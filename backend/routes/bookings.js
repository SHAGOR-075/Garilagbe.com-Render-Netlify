import express from 'express'
import { body, validationResult } from 'express-validator'
import Booking from '../models/Booking.js'
import Car from '../models/Car.js'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let filter = {}
    
    // If user is not admin, only show their bookings
    if (req.user.role !== 'admin') {
      filter.customer = req.user.id
    }

    // Add status filter if provided
    if (req.query.status) {
      filter.status = req.query.status
    }

    // Add date range filter if provided
    if (req.query.startDate && req.query.endDate) {
      filter.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      }
    }

    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const bookings = await Booking.find(filter)
      .populate('customer', 'firstName lastName email phone')
      .populate('car', 'name brand model year pricePerDay images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Booking.countDocuments(filter)

    res.json({
      success: true,
      count: bookings.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: bookings
    })
  } catch (error) {
    console.error('Get bookings error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching bookings'
    })
  }
})

// @desc    Get booking statistics
// @route   GET /api/bookings/stats
// @access  Private (Admin only)
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const [
      totalBookings,
      activeBookings,
      pendingBookings,
      completedBookings,
      cancelledBookings,
      totalRevenue,
      monthlyRevenue
    ] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ status: { $in: ['active', 'confirmed'] } }),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'completed' }),
      Booking.countDocuments({ status: 'cancelled' }),
      Booking.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: '$pricing.totalAmount' }
          }
        }
      ]),
      Booking.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$pricing.totalAmount' }
          }
        }
      ])
    ])

    const stats = {
      totalBookings,
      activeBookings,
      pendingBookings,
      completedBookings,
      cancelledBookings,
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
      monthlyRevenue: monthlyRevenue.length > 0 ? monthlyRevenue[0].total : 0,
      averageBookingValue: totalBookings > 0 ? (totalRevenue.length > 0 ? totalRevenue[0].total / totalBookings : 0) : 0
    }

    res.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Get booking stats error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching booking statistics'
    })
  }
})

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'firstName lastName email phone')
      .populate('car', 'name brand model year pricePerDay images features')

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      })
    }

    // Check if user can access this booking
    if (req.user.role !== 'admin' && booking.customer._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this booking'
      })
    }

    res.json({
      success: true,
      data: booking
    })
  } catch (error) {
    console.error('Get booking error:', error)
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      })
    }
    res.status(500).json({
      success: false,
      message: 'Server error while fetching booking'
    })
  }
})

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
router.post('/', protect, [
  body('car').notEmpty().withMessage('Car ID is required'),
  body('pickupDate').isISO8601().withMessage('Valid pickup date is required'),
  body('returnDate').isISO8601().withMessage('Valid return date is required'),
  body('pickupLocation.branch').notEmpty().withMessage('Pickup location is required'),
  body('returnLocation.branch').notEmpty().withMessage('Return location is required')
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

    const { car: carId, pickupDate, returnDate, pickupLocation, returnLocation, insurance, addOns, specialRequests } = req.body

    // Validate dates
    const pickup = new Date(pickupDate)
    const returnD = new Date(returnDate)
    const now = new Date()

    if (pickup < now) {
      return res.status(400).json({
        success: false,
        message: 'Pickup date cannot be in the past'
      })
    }

    if (returnD <= pickup) {
      return res.status(400).json({
        success: false,
        message: 'Return date must be after pickup date'
      })
    }

    // Check if car exists and is available
    const car = await Car.findById(carId)
    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      })
    }

    if (car.availability.status !== 'Available') {
      return res.status(400).json({
        success: false,
        message: 'Car is not available for booking'
      })
    }

    // Check for conflicting bookings
    const conflictingBooking = await Booking.findOne({
      car: carId,
      status: { $in: ['pending', 'confirmed', 'active'] },
      $or: [
        {
          pickupDate: { $lte: returnD },
          returnDate: { $gte: pickup }
        }
      ]
    })

    if (conflictingBooking) {
      return res.status(400).json({
        success: false,
        message: 'Car is not available for the selected dates'
      })
    }

    // Calculate pricing
    const numberOfDays = Math.ceil((returnD - pickup) / (1000 * 60 * 60 * 24))
    const basePrice = car.pricePerDay
    const subtotal = basePrice * numberOfDays

    // Calculate additional costs
    let insuranceCost = 0
    if (insurance && insurance.type !== 'basic') {
      insuranceCost = insurance.type === 'comprehensive' ? 15 * numberOfDays : 25 * numberOfDays
    }

    let addOnsCost = 0
    if (addOns && addOns.length > 0) {
      addOnsCost = addOns.reduce((total, addon) => total + (addon.cost * addon.quantity), 0)
    }

    const taxes = subtotal * 0.1 // 10% tax
    const totalAmount = subtotal + insuranceCost + addOnsCost + taxes

    // Create booking
    const booking = await Booking.create({
      customer: req.user.id,
      car: carId,
      pickupDate: pickup,
      returnDate: returnD,
      pickupLocation,
      returnLocation,
      pricing: {
        basePrice,
        numberOfDays,
        subtotal,
        taxes,
        totalAmount
      },
      payment: {
        method: 'credit_card', // Default, can be updated later
        status: 'pending'
      },
      insurance: {
        type: insurance?.type || 'basic',
        cost: insuranceCost
      },
      addOns: addOns || [],
      specialRequests
    })




await booking.save()


    // Update car availability
    car.availability.status = 'Rented'
    car.availability.availableFrom = returnD
    await car.save()

    // Populate the booking before sending response
    const populatedBooking = await Booking.findById(booking._id)
      .populate('customer', 'firstName lastName email phone')
      .populate('car', 'name brand model year pricePerDay images')

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: populatedBooking
    })
  } catch (error) {
    console.error('Create booking error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while creating booking'
    })
  }
})

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private (Admin only)
router.put('/:id/status', protect, authorize('admin'), [
  body('status').isIn(['pending', 'confirmed', 'active', 'completed', 'cancelled', 'no_show']).withMessage('Invalid status')
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

    const booking = await Booking.findById(req.params.id)
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      })
    }

    const { status } = req.body
    const oldStatus = booking.status

    // Update booking status
    booking.status = status
    await booking.save()

    // Update car availability based on status change
    const car = await Car.findById(booking.car)
    if (car) {
      if (status === 'completed' || status === 'cancelled') {
        car.availability.status = 'Available'
        car.availability.availableFrom = new Date()
      } else if (status === 'active' || status === 'confirmed') {
        car.availability.status = 'Rented'
        car.availability.availableFrom = booking.returnDate
      }
      await car.save()
    }

    // Log status change for analytics
    console.log(`Booking ${booking._id} status changed from ${oldStatus} to ${status}`)

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      data: booking
    })
  } catch (error) {
    console.error('Update booking status error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while updating booking status'
    })
  }
})

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
router.put('/:id/cancel', protect, [
  body('reason').optional().isLength({ max: 500 }).withMessage('Reason cannot exceed 500 characters')
], async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      })
    }

    // Check if user can cancel this booking
    if (req.user.role !== 'admin' && booking.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      })
    }

    // Check if booking can be cancelled
    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel this booking'
      })
    }

    // Calculate refund amount based on cancellation policy
    const now = new Date()
    const pickupDate = new Date(booking.pickupDate)
    const hoursUntilPickup = (pickupDate - now) / (1000 * 60 * 60)
    
    let refundAmount = 0
    if (hoursUntilPickup > 24) {
      refundAmount = booking.pricing.totalAmount * 0.9 // 90% refund
    } else if (hoursUntilPickup > 12) {
      refundAmount = booking.pricing.totalAmount * 0.5 // 50% refund
    }

    // Update booking
    booking.status = 'cancelled'
    booking.cancellation = {
      cancelledAt: now,
      cancelledBy: req.user.id,
      reason: req.body.reason,
      refundAmount
    }
    await booking.save()

    // Update car availability
    const car = await Car.findById(booking.car)
    if (car) {
      car.availability.status = 'Available'
      car.availability.availableFrom = new Date()
      await car.save()
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: {
        bookingId: booking._id,
        refundAmount,
        status: booking.status
      }
    })
  } catch (error) {
    console.error('Cancel booking error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling booking'
    })
  }
})

// @desc    Get monthly booking revenue
// @route   GET /api/bookings/revenue/monthly
// @access  Private (Admin only)
router.get('/revenue/monthly', protect, authorize('admin'), async (req, res) => {
  try {
    const months = parseInt(req.query.months) || 6
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)

    const monthlyRevenue = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
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
          bookings: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ])

    res.json({
      success: true,
      data: monthlyRevenue
    })
  } catch (error) {
    console.error('Monthly revenue error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching monthly revenue'
    })
  }
})

export default router
