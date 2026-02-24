import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown, ChevronLeft, ChevronRight,
  Heart, ShoppingBag, ArrowRight, Star
} from 'lucide-react'
import CustomerLayout from '../../components/layout/CustomerLayout'
import ProductCard from '../../components/common/ProductCard'
import Loader from '../../components/common/Loader'
import { getProduct, getProducts } from '../../services/api'
import { formatPrice, formatDate } from '../../utils/format'
import { useCart } from '../../context/CartContext'
import toast from 'react-hot-toast'

export default function ProductDetailPage() {
  const { slug } = useParams()
  const { addItem } = useCart()
  const [product, setProduct]           = useState(null)
  const [related, setRelated]           = useState([])
  const [loading, setLoading]           = useState(true)
  const [selectedColor, setSelectedColor] = useState(null)
  const [selectedSize, setSelectedSize]   = useState(null)
  const [quantity, setQuantity]           = useState(1)
  const [activeImg, setActiveImg]         = useState(0)
  const [openSection, setOpenSection]     = useState('description')
  const [wishlist, setWishlist]           = useState(false)

  useEffect(() => {
    setLoading(true)
    getProduct(slug).then(async (data) => {
      if (data) {
        setProduct(data)
        setSelectedColor(data.colors[0])
        const all = await getProducts()
        setRelated(all.filter(p => p.category === data.category && p.id !== data.id).slice(0, 4))
      }
    }).finally(() => setLoading(false))
  }, [slug])

  useEffect(() => { setActiveImg(0) }, [selectedColor])

  if (loading) return (
    <CustomerLayout>
      <div className="flex justify-center items-center min-h-[70vh]"><Loader /></div>
    </CustomerLayout>
  )

  if (!product) return (
    <CustomerLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-[13px] font-body text-brand-muted">Product not found</p>
        <Link to="/products" className="btn-outline">Back</Link>
      </div>
    </CustomerLayout>
  )

  const currentImages    = selectedColor?.images?.length ? selectedColor.images : product.images
  const currentPrice     = selectedSize
    ? (product.pricing.priceBySize?.[selectedSize] || product.pricing.basePrice)
    : product.pricing.basePrice
  const salePrice        = product.pricing.salePrice
  const selectedSizeData = product.sizes.find(s => s.size === selectedSize)
  const inStock          = selectedSizeData ? selectedSizeData.stock > 0 : true
  const discountPct      = salePrice ? Math.round((1 - salePrice / product.pricing.basePrice) * 100) : null

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Please select a size')
      return
    }
    addItem(product, selectedSize, selectedColor, quantity)
    toast.success('Added to cart')
  }

  const AccordionItem = ({ id, title, children }) => (
    <div className="border-t border-brand-stone">
      <button
        onClick={() => setOpenSection(openSection === id ? null : id)}
        className="w-full flex items-center justify-between py-4"
      >
        <span className="text-[12px] font-body text-brand-ink">{title}</span>
        <ChevronDown
          size={13}
          strokeWidth={1.5}
          className={`text-brand-muted transition-transform duration-300 ${openSection === id ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence>
        {openSection === id && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-5 text-[13px] font-body font-light text-brand-mid leading-relaxed">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  return (
    <CustomerLayout>
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 pt-6 pb-8 text-[11px] font-mono text-brand-muted">
          <Link to="/" className="hover:text-brand-ink transition-colors">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-brand-ink transition-colors">Products</Link>
          <span>/</span>
          <span className="text-brand-ink truncate max-w-[200px]">{product.name}</span>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 pb-24">

          {/* ── Left: Images ── */}
          <div className="flex gap-3">
            {/* Thumbnail strip — left side like Figma reference */}
            {currentImages.length > 1 && (
              <div className="flex flex-col gap-2 w-14 flex-shrink-0">
                {currentImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`w-14 h-16 overflow-hidden flex-shrink-0 transition-opacity ${
                      i === activeImg ? 'opacity-100 ring-1 ring-brand-ink' : 'opacity-40 hover:opacity-70'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Main image */}
            <div className="flex-1 relative overflow-hidden bg-[#F8F8F7] aspect-[4/5] group">
              <AnimatePresence mode="wait">
                <motion.img
                  key={`${selectedColor?.name}-${activeImg}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  src={currentImages[activeImg]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>

              {/* Nav arrows */}
              {currentImages.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImg(p => (p - 1 + currentImages.length) % currentImages.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                  >
                    <ChevronLeft size={14} strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={() => setActiveImg(p => (p + 1) % currentImages.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                  >
                    <ChevronRight size={14} strokeWidth={1.5} />
                  </button>
                </>
              )}

              {/* Discount badge */}
              {salePrice && (
                <span className="absolute top-4 right-4 text-[11px] font-mono text-brand-red">
                  −{discountPct}%
                </span>
              )}
            </div>
          </div>

          {/* ── Right: Info ── */}
          <div className="lg:pt-1 flex flex-col">

            {/* Category */}
            <p className="text-[11px] font-mono text-brand-muted tracking-wider uppercase mb-3">
              {product.category}
            </p>

            {/* Name */}
            <h1 className="font-body font-normal text-[22px] lg:text-[26px] text-brand-ink leading-tight mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-5">
              <div className="flex items-center gap-0.5">
                {Array(5).fill(null).map((_, i) => (
                  <Star key={i} size={10} strokeWidth={0}
                    className={i < Math.floor(product.rating) ? 'fill-brand-ink' : 'fill-brand-stone'}
                  />
                ))}
              </div>
              <span className="text-[11px] font-mono text-brand-muted">
                {product.rating} · {product.reviewCount} reviews · {product.soldCount} sold
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-7 pb-6 border-b border-brand-stone">
              {salePrice ? (
                <>
                  <span className="text-[18px] font-body text-brand-red">{formatPrice(salePrice)}</span>
                  <span className="text-[15px] font-body text-brand-muted line-through">{formatPrice(currentPrice)}</span>
                </>
              ) : (
                <span className="text-[18px] font-body text-brand-ink">{formatPrice(currentPrice)}</span>
              )}
            </div>

            {/* Color */}
            <div className="mb-5">
              <p className="text-[11px] font-mono text-brand-muted tracking-wider uppercase mb-3">
                Color — <span className="text-brand-ink">{selectedColor?.name}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color)}
                    title={color.name}
                    className={`w-6 h-6 rounded-full transition-all ${
                      selectedColor?.name === color.name
                        ? 'ring-2 ring-offset-2 ring-brand-ink'
                        : 'ring-1 ring-brand-stone hover:ring-brand-warm'
                    }`}
                    style={{ background: color.code }}
                  />
                ))}
              </div>
            </div>

            {/* Size */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-mono text-brand-muted tracking-wider uppercase">Size</p>
                <button className="text-[11px] font-mono text-brand-muted hover:text-brand-ink transition-colors">
                  Size guide
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s.size}
                    onClick={() => s.stock > 0 && setSelectedSize(s.size)}
                    disabled={s.stock === 0}
                    className={`w-10 h-10 text-[12px] font-body border transition-all ${
                      selectedSize === s.size
                        ? 'bg-brand-ink text-white border-brand-ink'
                        : s.stock === 0
                        ? 'border-brand-stone text-brand-stone cursor-not-allowed line-through'
                        : 'border-brand-stone text-brand-mid hover:border-brand-ink hover:text-brand-ink'
                    }`}
                  >
                    {s.size}
                    {s.stock <= 5 && s.stock > 0 && (
                      <span className="block text-[8px] text-brand-red leading-none mt-0.5">{s.stock}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Qty + Add */}
            <div className="flex gap-2 mb-5">
              {/* Quantity */}
              <div className="flex items-center border border-brand-stone w-28">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="flex-1 flex items-center justify-center h-11 text-brand-muted hover:text-brand-ink transition-colors text-lg"
                >
                  −
                </button>
                <span className="text-[13px] font-mono text-brand-ink w-6 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="flex-1 flex items-center justify-center h-11 text-brand-muted hover:text-brand-ink transition-colors text-lg"
                >
                  +
                </button>
              </div>

              {/* Add to cart */}
              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className={`flex-1 flex items-center justify-center gap-2 h-11 text-[12px] font-body tracking-wider transition-all duration-150 ${
                  inStock
                    ? 'bg-brand-ink text-white hover:bg-brand-red'
                    : 'bg-brand-stone text-brand-muted cursor-not-allowed'
                }`}
              >
                <ShoppingBag size={13} strokeWidth={1.5} />
                {inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>

              {/* Wishlist */}
              <button
                onClick={() => setWishlist(!wishlist)}
                className={`w-11 h-11 flex items-center justify-center border transition-colors ${
                  wishlist ? 'border-brand-red text-brand-red' : 'border-brand-stone text-brand-muted hover:border-brand-ink hover:text-brand-ink'
                }`}
              >
                <Heart size={14} strokeWidth={1.5} className={wishlist ? 'fill-current' : ''} />
              </button>
            </div>

            {/* Policies — single line, text only */}
            <p className="text-[11px] font-mono text-brand-muted mb-6">
              Free shipping over 500K · 30-day returns · Authentic
            </p>

            {/* Accordions */}
            <div className="border-b border-brand-stone mt-auto">
              <AccordionItem id="description" title="Description">
                <p>{product.description}</p>
                {product.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {product.tags.map(tag => (
                      <span key={tag} className="text-[10px] font-mono text-brand-muted border border-brand-stone px-2 py-0.5 tracking-wider">{tag}</span>
                    ))}
                  </div>
                )}
              </AccordionItem>

              <AccordionItem id="material" title="Material & Care">
                <p className="mb-3"><span className="text-brand-ink">Material:</span> {product.material}</p>
                <ul className="space-y-1">
                  {product.careInstructions?.map((c, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-brand-muted mt-0.5">—</span>{c}
                    </li>
                  ))}
                </ul>
              </AccordionItem>

              <AccordionItem id="reviews" title={`Reviews (${product.reviewCount})`}>
                {product.reviews?.length > 0 ? (
                  <div className="space-y-5">
                    {product.reviews.map(review => (
                      <div key={review.id} className="pb-5 border-b border-brand-stone last:border-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] font-body text-brand-ink">{review.userName}</span>
                            {review.verified && <span className="text-[10px] font-mono text-green-600 bg-green-50 px-1.5 py-0.5">✓ Verified</span>}
                          </div>
                          <span className="text-[11px] font-mono text-brand-muted">{formatDate(review.date)}</span>
                        </div>
                        <div className="flex gap-0.5 mb-2">
                          {Array(5).fill(null).map((_, i) => (
                            <Star key={i} size={9} strokeWidth={0}
                              className={i < review.rating ? 'fill-brand-ink' : 'fill-brand-stone'}
                            />
                          ))}
                        </div>
                        <p>{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-brand-muted">No reviews yet.</p>
                )}
              </AccordionItem>
            </div>
          </div>
        </div>

        {/* ── Related products ── */}
        {related.length > 0 && (
          <div className="pt-12 pb-24 border-t border-brand-stone">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-[15px] font-body text-brand-ink">You may also like</h2>
              <Link to={`/products?category=${product.category}`}
                className="flex items-center gap-1 text-[11px] font-mono text-brand-muted hover:text-brand-ink transition-colors">
                View all <ArrowRight size={11} />
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  )
}