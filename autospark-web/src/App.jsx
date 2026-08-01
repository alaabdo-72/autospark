import { Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import ScheduleWash from './pages/ScheduleWash'
import WaitingConfirmation from './pages/WaitingConfirmation'
import LiveTracker from './pages/LiveTracker'
import CheckIn from './pages/CheckIn'
import Subscription from './pages/Subscription'
import ComingSoon from './pages/ComingSoon'
import RequireAuth from './components/RequireAuth'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route
        path="/schedule"
        element={
          <RequireAuth>
            <ScheduleWash />
          </RequireAuth>
        }
      />
      <Route
        path="/confirmation"
        element={
          <RequireAuth>
            <WaitingConfirmation />
          </RequireAuth>
        }
      />
      <Route
        path="/tracker"
        element={
          <RequireAuth>
            <LiveTracker />
          </RequireAuth>
        }
      />
      <Route
        path="/checkin"
        element={
          <RequireAuth>
            <CheckIn />
          </RequireAuth>
        }
      />
      <Route
        path="/subscription"
        element={
          <RequireAuth>
            <Subscription />
          </RequireAuth>
        }
      />
      <Route path="/history" element={<ComingSoon label="Booking History" />} />
      <Route path="*" element={<ComingSoon label="Not found" />} />
    </Routes>
  )
}
