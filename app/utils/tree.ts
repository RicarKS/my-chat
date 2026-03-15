import type { Message } from '~~/shared/types'

export interface ThreadNode {
  message: Message
  siblingCount: number
  siblingIndex: number
}

// Group messages by their parent_id
export function groupByParent(messages: Message[]): Map<string | null, Message[]> {
  const map = new Map<string | null, Message[]>()
  for (const msg of messages) {
    const key = msg.parent_id
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(msg)
  }
  // Sort each group by sibling_index
  for (const [, siblings] of map) {
    siblings.sort((a, b) => a.sibling_index - b.sibling_index)
  }
  return map
}

// Walk the tree from root to build the active thread
export function getActiveThread(
  messages: Message[],
  activePath: Record<string, number>,
): ThreadNode[] {
  const byParent = groupByParent(messages)
  const thread: ThreadNode[] = []

  let currentParentId: string | null = null

  while (true) {
    const siblings = byParent.get(currentParentId)
    if (!siblings || siblings.length === 0) break

    const key = currentParentId ?? '__root__'
    const activeIndex = Math.min(activePath[key] ?? siblings.length - 1, siblings.length - 1)
    const activeMessage = siblings[Math.max(0, activeIndex)]

    thread.push({
      message: activeMessage,
      siblingCount: siblings.length,
      siblingIndex: activeIndex,
    })

    currentParentId = activeMessage.id
  }

  return thread
}

// Get the last message in the active thread
export function getLastActiveMessage(
  messages: Message[],
  activePath: Record<string, number>,
): Message | null {
  const thread = getActiveThread(messages, activePath)
  return thread.length > 0 ? thread[thread.length - 1].message : null
}

// Find the path from a message up to the root
export function getPathToRoot(messages: Message[], messageId: string): Message[] {
  const byId = new Map(messages.map(m => [m.id, m]))
  const path: Message[] = []

  let current = byId.get(messageId)
  while (current) {
    path.unshift(current)
    current = current.parent_id ? byId.get(current.parent_id) : undefined
  }

  return path
}
