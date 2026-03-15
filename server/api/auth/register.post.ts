import { registerSchema } from '../../utils/validation'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0].message })
  }

  const { username, password } = parsed.data
  const db = useDb()

  // Check if username exists
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username)
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: 'Username already taken' })
  }

  const passwordHash = await hashPassword(password)
  const user = db.prepare(
    'INSERT INTO users (username, password_hash) VALUES (?, ?) RETURNING id, username, created_at',
  ).get(username, passwordHash) as any

  const token = signToken({ userId: user.id, username: user.username })

  return {
    data: { user: { id: user.id, username: user.username, created_at: user.created_at }, token },
    error: null,
  }
})
