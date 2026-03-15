import { conversationCreateSchema } from '../../utils/validation'

export default defineEventHandler(async (event) => {
  const { userId } = event.context.auth
  const db = useDb()

  const body = await readBody(event)
  const parsed = conversationCreateSchema.safeParse(body || {})
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0].message })
  }

  const { title, system_prompt, temperature, top_p, model_config_id } = parsed.data

  const conversation = db.prepare(`
    INSERT INTO conversations (user_id, title, system_prompt, temperature, top_p, model_config_id)
    VALUES (?, ?, ?, ?, ?, ?)
    RETURNING *
  `).get(
    userId,
    title || 'New Chat',
    system_prompt ?? null,
    temperature ?? 0.7,
    top_p ?? 0.9,
    model_config_id ?? null,
  )

  return { data: { conversation }, error: null }
})
