import { messageEditSchema } from '../../utils/validation'

export default defineEventHandler(async (event) => {
  const { userId } = event.context.auth
  const messageId = getRouterParam(event, 'id')
  const body = await readBody(event)
  const parsed = messageEditSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0].message })
  }

  const db = useDb()

  // Get the original message and verify ownership
  const original = db.prepare(`
    SELECT m.* FROM messages m
    JOIN conversations c ON c.id = m.conversation_id
    WHERE m.id = ? AND c.user_id = ?
  `).get(messageId, userId) as any

  if (!original) {
    throw createError({ statusCode: 404, statusMessage: 'Message not found' })
  }

  // Create a new sibling message (edit = new branch)
  const siblingCount = (db.prepare(
    'SELECT COUNT(*) as count FROM messages WHERE conversation_id = ? AND parent_id IS ?',
  ).get(original.conversation_id, original.parent_id) as any).count

  const newMessage = db.prepare(`
    INSERT INTO messages (conversation_id, parent_id, role, content, sibling_index)
    VALUES (?, ?, ?, ?, ?)
    RETURNING *
  `).get(original.conversation_id, original.parent_id, original.role, parsed.data.content, siblingCount)

  db.prepare("UPDATE conversations SET updated_at = datetime('now') WHERE id = ?").run(original.conversation_id)

  return { data: { original, newMessage }, error: null }
})
