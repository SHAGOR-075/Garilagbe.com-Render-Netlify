import React from 'react'

const StatCard = ({ icon, number, label, color = "blue" }) => {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-50",
    green: "text-green-600 bg-green-50",
    purple: "text-purple-600 bg-purple-50",
    orange: "text-orange-600 bg-orange-50"
  }

  return (
    <div className="text-center">
      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${colorClasses[color]} mb-4`}>
        <i className={`bi ${icon} text-2xl`}></i>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-2">{number}</div>
      <div className="text-gray-600">{label}</div>
    </div>
  )
}

export default StatCard
