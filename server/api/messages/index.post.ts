import { messageCreateSchema } from '../../utils/validation'

export default defineEventHandler(async (event) => {
  const { userId } = event.context.auth
  const body = await readBody(event)
  const parsed = messageCreateSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0].message })
  }

  const { conversation_id, parent_id, content, role } = parsed.data
  const db = useDb()

  // Verify ownership
  const convo = db.prepare(
    'SELECT id FROM conversations WHERE id = ? AND user_id = ?',
  ).get(conversation_id, userId)

  if (!convo) {
    throw createError({ statusCode: 404, statusMessage: 'Conversation not found' })
  }

  // Calculate sibling_index
  const siblingCount = (db.prepare(
    'SELECT COUNT(*) as count FROM messages WHERE conversation_id = ? AND parent_id IS ?',
  ).get(conversation_id, parent_id ?? null) as any).count

  const message = db.prepare(`
    INSERT INTO messages (conversation_id, parent_id, role, content, sibling_index)
    VALUES (?, ?, ?, ?, ?)
    RETURNING *
  `).get(conversation_id, parent_id ?? null, role, content, siblingCount)

  // Update conversation timestamp
  db.prepare("UPDATE conversations SET updated_at = datetime('now') WHERE id = ?").run(conversation_id)

  return { data: { message }, error: null }
})
