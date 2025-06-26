import React, { useState, useEffect } from 'react'
import { carsAPI } from '../services/api'

const Cars = () => {
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [editingCar, setEditingCar] = useState(null)
  const [viewingCar, setViewingCar] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [editImagePreview, setEditImagePreview] = useState('')
  const [newCar, setNewCar] = useState({
    name: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    type: '',
    transmission: '',
    fuelType: '',
    seats: 5,
    doors: 4,
    color: '',
    licensePlate: '',
    vin: '',
    mileage: 0,
    pricePerDay: 0,
    imageUrl: '',
    location: {
      branch: 'Main Branch'
    },
    features: []
  })

  const [newFeature, setNewFeature] = useState('')
  const [editFeature, setEditFeature] = useState('')

  useEffect(() => {
    fetchCars()
  }, [])

  const fetchCars = async () => {
    try {
      setLoading(true)
      const response = await carsAPI.getCars({ limit: 100 })
      setCars(response.data.data || [])
      setError('')
      
      // Trigger dashboard refresh
      window.dispatchEvent(new CustomEvent('carsUpdated', { 
        detail: { count: response.data.total || response.data.data?.length || 0 } 
      }))
    } catch (error) {
      setError('Failed to fetch cars')
      console.error('Error fetching cars:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setNewCar(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setNewCar(prev => ({
        ...prev,
        [name]: name === 'year' || name === 'seats' || name === 'doors' || name === 'mileage' || name === 'pricePerDay' 
          ? parseInt(value) || 0 
          : value
      }))
    }
  }

  const handleEditInputChange = (e) => {
    const { name, value } = e.target
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setEditingCar(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setEditingCar(prev => ({
        ...prev,
        [name]: name === 'year' || name === 'seats' || name === 'doors' || name === 'mileage' || name === 'pricePerDay' 
          ? parseInt(value) || 0 
          : value
      }))
    }
  }

  const handleImageUrlChange = (e) => {
    const url = e.target.value
    setNewCar(prev => ({ ...prev, imageUrl: url }))
    setImagePreview(url)
  }

  const handleEditImageUrlChange = (e) => {
    const url = e.target.value
    setEditingCar(prev => ({ ...prev, imageUrl: url }))
    setEditImagePreview(url)
  }

  const addFeature = () => {
    if (newFeature.trim()) {
      setNewCar(prev => ({
        ...prev,
        features: [...prev.features, { name: newFeature.trim(), available: true }]
      }))
      setNewFeature('')
    }
  }

  const removeFeature = (index) => {
    setNewCar(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }))
  }

  const addEditFeature = () => {
    if (editFeature.trim()) {
      setEditingCar(prev => ({
        ...prev,
        features: [...(prev.features || []), { name: editFeature.trim(), available: true }]
      }))
      setEditFeature('')
    }
  }

  const removeEditFeature = (index) => {
    setEditingCar(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }))
  }

  const handleAddCar = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      
      // Prepare car data with image
      const carData = {
        ...newCar,
        images: newCar.imageUrl ? [{
          url: newCar.imageUrl,
          alt: newCar.name,
          isPrimary: true
        }] : [{
          url: "https://images.unsplash.com/photo-1549924231-f129b911e442?w=400&h=250&fit=crop&crop=center",
          alt: newCar.name,
          isPrimary: true
        }]
      }

      // Remove imageUrl from the data as it's now in images array
      delete carData.imageUrl

      const response = await carsAPI.createCar(carData)
      
      if (response.data.success) {
        setShowAddModal(false)
        resetNewCar()
        await fetchCars()
        
        // Show success message
        alert('Car added successfully!')
      }
    } catch (error) {
      console.error('Add car error:', error)
      alert(error.response?.data?.message || 'Failed to add car')
    } finally {
      setLoading(false)
    }
  }

  const handleEditCar = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      
      // Prepare edit data
      const editData = { ...editingCar }
      
      // Update images if imageUrl changed
      if (editData.imageUrl) {
        editData.images = [{
          url: editData.imageUrl,
          alt: editData.name,
          isPrimary: true
        }]
        delete editData.imageUrl
      }

      const response = await carsAPI.updateCar(editingCar._id, editData)
      
      if (response.data.success) {
        setShowEditModal(false)
        setEditingCar(null)
        setEditImagePreview('')
        await fetchCars()
        
        alert('Car updated successfully!')
      }
    } catch (error) {
      console.error('Update car error:', error)
      alert(error.response?.data?.message || 'Failed to update car')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCar = async (id) => {
    if (!window.confirm('Are you sure you want to delete this car?')) {
      return
    }

    try {
      setLoading(true)
      const response = await carsAPI.deleteCar(id)
      
      if (response.data.success) {
        await fetchCars()
        alert('Car deleted successfully!')
      }
    } catch (error) {
      console.error('Delete car error:', error)
      alert('Failed to delete car')
    } finally {
      setLoading(false)
    }
  }

  const resetNewCar = () => {
    setNewCar({
      name: '',
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      type: '',
      transmission: '',
      fuelType: '',
      seats: 5,
      doors: 4,
      color: '',
      licensePlate: '',
      vin: '',
      mileage: 0,
      pricePerDay: 0,
      imageUrl: '',
      location: {
        branch: 'Main Branch'
      },
      features: []
    })
    setNewFeature('')
    setImagePreview('')
  }

  const openEditModal = (car) => {
    setEditingCar({
      ...car,
      imageUrl: car.images?.[0]?.url || ''
    })
    setEditImagePreview(car.images?.[0]?.url || '')
    setEditFeature('')
    setShowEditModal(true)
  }

  const openViewModal = (car) => {
    setViewingCar(car)
    setShowViewModal(true)
  }

  const closeModals = () => {
    setShowAddModal(false)
    setShowEditModal(false)
    setShowViewModal(false)
    setEditingCar(null)
    setViewingCar(null)
    setImagePreview('')
    setEditImagePreview('')
    resetNewCar()
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800'
      case 'Rented':
        return 'bg-blue-100 text-blue-800'
      case 'Maintenance':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading && cars.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">Cars Management</h2>
        <div className="flex space-x-3">
          <button 
            onClick={fetchCars}
            className="btn-secondary"
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise mr-2"></i>
            {loading ? 'Loading...' : 'Refresh'}
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            <i className="bi bi-plus mr-2"></i>Add New Car
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Cars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.length > 0 ? cars.map((car) => (
          <div key={car._id} className="card overflow-hidden">
            <img 
              src={car.images?.[0]?.url || "https://images.unsplash.com/photo-1549924231-f129b911e442?w=400&h=250&fit=crop&crop=center"} 
              alt={car.name}
              className="w-full h-48 object-cover"
              crossOrigin="anonymous"
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1549924231-f129b911e442?w=400&h=250&fit=crop&crop=center"
              }}
            />
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{car.name}</h3>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(car.availability?.status)}`}>
                  {car.availability?.status || 'Available'}
                </span>
              </div>
              <p className="text-gray-600 mb-2">{car.brand} • {car.type}</p>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                <div>Year: {car.year}</div>
                <div>Mileage: {car.mileage?.toLocaleString()}</div>
                <div>Seats: {car.seats}</div>
                <div>Fuel: {car.fuelType}</div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-gray-900">৳{car.pricePerDay.toLocaleString()}/day</span>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => openViewModal(car)}
                    className="text-green-600 hover:text-green-800 p-2 rounded-full hover:bg-green-50"
                    title="View Details"
                  >
                    <i className="bi bi-eye text-lg"></i>
                  </button>
                  <button 
                    onClick={() => openEditModal(car)}
                    className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50"
                    title="Edit Car"
                  >
                    <i className="bi bi-pencil text-lg"></i>
                  </button>
                  <button 
                    onClick={() => handleDeleteCar(car._id)}
                    className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50"
                    title="Delete Car"
                  >
                    <i className="bi bi-trash text-lg"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full text-center py-12">
            <i className="bi bi-car-front text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No cars found</h3>
            <p className="text-gray-600 mb-4">Start by adding your first car to the fleet</p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="btn-primary"
            >
              <i className="bi bi-plus mr-2"></i>Add First Car
            </button>
          </div>
        )}
      </div>

      {/* Add Car Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Car</h3>
              <button 
                onClick={closeModals}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="bi bi-x-lg text-xl"></i>
              </button>
            </div>
            
            <form onSubmit={handleAddCar} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Car Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={newCar.name}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand *</label>
                  <input
                    type="text"
                    name="brand"
                    value={newCar.brand}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model *</label>
                  <input
                    type="text"
                    name="model"
                    value={newCar.model}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
                  <input
                    type="number"
                    name="year"
                    value={newCar.year}
                    onChange={handleInputChange}
                    className="input-field"
                    min="1990"
                    max={new Date().getFullYear() + 1}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select
                    name="type"
                    value={newCar.type}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    {/* <option value="Sports">Sports</option> */}
                    <option value="Luxury">Luxury</option>
                    <option value="Compact">Compact</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Transmission *</label>
                  <select
                    name="transmission"
                    value={newCar.transmission}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  >
                    <option value="">Select Transmission</option>
                    <option value="Manual">Manual</option>
                    <option value="Automatic">Automatic</option>
                    <option value="CVT">CVT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type *</label>
                  <select
                    name="fuelType"
                    value={newCar.fuelType}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  >
                    <option value="">Select Fuel Type</option>
                    <option value="Gasoline">Gasoline</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Seats *</label>
                  <input
                    type="number"
                    name="seats"
                    value={newCar.seats}
                    onChange={handleInputChange}
                    className="input-field"
                    min="2"
                    max="8"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color *</label>
                  <input
                    type="text"
                    name="color"
                    value={newCar.color}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">License Plate *</label>
                  <input
                    type="text"
                    name="licensePlate"
                    value={newCar.licensePlate}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">VIN *</label>
                  <input
                    type="text"
                    name="vin"
                    value={newCar.vin}
                    onChange={handleInputChange}
                    className="input-field"
                    maxLength="17"
                    minLength="17"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mileage *</label>
                  <input
                    type="number"
                    name="mileage"
                    value={newCar.mileage}
                    onChange={handleInputChange}
                    className="input-field"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price/Day (৳) *</label>
                  <input
                    type="number"
                    name="pricePerDay"
                    value={newCar.pricePerDay}
                    onChange={handleInputChange}
                    className="input-field"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Branch Location *</label>
                  <select
                    name="location.branch"
                    value={newCar.location.branch}
                    onChange={handleInputChange}
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
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Car Image URL</label>
                <input
                  type="url"
                  name="imageUrl"
                  value={newCar.imageUrl}
                  onChange={handleImageUrlChange}
                  className="input-field"
                  placeholder="https://example.com/car-image.jpg"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Enter a valid image URL. If left empty, a default image will be used.
                </p>
                {imagePreview && (
                  <div className="mt-2">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-32 h-20 object-cover rounded border"
                      onError={() => setImagePreview('')}
                    />
                  </div>
                )}
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Features</label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    className="input-field flex-1"
                    placeholder="Add a feature (e.g., Air Conditioning)"
                  />
                  <button
                    type="button"
                    onClick={addFeature}
                    className="btn-secondary"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {newCar.features.map((feature, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {feature.name}
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <i className="bi bi-x"></i>
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button 
                  type="submit" 
                  className="btn-primary flex-1"
                  disabled={loading}
                >
                  {loading ? 'Adding...' : 'Add Car'}
                </button>
                <button 
                  type="button"
                  onClick={closeModals}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Car Modal */}
      {showEditModal && editingCar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Car</h3>
              <button 
                onClick={closeModals}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="bi bi-x-lg text-xl"></i>
              </button>
            </div>
            
            <form onSubmit={handleEditCar} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Car Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editingCar.name}
                    onChange={handleEditInputChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                  <input
                    type="text"
                    name="brand"
                    value={editingCar.brand}
                    onChange={handleEditInputChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                  <input
                    type="text"
                    name="model"
                    value={editingCar.model}
                    onChange={handleEditInputChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  <input
                    type="number"
                    name="year"
                    value={editingCar.year}
                    onChange={handleEditInputChange}
                    className="input-field"
                    min="1990"
                    max={new Date().getFullYear() + 1}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price/Day (৳)</label>
                  <input
                    type="number"
                    name="pricePerDay"
                    value={editingCar.pricePerDay}
                    onChange={handleEditInputChange}
                    className="input-field"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mileage</label>
                  <input
                    type="number"
                    name="mileage"
                    value={editingCar.mileage}
                    onChange={handleEditInputChange}
                    className="input-field"
                    min="0"
                    required
                  />
                </div>
              </div>

              {/* Edit Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Car Image URL</label>
                <input
                  type="url"
                  name="imageUrl"
                  value={editingCar.imageUrl}
                  onChange={handleEditImageUrlChange}
                  className="input-field"
                  placeholder="https://example.com/car-image.jpg"
                />
                {editImagePreview && (
                  <div className="mt-2">
                    <img 
                      src={editImagePreview} 
                      alt="Preview" 
                      className="w-32 h-20 object-cover rounded border"
                      onError={() => setEditImagePreview('')}
                    />
                  </div>
                )}
              </div>

              {/* Edit Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Features</label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={editFeature}
                    onChange={(e) => setEditFeature(e.target.value)}
                    className="input-field flex-1"
                    placeholder="Add a feature"
                  />
                  <button
                    type="button"
                    onClick={addEditFeature}
                    className="btn-secondary"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(editingCar.features || []).map((feature, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                    >
                      {feature.name}
                      <button
                        type="button"
                        onClick={() => removeEditFeature(index)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <i className="bi bi-x"></i>
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button 
                  type="submit" 
                  className="btn-primary flex-1"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Car'}
                </button>
                <button 
                  type="button"
                  onClick={closeModals}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Car Modal */}
      {showViewModal && viewingCar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Car Details</h3>
              <button 
                onClick={closeModals}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="bi bi-x-lg text-xl"></i>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <img 
                  src={viewingCar.images?.[0]?.url || "https://images.unsplash.com/photo-1549924231-f129b911e442?w=400&h=250&fit=crop&crop=center"} 
                  alt={viewingCar.name}
                  className="w-full h-64 object-cover rounded-lg"
                  crossOrigin="anonymous"
                />
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{viewingCar.name}</h4>
                  <p className="text-gray-600">{viewingCar.brand} {viewingCar.model} • {viewingCar.year}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Type:</strong> {viewingCar.type}</div>
                  <div><strong>Transmission:</strong> {viewingCar.transmission}</div>
                  <div><strong>Fuel:</strong> {viewingCar.fuelType}</div>
                  <div><strong>Seats:</strong> {viewingCar.seats}</div>
                  <div><strong>Color:</strong> {viewingCar.color}</div>
                  <div><strong>Mileage:</strong> {viewingCar.mileage?.toLocaleString()}</div>
                  <div><strong>License:</strong> {viewingCar.licensePlate}</div>
                  <div><strong>Price:</strong> ৳{viewingCar.pricePerDay.toLocaleString()}/day</div>
                </div>
                
                {viewingCar.features && viewingCar.features.length > 0 && (
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-2">Features:</h5>
                    <div className="flex flex-wrap gap-2">
                      {viewingCar.features.map((feature, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800"
                        >
                          <i className="bi bi-check-circle mr-1"></i>
                          {feature.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Cars
