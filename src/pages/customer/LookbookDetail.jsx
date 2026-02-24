import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Heart } from 'lucide-react'
import { collections } from '../../data/lookbookData'

const LookbookDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const collection = collections.find(c => c.id === id)

  const [activeIndex, setActiveIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(null)

  if (!collection) {
    return (
      <div className="w-full h-screen bg-white flex items-center justify-center">
        Collection not found
      </div>
    )
  }

  const activeLook = collection.looks[activeIndex]
  const total = collection.looks.length

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-0 left-0 right-0 z-50 px-8 py-6 flex items-center justify-between bg-gradient-to-b from-white/80 to-transparent backdrop-blur-sm"
      >
        <button
          onClick={() => navigate('/lookbook')}
          className="flex items-center gap-2 text-gray-700 hover:text-black transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-semibold tracking-wide">BACK</span>
        </button>

        <h1 className="text-xl font-semibold tracking-wider text-gray-900 text-center">
          {collection.title}
        </h1>

        <div className="w-12" />
      </motion.div>

      <div className="w-full h-full flex">
        {/* LEFT SIDE — Carousel */}
        <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-gradient-to-r from-white via-slate-50 to-slate-100">
          {/* Container for all carousel images, centered */}
          <div className="relative w-full h-full flex items-center justify-center">
            {collection.looks.map((look, i) => {
              // Circular distance: tính khoảng cách ngắn nhất theo vòng tròn
              let distance = i - activeIndex
              if (distance > total / 2) distance -= total
              if (distance < -total / 2) distance += total

              const abs = Math.abs(distance)

              // Only render nearby items
              if (abs > 3) return null

              const isActive = distance === 0
              const scale = isActive ? 1.08 : Math.max(0.6, 0.85 - abs * 2.2)
              const opacity = isActive ? 1 : Math.max(0.3, 0.7 - abs * 0.15)
              const blurAmount = isActive ? 0 : abs * 2

              return (
                <motion.img
                  key={look.id}
                  src={look.image}
                  onClick={() => setActiveIndex((i + total) % total)}
                  initial={false}
                  animate={{
                    x: -distance * 280,  // đảo dấu để đổi chiều trái → phải
                    scale,
                    opacity,
                    filter: `blur(${blurAmount}px)`,
                    zIndex: 100 - abs,
                  }}
                  transition={{
                    duration: 0.6,
                    ease: [0.23, 1, 0.32, 1],
                  }}
                  className="absolute h-[80vh] object-contain cursor-pointer select-none"
                  style={{ pointerEvents: isActive ? 'auto' : 'auto' }}
                />
              )
            })}
          </div>

          {/* Dot indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {collection.looks.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === activeIndex
                    ? 'w-6 h-2 bg-gray-800'
                    : 'w-2 h-2 bg-gray-400 hover:bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-96 bg-white/95 overflow-y-auto shadow-2xl flex flex-col mt-20"
        >
          {/* Active Product */}
          <motion.div
            key={activeLook.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-8 py-6 border-b border-gray-200 bg-gradient-to-b from-slate-50 to-white"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">
                  Featured
                </p>
                <h3 className="text-lg font-semibold text-gray-900">
                  {activeLook.name}
                </h3>
              </div>
           
            </div>

          
          </motion.div>

          {/* Product List */}
          <div className="flex-1 px-6 py-6 space-y-3 overflow-y-auto">
            {collection.looks.map((look, index) => (
              <motion.button
                key={look.id}
                onClick={() => setActiveIndex(index)}
                onMouseEnter={() => setIsHovered(index)}
                onMouseLeave={() => setIsHovered(null)}
                className={`w-full p-4 rounded-lg border-2 text-left transition ${
                  index === activeIndex
                    ? 'border-gray-900 bg-gray-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex gap-4 items-center">
                  <div className="w-16 h-20 rounded overflow-hidden bg-gray-100">
                    <img
                      src={look.image}
                      alt={look.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono text-gray-500 uppercase mb-1">
                      LOOK {index + 1}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {look.name}
                    </p>
                  </div>

                  {isHovered === index && index !== activeIndex && (
                    <div className="w-2 h-2 bg-gray-400 rounded-full" />
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default LookbookDetail