import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { authRouter } from './routes/auth.routes'
import { meRouter } from './routes/me.routes'
import { subscriptionRouter } from './routes/subscription.routes'
import { bookingRouter } from './routes/booking.routes'
import { slotsRouter } from './routes/slots.routes'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/health', (_req, res) => res.json({ ok: true }))

app.use('/auth', authRouter)
app.use('/me', meRouter)
app.use('/subscription', subscriptionRouter)
app.use('/bookings', bookingRouter)
app.use('/slots', slotsRouter)

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

const port = Number(process.env.PORT ?? 4000)
app.listen(port, () => {
  console.log(`AutoSpark API listening on http://localhost:${port}`)
})
