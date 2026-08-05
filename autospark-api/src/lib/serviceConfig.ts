import { prisma } from '../db/client'

// Singleton row — there's only ever one active wash service + its one
// extra, so callers just need "the" config, not a lookup by id.
export async function getServiceConfig() {
  const config = await prisma.serviceConfig.findFirst()
  if (!config) {
    throw new Error('ServiceConfig row is missing — bootstrap did not run')
  }
  return config
}

export function washDurationMinutes(config: { exteriorMinutes: number; interiorMinutes: number }) {
  return config.exteriorMinutes + config.interiorMinutes
}
