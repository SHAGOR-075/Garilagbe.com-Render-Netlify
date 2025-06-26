import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const Sidebar = () => {
  const location = useLocation()

  const menuItems = [
    { path: '/', icon: 'bi-speedometer2', label: 'Dashboard' },
    { path: '/cars', icon: 'bi-car-front', label: 'Cars' },
    { path: '/bookings', icon: 'bi-calendar-check', label: 'Bookings' },
    { path: '/customers', icon: 'bi-people', label: 'Customers' },
    { path: '/analytics', icon: 'bi-graph-up', label: 'Analytics' },
    { path: '/settings', icon: 'bi-gear', label: 'Settings' }
  ]

  return (
    <div className="bg-white w-64 min-h-screen shadow-lg">
      <div className="p-6 border-b">
        <div className="flex items-center space-x-2">
          <i className="bi bi-car-front text-2xl text-blue-600"></i>
          <span className="text-xl font-bold text-gray-900">GαɾιLαɠႦҽ.com Admin</span>
        </div>
      </div>

      <nav className="mt-6">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
              location.pathname === item.path ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : ''
            }`}
          >
            <i className={`bi ${item.icon} text-lg mr-3`}></i>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}

export default Sidebar
