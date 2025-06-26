import express from 'express'
import { body, validationResult } from 'express-validator'
import User from '../models/User.js'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    let filter = {}
    
    if (req.query.role) {
      filter.role = req.query.role
    }
    
    if (req.query.status) {
      filter.status = req.query.status
    }
    
    if (req.query.search) {
      filter.$or = [
        { firstName: new RegExp(req.query.search, 'i') },
        { lastName: new RegExp(req.query.search, 'i') },
        { email: new RegExp(req.query.search, 'i') }
      ]
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await User.countDocuments(filter)

    res.json({
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: users
    })
  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    })
  }
})

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (Admin only)
router.get('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error('Get user error:', error)
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user'
    })
  }
})

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin only)
router.put('/:id', protect, authorize('admin'), [
  body('email').optional().isEmail().withMessage('Please enter a valid email'),
  body('role').optional().isIn(['customer', 'admin']).withMessage('Invalid role'),
  body('status').optional().isIn(['active', 'inactive', 'suspended']).withMessage('Invalid status')
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

    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    })
  } catch (error) {
    console.error('Update user error:', error)
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      })
    }
    res.status(500).json({
      success: false,
      message: 'Server error while updating user'
    })
  }
})

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      })
    }

    // Soft delete by setting status to inactive
    user.status = 'inactive'
    await user.save()

    res.json({
      success: true,
      message: 'User deleted successfully'
    })
  } catch (error) {
    console.error('Delete user error:', error)
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }
    res.status(500).json({
      success: false,
      message: 'Server error while deleting user'
    })
  }
})

export default router
