<template>
  <div class="model-config-list">
    <div class="section-header">
      <h2>模型提供方</h2>
      <button class="btn btn-sm btn-primary" @click="showProviderForm = !showProviderForm">
        {{ showProviderForm ? '取消' : '+ 添加提供方' }}
      </button>
    </div>

    <ProviderForm v-if="showProviderForm" @saved="handleProviderSaved" @cancel="showProviderForm = false" />

    <div v-if="providers.length === 0 && !showProviderForm" class="empty-text">
      暂未配置提供方。添加一个提供方以开始使用。
    </div>

    <div v-else class="providers-list">
      <div v-for="provider in providers" :key="provider.id" class="provider-card">
        <!-- Provider Header -->
        <div class="provider-header" @click="toggleProvider(provider.id)">
          <div class="provider-info">
            <span class="provider-name">{{ provider.name }}</span>
            <span class="provider-endpoint">{{ provider.api_endpoint }}</span>
          </div>
          <div class="provider-actions">
            <button class="btn btn-sm btn-ghost" @click.stop="editingProvider = editingProvider === provider.id ? null : provider.id">
              编辑
            </button>
            <button class="btn btn-sm btn-danger" @click.stop="handleDeleteProvider(provider.id)">
              删除
            </button>
            <span class="expand-icon">{{ expandedProviders.has(provider.id) ? '&#9650;' : '&#9660;' }}</span>
          </div>
        </div>

        <!-- Provider Edit Form -->
        <ProviderForm
          v-if="editingProvider === provider.id"
          :provider="provider"
          @saved="editingProvider = null"
          @cancel="editingProvider = null"
        />

        <!-- Models Under Provider -->
        <div v-if="expandedProviders.has(provider.id)" class="provider-models">
          <div class="models-toolbar">
            <button class="btn btn-sm btn-ghost" @click="fetchingModels = fetchingModels === provider.id ? null : provider.id">
              {{ fetchingModels === provider.id ? '关闭' : '获取模型' }}
            </button>
            <button class="btn btn-sm btn-ghost" @click="addingManual = addingManual === provider.id ? null : provider.id">
              {{ addingManual === provider.id ? '关闭' : '+ 手动添加' }}
            </button>
          </div>

          <!-- Fetch Models Dialog -->
          <AvailableModelsDialog
            v-if="fetchingModels === provider.id"
            :provider-id="provider.id"
            @close="fetchingModels = null"
            @enabled="fetchingModels = null; refreshModels()"
          />

          <!-- Manual Add Form -->
          <ModelConfigForm
            v-if="addingManual === provider.id"
            :provider-id="provider.id"
            @saved="addingManual = null; refreshModels()"
            @cancel="addingManual = null"
          />

          <!-- Model List -->
          <div v-if="getProviderModels(provider.id).length > 0" class="models-grid">
            <div v-for="model in getProviderModels(provider.id)" :key="model.id" class="model-item">
              <div class="model-info">
                <span class="model-name">
                  {{ model.name }}
                  <span v-if="model.is_default" class="default-badge">默认</span>
                </span>
                <span class="model-id-label">{{ model.model_name }}</span>
              </div>
              <div class="model-actions">
                <button class="btn btn-sm btn-ghost" @click="handleSetDefault(model.id)" :disabled="model.is_default">
                  设为默认
                </button>
                <button class="btn btn-sm btn-danger" @click="handleDeleteModel(model.id)">
                  删除
                </button>
              </div>
            </div>
          </div>
          <p v-else class="no-models-text">暂未添加模型</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const modelsStore = useModelsStore()
const { fetchProviders, deleteProvider, fetchModels, updateModel, deleteModel } = useModelConfigs()

const showProviderForm = ref(false)
const editingProvider = ref<string | null>(null)
const expandedProviders = ref(new Set<string>())
const fetchingModels = ref<string | null>(null)
const addingManual = ref<string | null>(null)

const providers = computed(() => modelsStore.providers)

function getProviderModels(providerId: string) {
  return modelsStore.modelsByProvider.get(providerId) || []
}

function toggleProvider(id: string) {
  if (expandedProviders.value.has(id)) {
    expandedProviders.value.delete(id)
  } else {
    expandedProviders.value.add(id)
  }
  expandedProviders.value = new Set(expandedProviders.value)
}

async function handleProviderSaved() {
  showProviderForm.value = false
}

async function handleDeleteProvider(id: string) {
  await deleteProvider(id)
}

async function handleSetDefault(modelId: string) {
  await updateModel(modelId, { is_default: true })
  await refreshModels()
}

async function handleDeleteModel(modelId: string) {
  await deleteModel(modelId)
}

async function refreshModels() {
  await fetchModels()
}

onMounted(async () => {
  await Promise.all([fetchProviders(), fetchModels()])
  // Auto-expand first provider
  if (providers.value.length > 0) {
    expandedProviders.value.add(providers.value[0].id)
  }
})
</script>

<style scoped>
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-header h2 {
  font-size: 18px;
  font-weight: 600;
}

.empty-text {
  color: var(--color-text-muted);
  font-size: 14px;
  padding: 20px;
  text-align: center;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.providers-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.provider-card {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.provider-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.provider-header:hover {
  background: var(--color-bg-hover);
}

.provider-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.provider-name {
  font-weight: 600;
  font-size: 14px;
}

.provider-endpoint {
  font-size: 12px;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.provider-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.expand-icon {
  font-size: 10px;
  color: var(--color-text-muted);
  margin-left: 4px;
  width: 16px;
  text-align: center;
}

.provider-models {
  border-top: 1px solid var(--color-border);
  padding: 12px 16px;
}

.models-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.models-grid {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
}

.model-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--color-bg);
  border-radius: var(--radius-sm);
}

.model-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.model-name {
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.model-id-label {
  font-size: 11px;
  color: var(--color-text-muted);
  font-family: var(--font-mono);
}

.default-badge {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: var(--radius-full);
  font-weight: 600;
  background: var(--color-primary-bg);
  color: var(--color-primary);
}

.model-actions {
  display: flex;
  gap: 4px;
}

.no-models-text {
  font-size: 13px;
  color: var(--color-text-muted);
  text-align: center;
  padding: 12px;
}
</style>
