import { chatCompletionSchema } from '../../utils/validation'

export default defineEventHandler(async (event) => {
  const { userId } = event.context.auth
  const body = await readBody(event)
  const parsed = chatCompletionSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0].message })
  }

  const { conversation_id, parent_id, model_config_id } = parsed.data
  const db = useDb()

  // Verify conversation ownership
  const conversation = db.prepare(
    'SELECT * FROM conversations WHERE id = ? AND user_id = ?',
  ).get(conversation_id, userId) as any

  if (!conversation) {
    throw createError({ statusCode: 404, statusMessage: 'Conversation not found' })
  }

  // Resolve model config
  const configId = model_config_id || conversation.model_config_id
  let modelConfig: any = null

  if (configId) {
    modelConfig = db.prepare(`
      SELECT mc.*, mp.api_endpoint as provider_endpoint, mp.api_key_encrypted as provider_key
      FROM model_configs mc
      JOIN model_providers mp ON mc.provider_id = mp.id
      WHERE mc.id = ? AND (mc.user_id = ? OR mc.user_id IS NULL)
    `).get(configId, userId)
  }

  if (!modelConfig) {
    // Fallback to default config
    modelConfig = db.prepare(`
      SELECT mc.*, mp.api_endpoint as provider_endpoint, mp.api_key_encrypted as provider_key
      FROM model_configs mc
      JOIN model_providers mp ON mc.provider_id = mp.id
      WHERE mc.is_default = 1 AND (mc.user_id = ? OR mc.user_id IS NULL)
      ORDER BY mc.user_id DESC LIMIT 1
    `).get(userId)
  }

  if (!modelConfig) {
    throw createError({ statusCode: 400, statusMessage: 'No model configured. Add a model in settings.' })
  }

  // Decrypt API key from provider
  let apiKey = ''
  const encryptedKey = modelConfig.provider_key || modelConfig.api_key_encrypted
  if (encryptedKey) {
    try {
      apiKey = decrypt(encryptedKey)
    } catch {
      throw createError({ statusCode: 500, statusMessage: 'Failed to decrypt API key' })
    }
  }

  const apiEndpoint = modelConfig.provider_endpoint || modelConfig.api_endpoint

  // Build context chain
  const contextMessages = buildContextChain(db, parent_id, conversation_id)

  // Prepend system prompt if set
  if (conversation.system_prompt) {
    contextMessages.unshift({ role: 'system', content: conversation.system_prompt })
  }

  // Create placeholder assistant message
  const siblingCount = (db.prepare(
    'SELECT COUNT(*) as count FROM messages WHERE conversation_id = ? AND parent_id IS ?',
  ).get(conversation_id, parent_id) as any).count

  const assistantMsg = db.prepare(`
    INSERT INTO messages (conversation_id, parent_id, role, content, sibling_index, model_name)
    VALUES (?, ?, 'assistant', '', ?, ?)
    RETURNING *
  `).get(conversation_id, parent_id, siblingCount, modelConfig.model_name) as any

  // Set SSE headers
  setResponseHeaders(event, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  })

  const sendSSE = (data: any) => {
    event.node.res.write(`data: ${JSON.stringify(data)}\n\n`)
  }

  // Send initial message info
  sendSSE({ type: 'message:start', message_id: assistantMsg.id, conversation_id })

  return new Promise<void>((resolve) => {
    streamChatCompletion({
      endpoint: apiEndpoint,
      apiKey,
      model: modelConfig.model_name,
      messages: contextMessages,
      temperature: conversation.temperature,
      onToken(delta) {
        sendSSE({
          type: 'message:stream',
          message_id: assistantMsg.id,
          conversation_id,
          delta,
          done: false,
        })
      },
      onDone(fullContent) {
        // Update message in DB with final content
        db.prepare('UPDATE messages SET content = ? WHERE id = ?').run(fullContent, assistantMsg.id)
        db.prepare("UPDATE conversations SET updated_at = datetime('now') WHERE id = ?").run(conversation_id)

        sendSSE({
          type: 'message:stream',
          message_id: assistantMsg.id,
          conversation_id,
          delta: '',
          done: true,
          content: fullContent,
        })

        // Auto-title on first exchange
        const msgCount = (db.prepare(
          'SELECT COUNT(*) as count FROM messages WHERE conversation_id = ?',
        ).get(conversation_id) as any).count

        if (msgCount <= 2 && conversation.title === 'New Chat') {
          autoTitle(db, conversation_id, contextMessages, fullContent, modelConfig, apiKey)
        }

        event.node.res.end()
        resolve()
      },
      onError(error) {
        sendSSE({ type: 'error', message: error.message })
        event.node.res.end()
        resolve()
      },
    })
  })
})

async function autoTitle(db: any, conversationId: string, messages: any[], assistantContent: string, modelConfig: any, apiKey: string) {
  try {
    const titleMessages = [
      ...messages,
      { role: 'assistant', content: assistantContent },
      { role: 'user', content: 'Generate a brief title (max 6 words) for this conversation. Respond with only the title, no quotes or punctuation.' },
    ]

    let title = ''
    await streamChatCompletion({
      endpoint: modelConfig.api_endpoint,
      apiKey,
      model: modelConfig.model_name,
      messages: titleMessages,
      temperature: 0.3,
      onToken(delta) { title += delta },
      onDone() {
        title = title.trim().slice(0, 100)
        if (title) {
          db.prepare('UPDATE conversations SET title = ? WHERE id = ?').run(title, conversationId)
        }
      },
      onError() { /* ignore title generation failures */ },
    })
  } catch { /* ignore */ }
}
