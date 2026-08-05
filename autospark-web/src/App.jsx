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
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AdminBayBoard from './pages/AdminBayBoard'
import AdminWalkIn from './pages/AdminWalkIn'
import AdminServiceConfig from './pages/AdminServiceConfig'
import AdminSubscriptionPlans from './pages/AdminSubscriptionPlans'
import RequireAuth from './components/RequireAuth'
import RequireAdminAuth from './components/RequireAdminAuth'

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

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <RequireAdminAuth>
            <AdminDashboard />
          </RequireAdminAuth>
        }
      />
      <Route
        path="/admin/bays"
        element={
          <RequireAdminAuth>
            <AdminBayBoard />
          </RequireAdminAuth>
        }
      />
      <Route
        path="/admin/walkin"
        element={
          <RequireAdminAuth>
            <AdminWalkIn />
          </RequireAdminAuth>
        }
      />
      <Route
        path="/admin/service-config"
        element={
          <RequireAdminAuth>
            <AdminServiceConfig />
          </RequireAdminAuth>
        }
      />
      <Route
        path="/admin/subscription-plans"
        element={
          <RequireAdminAuth>
            <AdminSubscriptionPlans />
          </RequireAdminAuth>
        }
      />

      <Route path="*" element={<ComingSoon label="Not found" />} />
    </Routes>
  )
}
