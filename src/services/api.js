import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

export const getProducts = async () => {
  const res = await api.get('/products')
  return res.data
}

export const getProduct = async (slug) => {
  // Lấy tất cả rồi filter client-side — tránh phụ thuộc query string filter
  const res = await api.get('/products')
  const all = Array.isArray(res.data) ? res.data : []
  return all.find(p => p.slug === slug) || null
}

export const getProductById = async (id) => {
  const res = await api.get(`/products/${id}`)
  return res.data
}

export const updateProduct = async (id, data) => {
  const res = await api.put(`/products/${id}`, data)
  return res.data
}

export const createProduct = async (data) => {
  const res = await api.post('/products', data)
  return res.data
}

// Users / Auth
export const loginUser = async (email, password) => {
  const res = await api.get('/users')
  const all = Array.isArray(res.data) ? res.data : []
  return all.find(u => u.email === email && u.password === password) || null
}

export const registerUser = async (data) => {
  const res = await api.get('/users')
  const all = Array.isArray(res.data) ? res.data : []
  if (all.find(u => u.email === data.email)) throw new Error('Email đã được sử dụng')
  const newUser = await api.post('/users', {
    ...data,
    role: 'customer',
    createdAt: new Date().toISOString()
  })
  return newUser.data
}

export const getUsers = async () => {
  const res = await api.get('/users')
  return res.data
}

export const updateUser = async (id, data) => {
  const res = await api.put(`/users/${id}`, data)
  return res.data
}

// Orders
export const createOrder = async (data) => {
  const res = await api.post('/orders', {
    ...data,
    id: `ORD-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })
  return res.data
}

export const getOrders = async (params = {}) => {
  const res = await api.get('/orders')
  let orders = Array.isArray(res.data) ? res.data : []
  // Filter client-side nếu có params
  Object.entries(params).forEach(([key, val]) => {
    orders = orders.filter(o => String(o[key]) === String(val))
  })
  return orders
}

export const getOrdersByUser = async (userId) => {
  const res = await api.get('/orders')
  const all = Array.isArray(res.data) ? res.data : []
  return all.filter(o => o.userId === userId)
}

export const updateOrder = async (id, data) => {
  const res = await api.put(`/orders/${id}`, data)
  return res.data
}

// Coupons
export const validateCoupon = async (code) => {
  const res = await api.get('/coupons')
  const all = Array.isArray(res.data) ? res.data : []
  return all.find(c => c.code === code && c.active === true) || null
}

// Categories
export const getCategories = async () => {
  const res = await api.get('/categories')
  return res.data
}