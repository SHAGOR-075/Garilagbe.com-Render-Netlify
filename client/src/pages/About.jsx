import React from 'react'

const About = () => {
  // Data could also come from API or external file
  const hero = {
    title: 'About GαɾιLαɠႦҽ.com',
    description:
      'Your trusted partner in premium car rental services, delivering exceptional experiences ' +
      'through innovation, quality, and unmatched customer service since 2015.'
  }

  const story = {
    title: 'Our Story',
    paragraphs: [
      'Founded in 2015 with a vision to revolutionize the car rental industry, GαɾιLαɠႦҽ.com has grown ' +
        'from a small local business to a trusted name in premium vehicle rentals across multiple cities.',
      'We believe that every journey should be extraordinary. That\'s why we\'ve curated a fleet of ' +
        'premium vehicles and built a service experience that exceeds expectations at every touchpoint.'
    ],
    stats: [
      { number: '1500+', label: 'Happy Customers' },
      { number: '100+', label: 'Premium Vehicles' }
    ],
    image: {
      src: 'https://i.ibb.co/DHZ4pDrb/Screenshot-2025-06-25-133419.png',
      alt: 'Our Story'
    }
  }

  const values = [
    {
      icon: 'bi-shield-check',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      title: 'Trust & Reliability',
      description:
        'We build lasting relationships through consistent, dependable service and transparent business practices.'
    },
    {
      icon: 'bi-star',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      title: 'Excellence',
      description:
        'We strive for perfection in every detail, from our premium fleet to our customer service experience.'
    },
    {
      icon: 'bi-heart',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      title: 'Customer First',
      description:
        'Every decision we make is guided by what\'s best for our customers and their journey experience.'
    }
  ]

  const team = [
    {
      initials: 'MKS',
      name: 'Md Kharul Islam Shagor',
      role: 'CEO & Founder',
      description:
        'Visionary leader with 15+ years in automotive industry, passionate about customer experience.',
      bgGradient: 'from-blue-600 to-purple-600',
      textColor: 'text-white'
    },
    {
      initials: 'SI',
      name: 'Shahriar Islam',
      role: 'Operations Director',
      description:
        'Expert in fleet management and operations, ensuring every vehicle meets our premium standards.',
      bgGradient: 'from-green-600 to-blue-600',
      textColor: 'text-white'
    },
    {
      initials: 'TR',
      name: 'Tanjil Rahman',
      role: 'Customer Success Manager',
      description:
        'Dedicated to ensuring every customer has an exceptional experience from booking to return.',
      bgGradient: 'from-purple-600 to-pink-600',
      textColor: 'text-white'
    }
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-purple-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">{hero.title}</h1>
          <p className="text-xl max-w-3xl mx-auto">{hero.description}</p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">{story.title}</h2>
              {story.paragraphs.map((para, idx) => (
                <p key={idx} className="text-lg text-gray-700 mb-6">
                  {para}
                </p>
              ))}

              <div className="grid grid-cols-2 gap-6">
                {story.stats.map(({ number, label }, idx) => (
                  <div key={idx} className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">{number}</div>
                    <div className="text-gray-600">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <img
                src={story.image.src}
                alt={story.image.alt}
                className="rounded-xl shadow-lg"
                crossOrigin="anonymous"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do and shape every interaction with our customers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map(({ icon, iconBg, iconColor, title, description }, idx) => (
              <div key={idx} className="text-center">
                <div
                  className={`${iconBg} rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6`}
                >
                  <i className={`bi ${icon} text-3xl ${iconColor}`}></i>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
                <p className="text-gray-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The passionate professionals behind CarLuxDe&apos;s exceptional service
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map(({ initials, name, role, description, bgGradient, textColor }, idx) => (
              <div key={idx} className="text-center">
                <div
                  className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-4 bg-gradient-to-r ${bgGradient} ${textColor} text-2xl font-bold`}
                >
                  {initials}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{name}</h3>
                <p className="text-blue-600 mb-3">{role}</p>
                <p className="text-gray-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default About
