<template>
  <div class="conversation-list">
    <ConversationItem
      v-for="convo in sorted"
      :key="convo.id"
      :conversation="convo"
      :active="convo.id === currentId"
      @select="handleSelect(convo.id)"
      @delete="handleDelete(convo.id)"
    />
    <p v-if="sorted.length === 0" class="empty-text">暂无对话</p>
  </div>
</template>

<script setup lang="ts">
const conversationsStore = useConversationsStore()
const { deleteConversation, selectConversation } = useConversations()

const sorted = computed(() => conversationsStore.sorted)
const currentId = computed(() => conversationsStore.currentId)

function handleSelect(id: string) {
  selectConversation(id)
}

async function handleDelete(id: string) {
  await deleteConversation(id)
}
</script>

<style scoped>
.conversation-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.empty-text {
  text-align: center;
  color: var(--color-text-muted);
  font-size: 13px;
  padding: 20px;
}
</style>
