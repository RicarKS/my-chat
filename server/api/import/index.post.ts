export default defineEventHandler(async (event) => {
  const { userId } = event.context.auth
  const body = await readBody(event)
  const db = useDb()

  if (!body || !body.conversation || !body.messages) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid import format. Expected { conversation, messages }' })
  }

  const { conversation: importConvo, messages: importMessages } = body

  // Create conversation
  const convo = db.prepare(`
    INSERT INTO conversations (user_id, title, system_prompt, temperature, top_p)
    VALUES (?, ?, ?, ?, ?)
    RETURNING *
  `).get(
    userId,
    importConvo.title || 'Imported Chat',
    importConvo.system_prompt || null,
    importConvo.temperature ?? 0.7,
    importConvo.top_p ?? 0.9,
  ) as any

  // Map old message IDs to new ones
  const idMap = new Map<string, string>()

  // Sort messages by created_at to preserve order
  const sorted = [...importMessages].sort((a: any, b: any) =>
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  )

  for (const msg of sorted) {
    const newParentId = msg.parent_id ? idMap.get(msg.parent_id) || null : null

    const created = db.prepare(`
      INSERT INTO messages (conversation_id, parent_id, role, content, sibling_index, model_name)
      VALUES (?, ?, ?, ?, ?, ?)
      RETURNING *
    `).get(
      convo.id,
      newParentId,
      msg.role,
      msg.content,
      msg.sibling_index || 0,
      msg.model_name || null,
    ) as any

    idMap.set(msg.id, created.id)
  }

  return { data: { conversation: convo }, error: null }
})
