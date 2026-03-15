<template>
  <div v-if="conversation" class="settings-wrapper">
    <button class="settings-btn" @click="open = !open" title="对话设置">
      &#9881;
    </button>

    <div v-if="open" class="settings-panel">
      <div class="panel-header">
        <span class="panel-title">对话设置</span>
        <button class="btn-icon close-btn" @click="open = false">&times;</button>
      </div>

      <div class="panel-body">
        <div class="form-group">
          <label class="form-label">系统提示</label>
          <textarea
            v-model="form.system_prompt"
            class="input-field"
            rows="3"
            placeholder="你是一个有帮助的助手..."
            @blur="save"
          />
        </div>

        <div class="form-group">
          <label class="form-label">温度</label>
          <div class="slider-input">
            <input type="range" v-model.number="form.temperature" min="0" max="2" step="0.1" @change="save" />
            <input type="number" v-model.number="form.temperature" class="number-input" min="0" max="2" step="0.1" @change="save" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Top P</label>
          <div class="slider-input">
            <input type="range" v-model.number="form.top_p" min="0" max="1" step="0.05" @change="save" />
            <input type="number" v-model.number="form.top_p" class="number-input" min="0" max="1" step="0.05" @change="save" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">模型</label>
          <select v-model="form.model_config_id" class="input-field" @change="save">
            <option :value="null">默认</option>
            <option v-for="model in models" :key="model.id" :value="model.id">
              {{ model.name }} ({{ model.provider_name ? model.provider_name + ' / ' : '' }}{{ model.model_name }})
            </option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="open" class="settings-overlay" @click="open = false" />
  </div>
</template>

<script setup lang="ts">
import type { Conversation } from '~~/shared/types'

const conversationsStore = useConversationsStore()
const modelsStore = useModelsStore()
const { updateConversation } = useConversations()

const open = ref(false)
const conversation = computed(() => conversationsStore.current)
const models = computed(() => modelsStore.models)

const form = reactive({
  system_prompt: '',
  temperature: 0.7,
  top_p: 0.9,
  model_config_id: null as string | null,
})

watch(conversation, (c) => {
  if (c) {
    form.system_prompt = c.system_prompt || ''
    form.temperature = c.temperature ?? 0.7
    form.top_p = (c as any).top_p ?? 0.9
    form.model_config_id = c.model_config_id || null
  }
}, { immediate: true })

async function save() {
  if (!conversation.value) return
  await updateConversation(conversation.value.id, {
    system_prompt: form.system_prompt || null,
    temperature: form.temperature,
    top_p: form.top_p,
    model_config_id: form.model_config_id,
  } as any)
}
</script>

<style scoped>
.settings-wrapper {
  position: absolute;
  top: 12px;
  right: 16px;
  z-index: 50;
}

.settings-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: var(--color-text-muted);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.settings-btn:hover {
  color: var(--color-text);
  background: var(--color-bg-hover);
}

.settings-overlay {
  position: fixed;
  inset: 0;
  z-index: 59;
}

.settings-panel {
  position: absolute;
  top: 44px;
  right: 0;
  width: 320px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 60;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
}

.close-btn {
  font-size: 18px;
  color: var(--color-text-muted);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}

.close-btn:hover {
  color: var(--color-text);
  background: var(--color-bg-hover);
}

.panel-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-height: 400px;
  overflow-y: auto;
}

.slider-input {
  display: flex;
  align-items: center;
  gap: 8px;
}

.slider-input input[type="range"] {
  flex: 1;
  accent-color: var(--color-primary);
}

.number-input {
  width: 60px;
  padding: 4px 6px;
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-size: 13px;
  text-align: center;
  outline: none;
}

.number-input:focus {
  border-color: var(--color-primary);
}
</style>
