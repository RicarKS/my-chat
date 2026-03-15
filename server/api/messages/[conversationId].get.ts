export default defineEventHandler(async (event) => {
  const { userId } = event.context.auth
  const conversationId = getRouterParam(event, 'conversationId')
  const db = useDb()

  // Verify ownership
  const convo = db.prepare(
    'SELECT id FROM conversations WHERE id = ? AND user_id = ?',
  ).get(conversationId, userId)

  if (!convo) {
    throw createError({ statusCode: 404, statusMessage: 'Conversation not found' })
  }

  const messages = db.prepare(
    'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
  ).all(conversationId)

  return { data: { messages }, error: null }
})
