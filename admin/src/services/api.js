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
  login: (credentials) => api.post('https://garilagbe-com.onrender.com/api/auth/login', credentials),
  getProfile: () => api.get('https://garilagbe-com.onrender.com/api/auth/me')
}

// Cars API
export const carsAPI = {
  getCars: (params = {}) => api.get('https://garilagbe-com.onrender.com/api/cars', { params }),
  getCar: (id) => api.get(`https://garilagbe-com.onrender.com/api/cars/${id}`),
  createCar: (carData) => api.post('https://garilagbe-com.onrender.com/api/cars', carData),
  updateCar: (id, carData) => api.put(`https://garilagbe-com.onrender.com/api/cars/${id}`, carData),
  deleteCar: (id) => api.delete(`https://garilagbe-com.onrender.com/api/cars/${id}`)
}

// Bookings API
export const bookingsAPI = {
  getBookings: (params = {}) => api.get('https://garilagbe-com.onrender.com/api/bookings', { params }),
  getBooking: (id) => api.get(`https://garilagbe-com.onrender.com/api/bookings/${id}`),
  updateBookingStatus: (id, status) => api.put(`https://garilagbe-com.onrender.com/api/bookings/${id}/status`, { status }),
  getBookingStats: () => api.get('https://garilagbe-com.onrender.com/api/bookings/stats'),
  getMonthlyRevenue: (months = 6) => api.get(`https://garilagbe-com.onrender.com/api/bookings/revenue/monthly?months=${months}`)
}

// Users API
export const usersAPI = {
  getUsers: (params = {}) => api.get('https://garilagbe-com.onrender.com/api/users', { params }),
  getUser: (id) => api.get(`https://garilagbe-com.onrender.com/api/users/${id}`),
  updateUser: (id, userData) => api.put(`https://garilagbe-com.onrender.com/api/users/${id}`, userData),
  deleteUser: (id) => api.delete(`https://garilagbe-com.onrender.com/api/users/${id}`)
}

// Analytics API
export const analyticsAPI = {
  getDashboard: (timeRange = '6months') => api.get(`https://garilagbe-com.onrender.com/api/analytics/dashboard?timeRange=${timeRange}`),
  getRevenue: (timeRange = '6months') => api.get(`https://garilagbe-com.onrender.com/api/analytics/revenue?timeRange=${timeRange}`),
  getBookingStats: () => api.get('https://garilagbe-com.onrender.com/api/analytics/bookings'),
  getFleetStats: () => api.get('https://garilagbe-com.onrender.com/api/analytics/fleet')
}

export default api
