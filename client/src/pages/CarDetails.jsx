import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { carsAPI, bookingsAPI, paymentAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/LoadingSpinner'

const CarDetails = () => {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [car, setCar] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [bookingData, setBookingData] = useState({
    pickupDate: '',
    returnDate: '',
    pickupLocation: { branch: 'Main Branch' },
    returnLocation: { branch: 'Main Branch' }
  })
  const [bookingLoading, setBookingLoading] = useState(false)

  useEffect(() => {
    fetchCar()
  }, [id])

  useEffect(() => {
    // Prefill booking form from query params
    const params = new URLSearchParams(location.search)
    const pickupLocation = params.get('pickupLocation')
    const pickupDate = params.get('pickupDate')
    const returnDate = params.get('returnDate')
    setBookingData(prev => ({
      ...prev,
      pickupLocation: pickupLocation ? { branch: pickupLocation } : prev.pickupLocation,
      pickupDate: pickupDate || prev.pickupDate,
      returnDate: returnDate || prev.returnDate
    }))
  }, [location.search])

  const fetchCar = async () => {
    try {
      setLoading(true)
      const response = await carsAPI.getCar(id)
      setCar(response.data.data)
    } catch (error) {
      setError('Car not found')
      console.error('Error fetching car:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBookingChange = (e) => {
    const { name, value } = e.target
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setBookingData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setBookingData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const calculateDays = () => {
    if (!bookingData.pickupDate || !bookingData.returnDate) return 0
    const pickup = new Date(bookingData.pickupDate)
    const returnDate = new Date(bookingData.returnDate)
    const diffTime = Math.abs(returnDate - pickup)
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const calculateTotal = () => {
    const days = calculateDays()
    return days * (car?.pricePerDay || 0)
  }

  const handleBookNow = async (e) => {
    e.preventDefault()
    
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    setBookingLoading(true)
    
    try {
      const bookingPayload = {
        car: car._id,
        pickupDate: bookingData.pickupDate,
        returnDate: bookingData.returnDate,
        pickupLocation: bookingData.pickupLocation,
        returnLocation: bookingData.returnLocation
      }

      const response = await bookingsAPI.createBooking(bookingPayload)
      
      if (response.data.success) {
        const booking = response.data.data
        
        // Initialize payment
        try {
          const paymentResponse = await paymentAPI.initPayment({
            bookingId: booking._id,
            amount: booking.pricing.totalAmount,
            currency: 'BDT'
          })

          if (paymentResponse.data.success) {
            // Redirect to payment gateway
            window.location.href = paymentResponse.data.data.paymentUrl
          } else {
            alert('Payment initialization failed. Please try again.')
          }
        } catch (paymentError) {
          console.error('Payment error:', paymentError)
          alert('Booking created but payment failed. Please contact support.')
          navigate('/bookings')
        }
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create booking. Please try again.')
    } finally {
      setBookingLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error || !car) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="bi bi-car-front text-6xl text-gray-300 mb-4"></i>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">{error || 'Car not found'}</h2>
          <Link to="/cars" className="btn-primary">
            Back to Cars
          </Link>
        </div>
      </div>
    )
  }

  const images = car.images?.length > 0 ? car.images : [
    { url: "https://images.unsplash.com/photo-1549924231-f129b911e442?w=600&h=400&fit=crop&crop=center", alt: car.name }
  ]

  const days = calculateDays()
  const total = calculateTotal()

  return (
    <div>
      {/* Breadcrumb */}
      <section className="bg-gradient-to-r from-blue-900 to-purple-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-2 text-sm mb-4">
            <Link to="/" className="hover:text-yellow-400">Home</Link>
            <i className="bi bi-chevron-right"></i>
            <Link to="/cars" className="hover:text-yellow-400">Cars</Link>
            <i className="bi bi-chevron-right"></i>
            <span className="text-yellow-400">{car.name}</span>
          </nav>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">{car.name}</h1>
            <p className="text-xl mb-4">{car.brand} {car.model} • {car.year}</p>
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <i 
                    key={i} 
                    className={`bi bi-star${i < Math.floor(car.rating?.average || 0) ? '-fill' : ''} text-yellow-400`}
                  ></i>
                ))}
                <span className="ml-2">({car.rating?.count || 0} reviews)</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                car.availability?.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {car.availability?.status || 'Available'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Car Details */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Images */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="relative">
                  <img 
                    src={images[currentImageIndex]?.url} 
                    alt={images[currentImageIndex]?.alt || car.name}
                    className="w-full h-96 object-cover"
                    crossOrigin="anonymous"
                  />
                  <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1}/{images.length}
                  </div>
                  
                  {images.length > 1 && (
                    <>
                      <button 
                        onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : images.length - 1)}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all"
                      >
                        <i className="bi bi-chevron-left text-gray-800"></i>
                      </button>
                      <button 
                        onClick={() => setCurrentImageIndex(prev => prev < images.length - 1 ? prev + 1 : 0)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all"
                      >
                        <i className="bi bi-chevron-right text-gray-800"></i>
                      </button>
                    </>
                  )}
                </div>
                
                {images.length > 1 && (
                  <div className="p-4">
                    <div className="flex space-x-2 overflow-x-auto">
                      {images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 ${
                            currentImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                          }`}
                        >
                          <img 
                            src={image.url} 
                            alt={image.alt || `${car.name} ${index + 1}`}
                            className="w-full h-full object-cover"
                            crossOrigin="anonymous"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Booking Form */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-blue-600 mb-2">৳{car.pricePerDay.toLocaleString()}</div>
                  <div className="text-gray-600">per day</div>
                  <div className="text-sm text-gray-500">All-inclusive pricing</div>
                </div>

                <form onSubmit={handleBookNow} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <i className="bi bi-calendar mr-2"></i>Pickup Date
                    </label>
                    <input
                      type="date"
                      name="pickupDate"
                      value={bookingData.pickupDate}
                      onChange={handleBookingChange}
                      className="input-field"
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <i className="bi bi-calendar-check mr-2"></i>Return Date
                    </label>
                    <input
                      type="date"
                      name="returnDate"
                      value={bookingData.returnDate}
                      onChange={handleBookingChange}
                      className="input-field"
                      min={bookingData.pickupDate || new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <i classNameclassName="bi bi-geo-alt mr-2"></i>Pickup Location
                    </label>
                    <select
                      name="pickupLocation.branch"
                      value={bookingData.pickupLocation.branch}
                      onChange={handleBookingChange}
                      className="input-field"
                      required
                    >
                      <option value="">Select Location</option>
                      <option value="Dhaka">Dhaka</option>
                      <option value="Chittagong">Chittagong</option>
                      <option value="Sylhet">Sylhet</option>
                      <option value="Rajshahi">Rajshahi</option>
                      <option value="Khulna">Khulna</option>
                      <option value="Barisal">Barisal</option>
                      <option value="Rangpur">Rangpur</option>
                      <option value="Mymensingh">Mymensingh</option>
                      <option value="Comilla">Comilla</option>
                      <option value="Noakhali">Noakhali</option>
                      <option value="Feni">Feni</option>
                      <option value="Chandpur">Chandpur</option>
                      <option value="Lakshmipur">Lakshmipur</option>
                      <option value="Cox's Bazar">Cox's Bazar</option>
                      <option value="Bandarban">Bandarban</option>
                      <option value="Rangamati">Rangamati</option>
                      <option value="Khagrachari">Khagrachari</option>
                      <option value="Jessore">Jessore</option>
                      <option value="Kushtia">Kushtia</option>
                      <option value="Bogra">Bogra</option>
                    </select>
                  </div>

                  {/* Booking Summary */}
                  {days > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Booking Summary</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Duration:</span>
                          <span>{days} day{days > 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Rate per day:</span>
                          <span>৳{car.pricePerDay.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-lg border-t pt-2">
                          <span>Total:</span>
                          <span>৳{total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <button 
                    type="submit" 
                    className="w-full btn-primary py-4 text-lg"
                    disabled={bookingLoading || car.availability?.status !== 'Available'}
                  >
                    {bookingLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      <>
                        <i className="bi bi-calendar-check mr-2"></i>
                        {isAuthenticated ? 'Book Now & Pay' : 'Sign in to Book'}
                      </>
                    )}
                  </button>
                </form>

                {!isAuthenticated && (
                  <p className="text-sm text-gray-600 text-center mt-4">
                    <Link to="/login" className="text-blue-600 hover:text-blue-800">
                      Sign in
                    </Link> to complete your booking
                  </p>
                )}

                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold text-gray-900 mb-3">Why Book With Us?</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <i className="bi bi-check-circle text-green-500 mr-2"></i>
                      Full Insurance Coverage
                    </li>
                    <li className="flex items-center">
                      <i className="bi bi-check-circle text-green-500 mr-2"></i>
                      24/7 Customer Support
                    </li>
                    <li className="flex items-center">
                      <i className="bi bi-check-circle text-green-500 mr-2"></i>
                      Free Cancellation
                    </li>
                    <li className="flex items-center">
                      <i className="bi bi-check-circle text-green-500 mr-2"></i>
                      Secure Payment with SSLCommerz
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specifications */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Vehicle Specifications</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <div className="text-center">
              <div className="bg-blue-50 text-blue-600 inline-flex items-center justify-center w-16 h-16 rounded-full mb-4">
                <i className="bi bi-currency-dollar text-2xl"></i>
              </div>
              <div className="font-semibold text-gray-900 mb-1">Daily Rate</div>
              <div className="text-lg font-bold text-gray-800">৳{car.pricePerDay.toLocaleString()}</div>
            </div>

            <div className="text-center">
              <div className="bg-green-50 text-green-600 inline-flex items-center justify-center w-16 h-16 rounded-full mb-4">
                <i className="bi bi-fuel-pump text-2xl"></i>
              </div>
              <div className="font-semibold text-gray-900 mb-1">Fuel Type</div>
              <div className="text-lg font-bold text-gray-800">{car.fuelType}</div>
            </div>

            <div className="text-center">
              <div className="bg-purple-50 text-purple-600 inline-flex items-center justify-center w-16 h-16 rounded-full mb-4">
                <i className="bi bi-people text-2xl"></i>
              </div>
              <div className="font-semibold text-gray-900 mb-1">Capacity</div>
              <div className="text-lg font-bold text-gray-800">{car.seats} Seats</div>
            </div>

            <div className="text-center">
              <div className="bg-orange-50 text-orange-600 inline-flex items-center justify-center w-16 h-16 rounded-full mb-4">
                <i className="bi bi-gear text-2xl"></i>
              </div>
              <div className="font-semibold text-gray-900 mb-1">Transmission</div>
              <div className="text-lg font-bold text-gray-800">{car.transmission}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      {car.features && car.features.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Premium Features</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {car.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3 bg-white p-4 rounded-lg shadow-sm">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    feature.available ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <i className="bi bi-check-circle"></i>
                  </div>
                  <span className={`font-medium ${
                    feature.available ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {feature.name}
                  </span>
                  {feature.available && (
                    <i className="bi bi-check-circle text-green-500 ml-auto"></i>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default CarDetails
