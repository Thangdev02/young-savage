import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ShoppingBag, Users, TrendingUp, Package,
  ArrowUp, ArrowDown, Clock, ChevronRight
} from 'lucide-react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { getOrders, getProducts, getUsers } from '../../services/api'
import { formatPrice, formatDateTime, orderStatusLabel, orderStatusColor } from '../../utils/format'
import Loader from '../../components/common/Loader'

/* ─── Stat Card ── */
function StatCard({ title, value, change, icon: Icon, accent = false, index }) {
  const positive = change >= 0
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      className={`relative border p-5 transition-colors ${
        accent
          ? 'bg-brand-ink border-brand-ink text-brand-cream'
          : 'bg-brand-cream border-brand-stone hover:border-brand-warm'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <Icon size={16} strokeWidth={1.5} className={accent ? 'text-brand-cream/60' : 'text-brand-muted'} />
        <span className={`flex items-center gap-0.5 text-2xs font-mono ${positive ? 'text-green-600' : 'text-red-500'}`}>
          {positive ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
          {Math.abs(change)}%
        </span>
      </div>
      <p className={`font-display text-3xl font-light leading-none mb-1 ${accent ? 'text-brand-cream' : 'text-brand-ink'}`}>
        {value}
      </p>
      <p className={`text-2xs font-mono tracking-wider uppercase ${accent ? 'text-brand-cream/50' : 'text-brand-muted'}`}>
        {title}
      </p>
    </motion.div>
  )
}

/* ─── Revenue Bar ── */
function RevenueBar({ label, value, max, index }) {
  const pct = max ? Math.round((value / max) * 100) : 0
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-2xs font-mono text-brand-mid uppercase tracking-open">{label}</span>
        <span className="text-2xs font-mono text-brand-ink">{pct}%</span>
      </div>
      <div className="h-1 bg-brand-stone overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, delay: 0.2 + index * 0.1, ease: 'easeOut' }}
          className="h-full bg-brand-ink"
        />
      </div>
    </div>
  )
}

/* ─── Status Dot ── */
const statusDot = {
  delivered: 'bg-green-500',
  cancelled:  'bg-red-500',
  shipping:   'bg-cyan-500',
  pending:    'bg-yellow-500',
  confirmed:  'bg-blue-500',
  processing: 'bg-purple-500',
}

export default function AdminDashboard() {
  const [orders, setOrders]     = useState([])
  const [products, setProducts] = useState([])
  const [users, setUsers]       = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([getOrders(), getProducts(), getUsers()])
      .then(([o, p, u]) => { setOrders(o); setProducts(p); setUsers(u) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <DashboardLayout role="admin">
      <div className="flex justify-center items-center h-screen bg-brand-paper"><Loader size="lg" /></div>
    </DashboardLayout>
  )

  const activeOrders = orders.filter(o => o.status !== 'cancelled')
  const totalRevenue = activeOrders.reduce((s, o) => s + o.total, 0)
  const customers    = users.filter(u => u.role === 'customer').length
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8)
  const pendingCount = orders.filter(o => ['pending', 'confirmed'].includes(o.status)).length

  const catRevenue = {}
  orders.forEach(order =>
    order.items.forEach(item => {
      const cat = products.find(p => p.id === item.productId)?.category || 'other'
      catRevenue[cat] = (catRevenue[cat] || 0) + item.price * item.quantity
    })
  )
  const catEntries = Object.entries(catRevenue).sort((a, b) => b[1] - a[1])
  const maxCatRev  = catEntries[0]?.[1] || 1

  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1
    return acc
  }, {})

  return (
    <DashboardLayout role="admin">
      <div className="p-6 lg:p-8 space-y-7">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-2xs font-mono text-brand-muted tracking-wider uppercase mb-1">Young Savage</p>
            <h1 className="font-display text-4xl lg:text-5xl font-light text-brand-ink">Dashboard</h1>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-2xs font-mono text-brand-muted bg-brand-cream border border-brand-stone px-3 py-2">
            <Clock size={11} />
            {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard title="Tổng doanh thu" value={formatPrice(totalRevenue)} change={12.5} icon={TrendingUp} accent index={0} />
          <StatCard title="Đơn hàng"       value={orders.length}            change={8.2}  icon={ShoppingBag}      index={1} />
          <StatCard title="Khách hàng"     value={customers}                change={15.3} icon={Users}            index={2} />
          <StatCard title="Sản phẩm"       value={products.length}          change={0}    icon={Package}          index={3} />
        </div>

        {/* Alert */}
        {pendingCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between bg-yellow-50 border border-yellow-200 px-5 py-3"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
              <span className="text-xs font-mono text-yellow-700 tracking-open">
                {pendingCount} đơn hàng đang chờ xử lý
              </span>
            </div>
            <Link to="/admin/orders" className="text-xs font-mono text-yellow-700 hover:text-brand-ink flex items-center gap-1 transition-colors">
              Xử lý ngay <ChevronRight size={11} />
            </Link>
          </motion.div>
        )}

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Recent orders */}
          <div className="lg:col-span-2 bg-brand-cream border border-brand-stone overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-brand-stone">
              <h3 className="text-2xs font-mono text-brand-muted tracking-wider uppercase">Đơn hàng gần đây</h3>
              <Link to="/admin/orders" className="text-2xs font-mono text-brand-muted hover:text-brand-ink transition-colors flex items-center gap-1">
                Tất cả <ChevronRight size={11} />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-brand-stone">
                    {['Mã đơn', 'Khách hàng', 'Tổng tiền', 'Trạng thái'].map(h => (
                      <th key={h} className="text-left py-2.5 px-4 text-2xs font-mono text-brand-muted uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order, i) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 + i * 0.03 }}
                      className="border-b border-brand-stone/60 hover:bg-brand-paper transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-xs text-brand-ink">{order.id}</td>
                      <td className="py-3 px-4">
                        <p className="text-sm font-body text-brand-ink">{order.customerName}</p>
                        <p className="text-2xs font-mono text-brand-muted">{order.customerPhone}</p>
                      </td>
                      <td className="py-3 px-4 font-body text-sm text-brand-ink whitespace-nowrap">{formatPrice(order.total)}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 text-2xs font-mono text-brand-mid">
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusDot[order.status] || 'bg-brand-muted'}`} />
                          {orderStatusLabel[order.status]}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              {recentOrders.length === 0 && (
                <p className="text-center text-brand-muted font-mono text-xs py-10">Chưa có đơn hàng nào</p>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">

            {/* Revenue by category */}
            <div className="bg-brand-cream border border-brand-stone p-5">
              <h3 className="text-2xs font-mono text-brand-muted tracking-wider uppercase mb-5">Doanh thu theo danh mục</h3>
              <div className="space-y-4">
                {catEntries.map(([cat, rev], i) => (
                  <RevenueBar key={cat} label={cat} value={rev} max={maxCatRev} index={i} />
                ))}
                {catEntries.length === 0 && <p className="text-brand-muted font-mono text-xs">Không có dữ liệu</p>}
              </div>
            </div>

            {/* Order status breakdown */}
            <div className="bg-brand-cream border border-brand-stone p-5">
              <h3 className="text-2xs font-mono text-brand-muted tracking-wider uppercase mb-4">Phân bổ trạng thái</h3>
              <div className="space-y-2.5">
                {Object.entries(statusCounts).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-xs font-mono text-brand-mid">
                      <span className={`w-1.5 h-1.5 rounded-full ${statusDot[status] || 'bg-brand-muted'}`} />
                      {orderStatusLabel[status]}
                    </span>
                    <span className="font-display text-xl font-light text-brand-ink">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top products */}
            <div className="bg-brand-cream border border-brand-stone p-5">
              <h3 className="text-2xs font-mono text-brand-muted tracking-wider uppercase mb-4">Top bán chạy</h3>
              <div className="space-y-3">
                {[...products].sort((a, b) => b.soldCount - a.soldCount).slice(0, 4).map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <span className="font-display text-xl font-light text-brand-stone w-5 flex-shrink-0">{i + 1}</span>
                    <img src={p.images[0]} alt="" className="w-9 h-11 object-cover bg-brand-paper flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-body text-brand-ink leading-tight line-clamp-1">{p.name}</p>
                      <p className="text-2xs font-mono text-brand-muted mt-0.5">{p.soldCount} đã bán</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}