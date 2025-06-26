import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <i className="bi bi-car-front text-2xl text-blue-600"></i>
            <span className="text-xl font-bold text-gray-900">GαɾιLαɠႦҽ.com</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`font-medium transition-colors ${isActive('/') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
            >
              Home
            </Link>
            <Link 
              to="/cars" 
              className={`font-medium transition-colors ${isActive('/cars') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
            >
              Cars
            </Link>
            <Link 
              to="/about" 
              className={`font-medium transition-colors ${isActive('/about') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className={`font-medium transition-colors ${isActive('/contact') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
            >
              Contact
            </Link>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/bookings" 
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  My Bookings
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </div>
                    <span className="font-medium">{user?.firstName}</span>
                    <i className="bi bi-chevron-down text-sm"></i>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <i className="bi bi-person mr-2"></i>Profile
                    </Link>
                    <Link to="/bookings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <i className="bi bi-calendar-check mr-2"></i>My Bookings
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <i className="bi bi-box-arrow-right mr-2"></i>Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="btn-primary"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <i className={`bi ${isMenuOpen ? 'bi-x' : 'bi-list'} text-2xl`}></i>
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium">Home</Link>
              <Link to="/cars" className="text-gray-700 hover:text-blue-600 font-medium">Cars</Link>
              <Link to="/about" className="text-gray-700 hover:text-blue-600 font-medium">About</Link>
              <Link to="/contact" className="text-gray-700 hover:text-blue-600 font-medium">Contact</Link>
              {isAuthenticated ? (
                <>
                  <Link to="/bookings" className="text-gray-700 hover:text-blue-600 font-medium">My Bookings</Link>
                  <Link to="/profile" className="text-gray-700 hover:text-blue-600 font-medium">Profile</Link>
                  <button 
                    onClick={handleLogout}
                    className="text-left text-gray-700 hover:text-blue-600 font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2 pt-4 border-t">
                  <Link to="/login" className="text-gray-700 hover:text-blue-600 font-medium">Login</Link>
                  <Link to="/signup" className="btn-primary text-center">Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
