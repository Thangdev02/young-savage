import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { loginUser, registerUser } from '../../services/api'
import toast, { Toaster } from 'react-hot-toast'

/* ── Sliding images ── */
const PANEL_IMAGES = [
  '/cateTS.jpg',
  '/cateHD.jpg',
  '/cateP.jpg',
]

/* ─────────────────────────────────────
   AUTH SHELL
───────────────────────────────────── */
function AuthShell({ mode, children }) {
  const [imgIdx, setImgIdx] = useState(0)
  const isLogin = mode === 'login'

  useEffect(() => {
    const t = setInterval(() => {
      setImgIdx(i => (i + 1) % PANEL_IMAGES.length)
    }, 5000)
    return () => clearInterval(t)
  }, [])

  return (
    <div
      className="min-h-screen bg-[#F7F6F3] relative overflow-hidden"
      style={{ fontFamily: '"DM Sans", sans-serif' }}
    >
      {/* ===== CONTAINER 2 PANEL ===== */}
      <div className="hidden lg:flex w-full h-screen relative">

        {/* ================= FORM PANEL ================= */}
        <motion.div
          animate={{
            x: isLogin ? '0%' : '100%',
          }}
          transition={{
            type: 'spring',
            stiffness: 70,
            damping: 20,
          }}
          className="absolute top-0 left-0 w-1/2 h-full flex items-center justify-center px-8 py-12 bg-[#F7F6F3] z-20"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-sm"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* ================= IMAGE PANEL ================= */}
        <motion.div
          animate={{
            x: isLogin ? '100%' : '0%',
          }}
          transition={{
            type: 'spring',
            stiffness: 70,
            damping: 20,
          }}
          className="absolute top-0 left-0 w-1/2 h-full overflow-hidden"
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={imgIdx}
              src={PANEL_IMAGES[imgIdx]}
              alt=""
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </AnimatePresence>

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          <div className="absolute inset-0 flex flex-col justify-between p-8">
            <div className="flex items-center justify-between">
              <span className="text-white text-2xl tracking-widest">
                <a href="/">
                YOUNG SAVAGE
                </a>
              </span>
              <span className="text-white/60 text-xs tracking-wider">
                Your favorite store.
              </span>
            </div>

            <div>
              <p className="text-white/50 text-xs tracking-widest uppercase mb-3">
                {isLogin ? 'Welcome back' : 'Join the crew'}
              </p>

              <p className="text-white text-4xl leading-tight whitespace-pre-line">
                {isLogin
                  ? 'Your next\nfavorite outfit\nis waiting.'
                  : 'Be part of\nsomething\nSAVAGE.'}
              </p>

              <p className="text-white/40 text-xs mt-6 tracking-widest">
                Shop the best.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ===== MOBILE: chỉ show form ===== */}
      <div className="lg:hidden flex min-h-screen items-center justify-center px-8 py-12">
        <div className="w-full max-w-sm">{children}</div>
      </div>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1A1A19',
            color: '#F5F5F0',
            border: '1px solid #252524',
            borderRadius: '0',
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '13px',
          },
        }}
      />
    </div>
  )
}

/* ─────────────────────────────────────
   INPUT
───────────────────────────────────── */
function AuthInput({ label, type = 'text', value, onChange, placeholder, suffix }) {
  return (
    <div className="group">
      <label className="block text-[11px] font-mono text-gray-400 uppercase tracking-widest mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
          className="w-full bg-transparent border-b border-gray-200 text-gray-900 text-sm placeholder-gray-300
                     py-3 pr-10 outline-none transition-all duration-200
                     focus:border-gray-900 group-hover:border-gray-400"
        />
        {suffix && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2">
            {suffix}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────
   LOGIN
───────────────────────────────────── */
export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  const from = location.state?.from || '/'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await loginUser(form.email, form.password)
      if (!user) {
        toast.error('Email hoặc mật khẩu không đúng')
        return
      }
      login(user)
      toast.success(`Chào mừng, ${user.name}!`)
      navigate(
        user.role === 'admin'
          ? '/admin'
          : user.role === 'staff'
          ? '/staff'
          : from
      )
    } catch {
      toast.error('Lỗi đăng nhập')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell mode="login">
      <div className="mb-10">
        <p className="font-mono text-[11px] text-gray-400 tracking-widest uppercase mb-3">
          Welcome back
        </p>
        <h1 className="text-4xl font-bold text-gray-900 leading-tight">
          Your next <span className="italic">favorite</span>
          <br />
          outfit is only
          <br />
          one click away.
        </h1>
        <p className="text-sm text-gray-400 mt-3">
          Welcome back! Please enter your details.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthInput
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) =>
            setForm((p) => ({ ...p, email: e.target.value }))
          }
          placeholder="Enter your email"
        />

        <AuthInput
          label="Password"
          type={show ? 'text' : 'password'}
          value={form.password}
          onChange={(e) =>
            setForm((p) => ({ ...p, password: e.target.value }))
          }
          placeholder="Password"
          suffix={
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="text-gray-400 hover:text-gray-700"
            >
              {show ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          }
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gray-900 text-white py-3.5 rounded-full
                     hover:bg-black transition duration-200 disabled:opacity-60"
        >
          {loading ? 'Đang đăng nhập...' : 'Login'}
        </button>
      </form>

      <p className="text-sm text-gray-500 text-center mt-6">
        Chưa có tài khoản?{' '}
        <Link to="/register" className="text-gray-900 font-semibold hover:underline">
          Đăng ký ngay →
        </Link>
      </p>
    </AuthShell>
  )
}

/* ─────────────────────────────────────
   REGISTER
───────────────────────────────────── */
export function RegisterPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
  })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  const up = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (form.password !== form.confirm) {
      toast.error('Mật khẩu không khớp')
      return
    }

    if (form.password.length < 6) {
      toast.error('Mật khẩu tối thiểu 6 ký tự')
      return
    }

    setLoading(true)

    try {
      const user = await registerUser({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      })

      login(user)
      toast.success('Đăng ký thành công!')
      navigate('/')
    } catch (err) {
      toast.error(err.message || 'Lỗi đăng ký')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell mode="register">
      <div className="mb-8">
        <p className="font-mono text-[11px] text-gray-400 tracking-widest uppercase mb-3">
          Join the crew
        </p>
        <h1 className="text-4xl font-bold text-gray-900 leading-tight">
          Create your <br />
          <span className="italic">account.</span>
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          label="Họ tên"
          value={form.name}
          onChange={(e) => up('name', e.target.value)}
          placeholder="Nguyễn Văn A"
        />

        <AuthInput
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => up('email', e.target.value)}
          placeholder="email@example.com"
        />

        <AuthInput
          label="Số điện thoại"
          type="tel"
          value={form.phone}
          onChange={(e) => up('phone', e.target.value)}
          placeholder="0901234567"
        />

        <AuthInput
          label="Mật khẩu"
          type={show ? 'text' : 'password'}
          value={form.password}
          onChange={(e) => up('password', e.target.value)}
          placeholder="Tối thiểu 6 ký tự"
          suffix={
            <button type="button" onClick={() => setShow(!show)}>
              {show ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          }
        />

        <AuthInput
          label="Xác nhận mật khẩu"
          type="password"
          value={form.confirm}
          onChange={(e) => up('confirm', e.target.value)}
          placeholder="Nhập lại mật khẩu"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gray-900 text-white py-3.5 rounded-full
                     hover:bg-black transition duration-200 disabled:opacity-60
                     flex items-center justify-center gap-2"
        >
          {loading ? 'Đang tạo tài khoản...' : <>Tạo tài khoản <ArrowRight size={14} /></>}
        </button>
      </form>

      <p className="text-sm text-gray-500 text-center mt-5">
        Đã có tài khoản?{' '}
        <Link to="/login" className="text-gray-900 font-semibold hover:underline">
          Đăng nhập
        </Link>
      </p>
    </AuthShell>
  )
}