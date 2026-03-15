export default defineNuxtRouteMiddleware(() => {
  // Only run on client - SSR has no access to localStorage tokens
  if (import.meta.server) return

  const authStore = useAuthStore()
  authStore.loadFromStorage()

  if (authStore.token) {
    return navigateTo('/chat')
  }
})
