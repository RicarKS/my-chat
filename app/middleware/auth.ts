export default defineNuxtRouteMiddleware(async (to) => {
  // Only run on client - SSR has no access to localStorage tokens
  if (import.meta.server) return

  const authStore = useAuthStore()
  authStore.loadFromStorage()

  if (!authStore.token) {
    return navigateTo('/')
  }

  if (!authStore.user) {
    const { fetchMe } = useAuth()
    const valid = await fetchMe()
    if (!valid) {
      return navigateTo('/')
    }
  }
})
