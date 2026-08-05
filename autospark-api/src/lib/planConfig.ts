import { prisma } from '../db/client'
import { PlanId } from '../config/plans'

export async function getPlanConfig(planId: PlanId) {
  const config = await prisma.subscriptionPlanConfig.findUnique({ where: { planId } })
  if (!config) {
    throw new Error(`SubscriptionPlanConfig row missing for "${planId}" — bootstrap did not run`)
  }
  return config
}

export async function getAllPlanConfigs() {
  const configs = await prisma.subscriptionPlanConfig.findMany()
  const byId = new Map(configs.map((c) => [c.planId, c]))
  return byId
}
