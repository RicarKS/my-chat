<template>
  <button class="new-chat-btn" @click="handleNewChat">
    + 新对话
  </button>
</template>

<script setup lang="ts">
const { createConversation } = useConversations()
const router = useRouter()

async function handleNewChat() {
  await createConversation()
  router.push('/chat')
}
</script>

<style scoped>
.new-chat-btn {
  margin: 12px 8px 4px;
  padding: 10px 16px;
  background: var(--color-bg-tertiary);
  border: 1px dashed var(--color-border-light);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: center;
}

.new-chat-btn:hover {
  background: var(--color-bg-hover);
  color: var(--color-text);
  border-color: var(--color-text-muted);
}
</style>
