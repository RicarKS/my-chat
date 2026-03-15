<template>
  <div class="chat-area">
    <template v-if="conversationId">
      <ConversationSettings />
    </template>

    <div class="messages-container" ref="messagesContainer">
      <div v-if="!conversationId" class="empty-state">
        <h2>欢迎使用我的聊天</h2>
        <p>开始新对话或从侧边栏选择一个</p>
      </div>
      <div v-else class="messages-inner">
        <MessageBubble
          v-for="node in thread"
          :key="node.message.id"
          :message="node.message"
          :sibling-count="node.siblingCount"
          :sibling-index="node.siblingIndex"
          :conversation-id="conversationId"
          @edit="handleEdit"
          @regenerate="handleRegenerate"
        />
        <StreamingIndicator v-if="streaming" />
      </div>
    </div>

    <ChatInput
      :conversation-id="conversationId || ''"
      :disabled="streaming"
      @send="handleSend"
      @stop="handleStop"
      :streaming="streaming"
    />
  </div>
</template>

<script setup lang="ts">
import { getActiveThread } from '~/utils/tree'
import type { Message } from '~~/shared/types'

const conversationsStore = useConversationsStore()
const messagesStore = useMessagesStore()
const { fetchMessages, sendMessage, stopStreaming, editMessage, regenerateResponse, streaming } = useChat()
const { createConversation } = useConversations()

const messagesContainer = ref<HTMLElement | null>(null)

const conversationId = computed(() => conversationsStore.currentId)

const thread = computed(() => {
  if (!conversationId.value) return []
  const messages = messagesStore.getMessages(conversationId.value)
  const activePath = messagesStore.getActivePath(conversationId.value)
  return getActiveThread(messages, activePath)
})

// Load messages when conversation changes
watch(conversationId, async (id) => {
  if (id) {
    await fetchMessages(id)
  }
}, { immediate: true })

// Auto-scroll on new messages
watch(() => thread.value.length, () => {
  nextTick(scrollToBottom)
})

// Also scroll during streaming
watch(() => {
  if (!conversationId.value) return ''
  const msgs = messagesStore.getMessages(conversationId.value)
  const last = msgs[msgs.length - 1]
  return last?.content?.length || 0
}, () => {
  if (streaming.value) {
    nextTick(scrollToBottom)
  }
})

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

async function handleSend(content: string) {
  let convId = conversationId.value
  // Auto-create conversation if none selected
  if (!convId) {
    const convo = await createConversation()
    convId = convo.id
  }
  const lastMsg = thread.value[thread.value.length - 1]
  const parentId = lastMsg?.message.id ?? null
  await sendMessage(convId, content, parentId)
  scrollToBottom()
}

async function handleEdit(messageId: string, newContent: string) {
  if (!conversationId.value) return
  await editMessage(messageId, conversationId.value, newContent)
}

async function handleRegenerate(parentId: string | null) {
  if (!conversationId.value) return
  await regenerateResponse(conversationId.value, parentId)
}

function handleStop() {
  stopStreaming()
}
</script>

<style scoped>
.chat-area {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.messages-container {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 20px 0;
}

.empty-state {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--color-text-secondary);
}

.empty-state h2 {
  font-size: 22px;
  font-weight: 500;
  color: var(--color-text);
}

.empty-state p {
  font-size: 14px;
}

.messages-inner {
  max-width: var(--chat-max-width);
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
</style>
