import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      if (token) {
        const response = await authAPI.getProfile()
        const userData = response.data.user
        
        // Only allow admin users
        if (userData.role === 'admin') {
          setUser(userData)
          setIsAuthenticated(true)
        } else {
          localStorage.removeItem('adminToken')
          localStorage.removeItem('adminUser')
        }
      }
    } catch (error) {
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminUser')
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials)
      const { token, user } = response.data
      
      // Only allow admin users
      if (user.role !== 'admin') {
        return { 
          success: false, 
          message: 'Access denied. Admin privileges required.' 
        }
      }
      
      localStorage.setItem('adminToken', token)
      localStorage.setItem('adminUser', JSON.stringify(user))
      setUser(user)
      setIsAuthenticated(true)
      
      return { success: true, user }
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    setUser(null)
    setIsAuthenticated(false)
  }

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
