import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Shield, Truck, RefreshCw, TrendingUp } from 'lucide-react'
import CustomerLayout from '../../components/layout/CustomerLayout'
import ProductCard from '../../components/common/ProductCard'
import Loader from '../../components/common/Loader'
import { getProducts } from '../../services/api'

/* ─────────────────────────────────────────
   Fade-in helper
───────────────────────────────────────── */
const FadeUp = ({ children, delay = 0, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 18 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
    className={className}
  >
    {children}
  </motion.div>
)

/* ─────────────────────────────────────────
   HERO
───────────────────────────────────────── */
function HeroSection() {
  return (
    <section className="relative min-h-[92vh] flex items-end bg-brand-black overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=1600&q=90"
          alt=""
          className="w-full h-full object-cover opacity-45"
        />
        {/* Gradient: bottom-heavy for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/30 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full px-8 lg:px-16 pb-16 lg:pb-20">
        <div className="max-w-3xl">
          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="text-2xs font-mono text-brand-muted tracking-wider uppercase mb-5"
          >
            Young Savage — Winter 2025
          </motion.p>

          {/* Headline: italic serif, light weight */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-[clamp(3.5rem,9vw,8rem)] font-light italic text-white leading-[1] mb-6"
          >
            Heavyweight<br />
            <span className="not-italic font-semibold">Collection</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-brand-muted font-body font-light text-base mb-10 max-w-sm leading-relaxed"
          >
            Streetwear nặng chất liệu, nhẹ về form. Made for everyday wear.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="flex items-center gap-5"
          >
            <Link to="/products" className="btn-primary">
              Khám phá ngay <ArrowRight size={13} />
            </Link>
            <Link to="/lookbook" className="inline-flex items-center gap-1.5 text-xs font-body text-brand-muted hover:text-white transition-colors tracking-wide uppercase">
              Lookbook <ArrowUpRight size={12} />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Bottom right scroll hint */}
      <div className="absolute bottom-8 right-8 lg:right-16 z-10 hidden lg:flex flex-col items-center gap-2">
        <div className="w-px h-12 bg-brand-muted/40" />
        <span className="text-2xs font-mono text-brand-muted/60 tracking-wider uppercase rotate-0">Scroll</span>
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────
   MARQUEE STRIP
───────────────────────────────────────── */
function MarqueeStrip() {
  const items = ['Free ship đơn 500K', 'Đổi trả 30 ngày', 'Hàng chính hãng', 'Giao toàn quốc', 'Drop mới mỗi tháng']
  const repeated = [...items, ...items]

  return (
    <div className="border-y border-brand-stone bg-brand-paper overflow-hidden py-3">
      <div className="flex animate-marquee whitespace-nowrap">
        {repeated.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-6 px-8 text-2xs font-mono text-brand-mid tracking-wider uppercase">
            {item}
            <span className="text-brand-warm">·</span>
          </span>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   CATEGORIES — asymmetric editorial grid
───────────────────────────────────────── */
function CategorySection() {
  const cats = [
    { name: 'T-Shirts', slug: 'tshirts', image: '/cateTS.jpg', span: 'lg:col-span-2 lg:row-span-2' },
    { name: 'Hoodies',  slug: 'hoodies', image: '/cateHD.jpg', span: '' },
    { name: 'Pants',    slug: 'pants',   image: '/cateP.jpg', span: '' },
    { name: 'Jackets',  slug: 'jackets', image: 'https://djn2oq6v2lacp.cloudfront.net/wp-content/uploads/2025/09/shearling-961-style-fashion.jpg', span: '' },
  ]

  return (

    <section className="px-8 lg:px-16 py-20 ">
      {/* Header */}
      <FadeUp className="flex items-end justify-between mb-10">
        <div>
          <p className="section-eyebrow mb-2">Danh mục</p>
          <h2 className="font-display text-4xl lg:text-5xl font-light text-brand-ink">Shop by category</h2>
        </div>
        <Link to="/products" className="btn-ghost">
          Tất cả <ArrowRight size={12} />
        </Link>
      </FadeUp>

      {/* Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 lg:grid-rows-2 gap-2 lg:h-[540px]">
        {cats.map((cat, i) => (
          <FadeUp key={cat.slug} delay={i * 0.08} className={`${cat.span} group`}>
            <Link
              to={`/products?category=${cat.slug}`}
              className="block relative h-full min-h-[220px] overflow-hidden bg-brand-paper"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-brand-black/20 group-hover:bg-brand-black/35 transition-colors duration-300" />
              {/* Label */}
              <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between">
                <h3 className="font-display text-xl lg:text-2xl font-light italic text-white">{cat.name}</h3>
                <ArrowUpRight size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </Link>
          </FadeUp>
        ))}
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────
   PRODUCTS SECTION — shared layout
───────────────────────────────────────── */
function ProductsSection({ title, eyebrow, link, linkLabel, products, loading, cols = 4 }) {
  return (
    <section className="px-8 lg:px-16 py-16 border-t border-brand-stone">
      <FadeUp className="flex items-end justify-between mb-10">
        <div>
          <p className="section-eyebrow mb-2">{eyebrow}</p>
          <h2 className="font-display text-4xl lg:text-5xl font-light text-brand-ink">{title}</h2>
        </div>
        <Link to={link} className="btn-ghost">
          {linkLabel} <ArrowRight size={12} />
        </Link>
      </FadeUp>

      {loading ? (
        <div className="flex justify-center py-20"><Loader text="Đang tải..." /></div>
      ) : (
        <div className={`grid grid-cols-2 lg:grid-cols-${cols} gap-px bg-brand-stone`}>
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      )}
    </section>
  )
}

/* ─────────────────────────────────────────
   EDITORIAL BANNER
───────────────────────────────────────── */
function BannerSection() {
  return (
    <FadeUp className="mx-8 lg:mx-16 my-16">
      <div className="relative overflow-hidden bg-brand-black h-[400px] lg:h-[480px]">
        <img
          src="https://images.unsplash.com/photo-1609902726285-00668009f004?w=1400&q=90"
          alt=""
          className="w-full h-full object-cover object-top opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-black/80 to-transparent" />
        <div className="absolute inset-0 flex items-center px-10 lg:px-16">
          <div className="max-w-md">
            <p className="section-eyebrow text-brand-muted mb-4">Exclusive Collection</p>
            <h2 className="font-display text-4xl lg:text-6xl font-light italic text-white leading-tight mb-5">
              Savage<br /><span className="not-italic font-semibold">Winter 2025</span>
            </h2>
            <p className="text-brand-muted text-sm font-body font-light leading-relaxed mb-8 max-w-xs">
              Những chất liệu heavyweight tốt nhất, được thiết kế để đứng mãi với thời gian.
            </p>
            <Link to="/products?filter=new" className="btn-red">
              Shop Collection <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </FadeUp>
  )
}

/* ─────────────────────────────────────────
   FEATURES
───────────────────────────────────────── */
function FeatureSection() {
  const features = [
    { icon: Shield,    title: 'Chất lượng đảm bảo', desc: 'Mỗi sản phẩm qua kiểm định nghiêm ngặt' },
    { icon: Truck,     title: 'Giao toàn quốc',      desc: 'Free ship đơn từ 500K, 2–3 ngày' },
    { icon: RefreshCw, title: 'Đổi trả 30 ngày',     desc: 'Miễn phí nếu có lỗi từ nhà sản xuất' },
    { icon: TrendingUp,title: 'Authentic only',       desc: '100% hàng chính hãng' },
  ]

  return (
    <section className="px-8 lg:px-16 py-14 border-t border-brand-stone bg-brand-paper">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((f, i) => (
          <FadeUp key={i} delay={i * 0.08} className="flex flex-col items-start gap-3">
            <f.icon size={18} className="text-brand-mid" strokeWidth={1.5} />
            <div>
              <p className="font-body font-medium text-brand-ink text-sm mb-1">{f.title}</p>
              <p className="text-2xs font-body text-brand-muted leading-relaxed">{f.desc}</p>
            </div>
          </FadeUp>
        ))}
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────
   TESTIMONIALS
───────────────────────────────────────── */
function TestimonialSection() {
  const reviews = [
    { name: 'Minh Khoa',   text: 'Vải dày, form chuẩn. Young Savage là brand local số 1 tôi follow.', rating: 5 },
    { name: 'Thanh Trúc',  text: 'Mặc áo đi phố ai cũng hỏi mua ở đâu. Quality rất tốt.',             rating: 5 },
    { name: 'Bảo Long',    text: 'Giao hàng cực nhanh, đóng gói kỹ. Sẽ ủng hộ dài dài.',              rating: 5 },
  ]

  return (
    <section className="px-8 lg:px-16 py-20 border-t border-brand-stone">
      <FadeUp className="mb-12">
        <p className="section-eyebrow mb-2">Đánh giá</p>
        <h2 className="font-display text-4xl lg:text-5xl font-light text-brand-ink">Khách hàng nói gì</h2>
      </FadeUp>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {reviews.map((r, i) => (
          <FadeUp key={i} delay={i * 0.1}>
            <div className="border-t-2 border-brand-ink pt-6">
              {/* Stars */}
              <div className="flex gap-0.5 mb-5">
                {Array(r.rating).fill(null).map((_, j) => (
                  <span key={j} className="text-brand-ink text-xs">★</span>
                ))}
              </div>
              <p className="font-display text-xl font-light italic text-brand-ink leading-snug mb-5">
                "{r.text}"
              </p>
              <p className="text-2xs font-mono text-brand-muted tracking-wider uppercase">{r.name}</p>
            </div>
          </FadeUp>
        ))}
      </div>
    </section>
  )
}

/* ─────────────────────────────────────────
   PAGE
───────────────────────────────────────── */
export default function HomePage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProducts().then(setProducts).catch(console.error).finally(() => setLoading(false))
  }, [])

  const bestsellers  = products.filter(p => p.isBestseller).slice(0, 4)
  const newArrivals  = products.filter(p => p.isNew).slice(0, 3)

  return (
    <CustomerLayout>
      <HeroSection />
      <MarqueeStrip />
      <CategorySection />
      <ProductsSection
        eyebrow="Bán chạy nhất"
        title="Best sellers"
        link="/products?filter=bestseller"
        linkLabel="Xem thêm"
        products={bestsellers}
        loading={loading}
        cols={4}
      />
      <BannerSection />
      <ProductsSection
        eyebrow="Mới về"
        title="New arrivals"
        link="/products?filter=new"
        linkLabel="Xem thêm"
        products={newArrivals}
        loading={loading}
        cols={3}
      />
      <FeatureSection />
      <TestimonialSection />
    </CustomerLayout>
  )
}