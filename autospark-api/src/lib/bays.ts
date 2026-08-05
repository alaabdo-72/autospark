import { prisma } from '../db/client'

export async function getActiveBayNumbers(): Promise<number[]> {
  const bays = await prisma.bay.findMany({ where: { isActive: true }, orderBy: { number: 'asc' } })
  return bays.map((b) => b.number)
}
