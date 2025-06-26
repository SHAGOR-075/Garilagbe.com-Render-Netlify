import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import CarCard from '../components/CarCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { carsAPI } from '../services/api'
import { Link } from 'react-router-dom'

const Cars = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    search: '',
    brand: '',
    type: '',
    minRating: '',
    sortBy: 'name',
    minPrice: '',
    maxPrice: '',
    pickupLocation: '',
    destination: '',
    pickupDate: '',
    returnDate: '',
    page: 1,
    limit: 12
  })
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    currentPage: 1
  })
  const [viewMode, setViewMode] = useState('grid')

  // Initialize filters from URL parameters
  useEffect(() => {
    const urlFilters = {
      search: searchParams.get('search') || '',
      brand: searchParams.get('brand') || '',
      type: searchParams.get('type') || '',
      minRating: searchParams.get('minRating') || '',
      sortBy: searchParams.get('sortBy') || 'name',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      pickupLocation: searchParams.get('pickupLocation') || '',
      destination: searchParams.get('destination') || '',
      pickupDate: searchParams.get('pickupDate') || '',
      returnDate: searchParams.get('returnDate') || '',
      page: parseInt(searchParams.get('page')) || 1,
      limit: 12
    }
    setFilters(urlFilters)
  }, [searchParams])

  useEffect(() => {
    fetchCars()
  }, [filters])

  const fetchCars = async () => {
    try { 
      setLoading(true)
      // Clean the filters - remove empty values
      const cleanedFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => 
          value !== '' && value !== undefined && value !== null
        )
      );

      // Check if we have any search parameters
      const hasSearchParams = Object.keys(cleanedFilters).length > 0 && 
        Object.keys(cleanedFilters).some(key => 
          key !== 'page' && key !== 'limit' && key !== 'sortBy'
        )

      // Check if we should use advanced search
      const hasDateRange = cleanedFilters.pickupDate && cleanedFilters.returnDate
      const hasLocation = cleanedFilters.pickupLocation || cleanedFilters.destination
      
      let response
      if (hasDateRange && hasLocation) {
        // Use advanced search for date-based queries
        const advancedParams = {
          pickupLocation: cleanedFilters.pickupLocation,
          destination: cleanedFilters.destination,
          pickupDate: cleanedFilters.pickupDate,
          returnDate: cleanedFilters.returnDate,
          vehicleType: cleanedFilters.type,
          page: cleanedFilters.page,
          limit: cleanedFilters.limit
        }
        response = await carsAPI.advancedSearch(advancedParams)
      } else if (hasSearchParams) {
        // Use regular search for other queries
        response = await carsAPI.getCars(cleanedFilters)
      } else {
        // No search parameters - get all cars
        response = await carsAPI.getCars({ 
          page: cleanedFilters.page || 1, 
          limit: cleanedFilters.limit || 12,
          sortBy: cleanedFilters.sortBy || 'name'
        })
      }

      setCars(response.data.data)
      setPagination({
        total: response.data.total,
        pages: response.data.pages,
        currentPage: response.data.page
      })
    } catch (error) {
      setError('Failed to fetch cars. Please try again.')
      console.error('Error fetching cars:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    const newFilters = {
      ...filters,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }
    setFilters(newFilters)
    
    // Update URL parameters
    const newSearchParams = new URLSearchParams()
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v && v !== '') {
        newSearchParams.set(k, v.toString())
      }
    })
    setSearchParams(newSearchParams)
  }

  const handlePageChange = (page) => {
    const newFilters = {
      ...filters,
      page
    }
    setFilters(newFilters)
    
    // Update URL parameters
    const newSearchParams = new URLSearchParams()
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v && v !== '') {
        newSearchParams.set(k, v.toString())
      }
    })
    setSearchParams(newSearchParams)
  }

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      brand: '',
      type: '',
      minRating: '',
      sortBy: 'name',
      minPrice: '',
      maxPrice: '',
      pickupLocation: '',
      destination: '',
      pickupDate: '',
      returnDate: '',
      page: 1,
      limit: 12
    }
    setFilters(clearedFilters)
    setSearchParams({})
  }

  // Check if there are any active search filters
  const hasActiveFilters = Object.entries(filters).some(([key, value]) => 
    key !== 'page' && key !== 'limit' && key !== 'sortBy' && value && value !== ''
  )

  if (loading && cars.length === 0) {
    return <LoadingSpinner />
  }

  return (
    <div>
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-900 to-purple-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Explore Our <span className="text-yellow-400">Premium Fleet</span>
          </h1>
          <p className="text-xl mb-6 max-w-2xl mx-auto">
            Discover the perfect vehicle for every journey. From luxury sedans to powerful SUVs, 
            explore our comprehensive collection of premium vehicles.
          </p>
          <div className="flex items-center justify-center space-x-8 text-sm">
            <div className="flex items-center">
              <i className="bi bi-car-front mr-2"></i>
              <span>{pagination.total} Vehicles</span>
            </div>
            <div className="flex items-center">
              <i className="bi bi-star-fill mr-2 text-yellow-400"></i>
              <span>Premium Quality</span>
            </div>
            <div className="flex items-center">
              <i className="bi bi-shield-check mr-2"></i>
              <span>Fully Insured</span>
            </div>
          </div>
        </div>
      </section>

      {/* Search Results Summary */}
      {hasActiveFilters && (
        <section className="py-4 bg-blue-50 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-blue-700 font-medium">
                  Search Results: {pagination.total} vehicles found
                </span>
                <div className="flex items-center space-x-2 text-sm text-blue-600">
                  {filters.pickupLocation && (
                    <span>
                      <i className="bi bi-geo-alt mr-1"></i>
                      From: {filters.pickupLocation}
                    </span>
                  )}
                  {filters.destination && (
                    <span>
                      <i className="bi bi-geo-alt-fill mr-1"></i>
                      To: {filters.destination}
                    </span>
                  )}
                  {filters.pickupDate && (
                    <span>
                      <i className="bi bi-calendar mr-1"></i>
                      {new Date(filters.pickupDate).toLocaleDateString()}
                    </span>
                  )}
                  {filters.returnDate && (
                    <span>
                      <i className="bi bi-calendar-check mr-1"></i>
                      {new Date(filters.returnDate).toLocaleDateString()}
                    </span>
                  )}
                  {filters.type && (
                    <span>
                      <i className="bi bi-car-front mr-1"></i>
                      {filters.type}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Filters */}
      {/* <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <i className="bi bi-search mr-2"></i>Search Cars
              </label>
              <input
                type="text"
                placeholder="Search by name or brand..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <i className="bi bi-building mr-2"></i>Brand
              </label>
              <select
                value={filters.brand}
                onChange={(e) => handleFilterChange('brand', e.target.value)}
                className="input-field"
              >
                <option value="">All Brands</option>
                <option value="Audi">Audi</option>
                <option value="BMW">BMW</option>
                <option value="Honda">Honda</option>
                <option value="Mercedes">Mercedes</option>
                <option value="Porsche">Porsche</option>
                <option value="Tesla">Tesla</option>
                <option value="Toyota">Toyota</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <i className="bi bi-car-front mr-2"></i>Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="input-field"
              >
                <option value="">All Types</option>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Sports">Sports</option>
                <option value="Luxury">Luxury</option>
                <option value="Compact">Compact</option>
                <option value="Convertible">Convertible</option>
                <option value="Truck">Truck</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <i className="bi bi-currency-dollar mr-2"></i>Max Price
              </label>
              <input
                type="number"
                placeholder="Max price per day"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <i className="bi bi-sort-down mr-2"></i>Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="input-field"
              >
                <option value="name">Name</option>
                <option value="pricePerDay">Price: Low to High</option>
                <option value="-pricePerDay">Price: High to Low</option>
                <option value="-rating.average">Rating</option>
                <option value="-createdAt">Newest</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {cars.length} of {pagination.total} vehicles found
              </span>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Clear Filters
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">View:</span>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
              >
                <i className="bi bi-grid-3x3-gap"></i>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
              >
                <i className="bi bi-list"></i>
              </button>
            </div>
          </div>
        </div>
      </section> */}

      {/* Cars Grid */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : cars.length > 0 ? (
            <>
              <div className={`grid gap-8 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {cars.map(car => (
                  <CarCard key={car._id} car={car} searchParams={searchParams} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center mt-12">
                  <nav className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                      className="px-3 py-2 rounded-md bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <i className="bi bi-chevron-left"></i>
                    </button>
                    
                    {[...Array(pagination.pages)].map((_, index) => {
                      const page = index + 1
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 rounded-md ${
                            page === pagination.currentPage
                              ? 'bg-blue-600 text-white'
                              : 'bg-white border border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    })}
                    
                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.pages}
                      className="px-3 py-2 rounded-md bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <i className="bi bi-chevron-right"></i>
                    </button>
                  </nav>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <i className="bi bi-car-front text-6xl text-gray-300 mb-4"></i>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {hasActiveFilters ? 'No vehicles found' : 'All Available Vehicles'}
              </h3>
              <p className="text-gray-600 mb-4">
                {hasActiveFilters 
                  ? "Try adjusting your search criteria to see more results. You can also clear all filters to see all available vehicles." 
                  : "Browse our complete collection of premium vehicles. Use the search form above to find specific cars."
                }
              </p>
              {hasActiveFilters ? (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={clearFilters}
                    className="btn-primary"
                  >
                    Clear All Filters
                  </button>
                  <Link to="/" className="btn-secondary">
                    <i className="bi bi-search mr-2"></i>
                    New Search
                  </Link>
                </div>
              ) : (
                <Link to="/" className="btn-primary">
                  <i className="bi bi-search mr-2"></i>
                  Search for Specific Cars
                </Link>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Cars

            
