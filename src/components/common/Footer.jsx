import { Link } from 'react-router-dom'
import { Instagram, Twitter, Youtube, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-savage-black border-t border-savage-gray-800 mt-20">
      {/* Marquee */}
      <div className="border-b border-savage-gray-800 py-4 overflow-hidden">
        <div className="marquee-wrapper">
          <div className="marquee-content">
            {Array(6).fill(null).map((_, i) => (
              <span key={i} className="font-display text-4xl lg:text-6xl text-savage-gray-900 tracking-ultra mx-6">
                YOUNG SAVAGE
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-12 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Brand */}
        <div className="lg:col-span-2">
          <h2 className="font-display text-3xl tracking-ultra text-savage-white mb-4">YOUNG SAVAGE</h2>
          <p className="text-savage-gray-500 text-sm font-body leading-relaxed max-w-sm">
            Streetwear thuần Việt — Thiết kế cho thế hệ trẻ không sợ nổi bật. 
            Chất lượng premium, phong cách độc, made in Vietnam.
          </p>
          <div className="flex gap-4 mt-6">
            {[Instagram, Twitter, Youtube].map((Icon, i) => (
              <a key={i} href="#" className="w-9 h-9 border border-savage-gray-700 flex items-center justify-center text-savage-gray-500 hover:text-savage-white hover:border-savage-white transition-all duration-200">
                <Icon size={15} />
              </a>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div>
          <h4 className="font-mono text-xs tracking-widest uppercase text-savage-gray-500 mb-4">Sản phẩm</h4>
          <ul className="space-y-3">
            {['T-Shirts', 'Hoodies', 'Cargo Pants', 'Jackets', 'Shorts'].map((item) => (
              <li key={item}>
                <Link to="/products" className="text-sm font-body text-savage-gray-500 hover:text-savage-white transition-colors">
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Info */}
        <div>
          <h4 className="font-mono text-xs tracking-widest uppercase text-savage-gray-500 mb-4">Thông tin</h4>
          <ul className="space-y-3">
            {[
              { label: 'Về chúng tôi', href: '/about' },
              { label: 'Liên hệ', href: '/contact' },
              { label: 'Chính sách đổi trả', href: '/policy' },
              { label: 'Hướng dẫn size', href: '/size-guide' },
              { label: 'Điều khoản sử dụng', href: '/terms' },
            ].map((item) => (
              <li key={item.label}>
                <Link to={item.href} className="text-sm font-body text-savage-gray-500 hover:text-savage-white transition-colors">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-savage-gray-800 px-6 lg:px-12 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
        <p className="text-xs font-mono text-savage-gray-700 tracking-wider">
          © 2025 YOUNG SAVAGE. All rights reserved.
        </p>
        <div className="flex items-center gap-2">
          <Mail size={12} className="text-savage-gray-700" />
          <span className="text-xs font-mono text-savage-gray-700">contact@youngsavage.vn</span>
        </div>
      </div>
    </footer>
  )
}