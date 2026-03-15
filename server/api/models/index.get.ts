export default defineEventHandler(async (event) => {
  const { userId } = event.context.auth
  const db = useDb()

  // JOIN with model_providers to include provider info
  const models = db.prepare(`
    SELECT mc.id, mc.user_id, mc.provider_id, mc.name, mc.model_name, mc.is_default, mc.created_at,
           mp.api_endpoint, mp.name as provider_name
    FROM model_configs mc
    LEFT JOIN model_providers mp ON mc.provider_id = mp.id
    WHERE mc.user_id = ? OR mc.user_id IS NULL
    ORDER BY mc.is_default DESC, mc.created_at ASC
  `).all(userId)

  return { data: { models }, error: null }
})
