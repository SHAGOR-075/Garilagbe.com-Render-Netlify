// import mongoose from 'mongoose'

// const bookingSchema = new mongoose.Schema({
//   bookingNumber: {
//     type: String,
//     unique: true,
//     required: true
//   },
//   customer: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: [true, 'Customer is required']
//   },
//   car: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Car',
//     required: [true, 'Car is required']
//   },
//   pickupDate: {
//     type: Date,
//     required: [true, 'Pickup date is required']
//   },
//   returnDate: {
//     type: Date,
//     required: [true, 'Return date is required']
//   },
//   pickupLocation: {
//     branch: {
//       type: String,
//       required: [true, 'Pickup branch is required']
//     },
//     address: {
//       street: String,
//       city: String,
//       state: String,
//       zipCode: String,
//       country: String
//     }
//   },
//   returnLocation: {
//     branch: {
//       type: String,
//       required: [true, 'Return branch is required']
//     },
//     address: {
//       street: String,
//       city: String,
//       state: String,
//       zipCode: String,
//       country: String
//     }
//   },
//   pricing: {
//     basePrice: {
//       type: Number,
//       required: true
//     },
//     numberOfDays: {
//       type: Number,
//       required: true
//     },
//     subtotal: {
//       type: Number,
//       required: true
//     },
//     taxes: {
//       type: Number,
//       default: 0
//     },
//     fees: [{
//       name: String,
//       amount: Number,
//       description: String
//     }],
//     discounts: [{
//       name: String,
//       amount: Number,
//       type: {
//         type: String,
//         enum: ['percentage', 'fixed']
//       }
//     }],
//     totalAmount: {
//       type: Number,
//       required: true
//     }
//   },
//   payment: {
//     method: {
//       type: String,
//       enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer'],
//       required: true
//     },
//     status: {
//       type: String,
//       enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
//       default: 'pending'
//     },
//     transactionId: String,
//     paidAmount: {
//       type: Number,
//       default: 0
//     },
//     paidAt: Date,
//     refundAmount: {
//       type: Number,
//       default: 0
//     },
//     refundedAt: Date
//   },
//   status: {
//     type: String,
//     enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled', 'no_show'],
//     default: 'pending'
//   },
//   driverDetails: {
//     primaryDriver: {
//       name: String,
//       licenseNumber: String,
//       licenseExpiry: Date,
//       licenseCountry: String
//     },
//     additionalDrivers: [{
//       name: String,
//       licenseNumber: String,
//       licenseExpiry: Date,
//       licenseCountry: String,
//       fee: Number
//     }]
//   },
//   insurance: {
//     type: {
//       type: String,
//       enum: ['basic', 'comprehensive', 'premium'],
//       default: 'basic'
//     },
//     cost: {
//       type: Number,
//       default: 0
//     },
//     coverage: String
//   },
//   addOns: [{
//     name: String,
//     description: String,
//     cost: Number,
//     quantity: {
//       type: Number,
//       default: 1
//     }
//   }],
//   specialRequests: {
//     type: String,
//     maxlength: [500, 'Special requests cannot exceed 500 characters']
//   },
//   checkIn: {
//     date: Date,
//     mileage: Number,
//     fuelLevel: {
//       type: String,
//       enum: ['Empty', '1/4', '1/2', '3/4', 'Full']
//     },
//     condition: String,
//     photos: [String],
//     staff: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User'
//     }
//   },
//   checkOut: {
//     date: Date,
//     mileage: Number,
//     fuelLevel: {
//       type: String,
//       enum: ['Empty', '1/4', '1/2', '3/4', 'Full']
//     },
//     condition: String,
//     photos: [String],
//     damages: [{
//       description: String,
//       cost: Number,
//       photos: [String]
//     }],
//     additionalCharges: [{
//       name: String,
//       amount: Number,
//       reason: String
//     }],
//     staff: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User'
//     }
//   },
//   cancellation: {
//     cancelledAt: Date,
//     cancelledBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User'
//     },
//     reason: String,
//     refundAmount: Number
//   },
//   notifications: {
//     confirmationSent: {
//       type: Boolean,
//       default: false
//     },
//     reminderSent: {
//       type: Boolean,
//       default: false
//     },
//     completionSent: {
//       type: Boolean,
//       default: false
//     }
//   },
//   notes: [{
//     content: String,
//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User'
//     },
//     createdAt: {
//       type: Date,
//       default: Date.now
//     }
//   }]
// }, {
//   timestamps: true
// })

// // Generate booking number before saving
// bookingSchema.pre('save', async function(next) {
//   if (!this.bookingNumber) {
//     const count = await mongoose.model('Booking').countDocuments()
//     this.bookingNumber = `BK${Date.now()}${String(count + 1).padStart(4, '0')}`
//   }
//   next()
// })

// // Validate dates
// bookingSchema.pre('save', function(next) {
//   if (this.returnDate <= this.pickupDate) {
//     next(new Error('Return date must be after pickup date'))
//   }
//   next()
  
// })

// // Index for efficient queries
// bookingSchema.index({ customer: 1 })
// bookingSchema.index({ car: 1 })
// bookingSchema.index({ status: 1 })
// bookingSchema.index({ pickupDate: 1, returnDate: 1 })
// bookingSchema.index({ bookingNumber: 1 })

// export default mongoose.model('Booking', bookingSchema)

import mongoose from 'mongoose'

const bookingSchema = new mongoose.Schema({
  bookingNumber: {
    type: String,
    unique: true,
    // required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Customer is required']
  },
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: [true, 'Car is required']
  },
  pickupDate: {
    type: Date,
    required: [true, 'Pickup date is required']
  },
  returnDate: {
    type: Date,
    required: [true, 'Return date is required']
  },
  pickupLocation: {
    branch: {
      type: String,
      required: [true, 'Pickup branch is required']
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },
  returnLocation: {
    branch: {
      type: String,
      required: [true, 'Return branch is required']
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },
  pricing: {
    basePrice: {
      type: Number,
      required: true
    },
    numberOfDays: {
      type: Number,
      required: true
    },
    subtotal: {
      type: Number,
      required: true
    },
    taxes: {
      type: Number,
      default: 0
    },
    fees: [{
      name: String,
      amount: Number,
      description: String
    }],
    discounts: [{
      name: String,
      amount: Number,
      type: {
        type: String,
        enum: ['percentage', 'fixed']
      }
    }],
    totalAmount: {
      type: Number,
      required: true
    }
  },
  payment: {
    method: {
      type: String,
      enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
      default: 'pending'
    },
    transactionId: String,
    paidAmount: {
      type: Number,
      default: 0
    },
    paidAt: Date,
    refundAmount: {
      type: Number,
      default: 0
    },
    refundedAt: Date
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled', 'no_show'],
    default: 'pending'
  },
  driverDetails: {
    primaryDriver: {
      name: String,
      licenseNumber: String,
      licenseExpiry: Date,
      licenseCountry: String
    },
    additionalDrivers: [{
      name: String,
      licenseNumber: String,
      licenseExpiry: Date,
      licenseCountry: String,
      fee: Number
    }]
  },
  insurance: {
    type: {
      type: String,
      enum: ['basic', 'comprehensive', 'premium'],
      default: 'basic'
    },
    cost: {
      type: Number,
      default: 0
    },
    coverage: String
  },
  addOns: [{
    name: String,
    description: String,
    cost: Number,
    quantity: {
      type: Number,
      default: 1
    }
  }],
  specialRequests: {
    type: String,
    maxlength: [500, 'Special requests cannot exceed 500 characters']
  },
  checkIn: {
    date: Date,
    mileage: Number,
    fuelLevel: {
      type: String,
      enum: ['Empty', '1/4', '1/2', '3/4', 'Full']
    },
    condition: String,
    photos: [String],
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  checkOut: {
    date: Date,
    mileage: Number,
    fuelLevel: {
      type: String,
      enum: ['Empty', '1/4', '1/2', '3/4', 'Full']
    },
    condition: String,
    photos: [String],
    damages: [{
      description: String,
      cost: Number,
      photos: [String]
    }],
    additionalCharges: [{
      name: String,
      amount: Number,
      reason: String
    }],
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  cancellation: {
    cancelledAt: Date,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    refundAmount: Number
  },
  notifications: {
    confirmationSent: {
      type: Boolean,
      default: false
    },
    reminderSent: {
      type: Boolean,
      default: false
    },
    completionSent: {
      type: Boolean,
      default: false
    }
  },
  notes: [{
    content: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
})

// Generate booking number before saving
bookingSchema.pre('save', async function(next) {
  if (!this.bookingNumber) {
    try {
      const count = await this.constructor.countDocuments()
      this.bookingNumber = `BK${Date.now()}${String(count + 1).padStart(4, '0')}`
      next()
    } catch (error) {
      next(error)
    }
  } else {
    next()
  }
})

// Validate dates
bookingSchema.pre('save', function(next) {
  if (this.returnDate <= this.pickupDate) {
    return next(new Error('Return date must be after pickup date'))
  }
  next()
})

// Index for efficient queries
bookingSchema.index({ customer: 1 })
bookingSchema.index({ car: 1 })
bookingSchema.index({ status: 1 })
bookingSchema.index({ pickupDate: 1, returnDate: 1 })
bookingSchema.index({ bookingNumber: 1 })

export default mongoose.model('Booking', bookingSchema)

