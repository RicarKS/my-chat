<template>
  <div class="available-models">
    <div v-if="loading" class="loading-text">正在获取可用模型...</div>
    <div v-else-if="error" class="error-section">
      <p class="error-text">{{ error }}</p>
      <button class="btn btn-sm btn-ghost" @click="fetchModels">重试</button>
    </div>
    <template v-else>
      <div class="models-header">
        <span class="models-count">{{ availableModels.length }} 个模型</span>
        <div class="header-actions">
          <button class="btn btn-sm btn-ghost" @click="toggleAll">
            {{ allSelected ? '取消全选' : '全选' }}
          </button>
          <button class="btn btn-sm btn-ghost" @click="$emit('close')">取消</button>
        </div>
      </div>
      <div class="models-list">
        <label v-for="model in availableModels" :key="model.id" class="model-option" :class="{ disabled: alreadyEnabled.has(model.id) }">
          <input
            type="checkbox"
            :checked="selected.has(model.id) || alreadyEnabled.has(model.id)"
            :disabled="alreadyEnabled.has(model.id)"
            @change="toggleModel(model.id)"
          />
          <span class="model-id">{{ model.id }}</span>
          <span v-if="alreadyEnabled.has(model.id)" class="enabled-badge">已添加</span>
        </label>
      </div>
      <button
        class="btn btn-primary btn-sm enable-btn"
        :disabled="selected.size === 0 || enabling"
        @click="handleEnable"
      >
        {{ enabling ? '添加中...' : `添加 ${selected.size} 个模型` }}
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { AvailableModel } from '~~/shared/types'

const props = defineProps<{ providerId: string }>()
const emit = defineEmits<{ close: []; enabled: [] }>()

const { fetchAvailableModels, bulkEnableModels } = useModelConfigs()
const modelsStore = useModelsStore()

const availableModels = ref<AvailableModel[]>([])
const selected = ref(new Set<string>())
const loading = ref(true)
const enabling = ref(false)
const error = ref('')

const alreadyEnabled = computed(() => {
  const providerModels = modelsStore.modelsByProvider.get(props.providerId) || []
  return new Set(providerModels.map(m => m.model_name))
})

const allSelected = computed(() => {
  const selectable = availableModels.value.filter(m => !alreadyEnabled.value.has(m.id))
  return selectable.length > 0 && selectable.every(m => selected.value.has(m.id))
})

function toggleModel(id: string) {
  if (selected.value.has(id)) {
    selected.value.delete(id)
  } else {
    selected.value.add(id)
  }
  // Trigger reactivity
  selected.value = new Set(selected.value)
}

function toggleAll() {
  const selectable = availableModels.value.filter(m => !alreadyEnabled.value.has(m.id))
  if (allSelected.value) {
    selected.value = new Set()
  } else {
    selected.value = new Set(selectable.map(m => m.id))
  }
}

async function fetchModels() {
  loading.value = true
  error.value = ''
  try {
    availableModels.value = await fetchAvailableModels(props.providerId)
  } catch (e: any) {
    error.value = e.data?.message || e.statusMessage || '获取模型失败'
  } finally {
    loading.value = false
  }
}

async function handleEnable() {
  enabling.value = true
  try {
    const models = Array.from(selected.value).map(id => ({ model_name: id }))
    await bulkEnableModels(props.providerId, models)
    selected.value = new Set()
    emit('enabled')
  } catch (e: any) {
    error.value = e.data?.message || e.statusMessage || '添加模型失败'
  } finally {
    enabling.value = false
  }
}

onMounted(fetchModels)
</script>

<style scoped>
.available-models {
  padding: 12px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  margin-top: 8px;
}

.loading-text {
  color: var(--color-text-muted);
  font-size: 13px;
  padding: 12px 0;
  text-align: center;
}

.error-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.models-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.models-count {
  font-size: 12px;
  color: var(--color-text-muted);
}

.header-actions {
  display: flex;
  gap: 4px;
}

.models-list {
  max-height: 240px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 12px;
}

.model-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 13px;
  transition: background var(--transition-fast);
}

.model-option:hover:not(.disabled) {
  background: var(--color-bg-hover);
}

.model-option.disabled {
  opacity: 0.5;
  cursor: default;
}

.model-id {
  font-family: var(--font-mono);
  font-size: 12px;
}

.enabled-badge {
  font-size: 10px;
  padding: 1px 6px;
  background: rgba(81, 207, 102, 0.1);
  color: var(--color-success);
  border-radius: var(--radius-full);
  margin-left: auto;
}

.enable-btn {
  width: 100%;
}
</style>
