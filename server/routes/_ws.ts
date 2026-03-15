export default defineWebSocketHandler({
  open(peer) {
    // Extract token from URL query
    const url = peer.request?.url || peer.url || ''
    const urlObj = new URL(url, 'http://localhost')
    const token = urlObj.searchParams.get('token')

    if (!token) {
      peer.send(JSON.stringify({ type: 'error', message: 'Missing token' }))
      peer.close(4001, 'Missing token')
      return
    }

    const payload = verifyToken(token)
    if (!payload) {
      peer.send(JSON.stringify({ type: 'error', message: 'Invalid token' }))
      peer.close(4001, 'Invalid token')
      return
    }

    // Store user info on peer context
    ;(peer as any)._userId = payload.userId
    addConnection(peer.id, peer, payload.userId)

    peer.send(JSON.stringify({ type: 'connected', userId: payload.userId }))
  },

  message(peer, message) {
    // WebSocket is read-only notification channel, no client messages expected
    // But we can handle ping/pong
    const text = typeof message === 'string' ? message : message.text()
    if (text === 'ping') {
      peer.send('pong')
    }
  },

  close(peer) {
    removeConnection(peer.id)
  },

  error(peer, error) {
    console.error('[ws] Error:', error)
    removeConnection(peer.id)
  },
})
