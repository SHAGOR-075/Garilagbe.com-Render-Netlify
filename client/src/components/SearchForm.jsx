import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const SearchForm = () => {
  const navigate = useNavigate()
  const [searchData, setSearchData] = useState({
    pickupLocation: '',
    destination: '',
    pickupDate: '',
    returnDate: '',
    vehicleType: ''
  })
  const [locations, setLocations] = useState([])
  const [vehicleTypes, setVehicleTypes] = useState([])

  useEffect(() => {
    // Fetch locations and vehicle types from backend
    const fetchOptions = async () => {
      try {
        const [locRes, typeRes] = await Promise.all([
          axios.get('https://garilagbe-com.onrender.com/api/cars/locations'),
          axios.get('https://garilagbe-com.onrender.com/api/cars/types')
        ])
        setLocations(locRes.data.data)
        setVehicleTypes(typeRes.data.data)
      } catch (err) {
        setLocations([])
        setVehicleTypes([])
      }
    }
    fetchOptions()
  }, [])

  const handleInputChange = (e) => {
    setSearchData({
      ...searchData,
      [e.target.name]: e.target.value
    })
  }

  const allFieldsFilled =
    searchData.pickupLocation &&
    searchData.destination &&
    searchData.pickupDate &&
    searchData.returnDate &&
    searchData.vehicleType

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!allFieldsFilled) {
      alert('Please fill in Pickup Location, Destination, Pickup Date, Return Date, and Vehicle Type to search.')
      return
    }
    
    // Build search parameters only for filled fields
    const searchParams = new URLSearchParams()
    
    if (searchData.pickupLocation && searchData.pickupLocation.trim()) {
      searchParams.append('pickupLocation', searchData.pickupLocation.trim())
    }
    if (searchData.destination && searchData.destination.trim()) {
      searchParams.append('destination', searchData.destination.trim())
    }
    if (searchData.pickupDate && searchData.pickupDate.trim()) {
      searchParams.append('pickupDate', searchData.pickupDate.trim())
    }
    if (searchData.returnDate && searchData.returnDate.trim()) {
      searchParams.append('returnDate', searchData.returnDate.trim())
    }
    if (searchData.vehicleType && searchData.vehicleType.trim()) {
      searchParams.append('type', searchData.vehicleType.trim())
    }
    
    // Navigate to cars page with search parameters
    const queryString = searchParams.toString()
    navigate(`/cars${queryString ? `?${queryString}` : ''}`)
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto -mt-16 relative z-10">
      <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Find Your Perfect Car</h3>
      <p className="text-gray-600 text-center mb-8">Search from our premium collection of luxury vehicles</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <i className="bi bi-geo-alt mr-2"></i>Pickup Location
            </label>
            <select 
              name="pickupLocation"
              value={searchData.pickupLocation}
              onChange={handleInputChange}
              className="input-field"
            >
              <option value="">Select Location</option>
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <i className="bi bi-geo-alt-fill mr-2"></i>Destination
            </label>
            <select 
              name="destination"
              value={searchData.destination}
              onChange={handleInputChange}
              className="input-field"
            >
              <option value="">Select Destination</option>
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <i className="bi bi-calendar mr-2"></i>Pickup Date
            </label>
            <input 
              type="date"
              name="pickupDate"
              value={searchData.pickupDate}
              onChange={handleInputChange}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <i className="bi bi-calendar-check mr-2"></i>Return Date
            </label>
            <input 
              type="date"
              name="returnDate"
              value={searchData.returnDate}
              onChange={handleInputChange}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <i className="bi bi-car-front mr-2"></i>Vehicle Type
            </label>
            <select 
              name="vehicleType"
              value={searchData.vehicleType}
              onChange={handleInputChange}
              className="input-field"
            >
              <option value="">All Types</option>
              {vehicleTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-center">
          <button 
            type="submit" 
            className={`px-12 py-4 text-lg rounded-lg font-semibold transition-colors ${
              allFieldsFilled 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            disabled={!allFieldsFilled}
          >
            <i className="bi bi-search mr-2"></i>
            {allFieldsFilled ? 'Search Available Cars' : 'Search Available Cars'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default SearchForm
