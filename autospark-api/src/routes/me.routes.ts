import { Router } from 'express'
import { prisma } from '../db/client'
import { requireAuth, AuthedRequest } from '../middleware/requireAuth'

export const meRouter = Router()
meRouter.use(requireAuth)

meRouter.get('/', async (req: AuthedRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId! },
    select: { id: true, name: true, emailOrPhone: true, createdAt: true },
  })
  if (!user) return res.status(404).json({ error: 'User not found' })
  res.json({ user })
})
