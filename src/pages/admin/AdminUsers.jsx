import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Edit2, X, Shield, User, UserCheck } from 'lucide-react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { getUsers, updateUser } from '../../services/api'
import { formatDate } from '../../utils/format'
import Loader from '../../components/common/Loader'
import toast from 'react-hot-toast'

const PERMISSIONS = [
  { key: 'view_orders', label: 'Xem đơn hàng' },
  { key: 'update_orders', label: 'Cập nhật đơn' },
  { key: 'manage_products', label: 'Quản lý sản phẩm' },
  { key: 'view_inventory', label: 'Xem tồn kho' },
  { key: 'manage_users', label: 'Quản lý users' },
  { key: 'view_analytics', label: 'Xem thống kê' },
]

function RoleBadge({ role }) {
  const config = {
    admin: { color: 'text-savage-red bg-savage-red/10', icon: Shield, label: 'Admin' },
    staff: { color: 'text-blue-400 bg-blue-400/10', icon: UserCheck, label: 'Staff' },
    customer: { color: 'text-savage-gray-400 bg-savage-gray-400/10', icon: User, label: 'Khách hàng' },
  }[role] || { color: 'text-savage-gray-400', label: role }

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-sm ${config.color}`}>
      {config.icon && <config.icon size={11} />} {config.label}
    </span>
  )
}

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [editUser, setEditUser] = useState(null)

  useEffect(() => {
    getUsers().then(data => {
      setUsers(data)
      setFiltered(data)
    }).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let result = [...users]
    if (search) result = result.filter(u =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    )
    if (roleFilter) result = result.filter(u => u.role === roleFilter)
    setFiltered(result)
  }, [users, search, roleFilter])

  const handleSave = async (userData) => {
    try {
      const updated = await updateUser(userData.id, userData)
      setUsers(prev => prev.map(u => u.id === userData.id ? updated : u))
      setEditUser(null)
      toast.success('Đã cập nhật người dùng')
    } catch { toast.error('Lỗi cập nhật') }
  }

  return (
    <DashboardLayout role="admin">
      <div className="p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="font-display text-4xl text-savage-white tracking-tight">QUẢN LÝ NGƯỜI DÙNG</h1>
          <p className="font-mono text-xs text-savage-gray-600 mt-1">{filtered.length} người dùng</p>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-savage-gray-600" />
            <input value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9 text-sm" placeholder="Tìm tên, email..." />
          </div>
          <div className="flex gap-2">
            {['', 'admin', 'staff', 'customer'].map(r => (
              <button key={r} onClick={() => setRoleFilter(r)}
                className={`font-mono text-xs px-3 py-2 border transition-all ${roleFilter === r ? 'bg-savage-white text-savage-black border-savage-white' : 'border-savage-gray-700 text-savage-gray-500 hover:border-savage-white hover:text-savage-white'}`}>
                {r === '' ? 'Tất cả' : r}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader /></div>
        ) : (
          <div className="bg-savage-gray-900 border border-savage-gray-800 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-savage-gray-800">
                  {['Người dùng', 'Vai trò', 'SĐT', 'Ngày tạo', ''].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-mono text-savage-gray-600 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(user => (
                  <tr key={user.id} className="border-b border-savage-gray-800/50 hover:bg-savage-gray-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img src={user.avatar} alt="" className="w-9 h-9 rounded-full bg-savage-gray-700" />
                        <div>
                          <p className="font-body text-sm text-savage-white">{user.name}</p>
                          <p className="font-mono text-xs text-savage-gray-600">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4"><RoleBadge role={user.role} /></td>
                    <td className="py-3 px-4 font-mono text-xs text-savage-gray-400">{user.phone || '—'}</td>
                    <td className="py-3 px-4 font-mono text-xs text-savage-gray-500">{formatDate(user.createdAt)}</td>
                    <td className="py-3 px-4">
                      <button onClick={() => setEditUser(user)} className="text-savage-gray-500 hover:text-savage-white transition-colors">
                        <Edit2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit modal */}
      <AnimatePresence>
        {editUser && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditUser(null)} className="fixed inset-0 bg-black/70 z-40" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="fixed inset-x-4 lg:inset-x-1/4 top-1/4 bg-savage-gray-900 border border-savage-gray-700 z-50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display text-2xl text-savage-white">Phân quyền người dùng</h3>
                <button onClick={() => setEditUser(null)} className="text-savage-gray-500 hover:text-savage-white"><X size={20} /></button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-savage-gray-800">
                  <img src={editUser.avatar} alt="" className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="text-sm font-body text-savage-white">{editUser.name}</p>
                    <p className="text-xs font-mono text-savage-gray-500">{editUser.email}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-savage-gray-600 uppercase mb-3">Vai trò</label>
                  <div className="flex gap-2">
                    {['customer', 'staff', 'admin'].map(r => (
                      <button
                        key={r}
                        onClick={() => setEditUser(p => ({ ...p, role: r }))}
                        className={`px-4 py-2 font-mono text-xs border transition-all ${editUser.role === r ? 'bg-savage-white text-savage-black border-savage-white' : 'border-savage-gray-700 text-savage-gray-500 hover:border-savage-white hover:text-savage-white'}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {editUser.role === 'staff' && (
                  <div>
                    <label className="block text-xs font-mono text-savage-gray-600 uppercase mb-3">Quyền hạn</label>
                    <div className="grid grid-cols-2 gap-2">
                      {PERMISSIONS.map(perm => (
                        <label key={perm.key} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={(editUser.permissions || []).includes(perm.key)}
                            onChange={e => {
                              const perms = editUser.permissions || []
                              setEditUser(p => ({
                                ...p,
                                permissions: e.target.checked
                                  ? [...perms, perm.key]
                                  : perms.filter(p => p !== perm.key)
                              }))
                            }}
                            className="w-4 h-4 accent-savage-red"
                          />
                          <span className="text-xs font-body text-savage-gray-400">{perm.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-savage-gray-800">
                  <button onClick={() => handleSave(editUser)} className="btn-primary">Lưu</button>
                  <button onClick={() => setEditUser(null)} className="btn-outline">Huỷ</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}