import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { login } = useAuth()

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await login(formData)
    
    if (!result.success) {
      setError(result.message)
    }
    
    setLoading(false)
  }

  const handleCreateAdmin = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch('http://localhost:5000/api/admin/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@carluxde.com',
          phone: '+1234567890',
          password: 'admin123'
        })
      })

      const data = await response.json()

      if (data.success) {
        alert('Admin user created successfully! You can now login.')
        setFormData({
          email: 'admin@carluxde.com',
          password: 'admin123'
        })
      } else {
        setError(data.message || 'Failed to create admin user')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-8">
            <i className="bi bi-car-front text-3xl text-blue-600"></i>
            <span className="text-2xl font-bold text-gray-900">GαɾιLαɠႦҽ.co Admin</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Admin Login</h2>
          <p className="text-gray-600">Sign in to access the admin dashboard</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Enter admin email"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Enter admin password"
                required
                disabled={loading}
              />
            </div>

            <button 
              type="submit" 
              className="w-full btn-primary py-3"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing In...
                </div>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right mr-2"></i>Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Default Admin Credentials:</h4>
              <p className="text-sm text-blue-700">
                <strong>Email:</strong> admin@carluxde.com<br />
                <strong>Password:</strong> admin123
              </p>
            </div> */}
            
            <button
              onClick={handleCreateAdmin}
              disabled={loading}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Create Admin User (if not exists)
            </button>
            
            <p className="text-sm text-gray-600 mt-4">
              Admin access only. Contact system administrator for credentials.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
