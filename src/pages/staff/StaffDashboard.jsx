import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ShoppingBag, Package, AlertTriangle,
  CheckCircle, Clock, ChevronRight, ArrowRight
} from 'lucide-react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { getOrders, getProducts, updateOrder } from '../../services/api'
import { formatPrice, formatDateTime, orderStatusLabel } from '../../utils/format'
import Loader from '../../components/common/Loader'
import toast from 'react-hot-toast'

const statusDot = {
  pending:    'bg-yellow-500',
  confirmed:  'bg-blue-500',
  processing: 'bg-purple-500',
  shipping:   'bg-cyan-500',
  delivered:  'bg-green-500',
  cancelled:  'bg-red-500',
}

function QuickStat({ title, value, icon: Icon, color, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="bg-brand-cream border border-brand-stone p-5"
    >
      <Icon size={16} strokeWidth={1.5} className={`${color} mb-4`} />
      <p className="font-display text-3xl font-light text-brand-ink leading-none">{value}</p>
      <p className="text-2xs font-mono text-brand-muted tracking-wider uppercase mt-1">{title}</p>
    </motion.div>
  )
}

export default function StaffDashboard() {
  const [orders, setOrders]     = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    Promise.all([getOrders(), getProducts()])
      .then(([o, p]) => { setOrders(o); setProducts(p) })
      .finally(() => setLoading(false))
  }, [])

  const handleQuickConfirm = async (order) => {
    setUpdating(order.id)
    try {
      const newStatus = order.status === 'pending' ? 'confirmed' : 'processing'
      const updated = await updateOrder(order.id, {
        ...order,
        status: newStatus,
        statusHistory: [...order.statusHistory, { status: newStatus, time: new Date().toISOString() }],
        updatedAt: new Date().toISOString(),
      })
      setOrders(prev => prev.map(o => o.id === order.id ? updated : o))
      toast.success(`Đơn ${order.id} → ${orderStatusLabel[newStatus]}`)
    } catch { toast.error('Lỗi cập nhật') } finally { setUpdating(null) }
  }

  if (loading) return (
    <DashboardLayout role="staff">
      <div className="flex justify-center items-center h-screen bg-brand-paper"><Loader size="lg" /></div>
    </DashboardLayout>
  )

  const pendingOrders   = orders.filter(o => o.status === 'pending')
  const confirmedOrders = orders.filter(o => o.status === 'confirmed')
  const processingOrds  = orders.filter(o => o.status === 'processing')
  const todayOrders     = orders.filter(o => {
    const d = new Date(o.createdAt), t = new Date()
    return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear()
  })
  const lowStockProducts = products.filter(p => p.sizes.some(s => s.stock > 0 && s.stock <= 5))
  const outOfStock       = products.filter(p => p.sizes.every(s => s.stock === 0))
  const needAction       = [...pendingOrders, ...confirmedOrders]
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).slice(0, 8)

  return (
    <DashboardLayout role="staff">
      <div className="p-6 lg:p-8 space-y-6">

        {/* Header */}
        <div>
          <p className="text-2xs font-mono text-brand-muted tracking-wider uppercase mb-1">Staff Portal</p>
          <h1 className="font-display text-4xl lg:text-5xl font-light text-brand-ink">Dashboard</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <QuickStat title="Chờ xác nhận" value={pendingOrders.length}    icon={Clock}         color="text-yellow-500" index={0} />
          <QuickStat title="Đang xử lý"   value={processingOrds.length}   icon={Package}       color="text-blue-500"   index={1} />
          <QuickStat title="Đơn hôm nay"  value={todayOrders.length}      icon={CheckCircle}   color="text-green-500"  index={2} />
          <QuickStat title="Sắp hết hàng" value={lowStockProducts.length} icon={AlertTriangle} color="text-brand-red"  index={3} />
        </div>

        {/* Alerts */}
        {(pendingOrders.length > 0 || outOfStock.length > 0) && (
          <div className="flex flex-col sm:flex-row gap-2">
            {pendingOrders.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="flex-1 flex items-center justify-between bg-yellow-50 border border-yellow-200 px-4 py-3"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                  <span className="text-xs font-mono text-yellow-700">{pendingOrders.length} đơn chờ xác nhận</span>
                </div>
                <Link to="/staff/orders" className="text-xs font-mono text-yellow-700 hover:text-brand-ink flex items-center gap-1">
                  Xử lý <ArrowRight size={10} />
                </Link>
              </motion.div>
            )}
            {outOfStock.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                className="flex-1 flex items-center justify-between bg-red-50 border border-red-200 px-4 py-3"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span className="text-xs font-mono text-red-700">{outOfStock.length} sản phẩm hết hàng</span>
                </div>
                <Link to="/staff/products" className="text-xs font-mono text-red-700 hover:text-brand-ink flex items-center gap-1">
                  Xem <ArrowRight size={10} />
                </Link>
              </motion.div>
            )}
          </div>
        )}

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Orders needing action */}
          <div className="lg:col-span-2 bg-brand-cream border border-brand-stone overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-brand-stone">
              <h3 className="text-2xs font-mono text-brand-muted tracking-wider uppercase">Đơn cần xử lý</h3>
              <Link to="/staff/orders" className="text-2xs font-mono text-brand-muted hover:text-brand-ink transition-colors flex items-center gap-1">
                Tất cả <ChevronRight size={11} />
              </Link>
            </div>

            {needAction.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 gap-3">
                <CheckCircle size={28} strokeWidth={1.5} className="text-green-500" />
                <p className="text-xs font-mono text-brand-muted">Tất cả đơn đã được xử lý 🎉</p>
              </div>
            ) : (
              <div className="divide-y divide-brand-stone/60">
                {needAction.map((order, i) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 + i * 0.04 }}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-brand-paper transition-colors"
                  >
                    {/* Thumbnails */}
                    <div className="flex -space-x-2 flex-shrink-0">
                      {order.items.slice(0, 2).map((item, j) => (
                        <img key={j} src={item.image} alt="" className="w-9 h-11 object-cover bg-brand-paper border border-brand-cream" />
                      ))}
                      {order.items.length > 2 && (
                        <div className="w-9 h-11 bg-brand-paper border border-brand-cream flex items-center justify-center">
                          <span className="text-2xs font-mono text-brand-muted">+{order.items.length - 2}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-brand-ink">{order.id}</span>
                        <span className="flex items-center gap-1 text-2xs font-mono text-brand-mid">
                          <span className={`w-1.5 h-1.5 rounded-full ${statusDot[order.status]}`} />
                          {orderStatusLabel[order.status]}
                        </span>
                      </div>
                      <p className="text-xs font-body text-brand-mid mt-0.5">{order.customerName} · {order.customerPhone}</p>
                      <p className="text-2xs font-mono text-brand-muted mt-0.5">{formatDateTime(order.createdAt)}</p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="font-body text-sm text-brand-ink">{formatPrice(order.total)}</p>
                      <button
                        onClick={() => handleQuickConfirm(order)}
                        disabled={updating === order.id}
                        className="mt-1 text-2xs font-mono text-brand-muted hover:text-green-600 transition-colors disabled:opacity-40"
                      >
                        {updating === order.id ? '...' : order.status === 'pending' ? '→ Xác nhận' : '→ Xử lý'}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Right */}
          <div className="space-y-4">

            {/* Low stock */}
            <div className="bg-brand-cream border border-brand-stone overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-brand-stone">
                <h3 className="text-2xs font-mono text-brand-muted tracking-wider uppercase">Cảnh báo tồn kho</h3>
                <Link to="/staff/products" className="text-2xs font-mono text-brand-muted hover:text-brand-ink transition-colors flex items-center gap-1">
                  Xem <ChevronRight size={11} />
                </Link>
              </div>

              {lowStockProducts.length === 0 ? (
                <div className="flex items-center gap-2 px-5 py-4">
                  <CheckCircle size={13} strokeWidth={1.5} className="text-green-500" />
                  <p className="text-xs font-mono text-green-600">Tồn kho ổn định</p>
                </div>
              ) : (
                <div className="divide-y divide-brand-stone/60">
                  {lowStockProducts.slice(0, 5).map((product, i) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 + i * 0.05 }}
                      className="flex items-center gap-3 px-5 py-3"
                    >
                      <img src={product.images[0]} alt="" className="w-8 h-10 object-cover bg-brand-paper flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-body text-brand-ink line-clamp-1">{product.name}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {product.sizes.filter(s => s.stock > 0 && s.stock <= 5).map(s => (
                            <span key={s.size} className="text-2xs font-mono text-brand-red bg-brand-redLight px-1.5 py-0.5">
                              {s.size}: {s.stock}
                            </span>
                          ))}
                          {product.sizes.filter(s => s.stock === 0).map(s => (
                            <span key={s.size} className="text-2xs font-mono text-brand-muted bg-brand-stone px-1.5 py-0.5">
                              {s.size}: 0
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Today's orders */}
            <div className="bg-brand-cream border border-brand-stone p-5">
              <h3 className="text-2xs font-mono text-brand-muted tracking-wider uppercase mb-4">Đơn hôm nay</h3>
              {todayOrders.length === 0 ? (
                <p className="text-xs font-mono text-brand-muted">Chưa có đơn nào hôm nay</p>
              ) : (
                <div className="space-y-3">
                  {todayOrders.slice(0, 5).map(order => (
                    <div key={order.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-mono text-xs text-brand-ink">{order.id}</p>
                        <p className="text-2xs font-mono text-brand-muted">{formatDateTime(order.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-body text-sm text-brand-ink">{formatPrice(order.total)}</p>
                        <span className="flex items-center gap-1 text-2xs font-mono text-brand-mid justify-end">
                          <span className={`w-1.5 h-1.5 rounded-full ${statusDot[order.status]}`} />
                          {orderStatusLabel[order.status]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-brand-stone grid grid-cols-2 gap-3">
                <div>
                  <p className="text-2xs font-mono text-brand-muted uppercase">Doanh thu hôm nay</p>
                  <p className="font-display text-lg font-light text-brand-ink mt-0.5">
                    {formatPrice(todayOrders.reduce((s, o) => s + o.total, 0))}
                  </p>
                </div>
                <div>
                  <p className="text-2xs font-mono text-brand-muted uppercase">Đơn hoàn thành</p>
                  <p className="font-display text-lg font-light text-green-600 mt-0.5">
                    {todayOrders.filter(o => o.status === 'delivered').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}