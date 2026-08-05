import { prisma } from '../db/client'
import { hashPassword } from './auth'

// The free-tier SQLite database is wiped on every backend restart (no
// persistent disk), so unlike customer accounts there must always be a way
// back in as an admin. This recreates the one bootstrap admin from env vars
// whenever it's missing, so a restart never permanently locks the business
// out of its own admin panel.
export async function ensureBootstrapAdmin() {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD
  if (!email || !password) {
    console.warn('ADMIN_EMAIL/ADMIN_PASSWORD not set — skipping admin bootstrap')
    return
  }

  const existing = await prisma.adminUser.findUnique({ where: { emailOrPhone: email } })
  if (existing) return

  const passwordHash = await hashPassword(password)
  await prisma.adminUser.create({
    data: { name: 'Admin', emailOrPhone: email, passwordHash, role: 'admin', isActive: true },
  })
  console.log(`Bootstrap admin account ensured: ${email}`)
}
