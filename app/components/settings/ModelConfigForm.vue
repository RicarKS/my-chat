<template>
  <form class="model-form" @submit.prevent="handleSubmit">
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">显示名称</label>
        <input v-model="form.name" class="input-field" placeholder="e.g. GPT-4o" required />
      </div>
      <div class="form-group">
        <label class="form-label">模型名称</label>
        <input v-model="form.model_name" class="input-field" placeholder="e.g. gpt-4o" required />
      </div>
    </div>
    <div class="form-check">
      <label>
        <input type="checkbox" v-model="form.is_default" />
        设为默认
      </label>
    </div>
    <p v-if="error" class="error-text">{{ error }}</p>
    <div class="form-actions">
      <button class="btn btn-primary btn-sm" type="submit" :disabled="saving">
        {{ saving ? '添加中...' : '添加模型' }}
      </button>
      <button class="btn btn-ghost btn-sm" type="button" @click="$emit('cancel')">取消</button>
    </div>
  </form>
</template>

<script setup lang="ts">
const props = defineProps<{ providerId: string }>()
const emit = defineEmits<{ saved: []; cancel: [] }>()
const { createModel } = useModelConfigs()

const form = reactive({ name: '', model_name: '', is_default: false })
const saving = ref(false)
const error = ref('')

async function handleSubmit() {
  error.value = ''
  saving.value = true
  try {
    await createModel({
      provider_id: props.providerId,
      name: form.name,
      model_name: form.model_name,
      is_default: form.is_default,
    })
    form.name = ''
    form.model_name = ''
    form.is_default = false
    emit('saved')
  } catch (e: any) {
    error.value = e.data?.message || e.statusMessage || '添加模型失败'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.model-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  margin-top: 8px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-check {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.form-check input[type="checkbox"] {
  margin-right: 6px;
}

.form-actions {
  display: flex;
  gap: 8px;
}
</style>
