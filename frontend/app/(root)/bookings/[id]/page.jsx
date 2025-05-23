"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import {
  ArrowLeft,
  Calendar,
  Clock,
  Download,
  Info,
  Loader2,
  MapPin,
  User,
  Mail,
  Phone,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertTriangle,
  CreditCard,
  Home,
  Bed,
  Users,
  Calendar as CalendarIcon,
  Receipt,
  Star,
  Wifi,
  Car,
  Shield,
  Copy,
  Check,
} from "lucide-react"

export default function BookingDetailsPage({ params }) {
  const resolvedParams = use(params)
  const bookingId = resolvedParams.id
  const router = useRouter()

  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const [downloadingReport, setDownloadingReport] = useState(false)

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setLoading(true)
        const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
          method: "GET",
          credentials: "include",
        })

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Please log in to view booking details")
          } else if (response.status === 403) {
            throw new Error("You are not authorized to view this booking")
          } else if (response.status === 404) {
            throw new Error("Booking not found")
          } else {
            throw new Error("Failed to fetch booking details")
          }
        }

        const data = await response.json()
        setBooking(data.booking)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching booking details:", err)
        setError(err.message)
        setLoading(false)
      }
    }

    if (bookingId) {
      fetchBookingDetails()
    }
  }, [bookingId])

  const handleDownloadReport = async () => {
    if (!booking) return

    try {
      setDownloadingReport(true)
      // Request booking report from the server
      const response = await fetch(`http://localhost:5000/api/bookings/${booking._id}/report`, {
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
      a.download = `booking-${booking._id}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Error downloading report:", err)
      alert("Failed to download booking report. Please try again.")
    } finally {
      setDownloadingReport(false)
    }
  }

  const handleCopyBookingId = () => {
    navigator.clipboard.writeText(booking._id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
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
        return "bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300"
      default:
        return "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 mr-2 animate-pulse" />
      case "confirmed":
        return <CheckCircle className="w-5 h-5 mr-2" />
      case "cancelled":
        return <XCircle className="w-5 h-5 mr-2" />
      case "completed":
        return <CheckCircle className="w-5 h-5 mr-2" />
      default:
        return <Info className="w-5 h-5 mr-2" />
    }
  }

  // Calculate payment amount based on payment status
  const calculatePaymentAmount = (booking) => {
    return booking.paymentStatus === "Partial Payment" ? booking.totalAmount / 2 : booking.totalAmount
  }

  // Calculate remaining amount for partial payments
  const calculateRemainingAmount = (booking) => {
    return booking.paymentStatus === "Partial Payment" ? booking.totalAmount / 2 : 0
  }

  // Calculate days until check-in
  const getDaysUntilCheckIn = (checkInDate) => {
    const today = new Date()
    const checkIn = new Date(checkInDate)
    const diffTime = checkIn - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center h-64">
            <div className="relative">
              <Loader2 className="h-16 w-16 text-indigo-600 animate-spin mb-4" />
              <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-indigo-200 animate-ping"></div>
            </div>
            <p className="text-gray-600 text-lg animate-pulse">Loading your booking details...</p>
            <div className="mt-4 flex space-x-1">
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto text-center transform animate-fade-in border-2 border-red-100">
            <div className="relative">
              <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-red-200 animate-ping mx-auto"></div>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Oops!</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>
            <Link
              href="/bookings"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-xl inline-block transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <ArrowLeft className="w-4 h-4 inline mr-2" />
              Back to Bookings
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto text-center transform animate-fade-in border-2 border-gray-100">
            <Info className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Booking Not Found</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              The booking you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Link
              href="/bookings"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-xl inline-block transform transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <ArrowLeft className="w-4 h-4 inline mr-2" />
              Back to Bookings
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const daysUntilCheckIn = getDaysUntilCheckIn(booking.checkInDate)

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <Link 
            href="/bookings" 
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium transition-all duration-200 hover:translate-x-1 group"
          >
            <ArrowLeft size={18} className="mr-2 transition-transform group-hover:-translate-x-1" /> 
            Back to Bookings
          </Link>
          
          {/* Countdown Banner */}
          {booking.bookingStatus === 'confirmed' && daysUntilCheckIn > 0 && (
            <div className="mt-4 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Your check-in is coming up!</h3>
                  <p className="opacity-90">
                    {daysUntilCheckIn === 1 ? 'Tomorrow' : `${daysUntilCheckIn} days to go`}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{daysUntilCheckIn}</div>
                  <div className="text-sm opacity-90">days</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Status Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Booking Status</p>
                    <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${getStatusBadgeClass(booking.bookingStatus)}`}>
                      {getStatusIcon(booking.bookingStatus)}
                      {booking.bookingStatus.charAt(0).toUpperCase() + booking.bookingStatus.slice(1)}
                    </span>
                  </div>
                  <div className="h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center">
                    {getStatusIcon(booking.bookingStatus)}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Payment Status</p>
                    <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${getPaymentStatusBadgeClass(booking.paymentStatus)}`}>
                      <DollarSign className="w-4 h-4 mr-1" />
                      {booking.paymentStatus}
                    </span>
                  </div>
                  <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                    <CreditCard className="w-8 h-8 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Accommodation Details */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                <h2 className="text-2xl font-bold flex items-center">
                  <Home className="mr-3" />
                  Accommodation Details
                </h2>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{booking.hostel?.name || "Hostel"}</h3>
                  <p className="text-gray-600 flex items-center text-lg">
                    <MapPin className="h-5 w-5 mr-2 text-indigo-600" />
                    {booking.hostel?.address || "Address not available"}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors duration-200">
                    <div className="flex items-center mb-2">
                      <Bed className="h-5 w-5 text-indigo-600 mr-2" />
                      <span className="text-sm text-gray-500">Room</span>
                    </div>
                    <p className="font-semibold text-lg">{booking.room?.name || "Room"}</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors duration-200">
                    <div className="flex items-center mb-2">
                      <Star className="h-5 w-5 text-indigo-600 mr-2" />
                      <span className="text-sm text-gray-500">Room Type</span>
                    </div>
                    <p className="font-semibold text-lg">{booking.room?.type || "Standard"}</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors duration-200">
                    <div className="flex items-center mb-2">
                      <Users className="h-5 w-5 text-indigo-600 mr-2" />
                      <span className="text-sm text-gray-500">Capacity</span>
                    </div>
                    <p className="font-semibold text-lg">{booking.room?.capacity || "N/A"} person(s)</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors duration-200">
                    <div className="flex items-center mb-2">
                      <DollarSign className="h-5 w-5 text-indigo-600 mr-2" />
                      <span className="text-sm text-gray-500">Price per month</span>
                    </div>
                    <p className="font-semibold text-lg">GH₵ {booking.room?.price || "N/A"}</p>
                  </div>
                </div>

                {/* Amenities Section */}
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Available Amenities</h4>
                  <div className="flex flex-wrap gap-3">
                    <span className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      <Wifi className="w-4 h-4 mr-1" />
                      Free WiFi
                    </span>
                    <span className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      <Car className="w-4 h-4 mr-1" />
                      Parking
                    </span>
                    <span className="inline-flex items-center bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                      <Shield className="w-4 h-4 mr-1" />
                      24/7 Security
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stay Details */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="bg-gradient-to-r from-green-600 to-teal-600 p-6 text-white">
                <h2 className="text-2xl font-bold flex items-center">
                  <CalendarIcon className="mr-3" />
                  Stay Details
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center mb-2">
                      <Calendar className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-sm text-green-700">Check-in Date</span>
                    </div>
                    <p className="font-bold text-xl text-green-800">{formatDate(booking.checkInDate)}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
                    <div className="flex items-center mb-2">
                      <Calendar className="h-5 w-5 text-red-600 mr-2" />
                      <span className="text-sm text-red-700">Check-out Date</span>
                    </div>
                    <p className="font-bold text-xl text-red-800">{formatDate(booking.checkOutDate)}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center mb-2">
                      <Clock className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="text-sm text-blue-700">Duration</span>
                    </div>
                    <p className="font-bold text-xl text-blue-800">{booking.duration}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                    <div className="flex items-center mb-2">
                      <Calendar className="h-5 w-5 text-purple-600 mr-2" />
                      <span className="text-sm text-purple-700">Booking Date</span>
                    </div>
                    <p className="font-bold text-xl text-purple-800">{formatDate(booking.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Student Information */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="bg-gradient-to-r from-orange-600 to-pink-600 p-6 text-white">
                <h2 className="text-2xl font-bold flex items-center">
                  <User className="mr-3" />
                  Student Information
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors duration-200">
                    <div className="flex items-center mb-2">
                      <User className="h-5 w-5 text-orange-600 mr-2" />
                      <span className="text-sm text-gray-500">Full Name</span>
                    </div>
                    <p className="font-semibold text-lg">{booking.student?.name || "N/A"}</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors duration-200">
                    <div className="flex items-center mb-2">
                      <Mail className="h-5 w-5 text-orange-600 mr-2" />
                      <span className="text-sm text-gray-500">Email Address</span>
                    </div>
                    <p className="font-semibold text-lg">{booking.student?.email || "N/A"}</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors duration-200">
                    <div className="flex items-center mb-2">
                      <Receipt className="h-5 w-5 text-orange-600 mr-2" />
                      <span className="text-sm text-gray-500">Student ID</span>
                    </div>
                    <p className="font-semibold text-lg">{booking.student?.studentId || "N/A"}</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors duration-200">
                    <div className="flex items-center mb-2">
                      <Phone className="h-5 w-5 text-orange-600 mr-2" />
                      <span className="text-sm text-gray-500">Phone Number</span>
                    </div>
                    <p className="font-semibold text-lg">{booking.student?.phoneNumber || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                  <h2 className="text-2xl font-bold flex items-center">
                    <CreditCard className="mr-3" />
                    Payment Details
                  </h2>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Booking ID with Copy Function */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">Booking ID</span>
                      <button
                        onClick={handleCopyBookingId}
                        className="text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                        title="Copy Booking ID"
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="font-mono text-sm break-all bg-white p-2 rounded border">
                      {booking._id}
                    </p>
                    {copied && (
                      <p className="text-green-600 text-xs mt-1 animate-fade-in">Copied to clipboard!</p>
                    )}
                  </div>

                  {/* Total Amount */}
                  <div className="text-center bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6">
                    <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                    <p className="text-4xl font-bold text-indigo-800">GH₵ {booking.totalAmount}</p>
                  </div>

                  {/* Payment Status */}
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-2">Payment Status</p>
                    <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold ${getPaymentStatusBadgeClass(booking.paymentStatus)}`}>
                      <DollarSign className="w-4 h-4 mr-1" />
                      {booking.paymentStatus}
                    </span>
                  </div>

                  {/* Payment Breakdown */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-green-700">Amount Paid</span>
                      <span className="font-bold text-green-800">GH₵ {calculatePaymentAmount(booking)}</span>
                    </div>
                    
                    {booking.paymentStatus === "Partial Payment" && (
                      <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                        <span className="text-amber-700">Remaining Balance</span>
                        <span className="font-bold text-amber-800">GH₵ {calculateRemainingAmount(booking)}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={handleDownloadReport}
                      disabled={downloadingReport}
                      className="w-full flex items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
                    >
                      {downloadingReport ? (
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      ) : (
                        <Download className="h-5 w-5 mr-2" />
                      )}
                      {downloadingReport ? "Generating..." : "Download Receipt"}
                    </button>

                    {booking.paymentStatus === "Partial Payment" && (
                      <Link
                        href={`/bookings/${booking._id}/complete-payment`}
                        className="w-full flex items-center justify-center bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        <DollarSign className="h-5 w-5 mr-2" />
                        Complete Payment
                      </Link>
                    )}
                  </div>
                </div>

                {/* Partial Payment Notice */}
                {booking.paymentStatus === "Partial Payment" && (
                  <div className="m-6 mt-0 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-4 animate-pulse-slow">
                    <div className="flex">
                      <AlertTriangle className="h-6 w-6 text-amber-500 mr-3 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-bold text-amber-800 mb-1">Payment Reminder</h3>
                        <p className="text-sm text-amber-700 leading-relaxed">
                          Complete your payment before check-in to avoid any booking complications. 
                          Your reservation is secured with the partial payment.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Progress Bar for Partial Payments */}
                {booking.paymentStatus === "Partial Payment" && (
                  <div className="p-6 pt-0">
                    <div className="bg-gray-200 rounded-full h-3 mb-2">
                      <div className="bg-gradient-to-r from-green-500 to-teal-500 h-3 rounded-full w-1/2 transition-all duration-500"></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>50% Paid</span>
                      <span>50% Remaining</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Actions Card */}
              <div className="mt-6 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    href="/bookings"
                    className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 group"
                  >
                    <ArrowLeft className="h-5 w-5 text-gray-600 mr-3 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium text-gray-700">View All Bookings</span>
                  </Link>
                  
                  <Link
                    href="/hostels"
                    className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 group"
                  >
                    <Home className="h-5 w-5 text-gray-600 mr-3 group-hover:scale-110 transition-transform" />
                    <span className="font-medium text-gray-700">Browse More Hostels</span>
                  </Link>
                  
                  <Link
                    href="/support"
                    className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 group"
                  >
                    <Info className="h-5 w-5 text-gray-600 mr-3 group-hover:rotate-12 transition-transform" />
                    <span className="font-medium text-gray-700">Contact Support</span>
                  </Link>
                </div>
              </div>

              {/* Success Message for Confirmed Bookings */}
              {booking.bookingStatus === 'confirmed' && (
                <div className="mt-6 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl p-6 text-white shadow-lg">
                  <div className="flex items-center">
                    <CheckCircle className="h-8 w-8 mr-3" />
                    <div>
                      <h3 className="font-bold text-lg">Booking Confirmed!</h3>
                      <p className="text-green-100 text-sm">
                        Your reservation is secured. We'll send you a reminder closer to your check-in date.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s infinite;
        }
        
        .hover\\:translate-x-1:hover {
          transform: translateX(0.25rem);
        }
        
        .group:hover .group-hover\\:-translate-x-1 {
          transform: translateX(-0.25rem);
        }
        
        .group:hover .group-hover\\:scale-110 {
          transform: scale(1.1);
        }
        
        .group:hover .group-hover\\:rotate-12 {
          transform: rotate(12deg);
        }
      `}</style>
    </div>
  )
}