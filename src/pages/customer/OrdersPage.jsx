import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Package, ChevronDown, ChevronUp } from 'lucide-react'
import CustomerLayout from '../../components/layout/CustomerLayout'
import { useAuth } from '../../context/AuthContext'
import { getOrdersByUser } from '../../services/api'
import { formatPrice, formatDateTime, orderStatusLabel, orderStatusColor } from '../../utils/format'
import Loader from '../../components/common/Loader'

function OrderStatusTimeline({ history }) {
  const statuses = ['pending', 'confirmed', 'processing', 'shipping', 'delivered']
  const currentIdx = statuses.indexOf(history[history.length - 1]?.status)

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {statuses.map((s, i) => (
        <div key={s} className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${i <= currentIdx ? 'bg-green-400' : 'bg-savage-gray-700'}`} />
          <span className={`text-[10px] font-mono ${i <= currentIdx ? 'text-green-400' : 'text-savage-gray-700'}`}>
            {orderStatusLabel[s]}
          </span>
          {i < statuses.length - 1 && <div className={`w-4 h-px ${i < currentIdx ? 'bg-green-400' : 'bg-savage-gray-800'}`} />}
        </div>
      ))}
    </div>
  )
}

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-savage-gray-800 hover:border-savage-gray-600 transition-colors"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
          <span className="font-mono text-sm text-savage-white">{order.id}</span>
          <span className="font-mono text-xs text-savage-gray-600">{formatDateTime(order.createdAt)}</span>
          <span className={`text-xs font-mono ${orderStatusColor[order.status]}`}>
            {orderStatusLabel[order.status]}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-body font-semibold text-savage-white hidden sm:block">
            {formatPrice(order.total)}
          </span>
          {expanded ? <ChevronUp size={16} className="text-savage-gray-500" /> : <ChevronDown size={16} className="text-savage-gray-500" />}
        </div>
      </div>

      {/* Items preview */}
      {!expanded && (
        <div className="px-5 pb-4 flex gap-2">
          {order.items.slice(0, 4).map((item, i) => (
            <img key={i} src={item.image} alt="" className="w-10 h-12 object-cover bg-savage-gray-900" />
          ))}
          {order.items.length > 4 && (
            <div className="w-10 h-12 bg-savage-gray-800 flex items-center justify-center">
              <span className="text-xs font-mono text-savage-gray-500">+{order.items.length - 4}</span>
            </div>
          )}
        </div>
      )}

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-savage-gray-800 p-5 space-y-4">
          {/* Timeline */}
          <div>
            <p className="text-xs font-mono text-savage-gray-600 uppercase mb-3">Trạng thái đơn hàng</p>
            <OrderStatusTimeline history={order.statusHistory} />
          </div>

          {/* Items */}
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex gap-4">
                <img src={item.image} alt="" className="w-16 h-20 object-cover bg-savage-gray-900" />
                <div>
                  <p className="font-body text-sm text-savage-white">{item.productName}</p>
                  <p className="text-xs font-mono text-savage-gray-500 mt-1">
                    {item.color} • Size {item.size} • x{item.quantity}
                  </p>
                  <p className="font-body text-sm text-savage-white mt-1">{formatPrice(item.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="border-t border-savage-gray-800 pt-4 space-y-1">
            <div className="flex justify-between text-xs font-mono text-savage-gray-500">
              <span>Tạm tính</span><span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-xs font-mono text-savage-gray-500">
              <span>Vận chuyển</span>
              <span>{order.shippingFee === 0 ? 'Miễn phí' : formatPrice(order.shippingFee)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-xs font-mono text-green-400">
                <span>Giảm giá</span><span>-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-body font-semibold text-savage-white pt-2">
              <span>Tổng cộng</span><span>{formatPrice(order.total)}</span>
            </div>
          </div>

          {/* Address */}
          <div className="border-t border-savage-gray-800 pt-4">
            <p className="text-xs font-mono text-savage-gray-600 uppercase mb-2">Địa chỉ giao hàng</p>
            <p className="text-sm font-body text-savage-gray-300">
              {order.shippingAddress.street}, {order.shippingAddress.ward}, {order.shippingAddress.district}, {order.shippingAddress.city}
            </p>
          </div>

          {order.note && (
            <div className="border-t border-savage-gray-800 pt-4">
              <p className="text-xs font-mono text-savage-gray-600 uppercase mb-1">Ghi chú</p>
              <p className="text-sm font-body text-savage-gray-400">{order.note}</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}

export default function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    getOrdersByUser(user.id).then(data => {
      setOrders(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
    }).finally(() => setLoading(false))
  }, [user])

  if (!user) {
    return (
      <CustomerLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <p className="font-display text-3xl text-savage-gray-700 tracking-widest">CHƯA ĐĂNG NHẬP</p>
          <Link to="/login" className="btn-primary">Đăng nhập</Link>
        </div>
      </CustomerLayout>
    )
  }

  return (
    <CustomerLayout>
      <div className="px-6 lg:px-12 py-12">
        <h1 className="font-display text-6xl text-savage-white tracking-tight mb-10">ĐƠN HÀNG CỦA TÔI</h1>

        {loading ? (
          <div className="flex justify-center py-24"><Loader text="Đang tải..." /></div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-6">
            <Package size={56} className="text-savage-gray-800" />
            <p className="font-display text-3xl text-savage-gray-700 tracking-widest">CHƯA CÓ ĐƠN NÀO</p>
            <Link to="/products" className="btn-primary">Bắt đầu mua sắm</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </CustomerLayout>
  )
}