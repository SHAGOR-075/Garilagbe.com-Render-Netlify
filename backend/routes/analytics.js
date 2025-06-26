import express from 'express'
import { query, validationResult } from 'express-validator'
import Booking from '../models/Booking.js'
import Car from '../models/Car.js'
import User from '../models/User.js'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()

// @desc    Get dashboard analytics
// @route   GET /api/analytics/dashboard
// @access  Private (Admin only)
router.get('/dashboard', protect, authorize('admin'), [
  query('timeRange').optional().isIn(['6months', '1year', 'all']).withMessage('Invalid time range')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      })
    }

    const timeRange = req.query.timeRange || '6months'
    
    // Calculate date range
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

    // Parallel data fetching
    const [
      totalStats,
      monthlyRevenue,
      carTypeStats,
      topCars,
      recentBookings,
      fleetStats,
      customerStats
    ] = await Promise.all([
      getTotalStats(startDate, endDate),
      getMonthlyRevenue(startDate, endDate),
      getCarTypeDistribution(),
      getTopPerformingCars(startDate, endDate),
      getRecentBookings(),
      getFleetUtilization(),
      getCustomerStats(startDate, endDate)
    ])

    res.json({
      success: true,
      data: {
        totalStats,
        monthlyRevenue,
        carTypeStats,
        topCars,
        recentBookings,
        fleetStats,
        customerStats,
        timeRange,
        dateRange: {
          startDate,
          endDate
        }
      }
    })
  } catch (error) {
    console.error('Dashboard analytics error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching analytics',
      error: error.message
    })
  }
})

// @desc    Get monthly revenue data
// @route   GET /api/analytics/revenue
// @access  Private (Admin only)
router.get('/revenue', protect, authorize('admin'), [
  query('timeRange').optional().isIn(['6months', '1year', 'all']).withMessage('Invalid time range')
], async (req, res) => {
  try {
    const timeRange = req.query.timeRange || '6months'
    
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
        startDate.setFullYear(2020)
        break
    }

    const monthlyData = await getMonthlyRevenue(startDate, endDate)

    res.json({
      success: true,
      data: monthlyData
    })
  } catch (error) {
    console.error('Revenue analytics error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching revenue data',
      error: error.message
    })
  }
})

// @desc    Get booking statistics
// @route   GET /api/analytics/bookings
// @access  Private (Admin only)
router.get('/bookings', protect, authorize('admin'), async (req, res) => {
  try {
    const bookingStats = await getBookingStatistics()
    
    res.json({
      success: true,
      data: bookingStats
    })
  } catch (error) {
    console.error('Booking analytics error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching booking statistics',
      error: error.message
    })
  }
})

// @desc    Get fleet analytics
// @route   GET /api/analytics/fleet
// @access  Private (Admin only)
router.get('/fleet', protect, authorize('admin'), async (req, res) => {
  try {
    const fleetAnalytics = await getFleetAnalytics()
    
    res.json({
      success: true,
      data: fleetAnalytics
    })
  } catch (error) {
    console.error('Fleet analytics error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching fleet analytics',
      error: error.message
    })
  }
})

// Helper functions
async function getTotalStats(startDate, endDate) {
  const [bookings, users] = await Promise.all([
    Booking.find({
      createdAt: { $gte: startDate, $lte: endDate },
      status: { $ne: 'cancelled' }
    }),
    User.find({
      createdAt: { $gte: startDate, $lte: endDate },
      role: 'customer'
    })
  ])

  const totalRevenue = bookings.reduce((sum, booking) => {
    return sum + (booking.pricing?.totalAmount || 0)
  }, 0)

  const totalBookings = bookings.length
  const newCustomers = users.length
  const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0

  return {
    totalRevenue: Math.round(totalRevenue),
    totalBookings,
    newCustomers,
    avgBookingValue: Math.round(avgBookingValue)
  }
}

async function getMonthlyRevenue(startDate, endDate) {
  const bookings = await Booking.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $ne: 'cancelled' }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        revenue: { $sum: '$pricing.totalAmount' },
        bookings: { $sum: 1 },
        customers: { $addToSet: '$customer' }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    }
  ])

  // Fill in missing months
  const monthlyData = []
  const current = new Date(startDate)
  
  while (current <= endDate) {
    const year = current.getFullYear()
    const month = current.getMonth() + 1
    
    const existingData = bookings.find(b => 
      b._id.year === year && b._id.month === month
    )
    
    monthlyData.push({
      month: current.toLocaleDateString('en-US', { month: 'short' }),
      year,
      monthNum: month,
      revenue: Math.round(existingData?.revenue || 0),
      bookings: existingData?.bookings || 0,
      customers: existingData?.customers?.length || 0
    })
    
    current.setMonth(current.getMonth() + 1)
  }

  return monthlyData
}

async function getCarTypeDistribution() {
  const carTypes = await Car.aggregate([
    {
      $match: { isActive: true }
    },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ])

  const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444']
  
  return carTypes.map((type, index) => ({
    name: type._id || 'Other',
    value: type.count,
    color: colors[index % colors.length]
  }))
}

async function getTopPerformingCars(startDate, endDate) {
  const topCars = await Booking.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $ne: 'cancelled' }
      }
    },
    {
      $group: {
        _id: '$car',
        bookings: { $sum: 1 },
        revenue: { $sum: '$pricing.totalAmount' }
      }
    },
    {
      $lookup: {
        from: 'cars',
        localField: '_id',
        foreignField: '_id',
        as: 'carDetails'
      }
    },
    {
      $unwind: '$carDetails'
    },
    {
      $project: {
        name: '$carDetails.name',
        bookings: 1,
        revenue: { $round: ['$revenue', 0] }
      }
    },
    {
      $sort: { revenue: -1 }
    },
    {
      $limit: 5
    }
  ])

  return topCars
}

async function getRecentBookings() {
  const recentBookings = await Booking.find()
    .populate('customer', 'firstName lastName email')
    .populate('car', 'name brand model')
    .sort({ createdAt: -1 })
    .limit(10)
    .select('status createdAt pickupDate customer car pricing')

  return recentBookings
}

async function getFleetUtilization() {
  const [totalCars, rentedCars, maintenanceCars] = await Promise.all([
    Car.countDocuments({ isActive: true }),
    Car.countDocuments({ 'availability.status': 'Rented' }),
    Car.countDocuments({ 'availability.status': 'Maintenance' })
  ])

  const availableCars = totalCars - rentedCars - maintenanceCars
  const utilizationRate = totalCars > 0 ? (rentedCars / totalCars) * 100 : 0

  return {
    totalCars,
    rentedCars,
    availableCars,
    maintenanceCars,
    utilizationRate: Math.round(utilizationRate * 10) / 10
  }
}

async function getCustomerStats(startDate, endDate) {
  const [totalCustomers, newCustomers, ratings] = await Promise.all([
    User.countDocuments({ role: 'customer' }),
    User.countDocuments({
      role: 'customer',
      createdAt: { $gte: startDate, $lte: endDate }
    }),
    Car.aggregate([
      {
        $group: {
          _id: null,
          totalRating: { $sum: { $multiply: ['$rating.average', '$rating.count'] } },
          totalReviews: { $sum: '$rating.count' }
        }
      }
    ])
  ])

  const avgRating = ratings.length > 0 && ratings[0].totalReviews > 0 
    ? ratings[0].totalRating / ratings[0].totalReviews 
    : 4.8

  return {
    totalCustomers,
    newCustomers,
    customerSatisfaction: {
      rating: Math.round(avgRating * 10) / 10,
      totalReviews: ratings.length > 0 ? ratings[0].totalReviews : 0
    }
  }
}

async function getBookingStatistics() {
  const [statusStats, paymentStats, monthlyTrend] = await Promise.all([
    Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]),
    Booking.aggregate([
      {
        $group: {
          _id: '$payment.status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$pricing.totalAmount' }
        }
      }
    ]),
    Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ])
  ])

  return {
    statusDistribution: statusStats,
    paymentDistribution: paymentStats,
    dailyTrend: monthlyTrend
  }
}

async function getFleetAnalytics() {
  const [carStats, brandStats, utilizationByType] = await Promise.all([
    Car.aggregate([
      {
        $group: {
          _id: '$availability.status',
          count: { $sum: 1 }
        }
      }
    ]),
    Car.aggregate([
      {
        $match: { isActive: true }
      },
      {
        $group: {
          _id: '$brand',
          count: { $sum: 1 },
          avgPrice: { $avg: '$pricePerDay' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]),
    Car.aggregate([
      {
        $group: {
          _id: {
            type: '$type',
            status: '$availability.status'
          },
          count: { $sum: 1 }
        }
      }
    ])
  ])

  return {
    availabilityStats: carStats,
    brandDistribution: brandStats,
    typeUtilization: utilizationByType
  }
}

export default router
