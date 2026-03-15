<template>
  <div class="chat-input-wrapper">
    <div class="chat-input-container">
      <textarea
        ref="textarea"
        v-model="content"
        class="chat-textarea"
        :placeholder="streaming ? '等待回复...' : '输入消息...'"
        :disabled="disabled && !streaming"
        rows="1"
        @keydown="handleKeydown"
        @input="autoResize"
      />
      <div class="input-actions">
        <button
          v-if="streaming"
          class="btn btn-sm btn-danger stop-btn"
          @click="$emit('stop')"
        >
          停止
        </button>
        <button
          v-else
          class="btn btn-sm btn-primary send-btn"
          :disabled="!content.trim() || disabled"
          @click="handleSend"
        >
          发送
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  conversationId: string
  disabled: boolean
  streaming: boolean
}>()

const emit = defineEmits<{
  send: [content: string]
  stop: []
}>()

const content = ref('')
const textarea = ref<HTMLTextAreaElement | null>(null)

function handleSend() {
  const trimmed = content.value.trim()
  if (!trimmed || props.disabled) return
  emit('send', trimmed)
  content.value = ''
  nextTick(autoResize)
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

function autoResize() {
  const el = textarea.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 200) + 'px'
}

onMounted(() => {
  textarea.value?.focus()
})
</script>

<style scoped>
.chat-input-wrapper {
  flex-shrink: 0;
  padding: 12px 20px 20px;
  background: var(--color-bg);
}

.chat-input-container {
  max-width: var(--chat-max-width);
  margin: 0 auto;
  display: flex;
  gap: 8px;
  align-items: flex-end;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 8px 12px;
}

.chat-textarea {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--color-text);
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  outline: none;
  max-height: 200px;
  padding: 4px 0;
}

.chat-textarea::placeholder {
  color: var(--color-text-muted);
}

.chat-textarea:disabled {
  opacity: 0.5;
}

.input-actions {
  display: flex;
  gap: 4px;
  padding-bottom: 2px;
}

.send-btn, .stop-btn {
  padding: 6px 16px;
}
</style>
