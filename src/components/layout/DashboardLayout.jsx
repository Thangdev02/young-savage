import { useState } from 'react'
import { NavLink, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, ShoppingBag, Package, Users, Tag,
  LogOut, Menu, X, ChevronRight, ExternalLink
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Toaster } from 'react-hot-toast'

const ADMIN_LINKS = [
  { to: '/admin',          icon: LayoutDashboard, label: 'Dashboard',        end: true },
  { to: '/admin/orders',   icon: ShoppingBag,     label: 'Đơn hàng' },
  { to: '/admin/products', icon: Package,          label: 'Sản phẩm' },
  { to: '/admin/users',    icon: Users,            label: 'Người dùng' },
  { to: '/admin/coupons',  icon: Tag,              label: 'Mã giảm giá' },
]

const STAFF_LINKS = [
  { to: '/staff',          icon: LayoutDashboard, label: 'Dashboard',        end: true },
  { to: '/staff/orders',   icon: ShoppingBag,     label: 'Quản lý đơn' },
  { to: '/staff/products', icon: Package,          label: 'Quản lý sản phẩm' },
]

export function DashboardLayout({ children, role = 'admin' }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const links = role === 'admin' ? ADMIN_LINKS : STAFF_LINKS

  const handleLogout = () => { logout(); navigate('/') }

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-brand-stone flex-shrink-0">
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-display text-base font-semibold text-brand-ink tracking-snug leading-tight">
              Young Savage
            </p>
            <p className="text-2xs font-mono text-brand-muted tracking-wider uppercase">
              {role === 'admin' ? 'Admin Portal' : 'Staff Portal'}
            </p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-brand-muted hover:text-brand-ink transition-colors p-1.5 flex-shrink-0 hidden lg:flex"
        >
          {collapsed ? <Menu size={16} /> : <X size={16} />}
        </button>
        <button
          onClick={() => setMobileOpen(false)}
          className="text-brand-muted hover:text-brand-ink transition-colors p-1.5 lg:hidden"
        >
          <X size={16} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 text-sm font-body transition-all duration-150 relative group ${
                isActive
                  ? 'bg-brand-stone text-brand-ink'
                  : 'text-brand-mid hover:text-brand-ink hover:bg-brand-paper'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 top-0 bottom-0 w-0.5 bg-brand-red"
                  />
                )}
                <link.icon size={15} strokeWidth={1.5} className="flex-shrink-0" />
                {!collapsed && <span className="truncate flex-1 text-sm">{link.label}</span>}
                {!collapsed && isActive && <ChevronRight size={11} className="text-brand-muted flex-shrink-0" />}
                {/* Tooltip when collapsed */}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-brand-ink text-brand-cream text-xs font-body whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    {link.label}
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-brand-stone flex-shrink-0">
        {!collapsed && (
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-2 px-4 py-3 text-2xs font-mono text-brand-muted hover:text-brand-ink transition-colors"
          >
            <ExternalLink size={11} />
            Xem Storefront
          </Link>
        )}

        <div className={`px-3 py-3 border-t border-brand-stone flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          {user?.avatar && (
            <img src={user.avatar} alt="" className="w-7 h-7 rounded-full flex-shrink-0 object-cover" />
          )}
          {!collapsed && user && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-body text-brand-ink truncate">{user.name}</p>
              <p className="text-2xs font-mono text-brand-muted uppercase">{user.role}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            title="Đăng xuất"
            className="text-brand-muted hover:text-brand-red transition-colors p-1 flex-shrink-0"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-brand-paper flex">

      {/* Desktop Sidebar */}
      <aside className={`
        ${collapsed ? 'w-14' : 'w-56'}
        bg-brand-cream border-r border-brand-stone
        flex-col transition-all duration-300 flex-shrink-0
        hidden lg:flex
      `}>
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-brand-ink/30 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.22 }}
              className="fixed left-0 top-0 bottom-0 w-56 bg-brand-cream border-r border-brand-stone flex flex-col z-50 lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <div className="lg:hidden h-12 border-b border-brand-stone bg-brand-cream flex items-center justify-between px-4 flex-shrink-0">
          <button onClick={() => setMobileOpen(true)} className="text-brand-mid hover:text-brand-ink p-1">
            <Menu size={18} />
          </button>
          <span className="font-display text-base font-semibold text-brand-ink">Young Savage</span>
          <div className="w-8" />
        </div>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#FAF9F6',
            color: '#2C2A27',
            border: '1px solid #E8E6E0',
            borderRadius: '0',
            fontFamily: '"Outfit", sans-serif',
            fontSize: '13px',
            boxShadow: '0 4px 24px rgba(44,42,39,0.08)',
          },
          success: { iconTheme: { primary: '#16a34a', secondary: '#FAF9F6' } },
          error:   { iconTheme: { primary: '#C0392B', secondary: '#FAF9F6' } },
        }}
      />
    </div>
  )
}