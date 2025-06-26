import express from 'express'
import { body, validationResult, query } from 'express-validator'
import Car from '../models/Car.js'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()

// @desc    Get all cars with filtering, sorting, and pagination
// @route   GET /api/cars
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('Limit must be between 1 and 1000'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be a positive number'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be a positive number'),
  query('pickupDate').optional().isISO8601().withMessage('Pickup date must be a valid date'),
  query('returnDate').optional().isISO8601().withMessage('Return date must be a valid date')
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

    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    // Build filter object
    let filter = { isActive: true }

    if (req.query.brand) {
      filter.brand = new RegExp(req.query.brand, 'i')
    }

    if (req.query.type) {
      filter.type = req.query.type
    }

    if (req.query.transmission) {
      filter.transmission = req.query.transmission
    }

    if (req.query.fuelType) {
      filter.fuelType = req.query.fuelType
    }

    if (req.query.minPrice || req.query.maxPrice) {
      filter.pricePerDay = {}
      if (req.query.minPrice) filter.pricePerDay.$gte = parseFloat(req.query.minPrice)
      if (req.query.maxPrice) filter.pricePerDay.$lte = parseFloat(req.query.maxPrice)
    }

    if (req.query.seats) {
      filter.seats = parseInt(req.query.seats)
    }

    // Handle pickup location filtering
    if (req.query.pickupLocation) {
      filter['location.branch'] = new RegExp(req.query.pickupLocation, 'i')
    }

    // Handle destination filtering (for future implementation)
    // This could be used to filter cars available at destination locations
    if (req.query.destination) {
      // For now, we'll include destination in the search but not filter by it
      // This can be expanded later to check availability at destination locations
    }

    // Handle date-based availability filtering
    if (req.query.pickupDate || req.query.returnDate) {
      const pickupDate = req.query.pickupDate ? new Date(req.query.pickupDate) : null
      const returnDate = req.query.returnDate ? new Date(req.query.returnDate) : null
      
      // Filter for cars that are available during the requested period
      filter['availability.status'] = 'Available'
      
      // Additional date logic can be added here for more sophisticated availability checking
      // For example, checking against existing bookings
    }

    if (req.query.availability) {
      filter['availability.status'] = req.query.availability
    }

    if (req.query.search) {
      filter.$or = [
        { name: new RegExp(req.query.search, 'i') },
        { brand: new RegExp(req.query.search, 'i') },
        { model: new RegExp(req.query.search, 'i') }
      ]
    }

    // Build sort object
    let sort = {}
    if (req.query.sortBy) {
      const sortField = req.query.sortBy.replace('-', '')
      const sortOrder = req.query.sortBy.startsWith('-') ? -1 : 1
      sort[sortField] = sortOrder
    } else {
      sort = { createdAt: -1 }
    }

    // Execute query
    const cars = await Car.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-__v')

    const total = await Car.countDocuments(filter)

    res.json({
      success: true,
      count: cars.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: cars
    })
  } catch (error) {
    console.error('Get cars error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching cars',
      error: error.message
    })
  }
})

// Get unique pickup locations
router.get('/locations', async (req, res) => {
  try {
    const locations = await Car.distinct('location.branch', { 'location.branch': { $ne: null } })
    res.json({ success: true, data: locations })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching locations', error: error.message })
  }
})

// Get unique vehicle types
router.get('/types', async (req, res) => {
  try {
    const types = await Car.distinct('type', { type: { $ne: null } })
    res.json({ success: true, data: types })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching vehicle types', error: error.message })
  }
})

// @desc    Get single car
// @route   GET /api/cars/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const car = await Car.findById(req.params.id).select('-__v')

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      })
    }

    res.json({
      success: true,
      data: car
    })
  } catch (error) {
    console.error('Get car error:', error)
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      })
    }
    res.status(500).json({
      success: false,
      message: 'Server error while fetching car',
      error: error.message
    })
  }
})

// @desc    Create new car
// @route   POST /api/cars
// @access  Private (Admin only)
router.post('/', protect, authorize('admin'), [
  body('name').notEmpty().withMessage('Car name is required'),
  body('brand').notEmpty().withMessage('Brand is required'),
  body('model').notEmpty().withMessage('Model is required'),
  body('year').isInt({ min: 1990 }).withMessage('Year must be 1990 or later'),
  body('type').isIn(['Sedan', 'SUV','Luxury', 'Compact']).withMessage('Invalid car type'),
  body('transmission').isIn(['Manual', 'Automatic', 'CVT']).withMessage('Invalid transmission type'),
  body('fuelType').isIn(['Gasoline', 'Diesel', 'Electric', 'Hybrid']).withMessage('Invalid fuel type'),
  body('seats').isInt({ min: 2, max: 8 }).withMessage('Seats must be between 2 and 8'),
  body('pricePerDay').isFloat({ min: 0 }).withMessage('Price per day must be a positive number'),
  body('licensePlate').notEmpty().withMessage('License plate is required'),
  body('vin').isLength({ min: 17, max: 17 }).withMessage('VIN must be exactly 17 characters')
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

    // Check for duplicate license plate or VIN
    const existingCar = await Car.findOne({
      $or: [
        { licensePlate: req.body.licensePlate.toUpperCase() },
        { vin: req.body.vin.toUpperCase() }
      ]
    })

    if (existingCar) {
      return res.status(400).json({
        success: false,
        message: 'Car with this license plate or VIN already exists'
      })
    }

    // Add default values for required fields
    const carData = {
      ...req.body,
      licensePlate: req.body.licensePlate.toUpperCase(),
      vin: req.body.vin.toUpperCase(),
      images: req.body.images || [{
        url: "https://images.unsplash.com/photo-1549924231-f129b911e442?w=400&h=250&fit=crop&crop=center",
        alt: req.body.name,
        isPrimary: true
      }],
      availability: {
        status: 'Available',
        availableFrom: new Date()
      },
      rating: {
        average: 0,
        count: 0
      }
    }

    const car = await Car.create(carData)

    res.status(201).json({
      success: true,
      message: 'Car created successfully',
      data: car
    })
  } catch (error) {
    console.error('Create car error:', error)
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0]
      return res.status(400).json({
        success: false,
        message: `Car with this ${field} already exists`
      })
    }
    res.status(500).json({
      success: false,
      message: 'Server error while creating car',
      error: error.message
    })
  }
})

// @desc    Update car
// @route   PUT /api/cars/:id
// @access  Private (Admin only)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const car = await Car.findById(req.params.id)

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      })
    }

    // Check for duplicate license plate or VIN if they are being updated
    if (req.body.licensePlate || req.body.vin) {
      const duplicateQuery = {
        _id: { $ne: req.params.id },
        $or: []
      }

      if (req.body.licensePlate) {
        duplicateQuery.$or.push({ licensePlate: req.body.licensePlate.toUpperCase() })
      }

      if (req.body.vin) {
        duplicateQuery.$or.push({ vin: req.body.vin.toUpperCase() })
      }

      if (duplicateQuery.$or.length > 0) {
        const existingCar = await Car.findOne(duplicateQuery)
        if (existingCar) {
          return res.status(400).json({
            success: false,
            message: 'Car with this license plate or VIN already exists'
          })
        }
      }
    }

    // Prepare update data
    const updateData = { ...req.body }
    if (updateData.licensePlate) {
      updateData.licensePlate = updateData.licensePlate.toUpperCase()
    }
    if (updateData.vin) {
      updateData.vin = updateData.vin.toUpperCase()
    }

    const updatedCar = await Car.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )

    res.json({
      success: true,
      message: 'Car updated successfully',
      data: updatedCar
    })
  } catch (error) {
    console.error('Update car error:', error)
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      })
    }
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0]
      return res.status(400).json({
        success: false,
        message: `Car with this ${field} already exists`
      })
    }
    res.status(500).json({
      success: false,
      message: 'Server error while updating car',
      error: error.message
    })
  }
})

// @desc    Delete car (soft delete)
// @route   DELETE /api/cars/:id
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const car = await Car.findById(req.params.id)

    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      })
    }

    // Soft delete by setting isActive to false
    car.isActive = false
    await car.save()

    res.json({
      success: true,
      message: 'Car deleted successfully'
    })
  } catch (error) {
    console.error('Delete car error:', error)
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      })
    }
    res.status(500).json({
      success: false,
      message: 'Server error while deleting car',
      error: error.message
    })
  }
})

// @desc    Get car availability
// @route   GET /api/cars/:id/availability
// @access  Public
router.get('/:id/availability', [
  query('startDate').isISO8601().withMessage('Start date must be a valid date'),
  query('endDate').isISO8601().withMessage('End date must be a valid date')
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

    const car = await Car.findById(req.params.id)
    if (!car) {
      return res.status(404).json({
        success: false,
        message: 'Car not found'
      })
    }

    const startDate = new Date(req.query.startDate)
    const endDate = new Date(req.query.endDate)

    // Check if car is available during the requested period
    const isAvailable = car.availability.status === 'Available'

    res.json({
      success: true,
      data: {
        carId: car._id,
        available: isAvailable,
        status: car.availability.status,
        availableFrom: car.availability.availableFrom,
        availableUntil: car.availability.availableUntil
      }
    })
  } catch (error) {
    console.error('Check availability error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while checking availability',
      error: error.message
    })
  }
})

// @desc    Advanced search with availability checking
// @route   GET /api/cars/search/advanced
// @access  Public
router.get('/search/advanced', [
  query('pickupLocation').optional().notEmpty().withMessage('Pickup location is required for advanced search'),
  query('destination').optional().notEmpty().withMessage('Destination is required for advanced search'),
  query('pickupDate').isISO8601().withMessage('Pickup date must be a valid date'),
  query('returnDate').isISO8601().withMessage('Return date must be a valid date'),
  query('vehicleType').optional().isIn(['Sedan', 'SUV','Luxury', 'Compact']).withMessage('Invalid vehicle type'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
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

    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 12
    const skip = (page - 1) * limit

    const pickupDate = new Date(req.query.pickupDate)
    const returnDate = new Date(req.query.returnDate)

    // Validate date range
    if (pickupDate >= returnDate) {
      return res.status(400).json({
        success: false,
        message: 'Return date must be after pickup date'
      })
    }

    // Build filter object
    let filter = { 
      isActive: true,
      'availability.status': 'Available'
    }

    // Filter by pickup location
    if (req.query.pickupLocation) {
      filter['location.branch'] = new RegExp(req.query.pickupLocation, 'i')
    }

    // Filter by vehicle type
    if (req.query.vehicleType) {
      filter.type = req.query.vehicleType
    }

    // Filter by availability dates
    // This is a basic implementation - in a real system, you'd check against actual bookings
    filter['availability.availableFrom'] = { $lte: pickupDate }
    
    // If there's an availableUntil date, check that too
    if (req.query.returnDate) {
      filter.$or = [
        { 'availability.availableUntil': { $exists: false } },
        { 'availability.availableUntil': { $gte: returnDate } }
      ]
    }

    // Execute query
    const cars = await Car.find(filter)
      .sort({ 'rating.average': -1, pricePerDay: 1 })
      .skip(skip)
      .limit(limit)
      .select('-__v')

    const total = await Car.countDocuments(filter)

    res.json({
      success: true,
      count: cars.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      searchCriteria: {
        pickupLocation: req.query.pickupLocation,
        destination: req.query.destination,
        pickupDate: req.query.pickupDate,
        returnDate: req.query.returnDate,
        vehicleType: req.query.vehicleType
      },
      data: cars
    })
  } catch (error) {
    console.error('Advanced search error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while performing advanced search',
      error: error.message
    })
  }
})

export default router
