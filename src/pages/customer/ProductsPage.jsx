import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, X, SlidersHorizontal } from 'lucide-react'
import CustomerLayout from '../../components/layout/CustomerLayout'
import ProductCard from '../../components/common/ProductCard'
import Loader from '../../components/common/Loader'
import { getProducts } from '../../services/api'

const CATEGORIES = [
  { label: 'All', value: '' },
  { label: 'T-Shirts', value: 'tshirts' },
  { label: 'Hoodies', value: 'hoodies' },
  { label: 'Pants', value: 'pants' },
  { label: 'Jackets', value: 'jackets' },
  { label: 'Shorts', value: 'shorts' },
]

const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Best selling', value: 'bestseller' },
  { label: 'Price: low', value: 'price_asc' },
  { label: 'Price: high', value: 'price_desc' },
  { label: 'Top rated', value: 'rating' },
]

const PRICE_RANGES = [
  { label: 'All prices', min: 0, max: Infinity },
  { label: 'Under 300K', min: 0, max: 300000 },
  { label: '300 – 500K', min: 300000, max: 500000 },
  { label: '500 – 800K', min: 500000, max: 800000 },
  { label: 'Over 800K', min: 800000, max: Infinity },
]

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [allProducts, setAllProducts] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterOpen, setFilterOpen] = useState(false)

  const category = searchParams.get('category') || ''
  const filter = searchParams.get('filter') || ''
  const query = searchParams.get('q') || ''
  const sort = searchParams.get('sort') || 'newest'
  const priceIdx = parseInt(searchParams.get('price') || '0')

  useEffect(() => {
    getProducts()
      .then(data => setAllProducts(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let result = Array.isArray(allProducts) ? [...allProducts] : []

    if (category) result = result.filter(p => p?.category === category)
    if (filter === 'bestseller') result = result.filter(p => p?.isBestseller)
    if (filter === 'new') result = result.filter(p => p?.isNew)
    if (filter === 'sale') result = result.filter(p => p?.isSale)

    if (query) {
      result = result.filter(p =>
        p?.name?.toLowerCase().includes(query.toLowerCase()) ||
        p?.tags?.some(t => t?.toLowerCase().includes(query.toLowerCase()))
      )
    }

    const range = PRICE_RANGES[priceIdx]
    if (range) {
      result = result.filter(p => {
        const price =
          p?.pricing?.salePrice ??
          p?.pricing?.basePrice ??
          0
        return price >= range.min && price <= range.max
      })
    }

    switch (sort) {
      case 'price_asc':
        result.sort(
          (a, b) =>
            (a?.pricing?.salePrice ?? a?.pricing?.basePrice ?? 0) -
            (b?.pricing?.salePrice ?? b?.pricing?.basePrice ?? 0)
        )
        break
      case 'price_desc':
        result.sort(
          (a, b) =>
            (b?.pricing?.salePrice ?? b?.pricing?.basePrice ?? 0) -
            (a?.pricing?.salePrice ?? a?.pricing?.basePrice ?? 0)
        )
        break
      case 'rating':
        result.sort((a, b) => (b?.rating ?? 0) - (a?.rating ?? 0))
        break
      case 'bestseller':
        result.sort((a, b) => (b?.soldCount ?? 0) - (a?.soldCount ?? 0))
        break
      default:
        result.sort(
          (a, b) =>
            new Date(b?.createdAt || 0) -
            new Date(a?.createdAt || 0)
        )
    }

    setFiltered(result)
  }, [allProducts, category, filter, query, sort, priceIdx])

  console.log(allProducts)

  const setParam = (key, val) => {
    const p = new URLSearchParams(searchParams)
    if (val) p.set(key, val)
    else p.delete(key)
    setSearchParams(p)
  }

  return (
    <CustomerLayout>
      <div className="max-w-[1200px] mx-auto px-6 lg:px-10 py-12">
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader text="Loading..." />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-32">
            <p className="text-sm text-brand-muted">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
            {filtered.map((product, i) => (
              <ProductCard
                key={product?.id || i}
                product={product}
                index={i}
              />
            ))}
          </div>
        )}
      </div>
    </CustomerLayout>
  )
}