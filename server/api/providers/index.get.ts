export default defineEventHandler(async (event) => {
  const { userId } = event.context.auth
  const db = useDb()

  const providers = db.prepare(`
    SELECT id, user_id, name, api_endpoint, created_at
    FROM model_providers
    WHERE user_id = ? OR user_id IS NULL
    ORDER BY created_at ASC
  `).all(userId)

  return { data: { providers }, error: null }
})
