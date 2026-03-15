<template>
  <div class="message-bubble" :class="[message.role]">
    <div class="message-header">
      <span class="role-label">{{ message.role === 'user' ? '你' : '助手' }}</span>
      <span v-if="message.model_name" class="model-name">{{ message.model_name }}</span>
    </div>

    <div v-if="editing" class="edit-area">
      <textarea
        ref="editTextarea"
        v-model="editContent"
        class="edit-input"
        @keydown.ctrl.enter="submitEdit"
        @keydown.escape="cancelEdit"
      />
      <div class="edit-actions">
        <button class="btn btn-sm btn-primary" @click="submitEdit">保存并提交</button>
        <button class="btn btn-sm btn-ghost" @click="cancelEdit">取消</button>
      </div>
    </div>

    <div v-else class="message-content">
      <MessageContent :content="message.content" />
    </div>

    <div class="message-footer">
      <BranchSwitcher
        v-if="siblingCount > 1"
        :count="siblingCount"
        :index="siblingIndex"
        :conversation-id="conversationId"
        :parent-id="message.parent_id"
      />

      <div class="message-actions">
        <button v-if="message.role === 'user'" class="action-btn" @click="startEdit" title="编辑">
          &#9998;
        </button>
        <button v-if="message.role === 'assistant'" class="action-btn" @click="handleRegenerate" title="重新生成">
          &#8635;
        </button>
        <button class="action-btn" @click="copyContent" title="复制">
          {{ copied ? '&#10003;' : '&#9112;' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Message } from '~~/shared/types'

const props = defineProps<{
  message: Message
  siblingCount: number
  siblingIndex: number
  conversationId: string
}>()

const emit = defineEmits<{
  edit: [messageId: string, content: string]
  regenerate: [parentId: string | null]
}>()

const editing = ref(false)
const editContent = ref('')
const editTextarea = ref<HTMLTextAreaElement | null>(null)
const copied = ref(false)

function startEdit() {
  editing.value = true
  editContent.value = props.message.content
  nextTick(() => editTextarea.value?.focus())
}

function cancelEdit() {
  editing.value = false
}

function submitEdit() {
  if (editContent.value.trim() && editContent.value !== props.message.content) {
    emit('edit', props.message.id, editContent.value.trim())
  }
  editing.value = false
}

function handleRegenerate() {
  emit('regenerate', props.message.parent_id)
}

async function copyContent() {
  try {
    await navigator.clipboard.writeText(props.message.content)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch { /* ignore */ }
}
</script>

<style scoped>
.message-bubble {
  padding: 4px 0;
}

.message-bubble.assistant {
  background: transparent;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.role-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: capitalize;
}

.model-name {
  font-size: 11px;
  color: var(--color-text-muted);
  background: var(--color-bg-tertiary);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}

.message-content {
  font-size: 15px;
  line-height: 1.7;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.message-content :deep(p) {
  margin-bottom: 12px;
}

.message-content :deep(p:last-child) {
  margin-bottom: 0;
}

.edit-area {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.edit-input {
  width: 100%;
  min-height: 80px;
  padding: 10px 14px;
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  color: var(--color-text);
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
  outline: none;
}

.edit-input:focus {
  border-color: var(--color-primary);
}

.edit-actions {
  display: flex;
  gap: 8px;
}

.message-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  min-height: 28px;
}

.message-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.message-bubble:hover .message-actions {
  opacity: 1;
}

.action-btn {
  padding: 4px 8px;
  font-size: 14px;
  color: var(--color-text-muted);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.action-btn:hover {
  color: var(--color-text);
  background: var(--color-bg-hover);
}
</style>
