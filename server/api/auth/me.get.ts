export default defineEventHandler(async (event) => {
  const { userId } = event.context.auth
  const db = useDb()

  const user = db.prepare(
    'SELECT id, username, created_at FROM users WHERE id = ?',
  ).get(userId) as any

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  return {
    data: { user },
    error: null,
  }
})
