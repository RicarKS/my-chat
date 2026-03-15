import { conversationUpdateSchema } from '../../utils/validation'

export default defineEventHandler(async (event) => {
  const { userId } = event.context.auth
  const id = getRouterParam(event, 'id')
  const db = useDb()

  // Verify ownership
  const existing = db.prepare(
    'SELECT id FROM conversations WHERE id = ? AND user_id = ?',
  ).get(id, userId)

  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Conversation not found' })
  }

  const body = await readBody(event)
  const parsed = conversationUpdateSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0].message })
  }

  const updates: string[] = []
  const values: any[] = []

  if (parsed.data.title !== undefined) { updates.push('title = ?'); values.push(parsed.data.title) }
  if (parsed.data.system_prompt !== undefined) { updates.push('system_prompt = ?'); values.push(parsed.data.system_prompt) }
  if (parsed.data.temperature !== undefined) { updates.push('temperature = ?'); values.push(parsed.data.temperature) }
  if (parsed.data.top_p !== undefined) { updates.push('top_p = ?'); values.push(parsed.data.top_p) }
  if (parsed.data.model_config_id !== undefined) { updates.push('model_config_id = ?'); values.push(parsed.data.model_config_id) }

  updates.push("updated_at = datetime('now')")
  values.push(id, userId)

  const conversation = db.prepare(
    `UPDATE conversations SET ${updates.join(', ')} WHERE id = ? AND user_id = ? RETURNING *`,
  ).get(...values)

  return { data: { conversation }, error: null }
})
