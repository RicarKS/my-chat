export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()

  if (import.meta.client) {
    authStore.loadFromStorage()
  }

  if (!authStore.token) {
    return navigateTo('/')
  }

  // If we have a token but no user, verify it
  if (!authStore.user) {
    const { fetchMe } = useAuth()
    const valid = await fetchMe()
    if (!valid) {
      return navigateTo('/')
    }
  }
})
