import { loginSchema } from '../../utils/validation'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0].message })
  }

  const { username, password } = parsed.data
  const db = useDb()

  const user = db.prepare(
    'SELECT id, username, password_hash, created_at FROM users WHERE username = ?',
  ).get(username) as any

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid username or password' })
  }

  const token = signToken({ userId: user.id, username: user.username })

  return {
    data: { user: { id: user.id, username: user.username, created_at: user.created_at }, token },
    error: null,
  }
})
