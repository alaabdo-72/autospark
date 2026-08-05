import { prisma } from '../db/client'

// Same free-tier reset problem as bays/admin — re-seed the one config row
// (with its schema defaults) whenever it's missing.
export async function ensureBootstrapServiceConfig() {
  const count = await prisma.serviceConfig.count()
  if (count > 0) return

  await prisma.serviceConfig.create({ data: {} })
  console.log('Bootstrap service config ensured')
}
