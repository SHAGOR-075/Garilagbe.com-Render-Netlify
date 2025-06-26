import axios from 'axios'

const API_BASE_URL = 'http://localhost:5000/api'

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
  const token = localStorage.getItem('adminToken')
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
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminUser')
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
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/me')
}

// Cars API
export const carsAPI = {
  getCars: (params = {}) => api.get('/cars', { params }),
  getCar: (id) => api.get(`/cars/${id}`),
  createCar: (carData) => api.post('/cars', carData),
  updateCar: (id, carData) => api.put(`/cars/${id}`, carData),
  deleteCar: (id) => api.delete(`/cars/${id}`)
}

// Bookings API
export const bookingsAPI = {
  getBookings: (params = {}) => api.get('/bookings', { params }),
  getBooking: (id) => api.get(`/bookings/${id}`),
  updateBookingStatus: (id, status) => api.put(`/bookings/${id}/status`, { status }),
  getBookingStats: () => api.get('/bookings/stats'),
  getMonthlyRevenue: (months = 6) => api.get(`/bookings/revenue/monthly?months=${months}`)
}

// Users API
export const usersAPI = {
  getUsers: (params = {}) => api.get('/users', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`)
}

// Analytics API
export const analyticsAPI = {
  getDashboard: (timeRange = '6months') => api.get(`/analytics/dashboard?timeRange=${timeRange}`),
  getRevenue: (timeRange = '6months') => api.get(`/analytics/revenue?timeRange=${timeRange}`),
  getBookingStats: () => api.get('/analytics/bookings'),
  getFleetStats: () => api.get('/analytics/fleet')
}

export default api
