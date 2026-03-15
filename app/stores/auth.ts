import { defineStore } from 'pinia'
import type { AuthUser } from '~~/shared/types'

interface AuthState {
  user: AuthUser | null
  token: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
  },

  actions: {
    setAuth(user: AuthUser, token: string) {
      this.user = user
      this.token = token
      if (import.meta.client) {
        localStorage.setItem('auth_token', token)
      }
    },

    logout() {
      this.user = null
      this.token = null
      if (import.meta.client) {
        localStorage.removeItem('auth_token')
      }
    },

    loadFromStorage() {
      if (!import.meta.client) return
      const token = localStorage.getItem('auth_token')
      if (token) {
        this.token = token
      }
    },
  },
})
