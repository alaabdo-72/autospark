import { prisma } from '../db/client'

// Same free-tier reset problem as the admin account: the DB is wiped on
// every restart, so re-seed the default bays whenever none exist.
export async function ensureBootstrapBays() {
  const count = await prisma.bay.count()
  if (count > 0) return

  await prisma.bay.createMany({
    data: [1, 2, 3].map((number) => ({ number, isActive: true })),
  })
  console.log('Bootstrap bays ensured: 1, 2, 3')
}
