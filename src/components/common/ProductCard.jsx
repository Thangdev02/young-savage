import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { formatPrice } from '../../utils/format'

export default function ProductCard({ product, index = 0 }) {
  if (!product) return null

  const image =
    product?.images?.[0] ||
    product?.image ||
    'https://via.placeholder.com/600x800?text=No+Image'

  const price =
    product?.pricing?.salePrice ??
    product?.pricing?.basePrice ??
    0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.8,
        delay: index * 0.05,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="group bg-brand-paper border-r border-b border-brand-stone"
    >
      <Link
        to={`/products/${product?.slug || ''}`}
        className="block relative overflow-hidden aspect-[3/4]"
      >
        <img
          src={image}
          alt={product?.name || 'Product'}
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000 ease-out"
        />

        {product?.isNew && (
          <div className="absolute top-4 left-4">
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase bg-white text-black px-2 py-1">
              New
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </Link>

      <div className="p-6 space-y-2">
        <div className="flex justify-between items-start gap-4">
          <Link to={`/product/${product?.slug || ''}`} className="flex-1">
            <h3 className="text-[11px] font-bold tracking-[0.15em] uppercase text-brand-ink leading-tight group-hover:underline decoration-1 underline-offset-4">
              {product?.name}
            </h3>
          </Link>
        </div>

        <div className="flex items-center justify-between pt-1">
          <p className="text-xs font-mono text-brand-muted">
            {formatPrice(price)}
          </p>

          <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest">
            {product?.category}
          </span>
        </div>
      </div>
    </motion.div>
  )
}