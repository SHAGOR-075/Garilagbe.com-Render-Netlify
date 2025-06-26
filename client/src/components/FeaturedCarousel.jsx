import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import CarCard from './CarCard'

const FeaturedCarousel = ({ cars = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerView, setItemsPerView] = useState(3)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerView(1)
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2)
      } else {
        setItemsPerView(3)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (cars.length === 0) return

    const interval = window.setInterval(() => {
      setCurrentIndex(prev => {
        const maxIndex = Math.max(0, cars.length - itemsPerView)
        return prev >= maxIndex ? 0 : prev + 1
      })
    }, 5000)

    return () => window.clearInterval(interval)
  }, [cars.length, itemsPerView])

  const nextSlide = () => {
    const maxIndex = Math.max(0, cars.length - itemsPerView)
    setCurrentIndex(prev => prev >= maxIndex ? 0 : prev + 1)
  }

  const prevSlide = () => {
    const maxIndex = Math.max(0, cars.length - itemsPerView)
    setCurrentIndex(prev => prev <= 0 ? maxIndex : prev - 1)
  }

  const goToSlide = (index) => {
    const maxIndex = Math.max(0, cars.length - itemsPerView)
    setCurrentIndex(Math.min(index, maxIndex))
  }

  if (cars.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading featured cars...</p>
      </div>
    )
  }

  const maxIndex = Math.max(0, cars.length - itemsPerView)
  const totalDots = maxIndex + 1

  return (
    <div className="relative">
      {/* Carousel Container */}
      <div className="overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ 
            transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
            width: `${(cars.length / itemsPerView) * 100}%`
          }}
        >
          {cars.map((car, index) => (
            <div 
              key={car._id || index} 
              className="flex-shrink-0 px-4"
              style={{ width: `${100 / cars.length}%` }}
            >
              <CarCard car={car} />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {cars.length > itemsPerView && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 z-10 group"
            aria-label="Previous cars"
          >
            <i className="bi bi-chevron-left text-xl text-gray-600 group-hover:text-blue-600"></i>
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 z-10 group"
            aria-label="Next cars"
          >
            <i className="bi bi-chevron-right text-xl text-gray-600 group-hover:text-blue-600"></i>
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {cars.length > itemsPerView && totalDots > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          {[...Array(totalDots)].map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-blue-600 scale-125' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* View More Card */}
      <div className="mt-8 flex justify-center">
        <div className="max-w-sm w-full">
          <div className="card flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-dashed border-blue-200 h-64">
            <div className="text-center p-6">
              <i className="bi bi-plus-circle text-4xl text-blue-600 mb-4"></i>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">View More Cars</h3>
              <p className="text-gray-600 mb-4">Explore our complete fleet</p>
              <Link to="/cars" className="btn-primary">
                Browse All <i className="bi bi-arrow-right ml-2"></i>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeaturedCarousel
