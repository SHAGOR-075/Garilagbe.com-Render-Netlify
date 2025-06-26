import axios from 'axios'

const API_BASE_URL = 'https://garilagbe-com.onrender.com/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 second timeout
})

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  register: (userData) => api.post('https://garilagbe-com.onrender.com/api/auth/register', userData),
  login: (credentials) => api.post('https://garilagbe-com.onrender.com/api/auth/login', credentials),
  getProfile: () => api.get('https://garilagbe-com.onrender.com/api/auth/me'),
  updateProfile: (userData) => api.put('https://garilagbe-com.onrender.com/api/auth/profile', userData)
}

// Cars API
export const carsAPI = {
  getCars: (params = {}) => api.get('https://garilagbe-com.onrender.com/api/cars', { params }),
  getCar: (id) => api.get(`/cars/${id}`),
  checkAvailability: (id, params) => api.get(`https://garilagbe-com.onrender.com/api/cars/${id}/availability`, { params }),
  advancedSearch: (params) => api.get('https://garilagbe-com.onrender.com/api/cars/search/advanced', { params })
}

// Bookings API
export const bookingsAPI = {
  getBookings: (params = {}) => api.get('https://garilagbe-com.onrender.com/api/bookings', { params }),
  getBooking: (id) => api.get(`https://garilagbe-com.onrender.com/api/bookings/${id}`),
  createBooking: (bookingData) => api.post('https://garilagbe-com.onrender.com/api/bookings', bookingData),
  cancelBooking: (id, reason) => api.put(`https://garilagbe-com.onrender.com/api/bookings/${id}/cancel`, { reason })
}

// Payment API
export const paymentAPI = {
  initPayment: (paymentData) => api.post('https://garilagbe-com.onrender.com/api/payment/init', paymentData),
  validatePayment: (validationData) => api.post('https://garilagbe-com.onrender.com/api/payment/validate', validationData),
  getPaymentStatus: (transactionId) => api.get(`https://garilagbe-com.onrender.com/api/payment/status/${transactionId}`),
  refundPayment: (refundData) => api.post('https://garilagbe-com.onrender.com/api/payment/refund', refundData)
}

export default api
