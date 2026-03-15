<template>
  <div class="chat-page">
    <ChatArea />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })

const conversationsStore = useConversationsStore()
const { fetchConversations } = useConversations()
const { fetchModels } = useModelConfigs()
const { connect, disconnect } = useWebSocket()

onMounted(async () => {
  await Promise.all([fetchConversations(), fetchModels()])
  // Auto-select first conversation if none selected
  if (!conversationsStore.currentId && conversationsStore.conversations.length > 0) {
    conversationsStore.setCurrent(conversationsStore.conversations[0].id)
  }
  connect()
})

onUnmounted(() => {
  disconnect()
})
</script>

<style scoped>
.chat-page {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
}
</style>
