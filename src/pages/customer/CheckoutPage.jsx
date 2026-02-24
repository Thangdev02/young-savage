import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, CreditCard, Truck, Tag, Check } from 'lucide-react'
import CustomerLayout from '../../components/layout/CustomerLayout'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { createOrder, validateCoupon } from '../../services/api'
import { formatPrice } from '../../utils/format'
import toast from 'react-hot-toast'

const STEPS = ['Information', 'Shipping', 'Payment']

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep]         = useState(0)
  const [loading, setLoading]   = useState(false)
  const [couponCode, setCoupon] = useState('')
  const [coupon, setCouponData] = useState(null)
  const [order, setOrder]       = useState(null)

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    ward: user?.address?.ward || '',
    district: user?.address?.district || '',
    city: user?.address?.city || 'Ho Chi Minh City',
    paymentMethod: 'cod',
    note: ''
  })

  const SHIPPING  = total >= 500000 ? 0 : 30000
  const discount  = coupon
    ? coupon.type === 'percentage'
      ? Math.min(total * coupon.value / 100, coupon.maxDiscount)
      : coupon.value
    : 0
  const finalTotal = total + SHIPPING - discount

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const applyCode = async () => {
    try {
      const c = await validateCoupon(couponCode.toUpperCase())
      if (!c) { toast.error('Invalid code'); return }
      if (total < c.minOrder) { toast.error(`Min order ${formatPrice(c.minOrder)}`); return }
      setCouponData(c)
      toast.success('Coupon applied!')
    } catch { toast.error('Error') }
  }

  const placeOrder = async () => {
    if (!form.name || !form.phone || !form.street) { toast.error('Please fill all required fields'); return }
    setLoading(true)
    try {
      const created = await createOrder({
        userId: user?.id || 'guest',
        customerName: form.name,
        customerPhone: form.phone,
        customerEmail: form.email,
        items: items.map(i => ({
          productId: i.productId, productName: i.name, image: i.image,
          color: i.color.name, size: i.size, quantity: i.quantity, price: i.price
        })),
        subtotal: total, shippingFee: SHIPPING, discount, total: finalTotal,
        shippingAddress: { street: form.street, ward: form.ward, district: form.district, city: form.city },
        paymentMethod: form.paymentMethod,
        paymentStatus: form.paymentMethod === 'cod' ? 'pending' : 'paid',
        status: 'pending',
        statusHistory: [{ status: 'pending', time: new Date().toISOString() }],
        note: form.note, couponCode: coupon?.code
      })
      setOrder(created); clearCart(); setStep(3)
    } catch { toast.error('Something went wrong') } finally { setLoading(false) }
  }

  if (items.length === 0 && step !== 3) return (
    <CustomerLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-[13px] font-body text-brand-muted">Your cart is empty</p>
        <Link to="/products" className="btn-primary">Shop now</Link>
      </div>
    </CustomerLayout>
  )

  /* Success */
  if (step === 3 && order) return (
    <CustomerLayout>
      <div className="max-w-[480px] mx-auto flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="w-12 h-12 bg-green-50 border border-green-200 flex items-center justify-center mb-6"
        >
          <Check size={20} strokeWidth={1.5} className="text-green-600" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <p className="text-[11px] font-mono text-brand-muted tracking-wider uppercase mb-2">Order confirmed</p>
          <h1 className="font-body font-normal text-[26px] text-brand-ink mb-3">Thank you!</h1>
          <p className="text-[13px] font-body text-brand-mid mb-1">Order <span className="font-mono text-brand-ink">{order.id}</span></p>
          <p className="text-[12px] font-body text-brand-muted mb-8">We'll contact you within 30 minutes</p>
          <div className="flex gap-3 justify-center">
            <Link to="/orders" className="btn-primary">View order</Link>
            <Link to="/" className="btn-outline">Home</Link>
          </div>
        </motion.div>
      </div>
    </CustomerLayout>
  )

  const inputClass = "w-full border-b border-brand-stone bg-transparent text-[13px] font-body text-brand-ink placeholder-brand-muted py-2.5 focus:outline-none focus:border-brand-ink transition-colors"
  const labelClass = "block text-[10px] font-mono text-brand-muted tracking-wider uppercase mb-1.5"

  return (
    <CustomerLayout>
      <div className="max-w-[1100px] mx-auto px-6 lg:px-10 py-10 pb-24">

        {/* Back */}
        <Link to="/cart" className="flex items-center gap-1.5 text-[11px] font-mono text-brand-muted hover:text-brand-ink transition-colors mb-8">
          <ChevronLeft size={12} /> Back to cart
        </Link>

        {/* Steps indicator — dots */}
        <div className="flex items-center gap-2 mb-10">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 ${i === step ? 'text-brand-ink' : i < step ? 'text-brand-mid' : 'text-brand-muted'}`}>
                <div className={`w-5 h-5 flex items-center justify-center text-[11px] font-mono border transition-all ${
                  i < step ? 'bg-brand-ink border-brand-ink text-white'
                  : i === step ? 'border-brand-ink text-brand-ink'
                  : 'border-brand-stone text-brand-muted'
                }`}>
                  {i < step ? <Check size={10} strokeWidth={2} /> : i + 1}
                </div>
                <span className="text-[11px] font-mono hidden sm:block">{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-px ${i < step ? 'bg-brand-ink' : 'bg-brand-stone'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-12">

          {/* ── Form ── */}
          <div>
            {step === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                <p className="text-[10px] font-mono text-brand-muted tracking-wider uppercase mb-6">Contact information</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Full name *</label>
                    <input value={form.name} onChange={e => update('name', e.target.value)} className={inputClass} placeholder="Nguyen Van A" />
                  </div>
                  <div>
                    <label className={labelClass}>Phone *</label>
                    <input value={form.phone} onChange={e => update('phone', e.target.value)} className={inputClass} placeholder="0901234567" />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Email</label>
                    <input value={form.email} onChange={e => update('email', e.target.value)} className={inputClass} placeholder="email@example.com" type="email" />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Street address *</label>
                    <input value={form.street} onChange={e => update('street', e.target.value)} className={inputClass} placeholder="House number, street name" />
                  </div>
                  <div>
                    <label className={labelClass}>Ward</label>
                    <input value={form.ward} onChange={e => update('ward', e.target.value)} className={inputClass} placeholder="Ward 1" />
                  </div>
                  <div>
                    <label className={labelClass}>District</label>
                    <input value={form.district} onChange={e => update('district', e.target.value)} className={inputClass} placeholder="District 1" />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>City</label>
                    <input value={form.city} onChange={e => update('city', e.target.value)} className={inputClass} />
                  </div>
                </div>
                <button onClick={() => setStep(1)} className="btn-primary mt-4">
                  Continue
                </button>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                <p className="text-[10px] font-mono text-brand-muted tracking-wider uppercase mb-6">Shipping method</p>
                {[
                  { value: 'standard', label: 'Standard delivery', desc: '3-5 business days', fee: 30000 },
                  { value: 'express',  label: 'Express delivery',  desc: '1-2 business days', fee: 55000 },
                  { value: 'free',     label: 'Free shipping',      desc: '3-5 business days', fee: 0, disabled: total < 500000 },
                ].map(opt => (
                  <button
                    key={opt.value}
                    disabled={opt.disabled}
                    className={`w-full flex items-center justify-between px-4 py-3.5 border transition-all text-left ${
                      opt.disabled ? 'border-brand-stone text-brand-stone cursor-not-allowed opacity-40'
                      : 'border-brand-stone hover:border-brand-ink cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Truck size={14} strokeWidth={1.5} className="text-brand-muted flex-shrink-0" />
                      <div>
                        <p className="text-[13px] font-body text-brand-ink">{opt.label}</p>
                        <p className="text-[11px] font-mono text-brand-muted">{opt.desc}</p>
                      </div>
                    </div>
                    <span className="text-[13px] font-body text-brand-ink">
                      {opt.fee === 0 ? 'Free' : formatPrice(opt.fee)}
                    </span>
                  </button>
                ))}

                <div className="mt-5">
                  <label className={labelClass}>Order note</label>
                  <textarea
                    value={form.note}
                    onChange={e => update('note', e.target.value)}
                    className={`${inputClass} resize-none`}
                    rows={2}
                    placeholder="Instructions for shipper, special requests..."
                  />
                </div>

                <div className="flex gap-3 mt-5">
                  <button onClick={() => setStep(0)} className="btn-outline">Back</button>
                  <button onClick={() => setStep(2)} className="btn-primary">Continue</button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                <p className="text-[10px] font-mono text-brand-muted tracking-wider uppercase mb-6">Payment method</p>
                {[
                  { value: 'cod',           label: 'Cash on delivery (COD)',   icon: Truck },
                  { value: 'bank_transfer', label: 'Bank transfer',            icon: CreditCard },
                  { value: 'momo',          label: 'MoMo wallet',              icon: CreditCard },
                ].map(pm => (
                  <button
                    key={pm.value}
                    onClick={() => update('paymentMethod', pm.value)}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 border transition-all ${
                      form.paymentMethod === pm.value
                        ? 'border-brand-ink bg-brand-paper'
                        : 'border-brand-stone hover:border-brand-warm'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      form.paymentMethod === pm.value ? 'border-brand-ink' : 'border-brand-stone'
                    }`}>
                      {form.paymentMethod === pm.value && <div className="w-1.5 h-1.5 rounded-full bg-brand-ink" />}
                    </div>
                    <pm.icon size={13} strokeWidth={1.5} className="text-brand-muted flex-shrink-0" />
                    <span className="text-[13px] font-body text-brand-ink">{pm.label}</span>
                  </button>
                ))}

                {form.paymentMethod === 'bank_transfer' && (
                  <div className="p-4 bg-brand-paper border border-brand-stone mt-2">
                    <p className="text-[10px] font-mono text-brand-muted tracking-wider uppercase mb-2">Bank details</p>
                    <div className="space-y-1 text-[12px] font-mono text-brand-mid">
                      <p>Bank: <span className="text-brand-ink">Techcombank</span></p>
                      <p>Account: <span className="text-brand-ink">1234567890</span></p>
                      <p>Name: <span className="text-brand-ink">YOUNG SAVAGE STORE</span></p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 mt-5">
                  <button onClick={() => setStep(1)} className="btn-outline">Back</button>
                  <button
                    onClick={placeOrder}
                    disabled={loading}
                    className="btn-primary flex-1 justify-center"
                  >
                    {loading ? 'Processing...' : `Place order — ${formatPrice(finalTotal)}`}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* ── Order summary ── */}
          <div className="border-l border-brand-stone pl-10 hidden lg:block">
            <p className="text-[10px] font-mono text-brand-muted tracking-wider uppercase mb-5">Order summary</p>

            {/* Items */}
            <div className="space-y-4 pb-5 border-b border-brand-stone max-h-64 overflow-y-auto no-scrollbar">
              {items.map(item => (
                <div key={item.key} className="flex gap-3">
                  <div className="relative flex-shrink-0">
                    <img src={item.image} alt="" className="w-12 h-14 object-cover bg-[#F8F8F7]" />
                    <span className="absolute -top-1.5 -right-1.5 bg-brand-ink text-white text-[9px] font-mono w-4 h-4 rounded-full flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-body text-brand-ink line-clamp-1">{item.name}</p>
                    <p className="text-[11px] font-mono text-brand-muted">{item.size} · {item.color.name}</p>
                    <p className="text-[12px] font-body text-brand-ink mt-0.5">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div className="py-4 border-b border-brand-stone">
              <div className="flex gap-2">
                <input
                  value={couponCode}
                  onChange={e => setCoupon(e.target.value)}
                  className="flex-1 border-b border-brand-stone bg-transparent text-[12px] font-body text-brand-ink placeholder-brand-muted py-1.5 focus:outline-none focus:border-brand-ink"
                  placeholder="Discount code"
                />
                <button onClick={applyCode} className="text-[11px] font-mono text-brand-muted hover:text-brand-ink transition-colors flex items-center gap-1">
                  <Tag size={11} strokeWidth={1.5} /> Apply
                </button>
              </div>
              {coupon && (
                <p className="text-[11px] font-mono text-green-600 mt-1.5">✓ {coupon.code} · −{formatPrice(discount)}</p>
              )}
            </div>

            {/* Totals */}
            <div className="py-4 space-y-2">
              <div className="flex justify-between text-[12px] font-body text-brand-mid">
                <span>Subtotal</span><span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-[12px] font-body text-brand-mid">
                <span>Shipping</span>
                <span className={SHIPPING === 0 ? 'text-green-600' : ''}>
                  {SHIPPING === 0 ? 'Free' : formatPrice(SHIPPING)}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[12px] font-body text-green-600">
                  <span>Discount</span><span>−{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t border-brand-stone">
                <span className="text-[14px] font-body text-brand-ink">Total</span>
                <span className="text-[16px] font-body text-brand-ink">{formatPrice(finalTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  )
}