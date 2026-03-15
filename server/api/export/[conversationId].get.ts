export default defineEventHandler(async (event) => {
  const { userId } = event.context.auth
  const conversationId = getRouterParam(event, 'conversationId')
  const query = getQuery(event)
  const format = (query.format as string) || 'json'
  const db = useDb()

  const conversation = db.prepare(
    'SELECT * FROM conversations WHERE id = ? AND user_id = ?',
  ).get(conversationId, userId) as any

  if (!conversation) {
    throw createError({ statusCode: 404, statusMessage: 'Conversation not found' })
  }

  const messages = db.prepare(
    'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
  ).all(conversationId) as any[]

  if (format === 'json') {
    setResponseHeader(event, 'Content-Type', 'application/json')
    setResponseHeader(event, 'Content-Disposition', `attachment; filename="${conversation.title}.json"`)
    return {
      version: 1,
      exported_at: new Date().toISOString(),
      conversation,
      messages,
    }
  }

  // For MD/TXT: walk active branch (use last sibling at each level)
  const lines: string[] = [`# ${conversation.title}\n`]
  if (conversation.system_prompt) {
    lines.push(`**System:** ${conversation.system_prompt}\n`)
  }

  // Build linear thread from tree (follow last sibling at each level)
  const byParent = new Map<string | null, any[]>()
  for (const msg of messages) {
    const key = msg.parent_id
    if (!byParent.has(key)) byParent.set(key, [])
    byParent.get(key)!.push(msg)
  }

  let currentParent: string | null = null
  while (true) {
    const siblings = byParent.get(currentParent)
    if (!siblings || siblings.length === 0) break
    const msg = siblings[siblings.length - 1] // last sibling
    const roleLabel = msg.role === 'user' ? 'User' : msg.role === 'assistant' ? 'Assistant' : 'System'
    if (format === 'md') {
      lines.push(`### ${roleLabel}\n${msg.content}\n`)
    } else {
      lines.push(`[${roleLabel}]\n${msg.content}\n`)
    }
    currentParent = msg.id
  }

  const content = lines.join('\n')
  const ext = format === 'md' ? 'md' : 'txt'
  setResponseHeader(event, 'Content-Type', format === 'md' ? 'text/markdown' : 'text/plain')
  setResponseHeader(event, 'Content-Disposition', `attachment; filename="${conversation.title}.${ext}"`)
  return content
})
