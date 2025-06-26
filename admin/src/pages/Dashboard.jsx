import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { carsAPI, bookingsAPI, usersAPI } from '../services/api'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCars: 0,
    activeBookings: 0,
    totalCustomers: 0,
    monthlyRevenue: 0
  })
  const [recentBookings, setRecentBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  const bookingData = [
    { month: 'Jan', bookings: 65 },
    { month: 'Feb', bookings: 78 },
    { month: 'Mar', bookings: 90 },
    { month: 'Apr', bookings: 81 },
    { month: 'May', bookings: 95 },
    { month: 'Jun', bookings: 110 }
  ]

  const revenueData = [
    { month: 'Jan', revenue: 35000 },
    { month: 'Feb', revenue: 42000 },
    { month: 'Mar', revenue: 38000 },
    { month: 'Apr', revenue: 45000 },
    { month: 'May', revenue: 52000 },
    { month: 'Jun', revenue: 48000 }
  ]

  useEffect(() => {
    fetchDashboardData()
  }, [refreshKey])

  // Listen for cars updated events
  useEffect(() => {
    const handleCarsUpdated = (event) => {
      console.log('Cars updated event received:', event.detail)
      setRefreshKey(prev => prev + 1)
    }

    // Listen for custom events
    window.addEventListener('carsUpdated', handleCarsUpdated)

    return () => {
      window.removeEventListener('carsUpdated', handleCarsUpdated)
    }
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch cars with proper error handling
      let totalCars = 0
      try {
        const carsResponse = await carsAPI.getCars({ limit: 1000 })
        totalCars = carsResponse.data.total || carsResponse.data.count || carsResponse.data.data?.length || 0
        console.log('Cars fetched:', totalCars)
      } catch (error) {
        console.error('Error fetching cars:', error)
      }

      // Fetch bookings with proper error handling
      let bookings = []
      let activeBookings = 0
      let monthlyRevenue = 0
      try {
        const bookingsResponse = await bookingsAPI.getBookings({ limit: 100 })
        bookings = bookingsResponse.data.data || []
        activeBookings = bookings.filter(b => 
          b.status === 'active' || b.status === 'confirmed'
        ).length
        
        // Calculate monthly revenue
        monthlyRevenue = bookings.reduce((sum, booking) => {
          const bookingMonth = new Date(booking.createdAt).getMonth()
          const currentMonth = new Date().getMonth()
          if (bookingMonth === currentMonth) {
            return sum + (booking.pricing?.totalAmount || 0)
          }
          return sum
        }, 0)
      } catch (error) {
        console.error('Error fetching bookings:', error)
      }

      // Fetch customers with proper error handling
      let totalCustomers = 0
      try {
        const usersResponse = await usersAPI.getUsers({ limit: 1000 })
        totalCustomers = usersResponse.data.total || usersResponse.data.count || usersResponse.data.data?.length || 0
      } catch (error) {
        console.error('Error fetching users:', error)
      }

      setStats({
        totalCars,
        activeBookings,
        totalCustomers,
        monthlyRevenue
      })

      setRecentBookings(bookings.slice(0, 4))
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      purple: 'bg-purple-50 text-purple-600',
      orange: 'bg-orange-50 text-orange-600'
    }
    return colors[color] || colors.blue
  }

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Dashboard Overview</h2>
        <div className="flex space-x-3">
          <button 
            onClick={handleRefresh}
            className="btn-secondary"
          >
            <i className="bi bi-arrow-clockwise mr-2"></i>Refresh
          </button>
          <button className="btn-secondary">
            <i className="bi bi-download mr-2"></i>Export
          </button>
          <button className="btn-primary">
            <i className="bi bi-plus mr-2"></i>Add New
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Cars</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCars}</p>
              <p className="text-sm text-green-600">Real-time count</p>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getColorClasses('blue')}`}>
              <i className="bi bi-car-front text-xl"></i>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeBookings}</p>
              <p className="text-sm text-green-600">Live updates</p>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getColorClasses('green')}`}>
              <i className="bi bi-calendar-check text-xl"></i>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
              <p className="text-sm text-green-600">Registered users</p>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getColorClasses('purple')}`}>
              <i className="bi bi-people text-xl"></i>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">৳{stats.monthlyRevenue.toLocaleString()}</p>
              <p className="text-sm text-green-600">This month</p>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getColorClasses('orange')}`}>
              <i className="bi bi-currency-dollar text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Bookings</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bookingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="bookings" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#8B5CF6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="card">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Car</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentBookings.length > 0 ? recentBookings.map((booking) => (
                <tr key={booking._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {booking.customer?.firstName} {booking.customer?.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {booking.car?.name || 'Car details unavailable'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(booking.pickupDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      booking.status === 'active' ? 'bg-green-100 text-green-800' :
                      booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                    <button className="text-gray-600 hover:text-gray-900">Edit</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No recent bookings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
