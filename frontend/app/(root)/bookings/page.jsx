"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import {
  Calendar,
  Clock,
  Download,
  Eye,
  FileText,
  Home,
  Info,
  Loader2,
  MapPin,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  DollarSign,
  Heart,
  Star,
  Wifi,
  Car,
  Coffee,
  Shield,
  TrendingUp,
  Award,
} from "lucide-react"

export default function BookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [expandedBooking, setExpandedBooking] = useState(null)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      // Try to fetch bookings directly using the current-user endpoint
      const response = await fetch(`http://localhost:5000/api/bookings/current-user`, {
        method: "GET",
        credentials: "include",
      })

      if (response.status === 401) {
        setError("Please log in to view your bookings")
        setLoading(false)
        setRefreshing(false)
        return
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch bookings: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setBookings(data.bookings || [])
      setLoading(false)
      setRefreshing(false)
    } catch (err) {
      console.error("Error fetching bookings:", err)
      setError("Failed to load bookings. Please try again.")
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleDownloadReport = async (bookingId) => {
    try {
      // Request booking report from the server
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/report`, {
        method: "GET",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to generate booking report")
      }

      // Get the blob from the response
      const blob = await response.blob()

      // Create a download link and trigger download
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = `booking-${bookingId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Error downloading report:", err)
      alert("Failed to download booking report. Please try again.")
    }
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300"
      case "confirmed":
        return "bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300"
      case "cancelled":
        return "bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300"
      case "completed":
        return "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300"
      default:
        return "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300"
    }
  }

  const getPaymentStatusBadgeClass = (status) => {
    switch (status) {
      case "Partial Payment":
        return "bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 border border-amber-300"
      case "Full Payment":
        return "bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 border border-emerald-300"
      default:
        return "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 mr-1 animate-pulse" />
      case "confirmed":
        return <CheckCircle className="w-4 h-4 mr-1" />
      case "cancelled":
        return <XCircle className="w-4 h-4 mr-1" />
      case "completed":
        return <Award className="w-4 h-4 mr-1" />
      default:
        return <Info className="w-4 h-4 mr-1" />
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Calculate payment amount based on payment status
  const calculatePaymentAmount = (booking) => {
    return booking.paymentStatus === "Partial Payment" ? booking.totalAmount / 2 : booking.totalAmount
  }

  // Calculate remaining amount for partial payments
  const calculateRemainingAmount = (booking) => {
    return booking.paymentStatus === "Partial Payment" ? booking.totalAmount / 2 : 0
  }

  // Calculate booking stats
  const getBookingStats = () => {
    const total = bookings.length
    const completed = bookings.filter(b => b.bookingStatus === 'completed').length
    const confirmed = bookings.filter(b => b.bookingStatus === 'confirmed').length
    const totalSpent = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0)
    
    return { total, completed, confirmed, totalSpent }
  }

  const stats = getBookingStats()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center h-64">
            <div className="relative">
              <Loader2 className="h-16 w-16 text-indigo-600 animate-spin" />
              <div className="absolute inset-0 h-16 w-16 border-4 border-indigo-200 rounded-full animate-ping"></div>
            </div>
            <p className="text-gray-600 mt-6 text-lg">Loading your amazing bookings...</p>
            <div className="flex space-x-1 mt-4">
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error && bookings.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto text-center border border-gray-100">
            <div className="relative">
              <div className="w-20 h-20 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="h-10 w-10 text-amber-600" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-400 rounded-full animate-ping"></div>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Authentication Required</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">{error}</p>
            <Link
              href="/login"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-xl inline-block transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Shield className="inline w-5 h-5 mr-2" />
              Secure Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white pt-24">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-3">
                Your Bookings Hub
                <Heart className="inline w-8 h-8 ml-3 text-pink-300 animate-pulse" />
              </h1>
              <p className="text-xl text-indigo-100 mb-6">Manage all your bookings in one beautiful place</p>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center">
                    <FileText className="w-8 h-8 text-blue-300 mr-3" />
                    <div>
                      <div className="text-2xl font-bold">{stats.total}</div>
                      <div className="text-sm text-indigo-200">Total Bookings</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center">
                    <Award className="w-8 h-8 text-green-300 mr-3" />
                    <div>
                      <div className="text-2xl font-bold">{stats.completed}</div>
                      <div className="text-sm text-indigo-200">Completed</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center">
                    <CheckCircle className="w-8 h-8 text-emerald-300 mr-3" />
                    <div>
                      <div className="text-2xl font-bold">{stats.confirmed}</div>
                      <div className="text-sm text-indigo-200">Confirmed</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center">
                    <TrendingUp className="w-8 h-8 text-yellow-300 mr-3" />
                    <div>
                      <div className="text-2xl font-bold">GH₵ {stats.totalSpent}</div>
                      <div className="text-sm text-indigo-200">Total Spent</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => fetchBookings(true)} 
              disabled={refreshing}
              className="mt-6 lg:mt-0 flex items-center bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 border border-white/30 backdrop-blur-sm disabled:opacity-50"
            >
              <RefreshCw className={`h-5 w-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh All'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-amber-800 px-6 py-4 rounded-xl flex items-start mb-6 shadow-sm">
            <div className="bg-amber-100 rounded-full p-2 mr-4">
              <Info className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold">{error}</p>
              <p className="text-sm mt-1 text-amber-700">
                If you're already logged in, there might be an issue with your session. Try refreshing the page or
                logging out and back in.
              </p>
            </div>
          </div>
        )}

        {bookings.length === 0 && !loading && !error ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
            <div className="relative mb-8">
              <div className="w-32 h-32 mx-auto bg-indigo-50 rounded-full flex items-center justify-center">
                <FileText className="h-16 w-16 text-indigo-300" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-indigo-400 rounded-full flex items-center justify-center">
                <Star className="w-4 h-4 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Start Your Adventure!</h2>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed max-w-md mx-auto">
              Ready to create some amazing memories? Browse our incredible hostels and book your next adventure.
            </p>
            <Link
              href="/hostels"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl inline-block transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Home className="inline w-5 h-5 mr-2" />
              Explore Amazing Hostels
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking, index) => (
              <div 
                key={booking._id} 
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl overflow-hidden border border-gray-100 transition-all duration-300 transform hover:-translate-y-1"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="p-6 lg:p-8">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">
                            {booking.hostel?.name || "Premium Hostel"}
                          </h2>
                          <div className="text-lg text-indigo-600 font-semibold">
                            {booking.room?.name || "Deluxe Room"}
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <span
                            className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm ${getStatusBadgeClass(
                              booking.bookingStatus,
                            )}`}
                          >
                            {getStatusIcon(booking.bookingStatus)}
                            {booking.bookingStatus.charAt(0).toUpperCase() + booking.bookingStatus.slice(1)}
                          </span>
                          <span
                            className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm ${getPaymentStatusBadgeClass(
                              booking.paymentStatus,
                            )}`}
                          >
                            <DollarSign className="w-4 h-4 mr-1" />
                            {booking.paymentStatus}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center text-gray-600 mb-6">
                        <div className="bg-indigo-50 rounded-full p-2 mr-3">
                          <MapPin className="h-5 w-5 text-indigo-600" />
                        </div>
                        <span className="text-lg">{booking.hostel?.address || "Amazing Location"}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                          <div className="text-sm text-gray-500 mb-2 font-medium">Check-in Date</div>
                          <div className="flex items-center">
                            <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                            <span className="font-bold text-gray-900">{formatDate(booking.checkInDate)}</span>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                          <div className="text-sm text-gray-500 mb-2 font-medium">Check-out Date</div>
                          <div className="flex items-center">
                            <Calendar className="h-5 w-5 text-purple-600 mr-2" />
                            <span className="font-bold text-gray-900">{formatDate(booking.checkOutDate)}</span>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                          <div className="text-sm text-gray-500 mb-2 font-medium">Duration</div>
                          <div className="flex items-center">
                            <Clock className="h-5 w-5 text-green-600 mr-2" />
                            <span className="font-bold text-gray-900">{booking.duration}</span>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-100">
                          <div className="text-sm text-gray-500 mb-2 font-medium">Room Type</div>
                          <div className="flex items-center">
                            <Home className="h-5 w-5 text-amber-600 mr-2" />
                            <span className="font-bold text-gray-900">{booking.room?.type || "Premium Suite"}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl w-full lg:w-80 flex-shrink-0 border border-gray-200">
                      <h3 className="font-bold text-gray-900 mb-4 text-lg flex items-center">
                        <DollarSign className="w-6 h-6 mr-2 text-green-600" />
                        Payment Summary
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                          <span className="text-gray-600 font-medium">Total Amount</span>
                          <span className="font-bold text-xl text-gray-900">GH₵ {booking.totalAmount}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                          <span className="text-gray-600 font-medium">Amount Paid</span>
                          <span className="font-bold text-lg text-green-600">GH₵ {calculatePaymentAmount(booking)}</span>
                        </div>
                        {booking.paymentStatus === "Partial Payment" && (
                          <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg border border-amber-200">
                            <span className="text-amber-700 font-medium">Remaining</span>
                            <span className="font-bold text-lg text-amber-700">GH₵ {calculateRemainingAmount(booking)}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                          <span className="text-gray-600 font-medium">Booking Date</span>
                          <span className="font-semibold text-gray-900">{formatDate(booking.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-gray-100">
                    <button
                      onClick={() => handleDownloadReport(booking._id)}
                      className="flex items-center bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                    >
                      <Download className="h-5 w-5 mr-2" />
                      Download Receipt
                    </button>

                    <Link
                      href={`/bookings/${booking._id}`}
                      className="flex items-center bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                    >
                      <Eye className="h-5 w-5 mr-2" />
                      View Details
                    </Link>

                    {booking.paymentStatus === "Partial Payment" && (
                      <Link
                        href={`/bookings/${booking._id}/complete-payment`}
                        className="flex items-center bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg animate-pulse"
                      >
                        <DollarSign className="h-5 w-5 mr-2" />
                        Complete Payment
                        <span className="ml-2 bg-white/20 px-2 py-1 rounded-full text-xs">!</span>
                      </Link>
                    )}

                    <button
                      onClick={() => setExpandedBooking(expandedBooking === booking._id ? null : booking._id)}
                      className="flex items-center bg-gradient-to-r from-purple-100 to-purple-200 hover:from-purple-200 hover:to-purple-300 text-purple-700 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300"
                    >
                      <Info className="h-5 w-5 mr-2" />
                      {expandedBooking === booking._id ? 'Hide' : 'Show'} Amenities
                    </button>
                  </div>

                  {/* Expandable Amenities Section */}
                  {expandedBooking === booking._id && (
                    <div className="mt-6 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 animate-fadeIn">
                      <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                        <Star className="w-5 h-5 mr-2 text-yellow-500" />
                        Included Amenities
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center text-gray-700">
                          <Wifi className="w-5 h-5 mr-2 text-blue-600" />
                          <span>Free WiFi</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <Car className="w-5 h-5 mr-2 text-green-600" />
                          <span>Parking</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <Coffee className="w-5 h-5 mr-2 text-amber-600" />
                          <span>Breakfast</span>
                        </div>
                        <div className="flex items-center text-gray-700">
                          <Shield className="w-5 h-5 mr-2 text-purple-600" />
                          <span>24/7 Security</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}