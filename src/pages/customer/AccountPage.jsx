import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, MapPin, Lock, ShoppingBag } from 'lucide-react'
import CustomerLayout from '../../components/layout/CustomerLayout'
import { useAuth } from '../../context/AuthContext'
import { updateUser } from '../../services/api'
import toast from 'react-hot-toast'

export default function AccountPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('profile')
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    ward: user?.address?.ward || '',
    district: user?.address?.district || '',
    city: user?.address?.city || ''
  })
  const [saving, setSaving] = useState(false)

  if (!user) {
    return (
      <CustomerLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <p className="font-display text-3xl text-savage-gray-700 tracking-widest">CHƯA ĐĂNG NHẬP</p>
          <Link to="/login" className="btn-primary">Đăng nhập</Link>
        </div>
      </CustomerLayout>
    )
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const updated = await updateUser(user.id, {
        ...user,
        name: form.name,
        phone: form.phone,
        address: { street: form.street, ward: form.ward, district: form.district, city: form.city }
      })
      login(updated)
      toast.success('Đã cập nhật thông tin')
    } catch { toast.error('Lỗi cập nhật') } finally { setSaving(false) }
  }

  const tabs = [
    { id: 'profile', label: 'Thông tin', icon: User },
    { id: 'address', label: 'Địa chỉ', icon: MapPin },
    { id: 'orders', label: 'Đơn hàng', icon: ShoppingBag },
  ]

  return (
    <CustomerLayout>
      <div className="px-6 lg:px-12 py-12 max-w-4xl mx-auto">
        <div className="mb-10">
          <div className="flex items-center gap-4">
            <img src={user.avatar} alt="" className="w-16 h-16 rounded-full" />
            <div>
              <h1 className="font-display text-4xl text-savage-white tracking-tight">{user.name}</h1>
              <p className="font-mono text-xs text-savage-gray-600">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-8 border-b border-savage-gray-800 pb-0">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => tab === 'orders' ? navigate('/orders') : setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-3 font-mono text-xs tracking-widest uppercase border-b-2 transition-all -mb-px ${
                tab === t.id ? 'border-savage-white text-savage-white' : 'border-transparent text-savage-gray-500 hover:text-savage-white'
              }`}
            >
              <t.icon size={13} /> {t.label}
            </button>
          ))}
        </div>

        {tab === 'profile' && (
          <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSave} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-mono text-savage-gray-600 uppercase mb-2">Họ tên</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-mono text-savage-gray-600 uppercase mb-2">Email</label>
              <input value={user.email} className="input-field opacity-50 cursor-not-allowed" disabled />
            </div>
            <div>
              <label className="block text-xs font-mono text-savage-gray-600 uppercase mb-2">Số điện thoại</label>
              <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="input-field" />
            </div>
            <button type="submit" disabled={saving} className="btn-primary mt-2">
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </motion.form>
        )}

        {tab === 'address' && (
          <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSave} className="space-y-4 max-w-md">
            {[
              { key: 'street', label: 'Địa chỉ', placeholder: 'Số nhà, tên đường' },
              { key: 'ward', label: 'Phường/Xã', placeholder: 'Phường 1' },
              { key: 'district', label: 'Quận/Huyện', placeholder: 'Quận 1' },
              { key: 'city', label: 'Tỉnh/Thành phố', placeholder: 'TP. Hồ Chí Minh' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-mono text-savage-gray-600 uppercase mb-2">{f.label}</label>
                <input value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className="input-field" placeholder={f.placeholder} />
              </div>
            ))}
            <button type="submit" disabled={saving} className="btn-primary mt-2">
              {saving ? 'Đang lưu...' : 'Lưu địa chỉ'}
            </button>
          </motion.form>
        )}
      </div>
    </CustomerLayout>
  )
}