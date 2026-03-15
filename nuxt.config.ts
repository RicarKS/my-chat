export default defineNuxtConfig({
  compatibilityDate: '2025-03-01',
  future: { compatibilityVersion: 4 },
  modules: ['@pinia/nuxt'],

  components: [
    { path: '~/components', pathPrefix: false },
  ],

  app: {
    head: {
      title: 'My Chat',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/katex@0.16.21/dist/katex.min.css' },
      ],
    },
  },

  css: ['~/assets/css/variables.css', '~/assets/css/main.css'],

  runtimeConfig: {
    jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
    encryptionKey: process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    databasePath: process.env.DATABASE_PATH || './data/chat.db',
    defaultApiEndpoint: process.env.DEFAULT_API_ENDPOINT || '',
    defaultApiKey: process.env.DEFAULT_API_KEY || '',
    defaultModelName: process.env.DEFAULT_MODEL_NAME || '',
  },

  nitro: {
    experimental: {
      websocket: true,
    },
  },

  devtools: { enabled: false },
})
