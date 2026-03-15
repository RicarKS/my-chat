import { defineStore } from 'pinia'
import type { ModelConfig, ModelProvider } from '~~/shared/types'

export const useModelsStore = defineStore('models', {
  state: () => ({
    providers: [] as ModelProvider[],
    models: [] as ModelConfig[],
    loading: false,
  }),

  getters: {
    defaultModel: (state) => state.models.find(m => m.is_default) || state.models[0] || null,
    modelsByProvider: (state) => {
      const map = new Map<string, ModelConfig[]>()
      for (const m of state.models) {
        if (!m.provider_id) continue
        const list = map.get(m.provider_id) || []
        list.push(m)
        map.set(m.provider_id, list)
      }
      return map
    },
  },

  actions: {
    setProviders(providers: ModelProvider[]) {
      this.providers = providers
    },

    addProvider(provider: ModelProvider) {
      const idx = this.providers.findIndex(p => p.id === provider.id)
      if (idx >= 0) {
        this.providers[idx] = provider
      } else {
        this.providers.push(provider)
      }
    },

    removeProvider(id: string) {
      this.providers = this.providers.filter(p => p.id !== id)
      this.models = this.models.filter(m => m.provider_id !== id)
    },

    setModels(models: ModelConfig[]) {
      this.models = models
    },

    addModel(model: ModelConfig) {
      const idx = this.models.findIndex(m => m.id === model.id)
      if (idx >= 0) {
        this.models[idx] = model
      } else {
        this.models.push(model)
      }
    },

    addModels(models: ModelConfig[]) {
      for (const m of models) this.addModel(m)
    },

    removeModel(id: string) {
      this.models = this.models.filter(m => m.id !== id)
    },
  },
})
