import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { formatPrice } from '../../utils/format'
import { Link } from 'react-router-dom'

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, total, count } = useCart()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-brand-ink/15 backdrop-blur-[2px] z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed right-0 top-0 h-full w-full max-w-[400px] bg-white z-50 flex flex-col shadow-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-brand-stone">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-body text-brand-ink">Cart</span>
                {count > 0 && (
                  <span className="text-[11px] font-mono text-brand-muted">({count})</span>
                )}
              </div>
              <button onClick={() => setIsOpen(false)} className="text-brand-muted hover:text-brand-ink transition-colors p-1">
                <X size={16} strokeWidth={1.5} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-5 px-6">
                  <ShoppingBag size={32} strokeWidth={1} className="text-brand-stone" />
                  <p className="text-[13px] font-body text-brand-muted">Your cart is empty</p>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-[11px] font-mono text-brand-muted hover:text-brand-ink underline underline-offset-2 transition-colors"
                  >
                    Continue shopping
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-brand-stone/60">
                  {items.map((item) => (
                    <div key={item.key} className="flex gap-4 px-6 py-5">
                      {/* Image */}
                      <Link to={`/products/${item.slug}`} onClick={() => setIsOpen(false)} className="flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-20 object-cover bg-[#F8F8F7]"
                        />
                      </Link>

                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/products/${item.slug}`}
                          onClick={() => setIsOpen(false)}
                          className="text-[13px] font-body text-brand-ink hover:text-brand-mid transition-colors line-clamp-2 leading-snug"
                        >
                          {item.name}
                        </Link>
                        <p className="text-[11px] font-mono text-brand-muted mt-1">
                          {item.color.name} · {item.size}
                        </p>

                        <div className="flex items-center justify-between mt-3">
                          {/* Qty — minimal */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.key, item.quantity - 1)}
                              className="w-5 h-5 flex items-center justify-center text-brand-muted hover:text-brand-ink border border-brand-stone hover:border-brand-ink transition-colors"
                            >
                              <Minus size={9} strokeWidth={1.5} />
                            </button>
                            <span className="text-[12px] font-mono text-brand-ink w-4 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.key, item.quantity + 1)}
                              className="w-5 h-5 flex items-center justify-center text-brand-muted hover:text-brand-ink border border-brand-stone hover:border-brand-ink transition-colors"
                            >
                              <Plus size={9} strokeWidth={1.5} />
                            </button>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-[13px] font-body text-brand-ink">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                            <button
                              onClick={() => removeItem(item.key)}
                              className="text-brand-muted hover:text-brand-red transition-colors"
                            >
                              <Trash2 size={12} strokeWidth={1.5} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-brand-stone px-6 py-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-body text-brand-mid">Subtotal</span>
                  <span className="text-[14px] font-body text-brand-ink">{formatPrice(total)}</span>
                </div>
                <p className="text-[11px] font-mono text-brand-muted">
                  Shipping & discounts calculated at checkout
                </p>
                <Link
                  to="/checkout"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between w-full bg-brand-ink text-white px-5 py-3.5 text-[12px] font-body tracking-wider hover:bg-brand-red transition-colors duration-150"
                >
                  <span>Checkout</span>
                  <div className="flex items-center gap-2">
                    <span>{formatPrice(total)}</span>
                    <ArrowRight size={13} strokeWidth={1.5} />
                  </div>
                </Link>
                <Link
                  to="/cart"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center text-[11px] font-mono text-brand-muted hover:text-brand-ink transition-colors underline underline-offset-2"
                >
                  View cart
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}