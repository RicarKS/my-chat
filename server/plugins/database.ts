export default defineNitroPlugin((nitroApp) => {
  // Database is initialized lazily on first useDb() call.
  // This plugin eagerly initializes it on startup to run migrations early.
  try {
    useDb()
    console.log('[db] Database initialized and migrations applied')
  } catch (err) {
    console.error('[db] Failed to initialize database:', err)
  }
})
