// import axios from 'axios'

// const API_BASE_URL = 'https://garilagbe-com.onrender.com/api'

// // Create axios instance
// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json'
//   },
//   timeout: 10000 // 10 second timeout
// })

// // Add token to requests if available
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token')
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`
//   }
//   return config
// }, (error) => {
//   return Promise.reject(error)
// })

// // Handle response errors
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     console.error('API Error:', error.response?.data || error.message)
    
//     if (error.response?.status === 401) {
//       localStorage.removeItem('token')
//       localStorage.removeItem('user')
//       // Only redirect if not already on login page
//       if (!window.location.pathname.includes('/login')) {
//         window.location.href = '/login'
//       }
//     }
//     return Promise.reject(error)
//   }
// )

// // Auth API
// export const authAPI = {
//   register: (userData) => api.post('https://garilagbe-com.onrender.com/api/auth/register', userData),
//   login: (credentials) => api.post('https://garilagbe-com.onrender.com/api/auth/login', credentials),
//   getProfile: () => api.get('https://garilagbe-com.onrender.com/api/auth/me'),
//   updateProfile: (userData) => api.put('https://garilagbe-com.onrender.com/api/auth/profile', userData)
// }

// // Cars API
// export const carsAPI = {
//   getCars: (params = {}) => api.get('https://garilagbe-com.onrender.com/api/cars', { params }),
//   getCar: (id) => api.get(`/cars/${id}`),
//   checkAvailability: (id, params) => api.get(`https://garilagbe-com.onrender.com/api/cars/${id}/availability`, { params }),
//   advancedSearch: (params) => api.get('https://garilagbe-com.onrender.com/api/cars/search/advanced', { params })
// }

// // Bookings API
// export const bookingsAPI = {
//   getBookings: (params = {}) => api.get('https://garilagbe-com.onrender.com/api/bookings', { params }),
//   getBooking: (id) => api.get(`https://garilagbe-com.onrender.com/api/bookings/${id}`),
//   createBooking: (bookingData) => api.post('https://garilagbe-com.onrender.com/api/bookings', bookingData),
//   cancelBooking: (id, reason) => api.put(`https://garilagbe-com.onrender.com/api/bookings/${id}/cancel`, { reason })
// }

// // Payment API
// export const paymentAPI = {
//   initPayment: (paymentData) => api.post('https://garilagbe-com.onrender.com/api/payment/init', paymentData),
//   validatePayment: (validationData) => api.post('https://garilagbe-com.onrender.com/api/payment/validate', validationData),
//   getPaymentStatus: (transactionId) => api.get(`https://garilagbe-com.onrender.com/api/payment/status/${transactionId}`),
//   refundPayment: (refundData) => api.post('https://garilagbe-com.onrender.com/api/payment/refund', refundData)
// }

// export default api


import axios from 'axios'

const API_BASE_URL = 'https://garilagbe-com.onrender.com/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // 30 second timeout for payment operations
})

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  // Log request for debugging
  console.log('API Request:', {
    method: config.method,
    url: config.url,
    data: config.data,
    headers: config.headers
  })
  
  return config
}, (error) => {
  console.error('Request interceptor error:', error)
  return Promise.reject(error)
})

// Handle response errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      data: response.data,
      url: response.config.url
    })
    return response
  },
  (error) => {
    console.error('API Error Details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method
    })
    
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
  getCar: (id) => api.get(`https://garilagbe-com.onrender.com/api/cars/${id}`),
  checkAvailability: (id, params) => api.get(`https://garilagbe-com.onrender.com/api/cars/${id}/availability`, { params }),
  advancedSearch: (params) => api.get('https://garilagbe-com.onrender.com/api/cars/search/advanced', { params })
}

// Bookings API
export const bookingsAPI = {
  getBookings: (params = {}) => api.get('https://garilagbe-com.onrender.com/api/bookings', { params }),
  getBooking: (id) => api.get(`https://garilagbe-com.onrender.com/api/bookings/${id}`),
  createBooking: (bookingData) => {
    console.log('Creating booking with data:', bookingData)
    return api.post('https://garilagbe-com.onrender.com/api/bookings', bookingData)
  },
  cancelBooking: (id, reason) => api.put(`https://garilagbe-com.onrender.com/api/bookings/${id}/cancel`, { reason })
}

// Payment API with enhanced error handling
export const paymentAPI = {
  initPayment: async (paymentData) => {
    try {
      console.log('Initializing payment with data:', paymentData)
      
      // Validate required fields
      if (!paymentData.bookingId) {
        throw new Error('Booking ID is required for payment initialization')
      }
      if (!paymentData.amount || paymentData.amount <= 0) {
        throw new Error('Valid amount is required for payment initialization')
      }
      
      const response = await api.post('https://garilagbe-com.onrender.com/api/payment/init', paymentData)
      console.log('Payment initialization response:', response.data)
      return response
    } catch (error) {
      console.error('Payment initialization failed:', error)
      throw error
    }
  },
  
  validatePayment: async (validationData) => {
    try {
      console.log('Validating payment with data:', validationData)
      const response = await api.post('https://garilagbe-com.onrender.com/api/payment/validate', validationData)
      console.log('Payment validation response:', response.data)
      return response
    } catch (error) {
      console.error('Payment validation failed:', error)
      throw error
    }
  },
  
  getPaymentStatus: async (transactionId) => {
    try {
      console.log('Getting payment status for transaction:', transactionId)
      const response = await api.get(`https://garilagbe-com.onrender.com/api/payment/status/${transactionId}`)
      console.log('Payment status response:', response.data)
      return response
    } catch (error) {
      console.error('Get payment status failed:', error)
      throw error
    }
  },
  
  refundPayment: async (refundData) => {
    try {
      console.log('Processing refund with data:', refundData)
      const response = await api.post('https://garilagbe-com.onrender.com/api/payment/refund', refundData)
      console.log('Refund response:', response.data)
      return response
    } catch (error) {
      console.error('Refund processing failed:', error)
      throw error
    }
  }
}

// Helper function for complete booking and payment flow
export const bookingFlowAPI = {
  createBookingAndPayment: async (bookingData, paymentData) => {
    try {
      console.log('Starting booking and payment flow...')
      
      // Step 1: Create booking
      console.log('Step 1: Creating booking...')
      const bookingResponse = await bookingsAPI.createBooking(bookingData)
      const booking = bookingResponse.data.data || bookingResponse.data
      
      if (!booking || !booking._id) {
        throw new Error('Booking creation failed - no booking ID returned')
      }
      
      console.log('Booking created successfully:', booking._id)
      
      // Step 2: Initialize payment
      console.log('Step 2: Initializing payment...')
      const paymentInitData = {
        bookingId: booking._id,
        amount: paymentData.amount,
        currency: paymentData.currency || 'BDT'
      }
      
      const paymentResponse = await paymentAPI.initPayment(paymentInitData)
      const paymentData = paymentResponse.data.data || paymentResponse.data
      
      if (!paymentData.paymentUrl) {
        throw new Error('Payment initialization failed - no payment URL returned')
      }
      
      console.log('Payment initialized successfully')
      
      return {
        booking,
        payment: paymentData,
        success: true
      }
    } catch (error) {
      console.error('Booking and payment flow failed:', error)
      throw error
    }
  }
}

// Export default api instance
export default api