import { motion } from 'framer-motion'
import { useState } from 'react'
import { MapPin, Phone, Mail, Clock, Instagram, Send } from 'lucide-react'
import CustomerLayout from '../../components/layout/CustomerLayout'
import toast from 'react-hot-toast'
import { collections } from '../../data/lookbookData'
import { Link } from 'react-router-dom'
export function AboutPage() {
  const values = [
    { title: 'AUTHENTICITY', desc: 'Không fake, không nhái. Mọi sản phẩm đều xuất phát từ cảm hứng thực sự.' },
    { title: 'QUALITY', desc: 'Chất liệu tốt nhất, kỹ thuật may tốt nhất. Không compromise.' },
    { title: 'LOCAL PRIDE', desc: '100% designed and made in Vietnam. Tự hào là hàng local chất lượng cao.' },
    { title: 'COMMUNITY', desc: 'Young Savage là cộng đồng, không chỉ là brand. We grow together.' },
  ]

  return (
    <CustomerLayout>
      {/* Hero */}
      <section className="relative h-[60vh] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=90"
          alt="About"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 flex items-end px-6 lg:px-16 pb-16">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <p className="font-mono text-xs text-savage-red tracking-ultra uppercase mb-2">Thành lập 2024</p>
            <h1 className="font-display text-7xl lg:text-[100px] text-savage-white tracking-tight leading-tight">
              VỀ<br />CHÚNG TÔI
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="px-6 lg:px-16 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <p className="font-mono text-xs text-savage-gray-600 tracking-ultra uppercase mb-4">Our Mission</p>
          <h2 className="font-display text-4xl lg:text-5xl text-savage-white tracking-tight mb-6 leading-tight">
            STREETWEAR<br />CHO THẾ HỆ MỚI
          </h2>
          <div className="space-y-4 text-savage-gray-400 font-body leading-relaxed">
            <p>
              Young Savage được sinh ra từ sự thất vọng với streetwear quốc tế giá cao và hàng local chất lượng thấp. 
              Chúng tôi tin rằng giới trẻ Việt Nam xứng đáng có một brand của riêng mình — chất lượng không kém 
              quốc tế, giá thành phù hợp, và phong cách đặc trưng Việt.
            </p>
            <p>
              Mỗi sản phẩm của Young Savage đều được thiết kế kỹ lưỡng, chọn lựa chất liệu premium, 
              và sản xuất có trách nhiệm tại Việt Nam.
            </p>
          </div>
        </div>
        <div className="aspect-square bg-savage-gray-900 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=700&q=90"
            alt="Brand"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Values */}
      <section className="px-6 lg:px-16 py-16 border-t border-savage-gray-800">
        <h2 className="font-display text-4xl text-savage-white tracking-widest mb-12">GIÁ TRỊ CỐT LÕI</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="border-t border-savage-gray-700 pt-6"
            >
              <h3 className="font-mono text-xs tracking-widest text-savage-red mb-3">{v.title}</h3>
              <p className="font-body text-sm text-savage-gray-500 leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 lg:px-16 py-16 border-t border-savage-gray-800">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {[
            { num: '5,000+', label: 'Khách hàng' },
            { num: '50+', label: 'Sản phẩm' },
            { num: '4.8', label: 'Rating trung bình' },
            { num: '100%', label: 'Made in VN' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <p className="font-display text-5xl text-savage-white tracking-tight mb-2">{stat.num}</p>
              <p className="font-mono text-xs text-savage-gray-600 tracking-widest uppercase">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </CustomerLayout>
  )
}

export function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    toast.success('Đã gửi tin nhắn! Chúng tôi sẽ phản hồi trong 24h.', {
      style: { background: '#1A1A19', color: '#F5F5F0', border: '1px solid #252524' }
    })
    setForm({ name: '', email: '', subject: '', message: '' })
    setLoading(false)
  }

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <CustomerLayout>
      <div className="px-6 lg:px-16 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="font-mono text-xs text-savage-gray-600 tracking-ultra uppercase mb-2">Get in touch</p>
          <h1 className="font-display text-6xl lg:text-8xl text-savage-white tracking-tight mb-16">LIÊN HỆ</h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-savage-gray-600 uppercase mb-2">Họ tên</label>
                <input value={form.name} onChange={e => update('name', e.target.value)} className="input-field" placeholder="Nguyễn Văn A" required />
              </div>
              <div>
                <label className="block text-xs font-mono text-savage-gray-600 uppercase mb-2">Email</label>
                <input type="email" value={form.email} onChange={e => update('email', e.target.value)} className="input-field" placeholder="email@example.com" required />
              </div>
            </div>
            <div>
              <label className="block text-xs font-mono text-savage-gray-600 uppercase mb-2">Chủ đề</label>
              <input value={form.subject} onChange={e => update('subject', e.target.value)} className="input-field" placeholder="Tôi cần hỗ trợ về..." required />
            </div>
            <div>
              <label className="block text-xs font-mono text-savage-gray-600 uppercase mb-2">Tin nhắn</label>
              <textarea
                value={form.message}
                onChange={e => update('message', e.target.value)}
                className="input-field resize-none"
                rows={6}
                placeholder="Nội dung tin nhắn..."
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
              <Send size={14} />
              {loading ? 'Đang gửi...' : 'Gửi tin nhắn'}
            </button>
          </form>

          {/* Info */}
          <div className="space-y-8">
            <div>
              <p className="font-mono text-xs text-savage-gray-600 tracking-widest uppercase mb-6">Thông tin liên hệ</p>
              <div className="space-y-5">
                {[
                  { icon: MapPin, label: 'Địa chỉ', value: '123 Nguyễn Văn Linh, Quận 7, TP.HCM' },
                  { icon: Phone, label: 'Hotline', value: '1800 1234 (Miễn phí)' },
                  { icon: Mail, label: 'Email', value: 'contact@youngsavage.vn' },
                  { icon: Clock, label: 'Giờ làm việc', value: 'T2 – T7: 9:00 – 21:00' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex gap-4">
                    <Icon size={18} className="text-savage-red flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-mono text-xs text-savage-gray-600 uppercase">{label}</p>
                      <p className="font-body text-sm text-savage-gray-300 mt-0.5">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-savage-gray-800 pt-8">
              <p className="font-mono text-xs text-savage-gray-600 tracking-widest uppercase mb-4">Follow us</p>
              <div className="flex gap-3">
                <a href="#" className="flex items-center gap-2 border border-savage-gray-700 px-4 py-2 text-xs font-mono text-savage-gray-500 hover:text-savage-white hover:border-savage-white transition-all">
                  <Instagram size={14} /> @youngsavage.vn
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  )
}


export function LookbookPage() {
  return (
    <CustomerLayout>
      <div className="px-10 py-16">
        <h1 className="text-6xl font-display mb-16">LOOKBOOK</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {collections.map((col) => (
            <Link key={col.id} to={`/lookbook/${col.id}`}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative aspect-[4/5] overflow-hidden group"
              >
                <img
                  src={col.cover}
                  className="w-full h-full object-cover brightness-75 group-hover:brightness-90 transition"
                />
                <div className="absolute bottom-6 left-6 text-white">
                  <h2 className="text-3xl font-display">{col.title}</h2>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </CustomerLayout>
  )
}