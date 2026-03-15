import type { Conversation } from '~~/shared/types'

export function useConversations() {
  const store = useConversationsStore()
  const { apiFetch } = useAuth()

  const fetchConversations = async () => {
    store.loading = true
    try {
      const res = await apiFetch<{ conversations: Conversation[]; total: number }>('/api/conversations')
      store.conversations = res.data.conversations
      store.total = res.data.total
    } finally {
      store.loading = false
    }
  }

  const createConversation = async (data?: Partial<Conversation>) => {
    const res = await apiFetch<{ conversation: Conversation }>('/api/conversations', {
      method: 'POST',
      body: data || {},
    })
    store.addConversation(res.data.conversation)
    store.setCurrent(res.data.conversation.id)
    return res.data.conversation
  }

  const updateConversation = async (id: string, data: Partial<Conversation>) => {
    const res = await apiFetch<{ conversation: Conversation }>(`/api/conversations/${id}`, {
      method: 'PUT',
      body: data,
    })
    store.addConversation(res.data.conversation)
    return res.data.conversation
  }

  const deleteConversation = async (id: string) => {
    await apiFetch(`/api/conversations/${id}`, { method: 'DELETE' })
    store.removeConversation(id)
  }

  const selectConversation = (id: string) => {
    store.setCurrent(id)
  }

  return { fetchConversations, createConversation, updateConversation, deleteConversation, selectConversation }
}
