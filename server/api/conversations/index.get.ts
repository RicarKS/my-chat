import { conversationCreateSchema } from '../../utils/validation'

export default defineEventHandler(async (event) => {
  const { userId } = event.context.auth
  const db = useDb()

  const query = getQuery(event)
  if (event.method === 'GET') {
    // List conversations
    const page = Math.max(1, Number(query.page) || 1)
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 20))
    const offset = (page - 1) * limit

    const conversations = db.prepare(
      'SELECT * FROM conversations WHERE user_id = ? ORDER BY updated_at DESC LIMIT ? OFFSET ?',
    ).all(userId, limit, offset)

    const total = (db.prepare(
      'SELECT COUNT(*) as count FROM conversations WHERE user_id = ?',
    ).get(userId) as any).count

    return { data: { conversations, total }, error: null }
  }
})
