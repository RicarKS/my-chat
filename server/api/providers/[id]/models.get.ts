export default defineEventHandler(async (event) => {
  const { userId } = event.context.auth
  const id = getRouterParam(event, 'id')
  const db = useDb()

  const provider = db.prepare(
    'SELECT * FROM model_providers WHERE id = ? AND (user_id = ? OR user_id IS NULL)',
  ).get(id, userId) as any

  if (!provider) {
    throw createError({ statusCode: 404, statusMessage: 'Provider not found' })
  }

  // Decrypt API key
  let apiKey = ''
  if (provider.api_key_encrypted) {
    try {
      apiKey = decrypt(provider.api_key_encrypted)
    } catch {
      throw createError({ statusCode: 500, statusMessage: 'Failed to decrypt API key' })
    }
  }

  // Call upstream GET /models
  const url = `${provider.api_endpoint.replace(/\/+$/, '')}/models`
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      signal: controller.signal,
    })

    if (!response.ok) {
      const text = await response.text().catch(() => 'Unknown error')
      throw createError({ statusCode: 502, statusMessage: `Upstream API error ${response.status}: ${text}` })
    }

    const json = await response.json()

    // OpenAI format: { data: [{ id: "gpt-4o", ... }] }
    // Some APIs return just an array
    let modelList: any[]
    if (Array.isArray(json.data)) {
      modelList = json.data
    } else if (Array.isArray(json)) {
      modelList = json
    } else {
      modelList = []
    }

    const models = modelList.map((m: any) => ({
      id: m.id || m.name || String(m),
      name: m.name || m.id || undefined,
    })).sort((a: any, b: any) => a.id.localeCompare(b.id))

    return { data: { models }, error: null }
  } catch (err: any) {
    if (err.statusCode) throw err // re-throw createError
    if (err.name === 'AbortError') {
      throw createError({ statusCode: 504, statusMessage: 'Upstream API request timed out' })
    }
    throw createError({ statusCode: 502, statusMessage: `Failed to fetch models: ${err.message}` })
  } finally {
    clearTimeout(timeout)
  }
})
