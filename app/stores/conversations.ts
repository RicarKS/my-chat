import { defineStore } from 'pinia'
import type { Conversation } from '~~/shared/types'

export const useConversationsStore = defineStore('conversations', {
  state: () => ({
    conversations: [] as Conversation[],
    currentId: null as string | null,
    total: 0,
    loading: false,
  }),

  getters: {
    current: (state) => state.conversations.find(c => c.id === state.currentId) || null,
    sorted: (state) => [...state.conversations].sort((a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    ),
  },

  actions: {
    setCurrent(id: string | null) {
      this.currentId = id
    },

    addConversation(conversation: Conversation) {
      const idx = this.conversations.findIndex(c => c.id === conversation.id)
      if (idx >= 0) {
        this.conversations[idx] = conversation
      } else {
        this.conversations.unshift(conversation)
      }
    },

    updateConversation(id: string, updates: Partial<Conversation>) {
      const idx = this.conversations.findIndex(c => c.id === id)
      if (idx >= 0) {
        this.conversations[idx] = { ...this.conversations[idx], ...updates }
      }
    },

    removeConversation(id: string) {
      this.conversations = this.conversations.filter(c => c.id !== id)
      if (this.currentId === id) {
        this.currentId = this.conversations[0]?.id || null
      }
    },
  },
})
