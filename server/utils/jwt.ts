import jwt from 'jsonwebtoken'

interface JwtPayload {
  userId: string
  username: string
}

export function signToken(payload: JwtPayload): string {
  const config = useRuntimeConfig()
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' })
}

export function verifyToken(token: string): JwtPayload | null {
  const config = useRuntimeConfig()
  try {
    return jwt.verify(token, config.jwtSecret) as JwtPayload
  } catch {
    return null
  }
}
