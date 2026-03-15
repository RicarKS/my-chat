import type { EventHandler, EventHandlerRequest } from 'h3'

// Server middleware to verify JWT and attach user to event context
export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  const path = url.pathname

  // Public routes that don't need auth
  const publicPaths = ['/api/auth/login', '/api/auth/register']
  if (publicPaths.includes(path)) return

  // Only protect /api/ routes (except auth)
  if (!path.startsWith('/api/')) return

  const authHeader = getHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Missing authorization token' })
  }

  const token = authHeader.slice(7)
  const payload = verifyToken(token)
  if (!payload) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid or expired token' })
  }

  // Attach user info to event context
  event.context.auth = {
    userId: payload.userId,
    username: payload.username,
  }
})
