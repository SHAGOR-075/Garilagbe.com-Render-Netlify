import React, { useState, useEffect } from 'react'
import { bookingsAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'

const Bookings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await bookingsAPI.getBookings()
      setBookings(response.data.data)
    } catch (error) {
      setError('Failed to fetch bookings')
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return
    }

    try {
      await bookingsAPI.cancelBooking(bookingId, 'Cancelled by customer')
      fetchBookings() // Refresh the list
      alert('Booking cancelled successfully')
    } catch (error) {
      alert('Failed to cancel booking')
    }
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

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">My Bookings</h1>
          <p className="text-gray-600">Manage your car rental bookings</p>
        </div>

        {/* Filter */}
        <div className="mb-6">
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
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <i className="bi bi-calendar-x text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600 mb-4">You haven't made any bookings yet</p>
            <a href="/cars" className="btn-primary">
              Browse Cars
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {booking.car?.name || 'Car Details Unavailable'}
                      </h3>
                      <p className="text-gray-600">
                        Booking #{booking.bookingNumber}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Pickup</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(booking.pickupDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        {booking.pickupLocation?.branch}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Return</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(booking.returnDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        {booking.returnLocation?.branch}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Total Amount</h4>
                      <p className="text-lg font-bold text-gray-900">
                        ${booking.pricing?.totalAmount}
                      </p>
                      <p className="text-sm text-gray-600">
                        {booking.pricing?.numberOfDays} days
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      Booked on {new Date(booking.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex space-x-3">
                      <button className="text-blue-600 hover:text-blue-800 font-medium">
                        View Details
                      </button>
                      {(booking.status === 'pending' || booking.status === 'confirmed') && (
                        <button
                          onClick={() => handleCancelBooking(booking._id)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Bookings
