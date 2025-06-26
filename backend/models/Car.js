import mongoose from 'mongoose'

const carSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Car name is required'],
    trim: true,
    maxlength: [100, 'Car name cannot exceed 100 characters']
  },
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Model is required'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [1990, 'Year must be 1990 or later'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
  },
  type: {
    type: String,
    required: [true, 'Car type is required'],
    enum: ['Sedan', 'SUV', 'Luxury', 'Compact']
  },
  transmission: {
    type: String,
    required: [true, 'Transmission type is required'],
    enum: ['Manual', 'Automatic', 'CVT']
  },
  fuelType: {
    type: String,
    required: [true, 'Fuel type is required'],
    enum: ['Gasoline', 'Diesel', 'Electric', 'Hybrid']
  },
  seats: {
    type: Number,
    required: [true, 'Number of seats is required'],
    min: [2, 'Must have at least 2 seats'],
    max: [8, 'Cannot have more than 8 seats']
  },
  doors: {
    type: Number,
    required: [true, 'Number of doors is required'],
    min: [2, 'Must have at least 2 doors'],
    max: [5, 'Cannot have more than 5 doors']
  },
  color: {
    type: String,
    required: [true, 'Color is required'],
    trim: true
  },
  licensePlate: {
    type: String,
    required: [true, 'License plate is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  vin: {
    type: String,
    required: [true, 'VIN is required'],
    unique: true,
    trim: true,
    uppercase: true,
    length: [17, 'VIN must be exactly 17 characters']
  },
  mileage: {
    type: Number,
    required: [true, 'Mileage is required'],
    min: [0, 'Mileage cannot be negative']
  },
  pricePerDay: {
    type: Number,
    required: [true, 'Price per day is required'],
    min: [0, 'Price cannot be negative']
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  features: [{
    name: {
      type: String,
      required: true
    },
    available: {
      type: Boolean,
      default: true
    }
  }],
  specifications: {
    engine: String,
    horsepower: Number,
    torque: String,
    fuelEconomy: {
      city: Number,
      highway: Number,
      combined: Number
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      wheelbase: Number
    },
    weight: Number,
    trunkCapacity: Number
  },
  location: {
    branch: {
      type: String,
      required: [true, 'Branch location is required']
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  availability: {
    status: {
      type: String,
      enum: ['Available', 'Rented', 'Maintenance', 'Out of Service'],
      default: 'Available'
    },
    availableFrom: {
      type: Date,
      default: Date.now
    },
    availableUntil: {
      type: Date
    }
  },
  maintenance: {
    lastService: Date,
    nextService: Date,
    serviceHistory: [{
      date: Date,
      type: String,
      description: String,
      cost: Number,
      mileageAtService: Number
    }]
  },
  insurance: {
    provider: String,
    policyNumber: String,
    expiryDate: Date,
    coverage: String
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

// Index for search functionality
carSchema.index({ name: 'text', brand: 'text', model: 'text' })
carSchema.index({ 'location.branch': 1 })
carSchema.index({ type: 1 })
carSchema.index({ pricePerDay: 1 })
carSchema.index({ 'availability.status': 1 })

export default mongoose.model('Car', carSchema)
