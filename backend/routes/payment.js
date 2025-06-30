// import express from 'express'
// import { body, validationResult } from 'express-validator'
// import SSLCommerzPayment from 'sslcommerz-lts'
// import { v4 as uuidv4 } from 'uuid'
// import Booking from '../models/Booking.js'
// import Car from '../models/Car.js'
// import { protect } from '../middleware/auth.js'

// const router = express.Router()

// // SSLCommerz Configuration
// const store_id = process.env.SSLCOMMERZ_STORE_ID || 'glcom685cf0e8d691e'
// const store_passwd = process.env.SSLCOMMERZ_STORE_PASSWORD || 'glcom685cf0e8d691e@ssl'
// const is_live = process.env.NODE_ENV === 'production' // true for live, false for sandbox

// // @desc    Initialize payment
// // @route   POST /api/payment/init
// // @access  Private
// router.post('/init', protect, [
//   body('bookingId').notEmpty().withMessage('Booking ID is required'),
//   body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
//   body('currency').optional().isIn(['BDT', 'USD']).withMessage('Currency must be BDT or USD')
// ], async (req, res) => {
//   try {
//     const errors = validationResult(req)
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         success: false,
//         message: 'Validation errors',
//         errors: errors.array()
//       })
//     }

//     const { bookingId, amount, currency = 'BDT' } = req.body

//     // Get booking details
//     const booking = await Booking.findById(bookingId)
//       .populate('customer', 'firstName lastName email phone')
//       .populate('car', 'name brand model')

//     if (!booking) {
//       return res.status(404).json({
//         success: false,
//         message: 'Booking not found'
//       })
//     }

//     // Check if user owns this booking
//     if (booking.customer._id.toString() !== req.user.id) {
//       return res.status(403).json({
//         success: false,
//         message: 'Not authorized to pay for this booking'
//       })
//     }

//     // Check if booking is already paid
//     if (booking.payment.status === 'paid') {
//       return res.status(400).json({
//         success: false,
//         message: 'Booking is already paid'
//       })
//     }

//     const transactionId = uuidv4()

//     const data = {
//       total_amount: amount,
//       currency: currency,
//       tran_id: transactionId, // use unique tran_id for each api call
//       success_url: `${process.env.CLIENT_URL || 'https://garilagbe-client.netlify.app'}/payment/success?tran_id=${transactionId}&amount=${amount}`,
//       fail_url: `${process.env.CLIENT_URL || 'https://garilagbe-client.netlify.app'}/payment/fail?tran_id=${transactionId}&amount=${amount}`,
//       cancel_url: `${process.env.CLIENT_URL || 'https://garilagbe-client.netlify.app'}/payment/cancel?tran_id=${transactionId}&amount=${amount}`,
//       ipn_url: `${process.env.BACKEND_URL || 'https://garilagbe-com.onrender.com'}/api/payment/ipn`,
//       shipping_method: 'NO',
//       product_name: `Car Rental - ${booking.car.name}`,
//       product_category: 'Car Rental',
//       product_profile: 'general',
//       cus_name: `${booking.customer.firstName} ${booking.customer.lastName}`,
//       cus_email: booking.customer.email,
//       cus_add1: 'Customer Address',
//       cus_add2: 'Dhaka',
//       cus_city: 'Dhaka',
//       cus_state: 'Dhaka',
//       cus_postcode: '1000',
//       cus_country: 'Bangladesh',
//       cus_phone: booking.customer.phone,
//       cus_fax: booking.customer.phone,
//       ship_name: `${booking.customer.firstName} ${booking.customer.lastName}`,
//       ship_add1: 'Customer Address',
//       ship_add2: 'Dhaka',
//       ship_city: 'Dhaka',
//       ship_state: 'Dhaka',
//       ship_postcode: 1000,
//       ship_country: 'Bangladesh',
//     }

//     const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
    
//     const apiResponse = await sslcz.init(data)

//     if (apiResponse.status === 'SUCCESS') {
//       // Update booking with transaction ID
//       booking.payment.transactionId = transactionId
//       booking.payment.status = 'pending'
//       await booking.save()

//       res.json({
//         success: true,
//         message: 'Payment initialized successfully',
//         data: {
//           paymentUrl: apiResponse.GatewayPageURL,
//           transactionId: transactionId,
//           sessionkey: apiResponse.sessionkey
//         }
//       })
//     } else {
//       res.status(400).json({
//         success: false,
//         message: 'Failed to initialize payment',
//         error: apiResponse
//       })
//     }
//   } catch (error) {
//     console.error('Payment initialization error:', error)
//     res.status(500).json({
//       success: false,
//       message: 'Server error during payment initialization',
//       error: error.message
//     })
//   }
// })

// // @desc    Validate payment
// // @route   POST /api/payment/validate
// // @access  Private
// // router.post('/validate', protect, [
// //   body('transactionId').notEmpty().withMessage('Transaction ID is required'),
// //   body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number')
// // ], async (req, res) => {
// //   try {
// //     const errors = validationResult(req)
// //     if (!errors.isEmpty()) {
// //       return res.status(400).json({
// //         success: false,
// //         message: 'Validation errors',
// //         errors: errors.array()
// //       })
// //     }

// //     const { transactionId, amount } = req.body

// //     const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
    
// //     const validation = await sslcz.validate({ tran_id: transactionId })

// //     if (validation.status === 'VALID' && validation.amount == amount) {
// //       // Find booking by transaction ID
// //       const booking = await Booking.findOne({ 'payment.transactionId': transactionId })

// //       if (!booking) {
// //         return res.status(404).json({
// //           success: false,
// //           message: 'Booking not found for this transaction'
// //         })
// //       }

// //       // Update booking payment status
// //       booking.payment.status = 'paid'
// //       booking.payment.paidAmount = parseFloat(amount)
// //       booking.payment.paidAt = new Date()
// //       booking.status = 'confirmed'
// //       await booking.save()

// //       res.json({
// //         success: true,
// //         message: 'Payment validated successfully',
// //         data: {
// //           bookingId: booking._id,
// //           transactionId: transactionId,
// //           amount: amount,
// //           status: 'paid'
// //         }
// //       })
// //     } else {
// //       res.status(400).json({
// //         success: false,
// //         message: 'Payment validation failed',
// //         error: validation
// //       })
// //     }
// //   } catch (error) {
// //     console.error('Payment validation error:', error)
// //     res.status(500).json({
// //       success: false,
// //       message: 'Server error during payment validation',
// //       error: error.message
// //     })
// //   }
// // })

// // @desc    Validate payment
// // @route   POST /api/payment/validate
// // @access  Private
// router.post('/validate', protect, [
//   body('transactionId').notEmpty().withMessage('Transaction ID is required'),
//   body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number')
// ], async (req, res) => {
//   try {
//     const errors = validationResult(req)
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         success: false,
//         message: 'Validation errors',
//         errors: errors.array()
//       })
//     }

//     const { transactionId, amount } = req.body

//     const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
//     const validation = await sslcz.validate({ tran_id: transactionId })

//     // STEP 1: Check if booking exists by transactionId
//     let booking = await Booking.findOne({ 'payment.transactionId': transactionId })

//     // STEP 2: If not found and it’s a test transaction, allow dummy success
//     if (!booking) {
//       if (transactionId === 'test123') {
//         return res.json({
//           success: true,
//           message: 'Test mode: Dummy transaction validated successfully',
//           data: {
//             bookingId: 'dummyBookingId',
//             transactionId,
//             amount,
//             status: 'paid'
//           }
//         })
//       }

//       return res.status(404).json({
//         success: false,
//         message: 'Booking not found for this transaction'
//       })
//     }

//     // STEP 3: Check validation result
//     if (validation.status === 'VALID' && parseFloat(validation.amount) === parseFloat(amount)) {
//       // Update booking payment info
//       booking.payment.status = 'paid'
//       booking.payment.paidAmount = parseFloat(amount)
//       booking.payment.paidAt = new Date()
//       booking.status = 'confirmed'
//       await booking.save()

//       return res.json({
//         success: true,
//         message: 'Payment validated successfully',
//         data: {
//           bookingId: booking._id,
//           transactionId,
//           amount,
//           status: 'paid'
//         }
//       })
//     } else {
//       return res.status(400).json({
//         success: false,
//         message: 'Payment validation failed',
//         error: validation
//       })
//     }
//   } catch (error) {
//     console.error('Payment validation error:', error)
//     res.status(500).json({
//       success: false,
//       message: 'Server error during payment validation',
//       error: error.message
//     })
//   }
// })

// // @desc    Handle IPN (Instant Payment Notification)
// // @route   POST /api/payment/ipn
// // @access  Public
// router.post('/ipn', async (req, res) => {
//   try {
//     const { tran_id, status, amount } = req.body

//     if (status === 'VALID') {
//       // Find booking by transaction ID
//       const booking = await Booking.findOne({ 'payment.transactionId': tran_id })

//       if (booking) {
//         // Update booking payment status
//         booking.payment.status = 'paid'
//         booking.payment.paidAmount = parseFloat(amount)
//         booking.payment.paidAt = new Date()
//         booking.status = 'confirmed'
//         await booking.save()

//         console.log(`Payment confirmed for booking ${booking._id}`)
//       }
//     }

//     res.status(200).send('OK')
//   } catch (error) {
//     console.error('IPN handling error:', error)
//     res.status(500).send('Error')
//   }
// })

// // @desc    Get payment status
// // @route   GET /api/payment/status/:transactionId
// // @access  Private
// router.get('/status/:transactionId', protect, async (req, res) => {
//   try {
//     const { transactionId } = req.params

//     const booking = await Booking.findOne({ 'payment.transactionId': transactionId })
//       .populate('customer', 'firstName lastName email')
//       .populate('car', 'name brand model')

//     if (!booking) {
//       return res.status(404).json({
//         success: false,
//         message: 'Transaction not found'
//       })
//     }

//     // Check if user owns this booking
//     if (booking.customer._id.toString() !== req.user.id) {
//       return res.status(403).json({
//         success: false,
//         message: 'Not authorized to view this transaction'
//       })
//     }

//     res.json({
//       success: true,
//       data: {
//         transactionId: transactionId,
//         bookingId: booking._id,
//         amount: booking.payment.paidAmount || booking.pricing.totalAmount,
//         status: booking.payment.status,
//         paidAt: booking.payment.paidAt,
//         booking: {
//           id: booking._id,
//           car: booking.car.name,
//           customer: `${booking.customer.firstName} ${booking.customer.lastName}`,
//           pickupDate: booking.pickupDate,
//           returnDate: booking.returnDate
//         }
//       }
//     })
//   } catch (error) {
//     console.error('Get payment status error:', error)
//     res.status(500).json({
//       success: false,
//       message: 'Server error while fetching payment status',
//       error: error.message
//     })
//   }
// })

// // @desc    Refund payment
// // @route   POST /api/payment/refund
// // @access  Private
// router.post('/refund', protect, [
//   body('transactionId').notEmpty().withMessage('Transaction ID is required'),
//   body('refundAmount').isFloat({ min: 0 }).withMessage('Refund amount must be a positive number'),
//   body('reason').optional().isLength({ max: 500 }).withMessage('Reason cannot exceed 500 characters')
// ], async (req, res) => {
//   try {
//     const errors = validationResult(req)
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         success: false,
//         message: 'Validation errors',
//         errors: errors.array()
//       })
//     }

//     const { transactionId, refundAmount, reason } = req.body

//     const booking = await Booking.findOne({ 'payment.transactionId': transactionId })

//     if (!booking) {
//       return res.status(404).json({
//         success: false,
//         message: 'Transaction not found'
//       })
//     }

//     // Check if user owns this booking or is admin
//     if (booking.customer.toString() !== req.user.id && req.user.role !== 'admin') {
//       return res.status(403).json({
//         success: false,
//         message: 'Not authorized to refund this transaction'
//       })
//     }

//     const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
    
//     const refundData = {
//       refund_amount: refundAmount,
//       refund_remarks: reason || 'Customer requested refund',
//       bank_tran_id: transactionId,
//       refe_id: uuidv4()
//     }

//     const refundResponse = await sslcz.refund(refundData)

//     if (refundResponse.status === 'SUCCESS') {
//       // Update booking with refund information
//       booking.payment.status = 'refunded'
//       booking.payment.refundAmount = refundAmount
//       booking.payment.refundedAt = new Date()
//       booking.status = 'cancelled'
//       await booking.save()

//       res.json({
//         success: true,
//         message: 'Refund processed successfully',
//         data: {
//           transactionId: transactionId,
//           refundAmount: refundAmount,
//           refundId: refundResponse.refund_ref_id
//         }
//       })
//     } else {
//       res.status(400).json({
//         success: false,
//         message: 'Refund processing failed',
//         error: refundResponse
//       })
//     }
//   } catch (error) {
//     console.error('Refund processing error:', error)
//     res.status(500).json({
//       success: false,
//       message: 'Server error during refund processing',
//       error: error.message
//     })
//   }
// })

// export default router


import express from 'express'
import { body, validationResult } from 'express-validator'
import SSLCommerzPayment from 'sslcommerz-lts'
import { v4 as uuidv4 } from 'uuid'
import Booking from '../models/Booking.js'
import Car from '../models/Car.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// SSLCommerz Configuration
const store_id = process.env.SSLCOMMERZ_STORE_ID || 'glcom685cf0e8d691e'
const store_passwd = process.env.SSLCOMMERZ_STORE_PASSWORD || 'glcom685cf0e8d691e@ssl'
const is_live = process.env.NODE_ENV === 'production' // true for live, false for sandbox

// Debug logging
console.log('SSLCommerz Config:', {
  store_id,
  is_live,
  backend_url: process.env.BACKEND_URL || 'https://garilagbe-com.onrender.com',
  client_url: process.env.CLIENT_URL || 'https://garilagbe-client.netlify.app'
})

// @desc    Initialize payment
// @route   POST /api/payment/init
// @access  Private
router.post('/init', protect, [
  body('bookingId').notEmpty().withMessage('Booking ID is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('currency').optional().isIn(['BDT', 'USD']).withMessage('Currency must be BDT or USD')
], async (req, res) => {
  try {
    console.log('Payment init request:', req.body)
    
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array())
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      })
    }

    const { bookingId, amount, currency = 'BDT' } = req.body

    // Get booking details
    const booking = await Booking.findById(bookingId)
      .populate('customer', 'firstName lastName email phone')
      .populate('car', 'name brand model')

    if (!booking) {
      console.log('Booking not found:', bookingId)
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      })
    }

    console.log('Booking found:', {
      id: booking._id,
      customer: booking.customer._id,
      requestUser: req.user.id
    })

    // Check if user owns this booking
    if (booking.customer._id.toString() !== req.user.id) {
      console.log('Authorization failed - user mismatch')
      return res.status(403).json({
        success: false,
        message: 'Not authorized to pay for this booking'
      })
    }

    // Check if booking is already paid
    if (booking.payment.status === 'paid') {
      console.log('Booking already paid')
      return res.status(400).json({
        success: false,
        message: 'Booking is already paid'
      })
    }

    const transactionId = uuidv4()
    console.log('Generated transaction ID:', transactionId)

    const data = {
      total_amount: parseFloat(amount).toFixed(2),
      currency: currency,
      tran_id: transactionId,
      success_url: `${process.env.CLIENT_URL || 'https://garilagbe-client.netlify.app'}/payment/success?tran_id=${transactionId}&amount=${amount}`,
      fail_url: `${process.env.CLIENT_URL || 'https://garilagbe-client.netlify.app'}/payment/fail?tran_id=${transactionId}&amount=${amount}`,
      cancel_url: `${process.env.CLIENT_URL || 'https://garilagbe-client.netlify.app'}/payment/cancel?tran_id=${transactionId}&amount=${amount}`,
      ipn_url: `${process.env.BACKEND_URL || 'https://garilagbe-com.onrender.com'}/api/payment/ipn`,
      shipping_method: 'NO',
      product_name: `Car Rental - ${booking.car.name}`,
      product_category: 'Car Rental',
      product_profile: 'general',
      cus_name: `${booking.customer.firstName} ${booking.customer.lastName}`,
      cus_email: booking.customer.email,
      cus_add1: 'Customer Address',
      cus_add2: 'Dhaka',
      cus_city: 'Dhaka',
      cus_state: 'Dhaka',
      cus_postcode: '1000',
      cus_country: 'Bangladesh',
      cus_phone: booking.customer.phone || '01700000000',
      cus_fax: booking.customer.phone || '01700000000',
      ship_name: `${booking.customer.firstName} ${booking.customer.lastName}`,
      ship_add1: 'Customer Address',
      ship_add2: 'Dhaka',
      ship_city: 'Dhaka',
      ship_state: 'Dhaka',
      ship_postcode: 1000,
      ship_country: 'Bangladesh',
    }

    console.log('SSLCommerz payment data:', data)

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
    
    console.log('Initializing SSLCommerz payment...')
    const apiResponse = await sslcz.init(data)
    
    console.log('SSLCommerz API response:', apiResponse)

    if (apiResponse?.status === 'SUCCESS') {
      // Update booking with transaction ID
      booking.payment.transactionId = transactionId
      booking.payment.status = 'pending'
      await booking.save()

      console.log('Payment initialized successfully:', transactionId)

      res.json({
        success: true,
        message: 'Payment initialized successfully',
        data: {
          paymentUrl: apiResponse.GatewayPageURL,
          transactionId: transactionId,
          sessionkey: apiResponse.sessionkey
        }
      })
    } else {
      console.log('SSLCommerz initialization failed:', apiResponse)
      res.status(400).json({
        success: false,
        message: 'Failed to initialize payment',
        error: apiResponse,
        debug: {
          store_id,
          is_live,
          amount: data.total_amount
        }
      })
    }
  } catch (error) {
    console.error('Payment initialization error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during payment initialization',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
})

// @desc    Validate payment
// @route   POST /api/payment/validate
// @access  Private
router.post('/validate', protect, [
  body('transactionId').notEmpty().withMessage('Transaction ID is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number')
], async (req, res) => {
  try {
    console.log('Payment validation request:', req.body)
    
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      })
    }

    const { transactionId, amount } = req.body

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
    
    console.log('Validating transaction:', transactionId)
    const validation = await sslcz.validate({ tran_id: transactionId })
    console.log('Validation response:', validation)

    // STEP 1: Check if booking exists by transactionId
    let booking = await Booking.findOne({ 'payment.transactionId': transactionId })

    // STEP 2: If not found and it's a test transaction, allow dummy success
    if (!booking) {
      if (transactionId === 'test123') {
        console.log('Test transaction - dummy success')
        return res.json({
          success: true,
          message: 'Test mode: Dummy transaction validated successfully',
          data: {
            bookingId: 'dummyBookingId',
            transactionId,
            amount,
            status: 'paid'
          }
        })
      }

      console.log('Booking not found for transaction:', transactionId)
      return res.status(404).json({
        success: false,
        message: 'Booking not found for this transaction'
      })
    }

    // STEP 3: Check validation result
    if (validation.status === 'VALID' && parseFloat(validation.amount) === parseFloat(amount)) {
      // Update booking payment info
      booking.payment.status = 'paid'
      booking.payment.paidAmount = parseFloat(amount)
      booking.payment.paidAt = new Date()
      booking.status = 'confirmed'
      await booking.save()

      console.log('Payment validated successfully:', transactionId)

      return res.json({
        success: true,
        message: 'Payment validated successfully',
        data: {
          bookingId: booking._id,
          transactionId,
          amount,
          status: 'paid'
        }
      })
    } else {
      console.log('Payment validation failed:', validation)
      return res.status(400).json({
        success: false,
        message: 'Payment validation failed',
        error: validation
      })
    }
  } catch (error) {
    console.error('Payment validation error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during payment validation',
      error: error.message
    })
  }
})

// @desc    Handle IPN (Instant Payment Notification)
// @route   POST /api/payment/ipn
// @access  Public
router.post('/ipn', async (req, res) => {
  try {
    console.log('IPN received:', req.body)
    const { tran_id, status, amount } = req.body

    if (status === 'VALID') {
      // Find booking by transaction ID
      const booking = await Booking.findOne({ 'payment.transactionId': tran_id })

      if (booking) {
        // Update booking payment status
        booking.payment.status = 'paid'
        booking.payment.paidAmount = parseFloat(amount)
        booking.payment.paidAt = new Date()
        booking.status = 'confirmed'
        await booking.save()

        console.log(`Payment confirmed for booking ${booking._id} via IPN`)
      } else {
        console.log('Booking not found for transaction:', tran_id)
      }
    }

    res.status(200).send('OK')
  } catch (error) {
    console.error('IPN handling error:', error)
    res.status(500).send('Error')
  }
})

// @desc    Get payment status
// @route   GET /api/payment/status/:transactionId
// @access  Private
router.get('/status/:transactionId', protect, async (req, res) => {
  try {
    const { transactionId } = req.params

    const booking = await Booking.findOne({ 'payment.transactionId': transactionId })
      .populate('customer', 'firstName lastName email')
      .populate('car', 'name brand model')

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      })
    }

    // Check if user owns this booking
    if (booking.customer._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this transaction'
      })
    }

    res.json({
      success: true,
      data: {
        transactionId: transactionId,
        bookingId: booking._id,
        amount: booking.payment.paidAmount || booking.pricing.totalAmount,
        status: booking.payment.status,
        paidAt: booking.payment.paidAt,
        booking: {
          id: booking._id,
          car: booking.car.name,
          customer: `${booking.customer.firstName} ${booking.customer.lastName}`,
          pickupDate: booking.pickupDate,
          returnDate: booking.returnDate
        }
      }
    })
  } catch (error) {
    console.error('Get payment status error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching payment status',
      error: error.message
    })
  }
})

// @desc    Refund payment
// @route   POST /api/payment/refund
// @access  Private
router.post('/refund', protect, [
  body('transactionId').notEmpty().withMessage('Transaction ID is required'),
  body('refundAmount').isFloat({ min: 0 }).withMessage('Refund amount must be a positive number'),
  body('reason').optional().isLength({ max: 500 }).withMessage('Reason cannot exceed 500 characters')
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

    const { transactionId, refundAmount, reason } = req.body

    const booking = await Booking.findOne({ 'payment.transactionId': transactionId })

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      })
    }

    // Check if user owns this booking or is admin
    if (booking.customer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to refund this transaction'
      })
    }

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
    
    const refundData = {
      refund_amount: refundAmount,
      refund_remarks: reason || 'Customer requested refund',
      bank_tran_id: transactionId,
      refe_id: uuidv4()
    }

    const refundResponse = await sslcz.refund(refundData)

    if (refundResponse.status === 'SUCCESS') {
      // Update booking with refund information
      booking.payment.status = 'refunded'
      booking.payment.refundAmount = refundAmount
      booking.payment.refundedAt = new Date()
      booking.status = 'cancelled'
      await booking.save()

      res.json({
        success: true,
        message: 'Refund processed successfully',
        data: {
          transactionId: transactionId,
          refundAmount: refundAmount,
          refundId: refundResponse.refund_ref_id
        }
      })
    } else {
      res.status(400).json({
        success: false,
        message: 'Refund processing failed',
        error: refundResponse
      })
    }
  } catch (error) {
    console.error('Refund processing error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during refund processing',
      error: error.message
    })
  }
})

export default router