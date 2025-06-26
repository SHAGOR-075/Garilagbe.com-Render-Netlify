import jwt from 'jsonwebtoken'
import User from '../models/User.js'

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
  try {
    let token

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided'
      })
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-key')
      
      // Get user from token
      const user = await User.findById(decoded.id).select('-password')
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, user not found'
        })
      }

      if (user.status !== 'active') {
        return res.status(401).json({
          success: false,
          message: 'Account is not active'
        })
      }

      req.user = user
      next()
    } catch (error) {
      console.error('Token verification error:', error)
      return res.status(401).json({
        success: false,
        message: 'Not authorized, invalid token'
      })
    }
  } catch (error) {
    console.error('Auth middleware error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    })
  }
}

// Authorize specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      })
    }
    next()
  }
}
