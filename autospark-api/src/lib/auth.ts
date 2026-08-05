import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-only-secret-change-in-production'
const TOKEN_EXPIRY = '30d'

export function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export function signToken(userId: string, type: 'customer' | 'admin' = 'customer') {
  return jwt.sign({ sub: userId, type }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY })
}

export function verifyToken(token: string): { sub: string; type: 'customer' | 'admin' } | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string; type?: 'customer' | 'admin' }
    // Tokens issued before the `type` claim existed are all customer tokens.
    return { sub: payload.sub, type: payload.type ?? 'customer' }
  } catch {
    return null
  }
}
