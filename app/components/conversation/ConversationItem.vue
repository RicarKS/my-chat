<template>
  <div class="conversation-item" :class="{ active }" @click="$emit('select')">
    <div class="item-content">
      <span class="item-title">{{ conversation.title }}</span>
      <span class="item-time">{{ formatRelativeTime(conversation.updated_at) }}</span>
    </div>
    <button class="delete-btn" @click.stop="$emit('delete')" title="删除">
      &times;
    </button>
  </div>
</template>

<script setup lang="ts">
import type { Conversation } from '~~/shared/types'
import { formatRelativeTime } from '~/utils/format'

defineProps<{
  conversation: Conversation
  active: boolean
}>()

defineEmits<{
  select: []
  delete: []
}>()
</script>

<style scoped>
.conversation-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.conversation-item:hover {
  background: var(--color-bg-hover);
}

.conversation-item.active {
  background: var(--color-bg-active);
}

.item-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-title {
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-time {
  font-size: 11px;
  color: var(--color-text-muted);
}

.delete-btn {
  opacity: 0;
  color: var(--color-text-muted);
  font-size: 18px;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.conversation-item:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  color: var(--color-danger);
  background: rgba(255, 107, 107, 0.1);
}
</style>
