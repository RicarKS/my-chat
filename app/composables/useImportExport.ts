export function useImportExport() {
  const authStore = useAuthStore()
  const { fetchConversations } = useConversations()

  const exportConversation = async (conversationId: string, format: 'json' | 'md' | 'txt' = 'json') => {
    const response = await fetch(`/api/export/${conversationId}?format=${format}`, {
      headers: { Authorization: `Bearer ${authStore.token}` },
    })

    if (!response.ok) throw new Error('Export failed')

    const blob = await response.blob()
    const disposition = response.headers.get('Content-Disposition') || ''
    const filenameMatch = disposition.match(/filename="(.+)"/)
    const filename = filenameMatch ? filenameMatch[1] : `chat.${format}`

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const importConversation = async (file: File) => {
    const text = await file.text()
    const data = JSON.parse(text)

    const res = await $fetch<{ data: { conversation: any } }>('/api/import', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authStore.token}` },
      body: data,
    })

    await fetchConversations()
    return res.data.conversation
  }

  return { exportConversation, importConversation }
}
