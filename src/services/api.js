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
  const res = await api.get(`/products?slug=${slug}`)
  return res.data[0] || null
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
  const res = await api.get(`/users?email=${email}&password=${password}`)
  return res.data[0] || null
}

export const registerUser = async (data) => {
  const existing = await api.get(`/users?email=${data.email}`)
  if (existing.data.length > 0) throw new Error('Email đã được sử dụng')
  const res = await api.post('/users', {
    ...data,
    role: 'customer',
    createdAt: new Date().toISOString()
  })
  return res.data
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
  const res = await api.get('/orders', { params })
  return res.data
}

export const getOrdersByUser = async (userId) => {
  const res = await api.get(`/orders?userId=${userId}`)
  return res.data
}

export const updateOrder = async (id, data) => {
  const res = await api.put(`/orders/${id}`, data)
  return res.data
}

// Coupons
export const validateCoupon = async (code) => {
  const res = await api.get(`/coupons?code=${code}&active=true`)
  return res.data[0] || null
}

// Categories
export const getCategories = async () => {
  const res = await api.get('/categories')
  return res.data
}