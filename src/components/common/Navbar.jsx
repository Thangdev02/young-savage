import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, User, Search, Menu, X, ChevronDown } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'

const navLinks = [
  { label: 'Store', href: '/products' },
  { label: 'Lookbook', href: '/lookbook' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export default function Navbar() {
  const { count, setIsOpen } = useCart()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [userOpen, setUserOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-30 transition-all duration-500 ${scrolled ? 'bg-savage-black/95 backdrop-blur-md border-b border-savage-gray-800' : 'bg-transparent'}`}>
        {/* Top bar */}
        {/* <div className="border-b border-savage-gray-800/50 py-1.5 hidden lg:block">
          <div className="marquee-wrapper">
            <div className="marquee-content">
              {Array(4).fill(null).map((_, i) => (
                <span key={i} className="text-xs font-mono text-savage-gray-500 tracking-widest uppercase mx-8">
                  YOUNG SAVAGE — STREETWEAR VIỆT NAM &nbsp;•&nbsp; FREE SHIPPING ĐƠN TỪ 500K &nbsp;•&nbsp; HÀNG CÓ SẴN TRONG KHO &nbsp;•&nbsp; ĐỔI TRẢ TRONG 30 NGÀY
                </span>
              ))}
            </div>
          </div>
        </div> */}

        {/* Main nav */}
        <nav className="px-6 lg:px-12 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="font-display text-2xl lg:text-3xl tracking-ultra text-savage-white hover:text-savage-gray-300 transition-colors">
            YOUNG SAVAGE
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <NavLink
                key={link.href}
                to={link.href}
                className={({ isActive }) =>
                  `font-body text-xs tracking-widest uppercase transition-colors duration-200 ${isActive ? 'text-savage-white' : 'text-savage-gray-400 hover:text-savage-white'}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="text-savage-gray-400 hover:text-savage-white transition-colors p-1"
            >
              <Search size={18} />
            </button>

            {/* User */}
            <div className="relative">
              <button
                onClick={() => user ? setUserOpen(!userOpen) : navigate('/login')}
                className="text-savage-gray-400 hover:text-savage-white transition-colors p-1 flex items-center gap-1"
              >
                <User size={18} />
                {user && <ChevronDown size={12} className={`transition-transform ${userOpen ? 'rotate-180' : ''}`} />}
              </button>

              <AnimatePresence>
                {userOpen && user && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 top-10 w-52 bg-savage-gray-900 border border-savage-gray-800 py-2"
                  >
                    <div className="px-4 py-2 border-b border-savage-gray-800">
                      <p className="text-sm font-medium text-savage-white truncate">{user.name}</p>
                      <p className="text-xs text-savage-gray-500 truncate">{user.email}</p>
                    </div>
                    <Link to="/account" onClick={() => setUserOpen(false)} className="block px-4 py-2 text-sm text-savage-gray-400 hover:text-savage-white hover:bg-savage-gray-800 transition-colors">
                      Account
                    </Link>
                    <Link to="/orders" onClick={() => setUserOpen(false)} className="block px-4 py-2 text-sm text-savage-gray-400 hover:text-savage-white hover:bg-savage-gray-800 transition-colors">
                      History
                    </Link>
                    {(user.role === 'admin' || user.role === 'staff') && (
                      <Link to={user.role === 'admin' ? '/admin' : '/staff'} onClick={() => setUserOpen(false)} className="block px-4 py-2 text-sm text-savage-red hover:bg-savage-gray-800 transition-colors">
                        Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => { logout(); setUserOpen(false); navigate('/') }}
                      className="block w-full text-left px-4 py-2 text-sm text-savage-gray-400 hover:text-savage-white hover:bg-savage-gray-800 transition-colors border-t border-savage-gray-800 mt-1"
                    >
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cart */}
            <button
              onClick={() => setIsOpen(true)}
              className="relative text-savage-gray-400 hover:text-savage-white transition-colors p-1"
            >
              <ShoppingBag size={18} />
              {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-savage-red text-white text-[10px] font-mono w-4 h-4 rounded-full flex items-center justify-center">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </button>

            {/* Mobile menu */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden text-savage-gray-400 hover:text-savage-white transition-colors p-1"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden overflow-hidden bg-savage-black border-t border-savage-gray-800"
            >
              <div className="px-6 py-6 space-y-4">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.href}
                    to={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `block font-body text-sm tracking-widest uppercase ${isActive ? 'text-savage-white' : 'text-savage-gray-400'}`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
                {!user ? (
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="block btn-outline text-center mt-4">
                    Đăng nhập
                  </Link>
                ) : (
                  <button onClick={() => { logout(); setMobileOpen(false) }} className="btn-outline w-full text-center mt-4">
                    Đăng xuất
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-savage-black/95 backdrop-blur-md z-50 flex items-center justify-center"
          >
            <button onClick={() => setSearchOpen(false)} className="absolute top-6 right-8 text-savage-gray-400 hover:text-savage-white">
              <X size={24} />
            </button>
            <form onSubmit={handleSearch} className="w-full max-w-2xl px-8">
              <p className="font-mono text-xs text-savage-gray-600 tracking-widest uppercase mb-4">Tìm kiếm sản phẩm</p>
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="NHẬP TÊN SẢN PHẨM..."
                className="w-full bg-transparent border-b-2 border-savage-gray-700 focus:border-savage-white text-savage-white font-display text-3xl lg:text-5xl tracking-widest outline-none pb-3 placeholder-savage-gray-800 transition-colors"
              />
              <button type="submit" className="mt-6 btn-primary">Tìm kiếm</button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}