import React, { useEffect, useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { paymentAPI } from '../services/api'

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams()
  const [paymentStatus, setPaymentStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [redirecting, setRedirecting] = useState(false)
  const [countdown, setCountdown] = useState(3)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  // Debug: Log the search parameters
  useEffect(() => {
    console.log('PaymentSuccess: Search params:', Object.fromEntries(searchParams.entries()))
  }, [searchParams])

  useEffect(() => {
    const validatePayment = async () => {
      try {
        const transactionId = searchParams.get('tran_id')
        const amount = searchParams.get('amount')

        console.log('PaymentSuccess: Validating payment with:', { transactionId, amount })

        if (transactionId && amount) {
          const response = await paymentAPI.validatePayment({
            transactionId,
            amount: parseFloat(amount)
          })

          console.log('PaymentSuccess: Validation response:', response.data)

          if (response.data.success) {
            setPaymentStatus(response.data.data)
          } else {
            setError('Payment validation failed')
          }
        } else {
          console.log('PaymentSuccess: Missing transaction ID or amount')
          setError('Missing payment information')
        }
      } catch (error) {
        console.error('Payment validation error:', error)
        setError('Payment validation failed. Please contact support.')
      } finally {
        setLoading(false)
      }
    }

    validatePayment()
  }, [searchParams])

  // Countdown timer
  useEffect(() => {
    if (paymentStatus && !loading && !redirecting) {
      setRedirecting(true)
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval)
            // Try multiple navigation methods
            try {
              console.log('PaymentSuccess: Redirecting to homepage...')
              navigate('/', { replace: true })
            } catch (error) {
              console.error('Navigation error:', error)
              // Fallback methods
              try {
                window.location.href = '/'
              } catch (fallbackError) {
                console.error('Fallback navigation error:', fallbackError)
                // Last resort - reload the page
                window.location.reload()
              }
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(countdownInterval)
    }
  }, [paymentStatus, loading, redirecting, navigate])

  const handleManualRedirect = () => {
    try {
      navigate('/', { replace: true })
    } catch (error) {
      console.error('Manual navigation error:', error)
      window.location.href = '/'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Validating payment...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="bi bi-exclamation-triangle text-3xl text-red-600"></i>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Error</h1>
            <p className="text-lg text-gray-600 mb-8">{error}</p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/bookings" className="btn-primary">
                View My Bookings
              </Link>
              <Link to="/contact" className="btn-secondary">
                Contact Support
              </Link>
              <button 
                onClick={handleManualRedirect}
                className="btn-secondary"
              >
                Go to Homepage
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="bi bi-check-circle text-3xl text-green-600"></i>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
          <p className="text-lg text-gray-600 mb-8">
            Your booking has been confirmed and payment processed successfully.
            <br />
            {redirecting ? (
              <span className="text-blue-600 font-medium">
                Redirecting to homepage in {countdown} second{countdown !== 1 ? 's' : ''}...
              </span>
            ) : (
              <span className="text-gray-500">You will be redirected to the homepage shortly.</span>
            )}
          </p>

          {paymentStatus && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Transaction ID:</span>
                  <span className="font-mono">{paymentStatus.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount Paid:</span>
                  <span className="font-semibold">${paymentStatus.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="text-green-600 font-semibold">Paid</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/bookings" className="btn-primary">
              View My Bookings
            </Link>
            <Link to="/cars" className="btn-secondary">
              Browse More Cars
            </Link>
            <button 
              onClick={handleManualRedirect}
              className="btn-secondary"
            >
              Go to Homepage Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentSuccess
