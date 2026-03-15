<template>
  <form class="provider-form" @submit.prevent="handleSubmit">
    <h3>{{ editMode ? '编辑提供方' : '添加提供方' }}</h3>
    <div class="form-group">
      <label class="form-label">提供方名称</label>
      <input v-model="form.name" class="input-field" placeholder="e.g. OpenAI, DeepSeek" required />
    </div>
    <div class="form-group">
      <label class="form-label">API 地址</label>
      <input v-model="form.api_endpoint" class="input-field" placeholder="https://api.openai.com/v1" required />
    </div>
    <div class="form-group">
      <label class="form-label">API 密钥</label>
      <input v-model="form.api_key" class="input-field" type="password" :placeholder="editMode ? '留空则保持当前密钥' : 'sk-...'" />
    </div>
    <p v-if="error" class="error-text">{{ error }}</p>
    <div class="form-actions">
      <button class="btn btn-primary btn-sm" type="submit" :disabled="saving">
        {{ saving ? '保存中...' : editMode ? '更新' : '添加提供方' }}
      </button>
      <button class="btn btn-ghost btn-sm" type="button" @click="$emit('cancel')">取消</button>
    </div>
  </form>
</template>

<script setup lang="ts">
import type { ModelProvider } from '~~/shared/types'

const props = defineProps<{
  provider?: ModelProvider
}>()

const emit = defineEmits<{
  saved: [provider: ModelProvider]
  cancel: []
}>()

const { createProvider, updateProvider } = useModelConfigs()

const editMode = computed(() => !!props.provider)

const form = reactive({
  name: props.provider?.name || '',
  api_endpoint: props.provider?.api_endpoint || 'https://api.openai.com/v1',
  api_key: '',
})

const saving = ref(false)
const error = ref('')

async function handleSubmit() {
  error.value = ''
  saving.value = true
  try {
    let result: ModelProvider
    if (editMode.value && props.provider) {
      const data: any = {}
      if (form.name !== props.provider.name) data.name = form.name
      if (form.api_endpoint !== props.provider.api_endpoint) data.api_endpoint = form.api_endpoint
      if (form.api_key) data.api_key = form.api_key
      result = await updateProvider(props.provider.id, data)
    } else {
      result = await createProvider({
        name: form.name,
        api_endpoint: form.api_endpoint,
        api_key: form.api_key || undefined,
      })
    }
    emit('saved', result)
  } catch (e: any) {
    error.value = e.data?.message || e.statusMessage || '保存提供方失败'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.provider-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  margin-bottom: 16px;
}

.provider-form h3 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.form-actions {
  display: flex;
  gap: 8px;
}
</style>
