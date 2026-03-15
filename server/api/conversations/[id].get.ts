export default defineEventHandler(async (event) => {
  const { userId } = event.context.auth
  const id = getRouterParam(event, 'id')
  const db = useDb()

  const conversation = db.prepare(
    'SELECT * FROM conversations WHERE id = ? AND user_id = ?',
  ).get(id, userId)

  if (!conversation) {
    throw createError({ statusCode: 404, statusMessage: 'Conversation not found' })
  }

  return { data: { conversation }, error: null }
})
