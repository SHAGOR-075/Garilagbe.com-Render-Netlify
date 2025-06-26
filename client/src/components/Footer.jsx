import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <i className="bi bi-car-front text-2xl text-blue-400"></i>
              <span className="text-xl font-bold">GαɾιLαɠႦҽ.com</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              Experience luxury and freedom with our premium fleet of vehicles. 
              From city cruising to cross-country adventures.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="bi bi-facebook text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="bi bi-twitter text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="bi bi-instagram text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="bi bi-linkedin text-xl"></i>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/cars" className="text-gray-400 hover:text-white transition-colors">Our Fleet</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center space-x-2">
                <i className="bi bi-telephone"></i>
                <span>+880 188501397*</span>
              </li>
              <li className="flex items-center space-x-2">
                <i className="bi bi-envelope"></i>
                <span>info@garilagbe.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <i className="bi bi-geo-alt"></i>
                <span>Dakshin Khan,Dhaka, 1230,Bangladesh</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 GαɾιLαɠႦҽ.com All rights reserved. | Privacy Policy | Terms of Service</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
