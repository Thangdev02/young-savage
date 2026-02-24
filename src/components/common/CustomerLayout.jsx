import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from '../common/Navbar'
import Footer from '../common/Footer'
import CartDrawer from '../common/CartDrawer'

export default function CustomerLayout({ children }) {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar />
      <main className="pt-16">
        {children}
      </main>
      <Footer />
      <CartDrawer />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#FAF9F6',
            color: '#2C2A27',
            border: '1px solid #E8E6E0',
            fontFamily: '"Outfit", sans-serif',
            fontSize: '13px',
            borderRadius: '0',
            boxShadow: '0 4px 32px rgba(44,42,39,0.08)',
          },
          success: { iconTheme: { primary: '#16a34a', secondary: '#FAF9F6' } },
          error:   { iconTheme: { primary: '#C0392B', secondary: '#FAF9F6' } },
        }}
      />
    </div>
  )
}