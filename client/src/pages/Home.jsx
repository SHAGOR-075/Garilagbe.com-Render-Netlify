import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { carsAPI } from '../services/api'
import SearchForm from '../components/SearchForm'
import FeaturedCarousel from '../components/FeaturedCarousel'
import StatCard from '../components/StatCard'

const Home = () => {
  const [featuredCars, setFeaturedCars] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedCars()
  }, [])

  const fetchFeaturedCars = async () => {
    try {
      const response = await carsAPI.getCars({ 
        limit: 8,
        sortBy: '-rating.average'
      })
      setFeaturedCars(response.data.data)
    } catch (error) {
      console.error('Error fetching featured cars:', error)
    } finally {
      setLoading(false)
    }
  }

  const testimonials = [
    {
      id: 1,
      name: "Shifat Ullah",
      role: "Business Executive",
      avatar: "SU",
      rating: 5,
      comment: "Excellent service and top-quality vehicles. The Audi A4 was immaculate and drove like a dream. The GPS and Bluetooth connectivity worked perfectly. Will definitely rent again for my next business trip.",
      date: "June 15, 2024"
    },
    {
      id: 2,
      name: "Robin Mojumdur",
      role: "Travel Blogger",
      avatar: "RM",
      rating: 5,
      comment: "Amazing fleet and outstanding customer service. The rental process was seamless and the car made our anniversary weekend special. Luxurious interior, smooth ride, and excellent fuel efficiency despite being such a powerful vehicle.",
      date: "May 28, 2024"
    },
    {
      id: 3,
      name: "Jehadul Islam",
      role: "Entrepreneur",
      avatar: "JI",
      rating: 5,
      comment: "চমৎকার একটি গাড়ি, যেটিতে সকল প্রিমিয়াম ফিচার ছিল যা প্রত্যাশা করা যায়। শুধু একটি ছোট সমস্যা ছিল—GPS শুরুতে সংযোগ নিতে একটু সময় নিয়েছিল, তবে এর বাইরে সবকিছু নিখুঁত ছিল। ভাড়ার প্রক্রিয়াটাও ছিল একদম ঝামেলাহীন।",
      date: "April 10, 2024"
    }
  ]
  const statsData = [
    {
      icon: "bi-car-front",
      number: "100+",
      label: "Premium Cars",
      color: "blue"
    },
    {
      icon: "bi-people",
      number: "1500+",
      label: "Happy Customers",
      color: "green"
    },
    {
      icon: "bi-geo-alt",
      number: "25+",
      label: "Cities Covered",
      color: "purple"
    },
    {
      icon: "bi-headset",
      number: "24/7",
      label: "Expert Support",
      color: "orange"
    }
  ]
  

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-900 via-purple-900 to-blue-800 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://i.ibb.co/Nn7pNTB8/make-a-high-resolution-car-image-in-a-dark-mood-like-given-image-make-sure-car-light-must-gray-1200.jpg')"
          }}
        ></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Drive Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Dreams</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Experience luxury and freedom with our premium fleet of vehicles. 
            From city cruising to cross-country adventures.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/cars" className="btn-primary text-lg px-8 py-4">
              Explore Fleet <i className="bi bi-arrow-right ml-2"></i>
            </Link>
            <button className="btn-secondary text-lg px-8 py-4">
              <i className="bi bi-play-circle mr-2"></i>Watch Video
            </button>
          </div>
        </div>
      </section>

      {/* Search Form */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SearchForm />
        </div>
      </section>

      {/* Stats Section */}
      {/* <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard icon="bi-car-front" number="100+" label="Premium Cars" color="blue" />
            <StatCard icon="bi-people" number="1500+" label="Happy Customers" color="green" />
            <StatCard icon="bi-geo-alt" number="25+" label="Cities Covered" color="purple" />
            <StatCard icon="bi-headset" number="24/7" label="Expert Support" color="orange" />
          </div>
        </div>
      </section> */}
      <section className="py-16 bg-white">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
      {statsData.map((stat, index) => (
        <StatCard
          key={index}
          icon={stat.icon}
          number={stat.number}
          label={stat.label}
          color={stat.color}
        />
      ))}
    </div>
  </div>
</section>


      {/* Featured Collection Carousel */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Collection</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our selection of luxury vehicles handpicked for your premium experience
            </p>
          </div>

          <FeaturedCarousel cars={featuredCars} />
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-gradient-to-r from-blue-900 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Why Choose <span className="text-yellow-400">GαɾιLαɠႦҽ.com</span></h2>
            <p className="text-xl max-w-2xl mx-auto">
              We deliver exceptional experiences through innovation, quality, and unmatched customer service
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white bg-opacity-10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <i className="bi bi-headset text-3xl text-yellow-400"></i>
              </div>
              <h3 className="text-xl font-semibold mb-4">24/7 Premium Support</h3>
              <p className="text-gray-300">
                Our dedicated support team is available around the clock to ensure your journey is smooth and worry-free.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-white bg-opacity-10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <i className="bi bi-shield-check text-3xl text-yellow-400"></i>
              </div>
              <h3 className="text-xl font-semibold mb-4">Full Protection</h3>
              <p className="text-gray-300">
                Comprehensive insurance coverage and roadside assistance for complete peace of mind during your rental.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-white bg-opacity-10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <i className="bi bi-currency-dollar text-3xl text-yellow-400"></i>
              </div>
              <h3 className="text-xl font-semibold mb-4">Best Value Pricing</h3>
              <p className="text-gray-300">
                Transparent pricing with no hidden fees. Get premium vehicles at competitive rates with flexible packages.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Stories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Customer Stories</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Hear from thousands of satisfied customers who chose GαɾιLαɠႦҽ.com for their journeys
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map(testimonial => (
              <div key={testimonial.id} className="card p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                
                <div className="flex items-center mb-3">
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className="bi bi-star-fill text-yellow-400 text-sm"></i>
                  ))}
                  <span className="text-sm text-gray-600 ml-2">{testimonial.date}</span>
                </div>
                
                <p className="text-gray-700 leading-relaxed">{testimonial.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready for Your Next Adventure?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers and experience the freedom of premium car rental. 
            Book now and save up to 15% on your first rental.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/cars" className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Start Your Journey <i className="bi bi-arrow-right ml-2"></i>
            </Link>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              <i className="bi bi-telephone mr-2"></i>Call Now
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
