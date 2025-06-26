# Garilagbe.com - Premium Car Rental Platform

## 🚀 Features

### Client Features
- **Modern UI/UX**: responsive design with Tailwind CSS
- **Car Browsing**: Advanced filtering and search functionality
- **Booking System**: Complete rental booking workflow
- **User Authentication**: Secure login/registration system
- **Car Details**: Comprehensive vehicle information and galleries
- **Responsive Design**: Optimized for all device sizes

### Admin Features
- **Dashboard Analytics**: Comprehensive business insights
- **Car Management**: Add, edit, and manage vehicle fleet
- **Booking Management**: Track and manage all reservations
- **Customer Management**: User administration and support
- **Real-time Updates**: Live booking and availability tracking

### Backend Features
- **RESTful API**: Clean, documented API endpoints
- **Authentication**: JWT-based secure authentication
- **Data Validation**: Comprehensive input validation
- **Error Handling**: Robust error management
- **Security**: Rate limiting, CORS, and security headers

## 📱 Application URLs

- **Client Application**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3001
- **Backend API**: http://localhost:5000

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Cars
- `GET /api/cars` - Get all cars (with filtering)
- `GET /api/cars/:id` - Get single car
- `POST /api/cars` - Create car (Admin)
- `PUT /api/cars/:id` - Update car (Admin)
- `DELETE /api/cars/:id` - Delete car (Admin)

### Bookings
- `GET /api/bookings` - Get bookings
- `GET /api/bookings/:id` - Get single booking
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id/status` - Update booking status (Admin)
- `PUT /api/bookings/:id/cancel` - Cancel booking

### Users
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/:id` - Get single user (Admin)
- `PUT /api/users/:id` - Update user (Admin)
- `DELETE /api/users/:id` - Delete user (Admin)

## 📊 Admin Dashboard Features

- **Analytics**: Revenue, bookings, and customer insights
- **Real-time Data**: Live updates and notifications
- **Management Tools**: Comprehensive CRUD operations
- **Reporting**: Export capabilities and detailed reports
- **User Management**: Role-based access control

