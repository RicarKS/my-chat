import { modelConfigCreateSchema } from '../../utils/validation'

export default defineEventHandler(async (event) => {
  const { userId } = event.context.auth
  const body = await readBody(event)
  const parsed = modelConfigCreateSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0].message })
  }

  const { provider_id, name, model_name, is_default } = parsed.data
  const db = useDb()

  // Verify provider exists and belongs to user
  const provider = db.prepare(
    'SELECT id, api_endpoint FROM model_providers WHERE id = ? AND (user_id = ? OR user_id IS NULL)',
  ).get(provider_id, userId) as any

  if (!provider) {
    throw createError({ statusCode: 404, statusMessage: 'Provider not found' })
  }

  // If setting as default, unset others
  if (is_default) {
    db.prepare('UPDATE model_configs SET is_default = 0 WHERE user_id = ?').run(userId)
  }

  const model = db.prepare(`
    INSERT INTO model_configs (user_id, provider_id, name, api_endpoint, model_name, is_default)
    VALUES (?, ?, ?, ?, ?, ?)
    RETURNING id, user_id, provider_id, name, model_name, is_default, created_at
  `).get(userId, provider_id, name, provider.api_endpoint, model_name, is_default ? 1 : 0)

  return { data: { model }, error: null }
})
