export const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price)
}

export const formatDate = (dateStr) => {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric', month: 'long', day: 'numeric'
  }).format(new Date(dateStr))
}

export const formatDateTime = (dateStr) => {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  }).format(new Date(dateStr))
}

export const orderStatusLabel = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  processing: 'Đang xử lý',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã huỷ',
  returned: 'Đã hoàn trả'
}

export const orderStatusColor = {
  pending: 'text-yellow-400',
  confirmed: 'text-blue-400',
  processing: 'text-purple-400',
  shipping: 'text-cyan-400',
  delivered: 'text-green-400',
  cancelled: 'text-red-400',
  returned: 'text-orange-400'
}

export const cn = (...classes) => classes.filter(Boolean).join(' ')