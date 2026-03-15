import { providerUpdateSchema } from '../../utils/validation'

export default defineEventHandler(async (event) => {
  const { userId } = event.context.auth
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const parsed = providerUpdateSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0].message })
  }

  const db = useDb()

  const existing = db.prepare(
    'SELECT id FROM model_providers WHERE id = ? AND user_id = ?',
  ).get(id, userId)

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Provider not found' })
  }

  const updates: string[] = []
  const values: any[] = []

  if (parsed.data.name !== undefined) { updates.push('name = ?'); values.push(parsed.data.name) }
  if (parsed.data.api_endpoint !== undefined) { updates.push('api_endpoint = ?'); values.push(parsed.data.api_endpoint) }
  if (parsed.data.api_key !== undefined) {
    updates.push('api_key_encrypted = ?')
    values.push(parsed.data.api_key ? encrypt(parsed.data.api_key) : null)
  }

  if (updates.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No fields to update' })
  }

  values.push(id, userId)

  const provider = db.prepare(
    `UPDATE model_providers SET ${updates.join(', ')} WHERE id = ? AND user_id = ? RETURNING id, user_id, name, api_endpoint, created_at`,
  ).get(...values)

  return { data: { provider }, error: null }
})
