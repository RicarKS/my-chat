export default defineEventHandler(async (event) => {
  const { userId } = event.context.auth
  const id = getRouterParam(event, 'id')
  const db = useDb()

  const result = db.prepare(
    'DELETE FROM model_providers WHERE id = ? AND user_id = ?',
  ).run(id, userId)

  if (result.changes === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Provider not found' })
  }

  return { data: { success: true }, error: null }
})
