import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { AdminAuthProvider } from './context/AdminAuthContext.jsx'
import { SubscriptionProvider } from './context/SubscriptionContext.jsx'
import { BookingProvider } from './context/BookingContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AdminAuthProvider>
        <AuthProvider>
          <SubscriptionProvider>
            <BookingProvider>
              <App />
            </BookingProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </AdminAuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
