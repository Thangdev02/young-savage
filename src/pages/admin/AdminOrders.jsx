import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Clock, MapPin, CreditCard } from 'lucide-react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { getOrders, updateOrder } from '../../services/api'
import { formatPrice, formatDateTime, orderStatusLabel } from '../../utils/format'
import Loader from '../../components/common/Loader'
import toast from 'react-hot-toast'

const ALL_STATUSES = ['pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled']

const STATUS_FLOW = {
  pending:    ['confirmed', 'cancelled'],
  confirmed:  ['processing', 'cancelled'],
  processing: ['shipping',  'cancelled'],
  shipping:   ['delivered', 'cancelled'],
  delivered:  [],
  cancelled:  [],
}

const statusStyle = {
  pending:    'bg-yellow-50 text-yellow-700 border-yellow-200',
  confirmed:  'bg-blue-50 text-blue-700 border-blue-200',
  processing: 'bg-purple-50 text-purple-700 border-purple-200',
  shipping:   'bg-cyan-50 text-cyan-700 border-cyan-200',
  delivered:  'bg-green-50 text-green-700 border-green-200',
  cancelled:  'bg-red-50 text-red-700 border-red-200',
}

const statusDot = {
  pending: 'bg-yellow-500', confirmed: 'bg-blue-500', processing: 'bg-purple-500',
  shipping: 'bg-cyan-500', delivered: 'bg-green-500', cancelled: 'bg-red-500',
}

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-2xs font-mono px-2 py-0.5 border ${statusStyle[status] || 'text-brand-muted'}`}>
      <span className={`w-1 h-1 rounded-full ${statusDot[status]}`} />
      {orderStatusLabel[status]}
    </span>
  )
}

function OrderTimeline({ history }) {
  return (
    <div className="space-y-2.5">
      {[...history].reverse().map((h, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${i === 0 ? 'bg-brand-ink' : 'bg-brand-stone'}`} />
          <div>
            <p className={`text-xs font-mono ${i === 0 ? 'text-brand-ink' : 'text-brand-muted'}`}>
              {orderStatusLabel[h.status]}
            </p>
            <p className="text-2xs font-mono text-brand-muted">{formatDateTime(h.time)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function OrderDetail({ order, onStatusUpdate, updating }) {
  if (!order) return (
    <div className="bg-brand-cream border border-brand-stone h-full flex items-center justify-center min-h-[280px]">
      <p className="text-xs font-mono text-brand-muted text-center px-4">Chọn đơn hàng để xem chi tiết</p>
    </div>
  )

  const nextStatuses = STATUS_FLOW[order.status] || []

  return (
    <motion.div
      key={order.id}
      initial={{ opacity: 0, x: 6 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-brand-cream border border-brand-stone overflow-y-auto max-h-[calc(100vh-160px)] sticky top-6"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-brand-stone flex items-start justify-between">
        <div>
          <p className="text-2xs font-mono text-brand-muted">{formatDateTime(order.createdAt)}</p>
          <h3 className="font-mono text-sm text-brand-ink mt-0.5">{order.id}</h3>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="p-5 space-y-5">
        {/* Customer */}
        <div>
          <p className="text-2xs font-mono text-brand-muted tracking-wider uppercase mb-2">Khách hàng</p>
          <p className="text-sm font-body text-brand-ink">{order.customerName}</p>
          <p className="text-xs font-mono text-brand-mid mt-0.5">{order.customerPhone}</p>
          {order.customerEmail && <p className="text-xs font-mono text-brand-muted">{order.customerEmail}</p>}
        </div>

        {/* Address */}
        <div className="flex gap-2">
          <MapPin size={12} strokeWidth={1.5} className="text-brand-muted mt-0.5 flex-shrink-0" />
          <p className="text-xs font-body text-brand-mid leading-relaxed">
            {order.shippingAddress.street}, {order.shippingAddress.ward && order.shippingAddress.ward + ', '}
            {order.shippingAddress.district}, {order.shippingAddress.city}
          </p>
        </div>

        {/* Payment */}
        <div className="flex items-center gap-2">
          <CreditCard size={12} strokeWidth={1.5} className="text-brand-muted flex-shrink-0" />
          <span className="text-xs font-mono text-brand-mid">
            {order.paymentMethod === 'cod' ? 'COD' : order.paymentMethod === 'bank_transfer' ? 'Chuyển khoản' : 'MoMo'}
          </span>
          <span className={`text-2xs font-mono ml-auto ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
            {order.paymentStatus === 'paid' ? '✓ Đã TT' : '○ Chưa TT'}
          </span>
        </div>

        {/* Note */}
        {order.note && (
          <div className="bg-brand-paper border border-brand-stone px-3 py-2.5">
            <p className="text-2xs font-mono text-brand-muted uppercase mb-1">Ghi chú</p>
            <p className="text-xs font-body text-brand-mid">{order.note}</p>
          </div>
        )}

        {/* Items */}
        <div>
          <p className="text-2xs font-mono text-brand-muted tracking-wider uppercase mb-3">
            Sản phẩm ({order.items.length})
          </p>
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex gap-3">
                <img src={item.image} alt="" className="w-11 h-14 object-cover bg-brand-paper flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-body text-brand-ink line-clamp-2 leading-tight">{item.productName}</p>
                  <p className="text-2xs font-mono text-brand-muted mt-0.5">{item.color} · {item.size} · ×{item.quantity}</p>
                  <p className="text-xs font-body text-brand-ink mt-0.5">{formatPrice(item.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="border-t border-brand-stone pt-4 space-y-1.5">
          <div className="flex justify-between text-xs font-mono text-brand-muted">
            <span>Tạm tính</span><span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-xs font-mono text-brand-muted">
            <span>Vận chuyển</span>
            <span>{order.shippingFee === 0 ? 'Miễn phí' : formatPrice(order.shippingFee)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-xs font-mono text-green-600">
              <span>Giảm giá</span><span>-{formatPrice(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-brand-stone">
            <span className="font-body font-medium text-sm text-brand-ink">Tổng cộng</span>
            <span className="font-display text-xl font-light text-brand-ink">{formatPrice(order.total)}</span>
          </div>
        </div>

        {/* Timeline */}
        <div className="border-t border-brand-stone pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={11} strokeWidth={1.5} className="text-brand-muted" />
            <p className="text-2xs font-mono text-brand-muted tracking-wider uppercase">Lịch sử</p>
          </div>
          <OrderTimeline history={order.statusHistory} />
        </div>

        {/* Actions */}
        {nextStatuses.length > 0 && (
          <div className="border-t border-brand-stone pt-4">
            <p className="text-2xs font-mono text-brand-muted tracking-wider uppercase mb-3">Cập nhật trạng thái</p>
            <div className="flex flex-col gap-2">
              {nextStatuses.map(s => (
                <button
                  key={s}
                  onClick={() => onStatusUpdate(order.id, s)}
                  disabled={updating}
                  className={`w-full text-xs font-mono py-2.5 border transition-all disabled:opacity-40 ${
                    s === 'cancelled'
                      ? 'border-red-200 text-red-600 hover:bg-red-50'
                      : 'border-brand-stone text-brand-mid hover:border-brand-ink hover:text-brand-ink hover:bg-brand-paper'
                  }`}
                >
                  {updating ? '...' : `→ ${orderStatusLabel[s]}`}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function AdminOrders({ staffMode = false }) {
  const [orders, setOrders]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [statusFilter, setFilter] = useState('')
  const [selected, setSelected]   = useState(null)
  const [updating, setUpdating]   = useState(false)

  useEffect(() => {
    getOrders()
      .then(data => setOrders(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    let r = [...orders]
    if (search) r = r.filter(o =>
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerPhone.includes(search)
    )
    if (statusFilter) r = r.filter(o => o.status === statusFilter)
    return r
  }, [orders, search, statusFilter])

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdating(true)
    try {
      const order = orders.find(o => o.id === orderId)
      const updated = await updateOrder(orderId, {
        ...order,
        status: newStatus,
        statusHistory: [...order.statusHistory, { status: newStatus, time: new Date().toISOString() }],
        updatedAt: new Date().toISOString(),
      })
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o))
      setSelected(updated)
      toast.success(`Cập nhật → ${orderStatusLabel[newStatus]}`)
    } catch { toast.error('Lỗi cập nhật trạng thái') } finally { setUpdating(false) }
  }

  return (
    <DashboardLayout role={staffMode ? 'staff' : 'admin'}>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display text-4xl lg:text-5xl font-light text-brand-ink">Đơn hàng</h1>
          <p className="text-2xs font-mono text-brand-muted mt-1">{filtered.length} / {orders.length} đơn</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="relative flex-1 min-w-48">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field-box pl-8 text-sm py-2"
              placeholder="Tìm mã đơn, tên, SĐT..."
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-ink">
                <X size={12} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setFilter('')}
              className={`font-mono text-2xs px-3 py-2 border transition-all ${!statusFilter ? 'bg-brand-ink text-brand-cream border-brand-ink' : 'border-brand-stone text-brand-mid hover:border-brand-ink hover:text-brand-ink'}`}
            >
              Tất cả ({orders.length})
            </button>
            {ALL_STATUSES.map(s => {
              const cnt = orders.filter(o => o.status === s).length
              return cnt > 0 ? (
                <button
                  key={s}
                  onClick={() => setFilter(statusFilter === s ? '' : s)}
                  className={`font-mono text-2xs px-3 py-2 border transition-all ${statusFilter === s ? 'bg-brand-ink text-brand-cream border-brand-ink' : 'border-brand-stone text-brand-mid hover:border-brand-ink hover:text-brand-ink'}`}
                >
                  {orderStatusLabel[s]} ({cnt})
                </button>
              ) : null
            })}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader /></div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            {/* Table */}
            <div className="xl:col-span-2 bg-brand-cream border border-brand-stone overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-brand-stone">
                      {['Mã đơn', 'Khách hàng', 'SP', 'Tổng', 'Trạng thái'].map(h => (
                        <th key={h} className="text-left py-3 px-4 text-2xs font-mono text-brand-muted uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {filtered.map((order, i) => (
                        <motion.tr
                          key={order.id}
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.02 }}
                          onClick={() => setSelected(order)}
                          className={`border-b border-brand-stone/50 cursor-pointer transition-colors ${
                            selected?.id === order.id ? 'bg-brand-paper' : 'hover:bg-brand-paper/60'
                          }`}
                        >
                          <td className="py-3 px-4 font-mono text-xs text-brand-ink whitespace-nowrap">{order.id}</td>
                          <td className="py-3 px-4">
                            <p className="text-sm font-body text-brand-ink">{order.customerName}</p>
                            <p className="text-2xs font-mono text-brand-muted">{order.customerPhone}</p>
                          </td>
                          <td className="py-3 px-4 text-xs font-mono text-brand-muted text-center">{order.items.length}</td>
                          <td className="py-3 px-4 text-sm font-body text-brand-ink whitespace-nowrap">{formatPrice(order.total)}</td>
                          <td className="py-3 px-4"><StatusBadge status={order.status} /></td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
                {filtered.length === 0 && (
                  <div className="text-center py-16">
                    <p className="text-xs font-mono text-brand-muted">Không tìm thấy đơn hàng nào</p>
                  </div>
                )}
              </div>
            </div>

            {/* Detail */}
            <OrderDetail order={selected} onStatusUpdate={handleStatusUpdate} updating={updating} />
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}