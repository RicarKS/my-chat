import { modelConfigUpdateSchema } from '../../utils/validation'

export default defineEventHandler(async (event) => {
  const { userId } = event.context.auth
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const parsed = modelConfigUpdateSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0].message })
  }

  const db = useDb()

  const existing = db.prepare(
    'SELECT id FROM model_configs WHERE id = ? AND user_id = ?',
  ).get(id, userId)

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Model config not found' })
  }

  const updates: string[] = []
  const values: any[] = []

  if (parsed.data.name !== undefined) { updates.push('name = ?'); values.push(parsed.data.name) }
  if (parsed.data.model_name !== undefined) { updates.push('model_name = ?'); values.push(parsed.data.model_name) }
  if (parsed.data.is_default !== undefined) {
    if (parsed.data.is_default) {
      db.prepare('UPDATE model_configs SET is_default = 0 WHERE user_id = ?').run(userId)
    }
    updates.push('is_default = ?')
    values.push(parsed.data.is_default ? 1 : 0)
  }

  if (updates.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No fields to update' })
  }

  values.push(id, userId)

  const model = db.prepare(
    `UPDATE model_configs SET ${updates.join(', ')} WHERE id = ? AND user_id = ? RETURNING id, user_id, provider_id, name, model_name, is_default, created_at`,
  ).get(...values)

  return { data: { model }, error: null }
})
