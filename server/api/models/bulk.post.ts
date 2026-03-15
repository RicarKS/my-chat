import { modelsBulkEnableSchema } from '../../utils/validation'

export default defineEventHandler(async (event) => {
  const { userId } = event.context.auth
  const body = await readBody(event)
  const parsed = modelsBulkEnableSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0].message })
  }

  const { provider_id, models: modelsToAdd } = parsed.data
  const db = useDb()

  // Verify provider
  const provider = db.prepare(
    'SELECT id, api_endpoint FROM model_providers WHERE id = ? AND (user_id = ? OR user_id IS NULL)',
  ).get(provider_id, userId) as any

  if (!provider) {
    throw createError({ statusCode: 404, statusMessage: 'Provider not found' })
  }

  // Get existing model_names for this provider+user to skip duplicates
  const existing = new Set(
    (db.prepare(
      'SELECT model_name FROM model_configs WHERE provider_id = ? AND user_id = ?',
    ).all(provider_id, userId) as any[]).map(r => r.model_name),
  )

  const insert = db.prepare(`
    INSERT INTO model_configs (user_id, provider_id, name, api_endpoint, model_name, is_default)
    VALUES (?, ?, ?, ?, ?, 0)
    RETURNING id, user_id, provider_id, name, model_name, is_default, created_at
  `)

  const created: any[] = []

  const transaction = db.transaction(() => {
    for (const m of modelsToAdd) {
      if (existing.has(m.model_name)) continue
      const row = insert.get(userId, provider_id, m.name || m.model_name, provider.api_endpoint, m.model_name)
      created.push(row)
    }
  })

  transaction()

  return { data: { models: created }, error: null }
})
