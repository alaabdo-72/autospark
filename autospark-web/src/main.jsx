import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { SubscriptionProvider } from './context/SubscriptionContext.jsx'
import { BookingProvider } from './context/BookingContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SubscriptionProvider>
          <BookingProvider>
            <App />
          </BookingProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
