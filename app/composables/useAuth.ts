import type { AuthUser } from '~~/shared/types'

export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()

  const apiFetch = <T>(url: string, opts: any = {}) => {
    const headers: Record<string, string> = { ...opts.headers }
    if (authStore.token) {
      headers.Authorization = `Bearer ${authStore.token}`
    }
    return $fetch<{ data: T; error: any }>(url, { ...opts, headers })
  }

  const login = async (username: string, password: string) => {
    const res = await $fetch<{ data: { user: AuthUser; token: string }; error: any }>('/api/auth/login', {
      method: 'POST',
      body: { username, password },
    })
    authStore.setAuth(res.data.user, res.data.token)
    await router.push('/chat')
  }

  const register = async (username: string, password: string) => {
    const res = await $fetch<{ data: { user: AuthUser; token: string }; error: any }>('/api/auth/register', {
      method: 'POST',
      body: { username, password },
    })
    authStore.setAuth(res.data.user, res.data.token)
    await router.push('/chat')
  }

  const fetchMe = async () => {
    if (!authStore.token) return false
    try {
      const res = await apiFetch<{ user: AuthUser }>('/api/auth/me')
      authStore.user = res.data.user
      return true
    } catch {
      authStore.logout()
      return false
    }
  }

  const logout = () => {
    authStore.logout()
    router.push('/')
  }

  return { login, register, fetchMe, logout, apiFetch }
}
