import type { ModelConfig, ModelProvider, AvailableModel } from '~~/shared/types'

export function useModelConfigs() {
  const store = useModelsStore()
  const { apiFetch } = useAuth()

  // --- Providers ---
  const fetchProviders = async () => {
    const res = await apiFetch<{ providers: ModelProvider[] }>('/api/providers')
    store.setProviders(res.data.providers)
  }

  const createProvider = async (data: { name: string; api_endpoint: string; api_key?: string }) => {
    const res = await apiFetch<{ provider: ModelProvider }>('/api/providers', {
      method: 'POST',
      body: data,
    })
    store.addProvider(res.data.provider)
    return res.data.provider
  }

  const updateProvider = async (id: string, data: Partial<{ name: string; api_endpoint: string; api_key: string }>) => {
    const res = await apiFetch<{ provider: ModelProvider }>(`/api/providers/${id}`, {
      method: 'PUT',
      body: data,
    })
    store.addProvider(res.data.provider)
    return res.data.provider
  }

  const deleteProvider = async (id: string) => {
    await apiFetch(`/api/providers/${id}`, { method: 'DELETE' })
    store.removeProvider(id)
  }

  const fetchAvailableModels = async (providerId: string): Promise<AvailableModel[]> => {
    const res = await apiFetch<{ models: AvailableModel[] }>(`/api/providers/${providerId}/models`)
    return res.data.models
  }

  // --- Models ---
  const fetchModels = async () => {
    store.loading = true
    try {
      const res = await apiFetch<{ models: ModelConfig[] }>('/api/models')
      store.setModels(res.data.models)
    } finally {
      store.loading = false
    }
  }

  const createModel = async (data: { provider_id: string; name: string; model_name: string; is_default?: boolean }) => {
    const res = await apiFetch<{ model: ModelConfig }>('/api/models', {
      method: 'POST',
      body: data,
    })
    store.addModel(res.data.model)
    return res.data.model
  }

  const bulkEnableModels = async (providerId: string, models: { model_name: string; name?: string }[]) => {
    const res = await apiFetch<{ models: ModelConfig[] }>('/api/models/bulk', {
      method: 'POST',
      body: { provider_id: providerId, models },
    })
    store.addModels(res.data.models)
    return res.data.models
  }

  const updateModel = async (id: string, data: Partial<{ name: string; model_name: string; is_default: boolean }>) => {
    const res = await apiFetch<{ model: ModelConfig }>(`/api/models/${id}`, {
      method: 'PUT',
      body: data,
    })
    store.addModel(res.data.model)
    return res.data.model
  }

  const deleteModel = async (id: string) => {
    await apiFetch(`/api/models/${id}`, { method: 'DELETE' })
    store.removeModel(id)
  }

  return {
    fetchProviders, createProvider, updateProvider, deleteProvider, fetchAvailableModels,
    fetchModels, createModel, bulkEnableModels, updateModel, deleteModel,
  }
}
