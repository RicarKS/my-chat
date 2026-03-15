export function useWebSocket() {
  const authStore = useAuthStore()
  const conversationsStore = useConversationsStore()
  const messagesStore = useMessagesStore()

  let ws: WebSocket | null = null
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  const connected = ref(false)
  const reconnectAttempts = ref(0)
  const maxReconnectAttempts = 10

  function connect() {
    if (!authStore.token || !import.meta.client) return

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const url = `${protocol}//${window.location.host}/_ws?token=${authStore.token}`

    try {
      ws = new WebSocket(url)
    } catch {
      scheduleReconnect()
      return
    }

    ws.onopen = () => {
      connected.value = true
      reconnectAttempts.value = 0
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        handleEvent(data)
      } catch { /* ignore */ }
    }

    ws.onclose = () => {
      connected.value = false
      scheduleReconnect()
    }

    ws.onerror = () => {
      connected.value = false
    }
  }

  function handleEvent(data: any) {
    switch (data.type) {
      case 'message:new': {
        const { message, conversation_id } = data.payload
        messagesStore.addMessage(message)
        break
      }
      case 'message:stream': {
        const { message_id, conversation_id, delta, done, content } = data.payload
        if (done && content) {
          messagesStore.updateMessageContent(message_id, conversation_id, content)
        } else if (delta) {
          const msgs = messagesStore.getMessages(conversation_id)
          const msg = msgs.find(m => m.id === message_id)
          if (msg) {
            messagesStore.updateMessageContent(message_id, conversation_id, msg.content + delta)
          }
        }
        break
      }
      case 'message:branch': {
        const { message } = data.payload
        messagesStore.addMessage(message)
        break
      }
      case 'conversation:create': {
        conversationsStore.addConversation(data.payload.conversation)
        break
      }
      case 'conversation:update': {
        const convo = data.payload.conversation
        conversationsStore.updateConversation(convo.id, convo)
        break
      }
      case 'conversation:delete': {
        conversationsStore.removeConversation(data.payload.conversation_id)
        break
      }
    }
  }

  function scheduleReconnect() {
    if (reconnectAttempts.value >= maxReconnectAttempts) return
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.value), 30000)
    reconnectTimer = setTimeout(() => {
      reconnectAttempts.value++
      connect()
    }, delay)
  }

  function disconnect() {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    if (ws) {
      ws.close()
      ws = null
    }
    connected.value = false
  }

  return { connect, disconnect, connected }
}
