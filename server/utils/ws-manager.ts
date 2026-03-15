import type { Peer } from 'crossws'

interface UserConnection {
  peer: Peer
  userId: string
}

const connections = new Map<string, UserConnection[]>()

export function addConnection(peerId: string, peer: Peer, userId: string) {
  if (!connections.has(userId)) {
    connections.set(userId, [])
  }
  connections.get(userId)!.push({ peer, userId })
}

export function removeConnection(peerId: string) {
  for (const [userId, conns] of connections) {
    const filtered = conns.filter(c => c.peer.id !== peerId)
    if (filtered.length === 0) {
      connections.delete(userId)
    } else {
      connections.set(userId, filtered)
    }
  }
}

export function broadcastToUser(userId: string, data: any, excludePeerId?: string) {
  const conns = connections.get(userId)
  if (!conns) return

  const payload = JSON.stringify(data)
  for (const conn of conns) {
    if (excludePeerId && conn.peer.id === excludePeerId) continue
    try {
      conn.peer.send(payload)
    } catch {
      // Connection may be closed
    }
  }
}
