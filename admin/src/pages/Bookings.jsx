import React, { useState, useEffect } from 'react'
import { bookingsAPI } from '../services/api'

const Bookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    fetchBookings()
  }, [refreshKey])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await bookingsAPI.getBookings({ limit: 100 })
      setBookings(response.data.data)
      
      // Trigger analytics refresh
      window.dispatchEvent(new CustomEvent('bookingsUpdated', { 
        detail: { count: response.data.total || response.data.data?.length || 0 } 
      }))
      
    } catch (error) {
      setError('Failed to fetch bookings')
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await bookingsAPI.updateBookingStatus(bookingId, newStatus)
      await fetchBookings() // Refresh the list
      alert('Booking status updated successfully!')
    } catch (error) {
      alert('Failed to update booking status')
    }
  }

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true
    return booking.status.toLowerCase() === filter
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const calculateStats = () => {
    const totalBookings = bookings.length
    const activeBookings = bookings.filter(b => b.status === 'active' || b.status === 'confirmed').length
    const pendingBookings = bookings.filter(b => b.status === 'pending').length
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.pricing?.totalAmount || 0), 0)

    return { totalBookings, activeBookings, pendingBookings, totalRevenue }
  }

  const stats = calculateStats()

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
        <h2 className="text-3xl font-bold text-gray-900">Bookings Management</h2>
        <div className="flex space-x-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field w-auto"
          >
            <option value="all">All Bookings</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button 
            onClick={handleRefresh}
            className="btn-secondary"
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise mr-2"></i>
            {loading ? 'Loading...' : 'Refresh'}
          </button>
          <button className="btn-secondary">
            <i className="bi bi-download mr-2"></i>Export
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
              <p className="text-sm text-blue-600">Real-time count</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
              <i className="bi bi-calendar-check text-blue-600 text-xl"></i>
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
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
              <i className="bi bi-check-circle text-green-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingBookings}</p>
              <p className="text-sm text-yellow-600">Needs attention</p>
            </div>
            <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center">
              <i className="bi bi-clock text-yellow-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
              ৳{stats.totalRevenue.toLocaleString()}
              </p>
              <p className="text-sm text-purple-600">Dynamic calculation</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center">
              <i className="bi bi-currency-dollar text-purple-600 text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="card">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            All Bookings ({filteredBookings.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Car</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.length > 0 ? filteredBookings.map((booking) => (
                <tr key={booking._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {booking.customer?.firstName} {booking.customer?.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{booking.customer?.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {booking.car?.name || 'Car details unavailable'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{new Date(booking.pickupDate).toLocaleDateString()}</div>
                    <div>to {new Date(booking.returnDate).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  ৳{booking.pricing?.totalAmount?.toLocaleString() || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={booking.status}
                      onChange={(e) => handleStatusUpdate(booking._id, e.target.value)}
                      className={`text-xs font-semibold rounded-full px-2 py-1 border-0 ${getStatusColor(booking.status)}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(booking.payment?.status)}`}>
                      {booking.payment?.status || 'pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                    <button className="text-gray-600 hover:text-gray-900">Edit</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No bookings found for the selected filter
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

export default Bookings
