interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface StreamOptions {
  endpoint: string
  apiKey: string
  model: string
  messages: ChatMessage[]
  temperature?: number
  top_p?: number
  onToken: (token: string) => void
  onDone: (fullContent: string) => void
  onError: (error: Error) => void
  signal?: AbortSignal
}

export async function streamChatCompletion(opts: StreamOptions): Promise<void> {
  const { endpoint, apiKey, model, messages, temperature = 0.7, onToken, onDone, onError, signal } = opts

  const url = `${endpoint.replace(/\/+$/, '')}/chat/completions`

  let response: Response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
        temperature,
      }),
      signal,
    })
  } catch (err: any) {
    onError(new Error(`Failed to connect to AI API: ${err.message}`))
    return
  }

  if (!response.ok) {
    const text = await response.text().catch(() => 'Unknown error')
    onError(new Error(`AI API error ${response.status}: ${text}`))
    return
  }

  const reader = response.body?.getReader()
  if (!reader) {
    onError(new Error('No response body'))
    return
  }

  const decoder = new TextDecoder()
  let buffer = ''
  let fullContent = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data: ')) continue

        const data = trimmed.slice(6)
        if (data === '[DONE]') {
          onDone(fullContent)
          return
        }

        try {
          const parsed = JSON.parse(data)
          const delta = parsed.choices?.[0]?.delta?.content
          if (delta) {
            fullContent += delta
            onToken(delta)
          }
        } catch {
          // Skip malformed JSON lines
        }
      }
    }

    // Stream ended without [DONE]
    onDone(fullContent)
  } catch (err: any) {
    if (err.name === 'AbortError') {
      onDone(fullContent)
    } else {
      onError(err)
    }
  }
}

// Build context chain by walking up the tree from parent_id to root
export function buildContextChain(db: ReturnType<typeof useDb>, parentId: string | null, conversationId: string): ChatMessage[] {
  const messages: ChatMessage[] = []

  let currentId = parentId
  while (currentId) {
    const msg = db.prepare(
      'SELECT id, parent_id, role, content FROM messages WHERE id = ? AND conversation_id = ?',
    ).get(currentId, conversationId) as any

    if (!msg) break
    messages.unshift({ role: msg.role, content: msg.content })
    currentId = msg.parent_id
  }

  return messages
}
