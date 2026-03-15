import { providerCreateSchema } from '../../utils/validation'

export default defineEventHandler(async (event) => {
  const { userId } = event.context.auth
  const body = await readBody(event)
  const parsed = providerCreateSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0].message })
  }

  const { name, api_endpoint, api_key } = parsed.data
  const db = useDb()

  let apiKeyEncrypted: string | null = null
  if (api_key) {
    apiKeyEncrypted = encrypt(api_key)
  }

  const provider = db.prepare(`
    INSERT INTO model_providers (user_id, name, api_endpoint, api_key_encrypted)
    VALUES (?, ?, ?, ?)
    RETURNING id, user_id, name, api_endpoint, created_at
  `).get(userId, name, api_endpoint, apiKeyEncrypted)

  return { data: { provider }, error: null }
})
