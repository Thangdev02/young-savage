import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight } from 'lucide-react'
import CustomerLayout from '../../components/layout/CustomerLayout'
import { useCart } from '../../context/CartContext'
import { formatPrice } from '../../utils/format'

export default function CartPage() {
  const { items, removeItem, updateQuantity, total } = useCart()
  const SHIPPING = total >= 500000 ? 0 : 30000

  return (
    <CustomerLayout>
      <div className="px-6 lg:px-12 py-12 min-h-[60vh]">
        <h1 className="font-display text-6xl text-savage-white tracking-tight mb-10">GIỎ HÀNG</h1>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-6">
            <ShoppingBag size={56} className="text-savage-gray-800" />
            <p className="font-display text-3xl text-savage-gray-700 tracking-widest">TRỐNG</p>
            <Link to="/products" className="btn-primary">Khám phá sản phẩm</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Items */}
            <div className="lg:col-span-2 space-y-0 border-t border-savage-gray-800">
              {items.map((item, i) => (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-6 py-6 border-b border-savage-gray-800"
                >
                  <Link to={`/products/${item.slug}`}>
                    <img src={item.image} alt={item.name} className="w-24 h-28 lg:w-32 lg:h-36 object-cover bg-savage-gray-900 flex-shrink-0" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${item.slug}`} className="font-body font-medium text-savage-white hover:text-savage-gray-300 transition-colors text-sm lg:text-base">
                      {item.name}
                    </Link>
                    <div className="flex gap-3 mt-1.5 mb-4">
                      <span className="text-xs font-mono text-savage-gray-500">Size: {item.size}</span>
                      <span className="text-xs font-mono text-savage-gray-500">Màu: {item.color.name}</span>
                    </div>
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center border border-savage-gray-700">
                        <button onClick={() => updateQuantity(item.key, item.quantity - 1)} className="px-3 py-2 text-savage-gray-400 hover:text-savage-white">
                          <Minus size={13} />
                        </button>
                        <span className="px-4 font-mono text-sm text-savage-white">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.key, item.quantity + 1)} className="px-3 py-2 text-savage-gray-400 hover:text-savage-white">
                          <Plus size={13} />
                        </button>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-body font-semibold text-savage-white">{formatPrice(item.price * item.quantity)}</span>
                        <button onClick={() => removeItem(item.key)} className="text-savage-gray-600 hover:text-savage-red transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Summary */}
            <div>
              <div className="border border-savage-gray-800 p-6 sticky top-24">
                <h3 className="font-mono text-xs tracking-widest uppercase text-white mb-6">Tóm tắt đơn hàng</h3>

                <div className="space-y-3 mb-6 pb-6 border-b border-savage-gray-800">
                  <div className="flex justify-between text-sm font-body">
                    <span className="text-white">Tạm tính</span>
                    <span className="text-savage-white">{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-body">
                    <span className="text-savage-gray-400">Phí vận chuyển</span>
                    <span className={SHIPPING === 0 ? 'text-green-400' : 'text-savage-white'}>
                      {SHIPPING === 0 ? 'Miễn phí' : formatPrice(SHIPPING)}
                    </span>
                  </div>
                  {SHIPPING > 0 && (
                    <p className="text-xs font-mono text-savage-gray-600">
                      Mua thêm {formatPrice(500000 - total)} để được free ship
                    </p>
                  )}
                </div>

                <div className="flex justify-between mb-6">
                  <span className="font-mono text-sm tracking-wider text-savage-white">TỔNG CỘNG</span>
                  <span className="font-display text-2xl text-savage-white tracking-wide">{formatPrice(total + SHIPPING)}</span>
                </div>

                <Link to="/checkout" className="btn-primary w-full text-center flex items-center justify-center gap-2">
                  Thanh toán <ArrowRight size={14} />
                </Link>
                <Link to="/products" className="btn-outline w-full text-center mt-3 flex items-center justify-center gap-2">
                  Tiếp tục mua sắm
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  )
}