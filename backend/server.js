import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import mongoose from 'mongoose'

// Import routes
import authRoutes from './routes/auth.js'
import carRoutes from './routes/cars.js'
import bookingRoutes from './routes/bookings.js'
import userRoutes from './routes/users.js'
import paymentRoutes from './routes/payment.js'
import analyticsRoutes from './routes/analytics.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Security middleware
app.use(helmet())
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // Increased limit for development
})
app.use(limiter)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// MongoDB connection with optimized settings
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://garilagbe:garilagbe123@garilagbe.valbsvd.mongodb.net/?retryWrites=true&w=majority&appName=GariLagbe', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      // bufferMaxEntries: 0 // Disable mongoose buffering
    })
    console.log(`MongoDB connected: ${conn.connection.host}`)
    
    // Create indexes for better performance
    // await createIndexes()
  } catch (error) {
    console.error('MongoDB connection error:', error)
    process.exit(1)
  }
}

// Create database indexes for better performance with conflict handling
const createIndexes = async () => {
  try {
    const Booking = (await import('./models/Booking.js')).default
    const Car = (await import('./models/Car.js')).default
    const User = (await import('./models/User.js')).default

    console.log('Creating database indexes...')

    // Helper function to safely create index
    const safeCreateIndex = async (collection, indexSpec, options = {}) => {
      try {
        const indexName = options.name || Object.keys(indexSpec).map(key => `${key}_${indexSpec[key]}`).join('_')
        
        // Check if index already exists
        const existingIndexes = await collection.collection.listIndexes().toArray()
        const indexExists = existingIndexes.some(index => {
          // Check by name or by key specification
          if (index.name === indexName) return true
          
          // Check if the key specification matches
          const existingKeys = JSON.stringify(index.key)
          const newKeys = JSON.stringify(indexSpec)
          return existingKeys === newKeys
        })

        if (indexExists) {
          console.log(`Index ${indexName} already exists, skipping...`)
          return
        }

        await collection.collection.createIndex(indexSpec, options)
        console.log(`Created index: ${indexName}`)
      } catch (error) {
        if (error.code === 86) { // IndexKeySpecsConflict
          console.log(`Index conflict for ${JSON.stringify(indexSpec)}, skipping...`)
        } else {
          console.error(`Error creating index ${JSON.stringify(indexSpec)}:`, error.message)
        }
      }
    }

    // Booking indexes
    await safeCreateIndex(Booking, { customer: 1 }, { name: 'booking_customer_1' })
    await safeCreateIndex(Booking, { car: 1 }, { name: 'booking_car_1' })
    await safeCreateIndex(Booking, { status: 1 }, { name: 'booking_status_1' })
    await safeCreateIndex(Booking, { createdAt: -1 }, { name: 'booking_createdAt_-1' })
    await safeCreateIndex(Booking, { pickupDate: 1, returnDate: 1 }, { name: 'booking_dates_1' })
    await safeCreateIndex(Booking, { 'payment.status': 1 }, { name: 'booking_payment_status_1' })
    await safeCreateIndex(Booking, { bookingNumber: 1 }, { name: 'booking_number_1' })

    // Car indexes
    await safeCreateIndex(Car, { 'availability.status': 1 }, { name: 'car_availability_status_1' })
    await safeCreateIndex(Car, { type: 1 }, { name: 'car_type_1' })
    await safeCreateIndex(Car, { brand: 1 }, { name: 'car_brand_1' })
    await safeCreateIndex(Car, { pricePerDay: 1 }, { name: 'car_price_1' })
    await safeCreateIndex(Car, { isActive: 1 }, { name: 'car_isActive_1' })
    await safeCreateIndex(Car, { licensePlate: 1 }, { name: 'car_licensePlate_1', unique: true })
    await safeCreateIndex(Car, { vin: 1 }, { name: 'car_vin_1', unique: true })

    // User indexes (skip email as it's already created by schema)
    await safeCreateIndex(User, { role: 1 }, { name: 'user_role_1' })
    await safeCreateIndex(User, { createdAt: -1 }, { name: 'user_createdAt_-1' })
    await safeCreateIndex(User, { status: 1 }, { name: 'user_status_1' })

    console.log('Database indexes creation completed')
  } catch (error) {
    console.error('Error in index creation process:', error)
  }
}

connectDB()

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/cars', carRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/users', userRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/analytics', analyticsRoutes)

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Car Rental API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '2.0.0'
  })
})

// Database status endpoint
app.get('/api/db-status', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    }

    // Get collection stats
    const collections = await mongoose.connection.db.listCollections().toArray()
    const stats = {}

    for (const collection of collections) {
      try {
        const collectionStats = await mongoose.connection.db.collection(collection.name).stats()
        stats[collection.name] = {
          documents: collectionStats.count,
          size: collectionStats.size,
          indexes: collectionStats.nindexes
        }
      } catch (error) {
        stats[collection.name] = { error: 'Unable to get stats' }
      }
    }

    res.json({
      success: true,
      database: {
        status: states[dbState],
        name: mongoose.connection.name,
        host: mongoose.connection.host,
        port: mongoose.connection.port
      },
      collections: stats
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error getting database status',
      error: error.message
    })
  }
})

// Test endpoint to create sample data
app.get('/api/seed', async (req, res) => {
  try {
    const Car = (await import('./models/Car.js')).default
    const User = (await import('./models/User.js')).default
    const Booking = (await import('./models/Booking.js')).default

    // Create admin user if not exists
    const adminExists = await User.findOne({ email: 'admin@carluxde.com' })
    if (!adminExists) {
      const adminUser = await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@carluxde.com',
        phone: '+1234567890',
        password: 'admin123',
        role: 'admin'
      })
      console.log('Admin user created:', adminUser.email)
    } else {
      console.log('Admin user already exists')
    }

    // Create a test customer user if not exists
    const customerExists = await User.findOne({ email: 'customer@test.com' })
    let customerId
    if (!customerExists) {
      const customerUser = await User.create({
        firstName: 'Test',
        lastName: 'Customer',
        email: 'customer@test.com',
        phone: '+1234567891',
        password: 'customer123',
        role: 'customer'
      })
      customerId = customerUser._id
      console.log('Test customer created:', customerUser.email)
    } else {
      customerId = customerExists._id
      console.log('Test customer already exists')
    }

    // Create sample cars if none exist
    const carCount = await Car.countDocuments()
    let carIds = []
    if (carCount === 0) {
      const sampleCars = [
        {
          name: 'Audi A4 Premium',
          brand: 'Audi',
          model: 'A4',
          year: 2023,
          type: 'Sedan',
          transmission: 'Automatic',
          fuelType: 'Gasoline',
          seats: 5,
          doors: 4,
          color: 'Black',
          licensePlate: 'ABC123',
          vin: '1HGBH41JXMN109186',
          mileage: 15000,
          pricePerDay: 110,
          images: [{
            url: "https://images.unsplash.com/photo-1549924231-f129b911e442?w=400&h=250&fit=crop&crop=center",
            alt: "Audi A4",
            isPrimary: true
          }],
          features: [
            { name: "Air Conditioning", available: true },
            { name: "Bluetooth", available: true },
            { name: "GPS Navigation", available: true },
            { name: "Heated Seats", available: true }
          ],
          location: { branch: 'Main Branch' },
          availability: { status: 'Available' },
          rating: { average: 4.7, count: 89 }
        },
        {
          name: 'BMW X5 Luxury',
          brand: 'BMW',
          model: 'X5',
          year: 2023,
          type: 'SUV',
          transmission: 'Automatic',
          fuelType: 'Gasoline',
          seats: 7,
          doors: 5,
          color: 'White',
          licensePlate: 'XYZ789',
          vin: '2HGBH41JXMN109187',
          mileage: 8000,
          pricePerDay: 180,
          images: [{
            url: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=250&fit=crop&crop=center",
            alt: "BMW X5",
            isPrimary: true
          }],
          features: [
            { name: "Air Conditioning", available: true },
            { name: "Bluetooth", available: true },
            { name: "GPS Navigation", available: true },
            { name: "Premium Sound", available: true },
            { name: "Leather Seats", available: true }
          ],
          location: { branch: 'Main Branch' },
          availability: { status: 'Available' },
          rating: { average: 4.8, count: 67 }
        },
        {
          name: 'Honda Civic Economy',
          brand: 'Honda',
          model: 'Civic',
          year: 2023,
          type: 'Sedan',
          transmission: 'Manual',
          fuelType: 'Gasoline',
          seats: 5,
          doors: 4,
          color: 'Red',
          licensePlate: 'DEF456',
          vin: '3HGBH41JXMN109188',
          mileage: 25000,
          pricePerDay: 55,
          images: [{
            url: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=250&fit=crop&crop=center",
            alt: "Honda Civic",
            isPrimary: true
          }],
          features: [
            { name: "Air Conditioning", available: true },
            { name: "Bluetooth", available: true },
            { name: "USB Ports", available: true }
          ],
          location: { branch: 'Main Branch' },
          availability: { status: 'Available' },
          rating: { average: 4.4, count: 126 }
        },
        {
          name: 'Mercedes GLC Comfort',
          brand: 'Mercedes',
          model: 'GLC',
          year: 2023,
          type: 'SUV',
          transmission: 'Automatic',
          fuelType: 'Gasoline',
          seats: 5,
          doors: 5,
          color: 'Silver',
          licensePlate: 'GHI789',
          vin: '4HGBH41JXMN109189',
          mileage: 12000,
          pricePerDay: 95,
          images: [{
            url: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=250&fit=crop&crop=center",
            alt: "Mercedes GLC",
            isPrimary: true
          }],
          features: [
            { name: "Air Conditioning", available: true },
            { name: "Bluetooth", available: true },
            { name: "GPS Navigation", available: true },
            { name: "Premium Sound", available: true }
          ],
          location: { branch: 'Airport Branch' },
          availability: { status: 'Available' },
          rating: { average: 4.6, count: 54 }
        },
        {
          name: 'Tesla Model 3 Electric',
          brand: 'Tesla',
          model: 'Model 3',
          year: 2023,
          type: 'Sedan',
          transmission: 'Automatic',
          fuelType: 'Electric',
          seats: 5,
          doors: 4,
          color: 'Blue',
          licensePlate: 'JKL012',
          vin: '5HGBH41JXMN109190',
          mileage: 5000,
          pricePerDay: 89,
          images: [{
            url: "https://images.unsplash.com/photo-1549924231-f129b911e442?w=400&h=250&fit=crop&crop=center",
            alt: "Tesla Model 3",
            isPrimary: true
          }],
          features: [
            { name: "Autopilot", available: true },
            { name: "Supercharging", available: true },
            { name: "Premium Audio", available: true },
            { name: "Glass Roof", available: true }
          ],
          location: { branch: 'Downtown Branch' },
          availability: { status: 'Available' },
          rating: { average: 4.8, count: 42 }
        },
        {
          name: 'Porsche 911 Compact',
          brand: 'Porsche',
          model: '911',
          year: 2023,
          type: 'Compact',
          transmission: 'Manual',
          fuelType: 'Gasoline',
          seats: 2,
          doors: 2,
          color: 'Yellow',
          licensePlate: 'MNO345',
          vin: '6HGBH41JXMN109191',
          mileage: 3000,
          pricePerDay: 199,
          images: [{
            url: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=250&fit=crop&crop=center",
            alt: "Porsche 911",
            isPrimary: true
          }],
          features: [
            { name: "Sport Mode", available: true },
            { name: "Premium Sound", available: true },
            { name: "Racing Seats", available: true },
            { name: "Performance Package", available: true }
          ],
          location: { branch: 'Main Branch' },
          availability: { status: 'Available' },
          rating: { average: 4.9, count: 31 }
        }
      ]

      try {
        const createdCars = await Car.insertMany(sampleCars)
        carIds = createdCars.map(car => car._id)
        console.log('Sample cars created:', sampleCars.length)
      } catch (error) {
        console.error('Error creating sample cars:', error)
        // If there's a duplicate key error, fetch existing cars
        const existingCars = await Car.find().limit(6)
        carIds = existingCars.map(car => car._id)
      }
    } else {
      const existingCars = await Car.find().limit(6)
      carIds = existingCars.map(car => car._id)
      console.log('Cars already exist in database')
    }

    // Create sample bookings if none exist
    const bookingCount = await Booking.countDocuments()
    if (bookingCount === 0 && carIds.length > 0 && customerId) {
      const sampleBookings = []
      
      // Create bookings for the last 6 months
      for (let i = 0; i < 12; i++) {
        const pickupDate = new Date()
        pickupDate.setMonth(pickupDate.getMonth() - Math.floor(Math.random() * 6))
        pickupDate.setDate(Math.floor(Math.random() * 28) + 1)
        
        const returnDate = new Date(pickupDate)
        returnDate.setDate(returnDate.getDate() + Math.floor(Math.random() * 7) + 1)
        
        const randomCarId = carIds[Math.floor(Math.random() * carIds.length)]
        const basePrice = [55, 89, 95, 110, 180, 199][Math.floor(Math.random() * 6)]
        const numberOfDays = Math.ceil((returnDate - pickupDate) / (1000 * 60 * 60 * 24))
        const subtotal = basePrice * numberOfDays
        const taxes = subtotal * 0.1
        const totalAmount = subtotal + taxes
        
        sampleBookings.push({
          customer: customerId,
          car: randomCarId,
          pickupDate,
          returnDate,
          pickupLocation: { branch: 'Main Branch' },
          returnLocation: { branch: 'Main Branch' },
          pricing: {
            basePrice,
            numberOfDays,
            subtotal,
            taxes,
            totalAmount
          },
          payment: {
            method: 'credit_card',
            status: Math.random() > 0.2 ? 'paid' : 'pending'
          },
          status: ['pending', 'confirmed', 'active', 'completed'][Math.floor(Math.random() * 4)],
          insurance: { type: 'basic', cost: 0 }
        })
      }
      
      try {
        await Booking.insertMany(sampleBookings)
        console.log('Sample bookings created:', sampleBookings.length)
      } catch (error) {
        console.error('Error creating sample bookings:', error)
      }
    }

    const totalCars = await Car.countDocuments()
    const totalUsers = await User.countDocuments()
    const totalBookings = await Booking.countDocuments()

    res.json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        adminCredentials: {
          email: 'admin@carluxde.com',
          password: 'admin123',
          role: 'admin'
        },
        customerCredentials: {
          email: 'customer@test.com',
          password: 'customer123',
          role: 'customer'
        },
        carsCreated: carCount === 0 ? 6 : 0,
        bookingsCreated: bookingCount === 0 ? 12 : 0,
        totalCars,
        totalUsers,
        totalBookings
      }
    })
  } catch (error) {
    console.error('Seeding error:', error)
    res.status(500).json({
      success: false,
      message: 'Error seeding database',
      error: error.message
    })
  }
})

// Admin registration endpoint (for development only)
app.post('/api/admin/register', async (req, res) => {
  try {
    const User = (await import('./models/User.js')).default
    const { firstName, lastName, email, phone, password } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      })
    }

    // Create admin user
    const adminUser = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password,
      role: 'admin'
    })

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      user: {
        id: adminUser._id,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        email: adminUser.email,
        role: adminUser.role
      }
    })
  } catch (error) {
    console.error('Admin registration error:', error)
    res.status(500).json({
      success: false,
      message: 'Error creating admin user',
      error: error.message
    })
  }
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ 
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route not found' 
  })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`Health check: http://localhost:${PORT}/api/health`)
  console.log(`Database status: http://localhost:${PORT}/api/db-status`)
  console.log(`Seed database: http://localhost:${PORT}/api/seed`)
  console.log(`Admin credentials: admin@carluxde.com / admin123`)
  console.log(`Analytics API: http://localhost:${PORT}/api/analytics/dashboard`)
})
