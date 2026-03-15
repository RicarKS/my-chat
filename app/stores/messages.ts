import { defineStore } from 'pinia'
import type { Message } from '~~/shared/types'

export const useMessagesStore = defineStore('messages', {
  state: () => ({
    // All messages indexed by conversation_id
    messagesByConversation: {} as Record<string, Message[]>,
    // Active branch path per conversation: Map<parentId | 'root', activeSiblingIndex>
    activePaths: {} as Record<string, Record<string, number>>,
    loading: false,
  }),

  actions: {
    setMessages(conversationId: string, messages: Message[]) {
      this.messagesByConversation[conversationId] = messages
    },

    addMessage(message: Message) {
      const convId = message.conversation_id
      if (!this.messagesByConversation[convId]) {
        this.messagesByConversation[convId] = []
      }
      // Avoid duplicates
      const exists = this.messagesByConversation[convId].find(m => m.id === message.id)
      if (!exists) {
        this.messagesByConversation[convId].push(message)
      }
    },

    updateMessageContent(messageId: string, conversationId: string, content: string) {
      const messages = this.messagesByConversation[conversationId]
      if (!messages) return
      const msg = messages.find(m => m.id === messageId)
      if (msg) {
        msg.content = content
      }
    },

    getMessages(conversationId: string): Message[] {
      return this.messagesByConversation[conversationId] || []
    },

    // Active path management
    getActivePath(conversationId: string): Record<string, number> {
      if (!this.activePaths[conversationId]) {
        this.activePaths[conversationId] = {}
      }
      return this.activePaths[conversationId]
    },

    setActiveSibling(conversationId: string, parentId: string | null, index: number) {
      if (!this.activePaths[conversationId]) {
        this.activePaths[conversationId] = {}
      }
      const key = parentId ?? '__root__'
      this.activePaths[conversationId][key] = index
    },

    clearConversation(conversationId: string) {
      delete this.messagesByConversation[conversationId]
      delete this.activePaths[conversationId]
    },
  },
})
