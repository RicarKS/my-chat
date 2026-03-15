import type { Message } from '~~/shared/types'

export function useChat() {
  const messagesStore = useMessagesStore()
  const conversationsStore = useConversationsStore()
  const authStore = useAuthStore()

  const streaming = ref(false)
  const abortController = ref<AbortController | null>(null)

  const fetchMessages = async (conversationId: string) => {
    messagesStore.loading = true
    try {
      const res = await $fetch<{ data: { messages: Message[] } }>(`/api/messages/${conversationId}`, {
        headers: { Authorization: `Bearer ${authStore.token}` },
      })
      messagesStore.setMessages(conversationId, res.data.messages)
    } finally {
      messagesStore.loading = false
    }
  }

  const sendMessage = async (conversationId: string, content: string, parentId: string | null) => {
    // Create user message
    const res = await $fetch<{ data: { message: Message } }>('/api/messages', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authStore.token}` },
      body: { conversation_id: conversationId, parent_id: parentId, content },
    })

    const userMessage = res.data.message
    messagesStore.addMessage(userMessage)

    // Auto-switch to new sibling
    messagesStore.setActiveSibling(conversationId, parentId, userMessage.sibling_index)

    // Trigger AI response
    await streamResponse(conversationId, userMessage.id)

    return userMessage
  }

  const streamResponse = async (conversationId: string, parentId: string | null, modelConfigId?: string) => {
    streaming.value = true
    abortController.value = new AbortController()

    try {
      const response = await fetch('/api/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStore.token}`,
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          parent_id: parentId,
          model_config_id: modelConfigId,
        }),
        signal: abortController.value.signal,
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(text)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let buffer = ''
      let messageId = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || !trimmed.startsWith('data: ')) continue

          try {
            const data = JSON.parse(trimmed.slice(6))

            if (data.type === 'message:start') {
              messageId = data.message_id
              // Add placeholder message
              messagesStore.addMessage({
                id: messageId,
                conversation_id: conversationId,
                parent_id: parentId,
                role: 'assistant',
                content: '',
                sibling_index: 0,
                model_name: null,
                created_at: new Date().toISOString(),
              })
              messagesStore.setActiveSibling(conversationId, parentId, messagesStore.getMessages(conversationId).filter(m => m.parent_id === parentId).length - 1)
            } else if (data.type === 'message:stream') {
              if (data.done) {
                // Update with final content
                if (data.content) {
                  messagesStore.updateMessageContent(messageId, conversationId, data.content)
                }
              } else {
                // Append delta
                const messages = messagesStore.getMessages(conversationId)
                const msg = messages.find(m => m.id === messageId)
                if (msg) {
                  messagesStore.updateMessageContent(messageId, conversationId, msg.content + data.delta)
                }
              }
            } else if (data.type === 'error') {
              console.error('Stream error:', data.message)
            }
          } catch {
            // Skip malformed JSON
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Stream failed:', err)
      }
    } finally {
      streaming.value = false
      abortController.value = null
    }
  }

  const stopStreaming = () => {
    abortController.value?.abort()
  }

  const editMessage = async (messageId: string, conversationId: string, newContent: string) => {
    const res = await $fetch<{ data: { original: Message; newMessage: Message } }>(`/api/messages/${messageId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${authStore.token}` },
      body: { content: newContent },
    })

    const { newMessage } = res.data
    messagesStore.addMessage(newMessage)
    messagesStore.setActiveSibling(conversationId, newMessage.parent_id, newMessage.sibling_index)

    // Trigger AI response for the edited message
    await streamResponse(conversationId, newMessage.id)

    return newMessage
  }

  const regenerateResponse = async (conversationId: string, parentId: string | null, modelConfigId?: string) => {
    await streamResponse(conversationId, parentId, modelConfigId)
  }

  return {
    streaming,
    fetchMessages,
    sendMessage,
    streamResponse,
    stopStreaming,
    editMessage,
    regenerateResponse,
  }
}
