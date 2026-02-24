import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Edit2, X, Package, AlertTriangle } from 'lucide-react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { getProducts, updateProduct, createProduct } from '../../services/api'
import { formatPrice } from '../../utils/format'
import Loader from '../../components/common/Loader'
import toast from 'react-hot-toast'

const CATEGORIES = ['tshirts', 'hoodies', 'pants', 'jackets', 'shorts']

function ProductBadges({ product }) {
  return (
    <div className="flex gap-1 flex-wrap">
      {product.isNew        && <span className="text-2xs font-mono bg-brand-ink text-brand-cream px-1.5 py-0.5">New</span>}
      {product.isBestseller && <span className="text-2xs font-mono bg-brand-red text-white px-1.5 py-0.5">Hot</span>}
      {product.isSale       && <span className="text-2xs font-mono bg-orange-100 text-orange-600 border border-orange-200 px-1.5 py-0.5">Sale</span>}
    </div>
  )
}

function ProductFormModal({ product, onSave, onClose }) {
  const isEdit = !!product?.id

  const [form, setForm] = useState(() => product ? { ...product } : {
    name: '', slug: '', category: 'tshirts',
    description: '', shortDescription: '', material: '',
    images: ['', '', ''],
    tags: [],
    pricing: { costPrice: 0, basePrice: 0, salePrice: null },
    isBestseller: false, isNew: true, isSale: false,
    rating: 5, reviewCount: 0, soldCount: 0,
    colors: [{ name: 'Black', code: '#111111', images: [] }],
    sizes: [
      { size: 'XS', stock: 0 }, { size: 'S',  stock: 0 },
      { size: 'M',  stock: 0 }, { size: 'L',  stock: 0 },
      { size: 'XL', stock: 0 }, { size: 'XXL', stock: 0 },
    ],
    careInstructions: [],
    reviews: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })

  const [saving, setSaving] = useState(false)

  const set = (path, value) => {
    setForm(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      const keys = path.split('.')
      let obj = next
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]]
      obj[keys[keys.length - 1]] = value
      return next
    })
  }

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!form.name || !form.pricing.basePrice) { toast.error('Vui lòng điền tên và giá sản phẩm'); return }
    setSaving(true)
    const slug   = form.slug || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const images = form.images.filter(Boolean)
    await onSave({ ...form, slug, images: images.length ? images : ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800'] })
    setSaving(false)
  }

  const fieldLabel = (label) => <label className="block text-2xs font-mono text-brand-muted tracking-wider uppercase mb-2">{label}</label>

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="fixed inset-0 bg-brand-ink/20 backdrop-blur-sm z-40" />

      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className="fixed inset-x-4 lg:inset-x-16 xl:inset-x-28 inset-y-4 lg:inset-y-5 bg-brand-cream border border-brand-stone z-50 flex flex-col overflow-hidden shadow-xl"
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-stone flex-shrink-0">
          <div>
            <h2 className="font-display text-2xl font-light text-brand-ink">
              {isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
            </h2>
            {isEdit && <p className="text-2xs font-mono text-brand-muted mt-0.5">{product.id}</p>}
          </div>
          <button onClick={onClose} className="text-brand-muted hover:text-brand-ink p-1.5 transition-colors"><X size={18} /></button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-7">

          {/* Basic */}
          <section>
            <p className="text-2xs font-mono text-brand-muted tracking-wider uppercase mb-4">Thông tin cơ bản</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                {fieldLabel('Tên sản phẩm *')}
                <input value={form.name} onChange={e => set('name', e.target.value)}
                  className="input-field-box" placeholder="VD: Savage Oversized Tee" required />
              </div>
              <div>
                {fieldLabel('Danh mục')}
                <select value={form.category} onChange={e => set('category', e.target.value)} className="input-field-box">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                {fieldLabel('Mô tả ngắn')}
                <input value={form.shortDescription} onChange={e => set('shortDescription', e.target.value)}
                  className="input-field-box" placeholder="Mô tả ở card sản phẩm" />
              </div>
              <div className="md:col-span-2">
                {fieldLabel('Mô tả chi tiết')}
                <textarea value={form.description} onChange={e => set('description', e.target.value)}
                  className="input-field-box resize-none" rows={3} placeholder="Mô tả đầy đủ..." />
              </div>
              <div>
                {fieldLabel('Chất liệu')}
                <input value={form.material} onChange={e => set('material', e.target.value)}
                  className="input-field-box" placeholder="100% Cotton 300GSM..." />
              </div>
            </div>
          </section>

          {/* Images */}
          <section className="border-t border-brand-stone pt-6">
            <p className="text-2xs font-mono text-brand-muted tracking-wider uppercase mb-4">Hình ảnh (URL)</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[0, 1, 2].map(i => (
                <div key={i}>
                  {fieldLabel(`Ảnh ${i + 1}${i === 0 ? ' (chính)' : ''}`)}
                  <input value={form.images[i] || ''} onChange={e => { const imgs = [...(form.images||[])]; imgs[i] = e.target.value; set('images', imgs) }}
                    className="input-field-box text-xs" placeholder="https://..." />
                  {form.images[i] && (
                    <img src={form.images[i]} alt="" className="mt-2 w-full h-16 object-cover bg-brand-paper" />
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Pricing */}
          <section className="border-t border-brand-stone pt-6">
            <p className="text-2xs font-mono text-brand-muted tracking-wider uppercase mb-4">Giá cả</p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Giá nhập (VNĐ)', path: 'pricing.costPrice',  val: form.pricing.costPrice,  ph: '' },
                { label: 'Giá bán * (VNĐ)', path: 'pricing.basePrice',  val: form.pricing.basePrice,  ph: '' },
                { label: 'Giá sale (VNĐ)',  path: 'pricing.salePrice',  val: form.pricing.salePrice || '', ph: 'Để trống nếu không' },
              ].map(f => (
                <div key={f.path}>
                  {fieldLabel(f.label)}
                  <input type="number" min="0" value={f.val}
                    onChange={e => set(f.path, e.target.value ? +e.target.value : null)}
                    className="input-field-box" placeholder={f.ph} />
                </div>
              ))}
            </div>
          </section>

          {/* Stock */}
          <section className="border-t border-brand-stone pt-6">
            <p className="text-2xs font-mono text-brand-muted tracking-wider uppercase mb-4">Tồn kho theo size</p>
            <div className="flex flex-wrap gap-3">
              {form.sizes.map((sz, i) => (
                <div key={sz.size} className="flex flex-col items-center gap-1.5">
                  <span className="text-2xs font-mono text-brand-mid">{sz.size}</span>
                  <input type="number" min="0" value={sz.stock}
                    onChange={e => { const sizes = form.sizes.map((s, idx) => idx === i ? { ...s, stock: +e.target.value } : s); set('sizes', sizes) }}
                    className="w-14 input-field-box text-center text-sm py-1.5" />
                  {sz.stock > 0 && sz.stock <= 5 && (
                    <span className="text-2xs font-mono text-brand-red">thấp</span>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Colors */}
          <section className="border-t border-brand-stone pt-6">
            <p className="text-2xs font-mono text-brand-muted tracking-wider uppercase mb-4">Màu sắc</p>
            <div className="space-y-3">
              {form.colors.map((color, i) => (
                <div key={i} className="flex items-center gap-3 flex-wrap">
                  <input type="color" value={color.code}
                    onChange={e => { const colors = [...form.colors]; colors[i] = { ...colors[i], code: e.target.value }; set('colors', colors) }}
                    className="w-9 h-9 border border-brand-stone cursor-pointer bg-transparent" />
                  <input value={color.name}
                    onChange={e => { const colors = [...form.colors]; colors[i] = { ...colors[i], name: e.target.value }; set('colors', colors) }}
                    className="input-field-box flex-1 min-w-28 text-sm py-2" placeholder="Tên màu" />
                  {form.colors.length > 1 && (
                    <button type="button" onClick={() => set('colors', form.colors.filter((_, idx) => idx !== i))}
                      className="text-brand-muted hover:text-brand-red transition-colors"><X size={13} /></button>
                  )}
                </div>
              ))}
              <button type="button"
                onClick={() => set('colors', [...form.colors, { name: 'New Color', code: '#888888', images: [] }])}
                className="text-xs font-mono text-brand-muted hover:text-brand-ink transition-colors flex items-center gap-1.5">
                <Plus size={11} /> Thêm màu
              </button>
            </div>
          </section>

          {/* Flags */}
          <section className="border-t border-brand-stone pt-6">
            <p className="text-2xs font-mono text-brand-muted tracking-wider uppercase mb-4">Nhãn hiển thị</p>
            <div className="flex flex-wrap gap-5">
              {[
                { key: 'isNew',        label: 'Hàng mới',   style: 'bg-brand-ink text-brand-cream' },
                { key: 'isBestseller', label: 'Bestseller', style: 'bg-brand-red text-white' },
                { key: 'isSale',       label: 'Đang sale',  style: 'bg-orange-100 text-orange-600 border border-orange-200' },
              ].map(({ key, label, style }) => (
                <label key={key} className="flex items-center gap-2.5 cursor-pointer">
                  <div
                    onClick={() => set(key, !form[key])}
                    className={`w-4 h-4 border flex items-center justify-center transition-all cursor-pointer ${
                      form[key] ? 'bg-brand-ink border-brand-ink' : 'border-brand-stone hover:border-brand-ink'
                    }`}
                  >
                    {form[key] && <span className="text-brand-cream text-[10px] font-bold">✓</span>}
                  </div>
                  <span className={`text-2xs font-mono px-2 py-0.5 ${form[key] ? style : 'text-brand-muted'}`}>{label}</span>
                </label>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-brand-stone flex-shrink-0 bg-brand-cream">
          <button type="button" onClick={handleSubmit} disabled={saving} className="btn-primary">
            {saving ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo sản phẩm'}
          </button>
          <button type="button" onClick={onClose} className="btn-outline">Huỷ</button>
        </div>
      </motion.div>
    </>
  )
}

export default function AdminProducts({ staffMode = false }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [catFilter, setCat]     = useState('')
  const [showModal, setShow]    = useState(false)
  const [editProduct, setEdit]  = useState(null)

  useEffect(() => { getProducts().then(setProducts).finally(() => setLoading(false)) }, [])

  const filtered = useMemo(() => {
    let r = [...products]
    if (search)    r = r.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase()))
    if (catFilter) r = r.filter(p => p.category === catFilter)
    return r
  }, [products, search, catFilter])

  const handleSave = async (data) => {
    try {
      if (products.find(p => p.id === data.id)) {
        const updated = await updateProduct(data.id, data)
        setProducts(prev => prev.map(p => p.id === data.id ? updated : p))
        toast.success('Đã cập nhật sản phẩm')
      } else {
        const created = await createProduct({ ...data, id: `YS-${Date.now()}` })
        setProducts(prev => [...prev, created])
        toast.success('Đã tạo sản phẩm mới')
      }
      setShow(false); setEdit(null)
    } catch { toast.error('Lỗi lưu sản phẩm') }
  }

  const lowStockCount = products.filter(p => p.sizes.some(s => s.stock > 0 && s.stock <= 5)).length

  return (
    <DashboardLayout role={staffMode ? 'staff' : 'admin'}>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <h1 className="font-display text-4xl lg:text-5xl font-light text-brand-ink">Sản phẩm</h1>
            <p className="text-2xs font-mono text-brand-muted mt-1">
              {filtered.length} / {products.length} sản phẩm
              {lowStockCount > 0 && (
                <span className="ml-3 text-brand-red">
                  <AlertTriangle size={9} className="inline mr-0.5" />
                  {lowStockCount} sắp hết hàng
                </span>
              )}
            </p>
          </div>
          <button onClick={() => { setEdit(null); setShow(true) }} className="btn-primary flex-shrink-0">
            <Plus size={13} /> Thêm mới
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="relative flex-1 min-w-48">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="input-field-box pl-8 text-sm py-2" placeholder="Tìm tên, mã sản phẩm..." />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-ink"><X size={12} /></button>}
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {['', ...CATEGORIES].map(c => (
              <button key={c} onClick={() => setCat(catFilter === c ? '' : c)}
                className={`font-mono text-2xs px-3 py-2 border transition-all uppercase ${catFilter === c ? 'bg-brand-ink text-brand-cream border-brand-ink' : 'border-brand-stone text-brand-mid hover:border-brand-ink hover:text-brand-ink'}`}>
                {c || 'Tất cả'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader /></div>
        ) : (
          <div className="bg-brand-cream border border-brand-stone overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-brand-stone">
                    {['Sản phẩm', 'Danh mục', 'Giá bán', 'Tồn kho', 'Rating', 'Tags', ''].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-2xs font-mono text-brand-muted uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((product, i) => {
                    const totalStock = product.sizes.reduce((s, sz) => s + sz.stock, 0)
                    const isLow      = product.sizes.some(s => s.stock > 0 && s.stock <= 5)
                    return (
                      <motion.tr key={product.id}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                        className="border-b border-brand-stone/60 hover:bg-brand-paper transition-colors group"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img src={product.images[0]} alt="" className="w-9 h-11 object-cover bg-brand-paper flex-shrink-0" />
                            <div>
                              <p className="text-sm font-body text-brand-ink leading-tight">{product.name}</p>
                              <p className="text-2xs font-mono text-brand-muted mt-0.5">{product.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-2xs font-mono text-brand-mid uppercase">{product.category}</td>
                        <td className="py-3 px-4">
                          <p className="text-sm font-body text-brand-ink">{formatPrice(product.pricing.basePrice)}</p>
                          {product.pricing.salePrice && (
                            <p className="text-2xs font-mono text-brand-red">{formatPrice(product.pricing.salePrice)}</p>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`font-mono text-sm ${totalStock === 0 ? 'text-red-500' : isLow ? 'text-yellow-600' : 'text-green-600'}`}>
                            {totalStock}
                          </span>
                          {isLow && <AlertTriangle size={10} className="inline ml-1 text-yellow-500" />}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-xs font-mono text-yellow-500">★ {product.rating}</span>
                          <p className="text-2xs font-mono text-brand-muted">{product.soldCount} bán</p>
                        </td>
                        <td className="py-3 px-4"><ProductBadges product={product} /></td>
                        <td className="py-3 px-4">
                          <button onClick={() => { setEdit(product); setShow(true) }}
                            className="text-brand-muted hover:text-brand-ink transition-colors p-1">
                            <Edit2 size={13} strokeWidth={1.5} />
                          </button>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="text-center py-14">
                  <Package size={28} strokeWidth={1.5} className="text-brand-stone mx-auto mb-3" />
                  <p className="text-xs font-mono text-brand-muted">Không tìm thấy sản phẩm nào</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && <ProductFormModal product={editProduct} onSave={handleSave} onClose={() => { setShow(false); setEdit(null) }} />}
      </AnimatePresence>
    </DashboardLayout>
  )
}