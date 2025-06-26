import React from 'react'

const LoadingSpinner = ({ size = 'large', text = 'Loading...' }) => {
  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-12 w-12',
    large: 'h-32 w-32'
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className={`animate-spin rounded-full border-b-2 border-blue-600 mx-auto mb-4 ${sizeClasses[size]}`}></div>
        <p className="text-gray-600">{text}</p>
      </div>
    </div>
  )
}

export default LoadingSpinner
