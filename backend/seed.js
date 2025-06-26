import mongoose from 'mongoose'
import Car from './models/Car.js'
import dotenv from 'dotenv'

dotenv.config()

const sampleCars = [
  {
    name: "Audi A4 Premium",
    brand: "Audi",
    model: "A4",
    year: 2023,
    type: "Sedan",
    transmission: "Automatic",
    fuelType: "Gasoline",
    seats: 5,
    doors: 4,
    color: "Phantom Black",
    licensePlate: "AUDI001",
    vin: "WAUZZZ8V5KA123456",
    mileage: 15000,
    pricePerDay: 8500,
    images: [{
      url: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=250&fit=crop&crop=center",
      alt: "Audi A4 Premium",
      isPrimary: true
    }],
    features: [
      { name: "GPS Navigation", available: true },
      { name: "Bluetooth", available: true },
      { name: "Backup Camera", available: true },
      { name: "Heated Seats", available: true }
    ],
    specifications: {
      engine: "2.0L Turbo",
      horsepower: 248,
      torque: "273 lb-ft",
      fuelEconomy: {
        city: 24,
        highway: 31,
        combined: 27
      }
    },
    location: {
      branch: "Dhaka",
      address: {
        street: "123 Gulshan Avenue",
        city: "Dhaka",
        state: "Dhaka",
        zipCode: "1212",
        country: "Bangladesh"
      }
    },
    availability: {
      status: "Available",
      availableFrom: new Date()
    },
    rating: {
      average: 4.8,
      count: 45
    },
    isFeatured: true
  },
  {
    name: "BMW X5 xDrive40i",
    brand: "BMW",
    model: "X5",
    year: 2023,
    type: "SUV",
    transmission: "Automatic",
    fuelType: "Gasoline",
    seats: 7,
    doors: 5,
    color: "Alpine White",
    licensePlate: "BMW002",
    vin: "5UXCR6C56KL123456",
    mileage: 12000,
    pricePerDay: 12000,
    images: [{
      url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=250&fit=crop&crop=center",
      alt: "BMW X5 xDrive40i",
      isPrimary: true
    }],
    features: [
      { name: "GPS Navigation", available: true },
      { name: "Bluetooth", available: true },
      { name: "360° Camera", available: true },
      { name: "Panoramic Sunroof", available: true }
    ],
    specifications: {
      engine: "3.0L Turbo",
      horsepower: 335,
      torque: "330 lb-ft",
      fuelEconomy: {
        city: 20,
        highway: 26,
        combined: 22
      }
    },
    location: {
      branch: "Chittagong",
      address: {
        street: "456 Agrabad Commercial Area",
        city: "Chittagong",
        state: "Chittagong",
        zipCode: "4100",
        country: "Bangladesh"
      }
    },
    availability: {
      status: "Available",
      availableFrom: new Date()
    },
    rating: {
      average: 4.9,
      count: 38
    },
    isFeatured: true
  },
  {
    name: "Mercedes-Benz C-Class",
    brand: "Mercedes",
    model: "C-Class",
    year: 2023,
    type: "Luxury",
    transmission: "Automatic",
    fuelType: "Gasoline",
    seats: 5,
    doors: 4,
    color: "Obsidian Black",
    licensePlate: "MBZ003",
    vin: "WDDWF4JB0FR123456",
    mileage: 8000,
    pricePerDay: 9500,
    images: [{
      url: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400&h=250&fit=crop&crop=center",
      alt: "Mercedes-Benz C-Class",
      isPrimary: true
    }],
    features: [
      { name: "GPS Navigation", available: true },
      { name: "Bluetooth", available: true },
      { name: "Premium Sound System", available: true },
      { name: "Ambient Lighting", available: true }
    ],
    specifications: {
      engine: "2.0L Turbo",
      horsepower: 255,
      torque: "273 lb-ft",
      fuelEconomy: {
        city: 23,
        highway: 33,
        combined: 27
      }
    },
    location: {
      branch: "Sylhet",
      address: {
        street: "789 Zindabazar Road",
        city: "Sylhet",
        state: "Sylhet",
        zipCode: "3100",
        country: "Bangladesh"
      }
    },
    availability: {
      status: "Available",
      availableFrom: new Date()
    },
    rating: {
      average: 4.7,
      count: 52
    },
    isFeatured: true
  },
  {
    name: "Porsche 911 Carrera",
    brand: "Porsche",
    model: "911",
    year: 2023,
    type: "Compact",
    transmission: "Automatic",
    fuelType: "Gasoline",
    seats: 4,
    doors: 2,
    color: "Guards Red",
    licensePlate: "PCH004",
    vin: "WP0AB2A91PS123456",
    mileage: 5000,
    pricePerDay: 25000,
    images: [{
      url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=250&fit=crop&crop=center",
      alt: "Porsche 911 Carrera",
      isPrimary: true
    }],
    features: [
      { name: "GPS Navigation", available: true },
      { name: "Bluetooth", available: true },
      { name: "Sport Chrono Package", available: true },
      { name: "Premium Sound System", available: true }
    ],
    specifications: {
      engine: "3.0L Twin-Turbo",
      horsepower: 379,
      torque: "331 lb-ft",
      fuelEconomy: {
        city: 18,
        highway: 25,
        combined: 21
      }
    },
    location: {
      branch: "Cox's Bazar",
      address: {
        street: "321 Marine Drive",
        city: "Cox's Bazar",
        state: "Chittagong",
        zipCode: "4700",
        country: "Bangladesh"
      }
    },
    availability: {
      status: "Available",
      availableFrom: new Date()
    },
    rating: {
      average: 4.9,
      count: 28
    },
    isFeatured: true
  },
  {
    name: "Tesla Model 3",
    brand: "Tesla",
    model: "Model 3",
    year: 2023,
    type: "Sedan",
    transmission: "Automatic",
    fuelType: "Electric",
    seats: 5,
    doors: 4,
    color: "Pearl White",
    licensePlate: "TSL005",
    vin: "5YJ3E1EA0PF123456",
    mileage: 10000,
    pricePerDay: 9000,
    images: [{
      url: "https://images.unsplash.com/photo-1536700503339-1e4b06520771?w=400&h=250&fit=crop&crop=center",
      alt: "Tesla Model 3",
      isPrimary: true
    }],
    features: [
      { name: "Autopilot", available: true },
      { name: "Bluetooth", available: true },
      { name: "Supercharging", available: true },
      { name: "Glass Roof", available: true }
    ],
    specifications: {
      engine: "Dual Motor AWD",
      horsepower: 346,
      torque: "389 lb-ft",
      fuelEconomy: {
        city: 130,
        highway: 120,
        combined: 125
      }
    },
    location: {
      branch: "Rajshahi",
      address: {
        street: "654 Shaheb Bazar Road",
        city: "Rajshahi",
        state: "Rajshahi",
        zipCode: "6000",
        country: "Bangladesh"
      }
    },
    availability: {
      status: "Available",
      availableFrom: new Date()
    },
    rating: {
      average: 4.8,
      count: 67
    },
    isFeatured: true
  },
  {
    name: "Toyota Camry Hybrid",
    brand: "Toyota",
    model: "Camry",
    year: 2023,
    type: "Sedan",
    transmission: "CVT",
    fuelType: "Hybrid",
    seats: 5,
    doors: 4,
    color: "Midnight Black",
    licensePlate: "TOY006",
    vin: "4T1B11HK5KU123456",
    mileage: 18000,
    pricePerDay: 6500,
    images: [{
      url: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&h=250&fit=crop&crop=center",
      alt: "Toyota Camry Hybrid",
      isPrimary: true
    }],
    features: [
      { name: "GPS Navigation", available: true },
      { name: "Bluetooth", available: true },
      { name: "Backup Camera", available: true },
      { name: "Lane Departure Warning", available: true }
    ],
    specifications: {
      engine: "2.5L Hybrid",
      horsepower: 208,
      torque: "163 lb-ft",
      fuelEconomy: {
        city: 51,
        highway: 53,
        combined: 52
      }
    },
    location: {
      branch: "Khulna",
      address: {
        street: "987 Khulna City Center",
        city: "Khulna",
        state: "Khulna",
        zipCode: "9000",
        country: "Bangladesh"
      }
    },
    availability: {
      status: "Available",
      availableFrom: new Date()
    },
    rating: {
      average: 4.6,
      count: 89
    },
    isFeatured: false
  },
  {
    name: "Honda CR-V",
    brand: "Honda",
    model: "CR-V",
    year: 2023,
    type: "SUV",
    transmission: "Automatic",
    fuelType: "Gasoline",
    seats: 5,
    doors: 5,
    color: "Crystal Black Pearl",
    licensePlate: "HND007",
    vin: "5FNRL38467B123456",
    mileage: 15000,
    pricePerDay: 7000,
    images: [{
      url: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=250&fit=crop&crop=center",
      alt: "Honda CR-V",
      isPrimary: true
    }],
    features: [
      { name: "GPS Navigation", available: true },
      { name: "Bluetooth", available: true },
      { name: "Backup Camera", available: true },
      { name: "Honda Sensing", available: true }
    ],
    specifications: {
      engine: "1.5L Turbo",
      horsepower: 190,
      torque: "179 lb-ft",
      fuelEconomy: {
        city: 28,
        highway: 34,
        combined: 30
      }
    },
    location: {
      branch: "Barisal",
      address: {
        street: "456 Sadar Road",
        city: "Barisal",
        state: "Barisal",
        zipCode: "8200",
        country: "Bangladesh"
      }
    },
    availability: {
      status: "Available",
      availableFrom: new Date()
    },
    rating: {
      average: 4.5,
      count: 73
    },
    isFeatured: false
  },
  {
    name: "Ford Mustang Convertible",
    brand: "Ford",
    model: "Mustang",
    year: 2023,
    type: "Convertible",
    transmission: "Automatic",
    fuelType: "Gasoline",
    seats: 4,
    doors: 2,
    color: "Oxford White",
    licensePlate: "FRD008",
    vin: "1FATP8UH5K5123456",
    mileage: 8000,
    pricePerDay: 11000,
    images: [{
      url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=250&fit=crop&crop=center",
      alt: "Ford Mustang Convertible",
      isPrimary: true
    }],
    features: [
      { name: "GPS Navigation", available: true },
      { name: "Bluetooth", available: true },
      { name: "Convertible Top", available: true },
      { name: "Sport Mode", available: true }
    ],
    specifications: {
      engine: "2.3L EcoBoost",
      horsepower: 310,
      torque: "350 lb-ft",
      fuelEconomy: {
        city: 21,
        highway: 28,
        combined: 24
      }
    },
    location: {
      branch: "Rangpur",
      address: {
        street: "789 Rangpur City Center",
        city: "Rangpur",
        state: "Rangpur",
        zipCode: "5400",
        country: "Bangladesh"
      }
    },
    availability: {
      status: "Available",
      availableFrom: new Date()
    },
    rating: {
      average: 4.7,
      count: 41
    },
    isFeatured: false
  },
  {
    name: "Toyota Hilux Pickup",
    brand: "Toyota",
    model: "Hilux",
    year: 2022,
    type: "Compact",
    transmission: "Manual",
    fuelType: "Diesel",
    seats: 5,
    doors: 4,
    color: "Super White",
    licensePlate: "TOY009",
    vin: "JT123456789012345",
    mileage: 22000,
    pricePerDay: 7000,
    images: [{
      url: "https://images.unsplash.com/photo-1511918984145-48de785d4c4e?w=400&h=250&fit=crop&crop=center",
      alt: "Toyota Hilux Pickup",
      isPrimary: true
    }],
    features: [
      { name: "4WD", available: true },
      { name: "Bluetooth", available: true },
      { name: "Backup Camera", available: true }
    ],
    specifications: {
      engine: "2.8L Diesel",
      horsepower: 201,
      torque: "500 Nm",
      fuelEconomy: {
        city: 12,
        highway: 15,
        combined: 13
      }
    },
    location: {
      branch: "Jessore",
      address: {
        street: "101 Jessore Road",
        city: "Jessore",
        state: "Khulna",
        zipCode: "7400",
        country: "Bangladesh"
      }
    },
    availability: {
      status: "Available",
      availableFrom: new Date()
    },
    rating: {
      average: 4.5,
      count: 21
    },
    isFeatured: false
  },
  {
    name: "Mazda MX-5 Convertible",
    brand: "Mazda",
    model: "MX-5",
    year: 2021,
    type: "Convertible",
    transmission: "Manual",
    fuelType: "Gasoline",
    seats: 2,
    doors: 2,
    color: "Soul Red Crystal",
    licensePlate: "MZD010",
    vin: "JM123456789012345",
    mileage: 9000,
    pricePerDay: 9500,
    images: [{
      url: "https://images.unsplash.com/photo-1461632830798-3adb3034e4c8?w=400&h=250&fit=crop&crop=center",
      alt: "Mazda MX-5 Convertible",
      isPrimary: true
    }],
    features: [
      { name: "Convertible Roof", available: true },
      { name: "Bluetooth", available: true },
      { name: "Premium Sound", available: true }
    ],
    specifications: {
      engine: "2.0L",
      horsepower: 181,
      torque: "205 Nm",
      fuelEconomy: {
        city: 26,
        highway: 34,
        combined: 29
      }
    },
    location: {
      branch: "Barisal",
      address: {
        street: "202 Barisal Main Road",
        city: "Barisal",
        state: "Barisal",
        zipCode: "8200",
        country: "Bangladesh"
      }
    },
    availability: {
      status: "Available",
      availableFrom: new Date()
    },
    rating: {
      average: 4.6,
      count: 18
    },
    isFeatured: false
  },
  {
    name: "Honda Fit Compact",
    brand: "Honda",
    model: "Fit",
    year: 2020,
    type: "Compact",
    transmission: "Automatic",
    fuelType: "Gasoline",
    seats: 5,
    doors: 4,
    color: "Blue",
    licensePlate: "HND011",
    vin: "HN123456789012345",
    mileage: 18000,
    pricePerDay: 5000,
    images: [{
      url: "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=400&h=250&fit=crop&crop=center",
      alt: "Honda Fit Compact",
      isPrimary: true
    }],
    features: [
      { name: "Bluetooth", available: true },
      { name: "Backup Camera", available: true }
    ],
    specifications: {
      engine: "1.5L",
      horsepower: 130,
      torque: "114 lb-ft",
      fuelEconomy: {
        city: 29,
        highway: 36,
        combined: 32
      }
    },
    location: {
      branch: "Noakhali",
      address: {
        street: "303 Noakhali Road",
        city: "Noakhali",
        state: "Chittagong",
        zipCode: "3800",
        country: "Bangladesh"
      }
    },
    availability: {
      status: "Available",
      availableFrom: new Date()
    },
    rating: {
      average: 4.4,
      count: 15
    },
    isFeatured: false
  },
  {
    name: "Hyundai Tucson SUV",
    brand: "Hyundai",
    model: "Tucson",
    year: 2022,
    type: "SUV",
    transmission: "Automatic",
    fuelType: "Gasoline",
    seats: 5,
    doors: 4,
    color: "Silver",
    licensePlate: "HYU012",
    vin: "HY123456789012345",
    mileage: 12000,
    pricePerDay: 8000,
    images: [{
      url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=250&fit=crop&crop=center",
      alt: "Hyundai Tucson SUV",
      isPrimary: true
    }],
    features: [
      { name: "Bluetooth", available: true },
      { name: "Backup Camera", available: true },
      { name: "Sunroof", available: true }
    ],
    specifications: {
      engine: "2.0L",
      horsepower: 161,
      torque: "150 lb-ft",
      fuelEconomy: {
        city: 23,
        highway: 28,
        combined: 25
      }
    },
    location: {
      branch: "Rangamati",
      address: {
        street: "404 Rangamati Road",
        city: "Rangamati",
        state: "Chittagong",
        zipCode: "4500",
        country: "Bangladesh"
      }
    },
    availability: {
      status: "Available",
      availableFrom: new Date()
    },
    rating: {
      average: 4.7,
      count: 22
    },
    isFeatured: false
  }
]

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://fackid1971:fack123@cluster0.i8uhbsy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
    console.log('Connected to MongoDB')

    // Clear existing cars
    await Car.deleteMany({})
    console.log('Cleared existing cars')

    // Insert sample cars
    const insertedCars = await Car.insertMany(sampleCars)
    console.log(`Inserted ${insertedCars.length} cars`)

    console.log('Database seeded successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Error seeding database:', error)
    process.exit(1)
  }
}

seedDatabase() 