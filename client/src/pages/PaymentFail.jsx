import React from 'react'
import { Link } from 'react-router-dom'

const PaymentFail = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="bi bi-x-circle text-3xl text-red-600"></i>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Failed</h1>
          <p className="text-lg text-gray-600 mb-8">
            Unfortunately, your payment could not be processed. Please try again or contact support.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/bookings" className="btn-primary">
              Try Again
            </Link>
            <Link to="/contact" className="btn-secondary">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentFail
