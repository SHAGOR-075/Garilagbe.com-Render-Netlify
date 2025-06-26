import React from 'react'
import { Link } from 'react-router-dom'

const CarCard = ({ car, searchParams }) => {
  const primaryImage = car.images?.find(img => img.isPrimary)?.url || 
                      car.images?.[0]?.url || 
                      "https://images.unsplash.com/photo-1549924231-f129b911e442?w=400&h=250&fit=crop&crop=center"

  // Helper to build the details link with search params
  const getDetailsLink = () => {
    if (searchParams && typeof searchParams === 'object' && searchParams.toString()) {
      return `/cars/${car._id}?${searchParams.toString()}`
    }
    return `/cars/${car._id}`
  }

  return (
    <div className="card overflow-hidden">
      <div className="relative">
        <img 
          src={primaryImage} 
          alt={car.name}
          className="w-full h-48 object-cover"
          crossOrigin="anonymous"
        />
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            car.availability?.status === 'Available' ? 'bg-green-100 text-green-800' : 
            car.availability?.status === 'Rented' ? 'bg-red-100 text-red-800' : 
            'bg-gray-100 text-gray-800'
          }`}>
            {car.availability?.status || 'Available'}
          </span>
        </div>
        {car.isFeatured && (
          <div className="absolute top-4 right-4">
            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
              Featured
            </span>
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-gray-900">{car.name}</h3>
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <i 
                key={i} 
                className={`bi bi-star${i < Math.floor(car.rating?.average || 0) ? '-fill' : ''} text-yellow-400 text-sm`}
              ></i>
            ))}
            <span className="text-sm text-gray-600 ml-1">({car.rating?.count || 0})</span>
          </div>
        </div>

        <p className="text-gray-600 mb-4">{car.brand} • {car.year}</p>

        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <i className="bi bi-people mr-1"></i>
              {car.seats} Seats
            </span>
            <span className="flex items-center">
              <i className="bi bi-gear mr-1"></i>
              {car.transmission}
            </span>
            <span className="flex items-center">
              <i className="bi bi-fuel-pump mr-1"></i>
              {car.fuelType}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-gray-900">৳{car.pricePerDay.toLocaleString()}</span>
            <span className="text-gray-600">/day</span>
          </div>
          <Link 
            to={getDetailsLink()}
            className="btn-primary"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  )
}

export default CarCard
