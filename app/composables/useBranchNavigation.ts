export function useBranchNavigation() {
  const messagesStore = useMessagesStore()

  const switchBranch = (conversationId: string, parentId: string | null, direction: 'prev' | 'next') => {
    const activePath = messagesStore.getActivePath(conversationId)
    const key = parentId ?? '__root__'
    const messages = messagesStore.getMessages(conversationId)
    const siblings = messages.filter(m => m.parent_id === parentId)
      .sort((a, b) => a.sibling_index - b.sibling_index)

    if (siblings.length <= 1) return

    const currentIndex = activePath[key] ?? siblings.length - 1
    let newIndex: number

    if (direction === 'prev') {
      newIndex = Math.max(0, currentIndex - 1)
    } else {
      newIndex = Math.min(siblings.length - 1, currentIndex + 1)
    }

    if (newIndex !== currentIndex) {
      messagesStore.setActiveSibling(conversationId, parentId, newIndex)
    }
  }

  return { switchBranch }
}
