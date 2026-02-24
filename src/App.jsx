import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import Cursor from './components/common/Cursor'

// Customer pages
import HomePage from './pages/customer/HomePage'
import ProductsPage from './pages/customer/ProductsPage'
import ProductDetailPage from './pages/customer/ProductDetailPage'
import CartPage from './pages/customer/CartPage'
import CheckoutPage from './pages/customer/CheckoutPage'
import { LoginPage, RegisterPage } from './pages/customer/AuthPages'
import OrdersPage from './pages/customer/OrdersPage'
import AccountPage from './pages/customer/AccountPage'
import { AboutPage, ContactPage, LookbookPage } from './pages/customer/InfoPages'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminOrders from './pages/admin/AdminOrders'
import AdminProducts from './pages/admin/AdminProducts'
import AdminUsers from './pages/admin/AdminUsers'

// Staff pages
import StaffDashboard from './pages/staff/StaffDashboard'
import  LookbookDetail  from './pages/customer/LookbookDetail'

// Protected route
function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-savage-black flex items-center justify-center"><div className="w-8 h-8 border-2 border-savage-gray-700 border-t-savage-red rounded-full animate-spin" /></div>
  if (!user) return <Navigate to="/login" />
  if (requiredRole && user.role !== requiredRole && !(requiredRole === 'staff' && user.role === 'admin')) {
    return <Navigate to="/" />
  }
  return children
}

function AppRoutes() {
  return (
    <Routes>
      {/* Customer */}
      <Route path="/" element={<HomePage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/products/:slug" element={<ProductDetailPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/orders" element={<OrdersPage />} />
      <Route path="/account" element={<AccountPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/lookbook" element={<LookbookPage />} />
         <Route path="/lookbook/:id" element={<LookbookDetail />} />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/orders" element={<ProtectedRoute requiredRole="admin"><AdminOrders /></ProtectedRoute>} />
      <Route path="/admin/products" element={<ProtectedRoute requiredRole="admin"><AdminProducts /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><AdminUsers /></ProtectedRoute>} />

      {/* Staff */}
      <Route path="/staff" element={<ProtectedRoute requiredRole="staff"><StaffDashboard /></ProtectedRoute>} />
      <Route path="/staff/orders" element={<ProtectedRoute requiredRole="staff"><AdminOrders staffMode={true} /></ProtectedRoute>} />
      <Route path="/staff/products" element={<ProtectedRoute requiredRole="staff"><AdminProducts staffMode={true} /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Cursor />
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}