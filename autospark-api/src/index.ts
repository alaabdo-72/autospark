import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { authRouter } from './routes/auth.routes'
import { meRouter } from './routes/me.routes'
import { subscriptionRouter } from './routes/subscription.routes'
import { bookingRouter } from './routes/booking.routes'
import { slotsRouter } from './routes/slots.routes'
import { adminAuthRouter } from './routes/adminAuth.routes'
import { adminBayRouter } from './routes/adminBay.routes'
import { adminWalkInRouter } from './routes/adminWalkIn.routes'
import { adminServiceConfigRouter } from './routes/adminServiceConfig.routes'
import { serviceConfigRouter } from './routes/serviceConfig.routes'
import { ensureBootstrapAdmin } from './lib/adminBootstrap'
import { ensureBootstrapBays } from './lib/bayBootstrap'
import { ensureBootstrapServiceConfig } from './lib/serviceConfigBootstrap'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => res.json({ ok: true }))

app.use('/auth', authRouter)
app.use('/me', meRouter)
app.use('/subscription', subscriptionRouter)
app.use('/bookings', bookingRouter)
app.use('/slots', slotsRouter)
app.use('/service-config', serviceConfigRouter)
app.use('/admin/auth', adminAuthRouter)
app.use('/admin/bays', adminBayRouter)
app.use('/admin/walkin', adminWalkInRouter)
app.use('/admin/service-config', adminServiceConfigRouter)

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

const port = Number(process.env.PORT ?? 4000)
Promise.all([ensureBootstrapAdmin(), ensureBootstrapBays(), ensureBootstrapServiceConfig()])
  .catch((err) => console.error('Startup bootstrap failed', err))
  .finally(() => {
    app.listen(port, () => {
      console.log(`AutoSpark API listening on http://localhost:${port}`)
    })
  })
