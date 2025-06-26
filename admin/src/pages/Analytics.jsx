import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { bookingsAPI, carsAPI, usersAPI } from '../services/api'

const Analytics = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [timeRange, setTimeRange] = useState('6months')
  
  // Analytics data state
  const [analyticsData, setAnalyticsData] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    newCustomers: 0,
    avgBookingValue: 0,
    monthlyData: [],
    carTypeData: [],
    topCars: [],
    recentBookings: [],
    fleetUtilization: {
      totalCars: 0,
      rentedCars: 0,
      utilizationRate: 0
    },
    customerSatisfaction: {
      rating: 4.8,
      totalReviews: 0
    }
  })

  useEffect(() => {
    fetchAnalyticsData()
  }, [refreshKey, timeRange])

  // Listen for real-time updates
  useEffect(() => {
    const handleBookingsUpdated = () => {
      setRefreshKey(prev => prev + 1)
    }

    const handleCarsUpdated = () => {
      setRefreshKey(prev => prev + 1)
    }

    window.addEventListener('bookingsUpdated', handleBookingsUpdated)
    window.addEventListener('carsUpdated', handleCarsUpdated)

    return () => {
      window.removeEventListener('bookingsUpdated', handleBookingsUpdated)
      window.removeEventListener('carsUpdated', handleCarsUpdated)
    }
  }, [])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      setError('')

      // Fetch all required data
      const [bookingsResponse, carsResponse, usersResponse] = await Promise.all([
        bookingsAPI.getBookings({ limit: 1000 }),
        carsAPI.getCars({ limit: 1000 }),
        usersAPI.getUsers({ limit: 1000 })
      ])

      const bookings = bookingsResponse.data.data || []
      const cars = carsResponse.data.data || []
      const users = usersResponse.data.data || []

      // Calculate analytics
      const analytics = calculateAnalytics(bookings, cars, users)
      setAnalyticsData(analytics)

    } catch (error) {
      console.error('Error fetching analytics data:', error)
      setError('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const calculateAnalytics = (bookings, cars, users) => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()

    // Filter bookings based on time range
    const getDateRange = () => {
      const endDate = new Date()
      const startDate = new Date()
      
      switch (timeRange) {
        case '6months':
          startDate.setMonth(endDate.getMonth() - 6)
          break
        case '1year':
          startDate.setFullYear(endDate.getFullYear() - 1)
          break
        case 'all':
          startDate.setFullYear(2020) // Far back date
          break
        default:
          startDate.setMonth(endDate.getMonth() - 6)
      }
      
      return { startDate, endDate }
    }

    const { startDate, endDate } = getDateRange()
    const filteredBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.createdAt)
      return bookingDate >= startDate && bookingDate <= endDate
    })

    // Calculate total revenue
    const totalRevenue = filteredBookings.reduce((sum, booking) => {
      return sum + (booking.pricing?.totalAmount || 0)
    }, 0)

    // Calculate total bookings
    const totalBookings = filteredBookings.length

    // Calculate new customers (users created in the time range)
    const newCustomers = users.filter(user => {
      const userDate = new Date(user.createdAt)
      return userDate >= startDate && userDate <= endDate && user.role === 'customer'
    }).length

    // Calculate average booking value
    const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0

    // Calculate monthly data
    const monthlyData = calculateMonthlyData(filteredBookings, startDate, endDate)

    // Calculate car type distribution
    const carTypeData = calculateCarTypeData(cars)

    // Calculate top performing cars
    const topCars = calculateTopCars(filteredBookings, cars)

    // Get recent bookings (last 10)
    const recentBookings = bookings
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)

    // Calculate fleet utilization
    const totalCars = cars.length
    const rentedCars = cars.filter(car => car.availability?.status === 'Rented').length
    const utilizationRate = totalCars > 0 ? (rentedCars / totalCars) * 100 : 0

    // Calculate customer satisfaction
    const ratingsSum = cars.reduce((sum, car) => sum + (car.rating?.average || 0) * (car.rating?.count || 0), 0)
    const totalRatings = cars.reduce((sum, car) => sum + (car.rating?.count || 0), 0)
    const avgRating = totalRatings > 0 ? ratingsSum / totalRatings : 4.8

    return {
      totalRevenue,
      totalBookings,
      newCustomers,
      avgBookingValue,
      monthlyData,
      carTypeData,
      topCars,
      recentBookings,
      fleetUtilization: {
        totalCars,
        rentedCars,
        utilizationRate
      },
      customerSatisfaction: {
        rating: avgRating,
        totalReviews: totalRatings
      }
    }
  }

  const calculateMonthlyData = (bookings, startDate, endDate) => {
    const monthlyMap = new Map()
    
    // Initialize months
    const current = new Date(startDate)
    while (current <= endDate) {
      const key = `${current.getFullYear()}-${current.getMonth()}`
      const monthName = current.toLocaleDateString('en-US', { month: 'short' })
      monthlyMap.set(key, {
        month: monthName,
        revenue: 0,
        bookings: 0,
        customers: new Set()
      })
      current.setMonth(current.getMonth() + 1)
    }

    // Aggregate booking data
    bookings.forEach(booking => {
      const bookingDate = new Date(booking.createdAt)
      const key = `${bookingDate.getFullYear()}-${bookingDate.getMonth()}`
      
      if (monthlyMap.has(key)) {
        const monthData = monthlyMap.get(key)
        monthData.revenue += booking.pricing?.totalAmount || 0
        monthData.bookings += 1
        monthData.customers.add(booking.customer?._id || booking.customer)
      }
    })

    // Convert to array and format
    return Array.from(monthlyMap.values()).map(data => ({
      month: data.month,
      revenue: Math.round(data.revenue),
      bookings: data.bookings,
      customers: data.customers.size
    }))
  }

  const calculateCarTypeData = (cars) => {
    const typeMap = new Map()
    
    cars.forEach(car => {
      const type = car.type || 'Other'
      typeMap.set(type, (typeMap.get(type) || 0) + 1)
    })

    const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444']
    let colorIndex = 0

    return Array.from(typeMap.entries()).map(([name, value]) => ({
      name,
      value,
      color: colors[colorIndex++ % colors.length]
    }))
  }

  const calculateTopCars = (bookings, cars) => {
    const carMap = new Map()

    // Count bookings and revenue per car
    bookings.forEach(booking => {
      const carId = booking.car?._id || booking.car
      if (carId) {
        if (!carMap.has(carId)) {
          carMap.set(carId, {
            carId,
            bookings: 0,
            revenue: 0,
            carData: null
          })
        }
        const carStats = carMap.get(carId)
        carStats.bookings += 1
        carStats.revenue += booking.pricing?.totalAmount || 0
      }
    })

    // Add car details and sort
    const topCarsArray = Array.from(carMap.values())
      .map(stats => {
        const car = cars.find(c => c._id === stats.carId)
        return {
          name: car?.name || 'Unknown Car',
          bookings: stats.bookings,
          revenue: Math.round(stats.revenue)
        }
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    return topCarsArray
  }

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`
  }

  const getGrowthPercentage = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
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
        <h2 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h2>
        <div className="flex space-x-3">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="input-field w-auto"
          >
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
            <option value="all">All Time</option>
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
            <i className="bi bi-download mr-2"></i>Export Report
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.totalRevenue)}</p>
              <p className="text-sm text-green-600">Real-time calculation</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
              <i className="bi bi-currency-dollar text-green-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.totalBookings}</p>
              <p className="text-sm text-blue-600">Live booking count</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
              <i className="bi bi-calendar-check text-blue-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">New Customers</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.newCustomers}</p>
              <p className="text-sm text-purple-600">Dynamic count</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center">
              <i className="bi bi-people text-purple-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Booking Value</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.avgBookingValue)}</p>
              <p className="text-sm text-orange-600">Calculated average</p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center">
              <i className="bi bi-graph-up text-orange-600 text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          {analyticsData.monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <i className="bi bi-graph-up text-4xl mb-2"></i>
                <p>No revenue data available</p>
              </div>
            </div>
          )}
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bookings vs Customers</h3>
          {analyticsData.monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="bookings" fill="#10B981" name="Bookings" />
                <Bar dataKey="customers" fill="#8B5CF6" name="New Customers" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <i className="bi bi-bar-chart text-4xl mb-2"></i>
                <p>No booking data available</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Car Type Distribution</h3>
          {analyticsData.carTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.carTypeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {analyticsData.carTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <i className="bi bi-pie-chart text-4xl mb-2"></i>
                <p>No car data available</p>
              </div>
            </div>
          )}
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Cars</h3>
          {analyticsData.topCars.length > 0 ? (
            <div className="space-y-4">
              {analyticsData.topCars.map((car, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{car.name}</p>
                      <p className="text-sm text-gray-500">{car.bookings} bookings</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(car.revenue)}</p>
                    <p className="text-sm text-gray-500">revenue</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <i className="bi bi-trophy text-4xl mb-2"></i>
                <p>No performance data available</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Fleet Utilization</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Cars</span>
              <span className="font-medium">{analyticsData.fleetUtilization.totalCars}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Rented Cars</span>
              <span className="font-medium">{analyticsData.fleetUtilization.rentedCars}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Utilization Rate</span>
              <span className="font-medium text-green-600">
                {formatPercentage(analyticsData.fleetUtilization.utilizationRate)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${analyticsData.fleetUtilization.utilizationRate}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Satisfaction</h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {analyticsData.customerSatisfaction.rating.toFixed(1)}
            </div>
            <div className="flex justify-center mb-2">
              {[...Array(5)].map((_, i) => (
                <i 
                  key={i} 
                  className={`bi ${i < Math.floor(analyticsData.customerSatisfaction.rating) ? 'bi-star-fill' : 'bi-star'} text-yellow-400`}
                ></i>
              ))}
            </div>
            <p className="text-sm text-gray-600">
              Based on {analyticsData.customerSatisfaction.totalReviews} reviews
            </p>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {analyticsData.recentBookings.slice(0, 4).map((booking, index) => (
              <div key={booking._id} className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  booking.status === 'confirmed' ? 'bg-green-500' :
                  booking.status === 'pending' ? 'bg-yellow-500' :
                  booking.status === 'active' ? 'bg-blue-500' :
                  'bg-gray-500'
                }`}></div>
                <div className="text-sm flex-1">
                  <p className="text-gray-900">
                    {booking.status === 'confirmed' ? 'Booking confirmed' :
                     booking.status === 'pending' ? 'New booking received' :
                     booking.status === 'active' ? 'Car picked up' :
                     'Booking updated'}
                  </p>
                  <p className="text-gray-500">
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {analyticsData.recentBookings.length === 0 && (
              <div className="text-center text-gray-500 py-4">
                <i className="bi bi-clock text-2xl mb-2"></i>
                <p className="text-sm">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics
