"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Calendar,
  Clock,
  Download,
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
  User,
  Mail,
  Phone,
  Search,
  ChevronDown,
  Star,
  TrendingUp,
  BarChart3,
  Filter,
  SortAsc,
  SortDesc,
  Eye,
  Building2,
  Bed,
  CreditCard,
} from "lucide-react"

export default function HostelOwnerBookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterPayment, setFilterPayment] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:5000/api/hostel-owners/bookings`, {
        method: "GET",
        credentials: "include",
      })

      if (response.status === 401) {
        setError("Please log in to view your bookings")
        setLoading(false)
        return
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch bookings: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setBookings(data.bookings || [])
      setLoading(false)
    } catch (err) {
      console.error("Error fetching bookings:", err)
      setError("Failed to load bookings. Please try again.")
      setLoading(false)
    }
  }

  const handleDownloadReport = async (bookingId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/report`, {
        method: "GET",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to generate booking report")
      }

      const blob = await response.blob()
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

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/hostel-owners/bookings/${bookingId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ bookingStatus: newStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update booking status")
      }

      fetchBookings()
    } catch (err) {
      console.error("Error updating booking status:", err)
      alert("Failed to update booking status. Please try again.")
    }
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200"
      case "confirmed":
        return "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200"
      case "cancelled":
        return "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200"
      case "completed":
        return "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200"
      default:
        return "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-200"
    }
  }

  const getPaymentStatusBadgeClass = (status) => {
    switch (status) {
      case "Partial Payment":
        return "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border border-amber-200"
      case "Full Payment":
        return "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200"
      default:
        return "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-200"
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
        return <Star className="w-4 h-4 mr-1" />
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

  const calculatePaymentAmount = (booking) => {
    return booking.paymentStatus === "Partial Payment" ? booking.totalAmount / 2 : booking.totalAmount
  }

  const calculateRemainingAmount = (booking) => {
    return booking.paymentStatus === "Partial Payment" ? booking.totalAmount / 2 : 0
  }

  // Calculate statistics
  const stats = {
    total: bookings.length,
    confirmed: bookings.filter(b => b.bookingStatus === "confirmed").length,
    pending: bookings.filter(b => b.bookingStatus === "pending").length,
    revenue: bookings.reduce((sum, b) => sum + calculatePaymentAmount(b), 0)
  }

  // Filter and sort bookings
  const filteredBookings = bookings
    .filter((booking) => {
      if (filterStatus !== "all" && booking.bookingStatus !== filterStatus) {
        return false
      }

      if (filterPayment !== "all" && booking.paymentStatus !== filterPayment) {
        return false
      }

      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        return (
          (booking.student?.name && booking.student.name.toLowerCase().includes(searchLower)) ||
          (booking.student?.email && booking.student.email.toLowerCase().includes(searchLower)) ||
          (booking.student?.studentId && booking.student.studentId.toLowerCase().includes(searchLower)) ||
          (booking.hostel?.name && booking.hostel.name.toLowerCase().includes(searchLower)) ||
          (booking.room?.name && booking.room.name.toLowerCase().includes(searchLower))
        )
      }

      return true
    })
    .sort((a, b) => {
      if (sortBy === "createdAt") {
        return sortOrder === "asc"
          ? new Date(a.createdAt) - new Date(b.createdAt)
          : new Date(b.createdAt) - new Date(a.createdAt)
      } else if (sortBy === "checkInDate") {
        return sortOrder === "asc"
          ? new Date(a.checkInDate) - new Date(b.checkInDate)
          : new Date(b.checkInDate) - new Date(a.checkInDate)
      } else if (sortBy === "totalAmount") {
        return sortOrder === "asc" ? a.totalAmount - b.totalAmount : b.totalAmount - a.totalAmount
      }
      return 0
    })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center h-64">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full w-20 h-20 animate-pulse opacity-20"></div>
              <Loader2 className="h-20 w-20 text-indigo-600 animate-spin" />
            </div>
            <p className="text-gray-600 mt-6 text-lg font-medium">Loading your bookings...</p>
            <div className="flex space-x-1 mt-4">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error && bookings.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto text-center border border-gray-100">
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Authentication Required</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">{error}</p>
            <Link
              href="/login"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-xl inline-block transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Log In Now
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-indigo-600 bg-clip-text text-transparent mb-2">
              Bookings Dashboard
            </h1>
            <p className="text-gray-600 text-lg">Manage your hostel reservations and track performance</p>
          </div>
          <button 
            onClick={fetchBookings} 
            className="mt-4 lg:mt-0 flex items-center bg-white hover:bg-gray-50 text-indigo-600 border border-indigo-200 hover:border-indigo-300 px-6 py-3 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Refresh Data
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-400 to-blue-600 w-12 h-12 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Confirmed</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.confirmed}</p>
              </div>
              <div className="bg-gradient-to-br from-green-400 to-green-600 w-12 h-12 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold text-amber-600 mt-1">{stats.pending}</p>
              </div>
              <div className="bg-gradient-to-br from-amber-400 to-amber-600 w-12 h-12 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Revenue</p>
                <p className="text-3xl font-bold text-indigo-600 mt-1">GH₵ {stats.revenue}</p>
              </div>
              <div className="bg-gradient-to-br from-indigo-400 to-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 mb-6">
            <div className="flex items-start">
              <div className="bg-amber-100 rounded-lg p-2 mr-3">
                <Info className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-amber-800">{error}</p>
                <p className="text-sm mt-1 text-amber-700">
                  If you're already logged in, there might be an issue with your session. Try refreshing the page or
                  logging out and back in.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Filters and Search */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
              <div className="flex items-center space-x-3">
                <div className="bg-indigo-50 p-2 rounded-lg">
                  <Filter className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <label htmlFor="filterStatus" className="block text-sm font-medium text-gray-700 mb-1">
                    Booking Status
                  </label>
                  <select
                    id="filterStatus"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="bg-green-50 p-2 rounded-lg">
                  <CreditCard className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <label htmlFor="filterPayment" className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Status
                  </label>
                  <select
                    id="filterPayment"
                    value={filterPayment}
                    onChange={(e) => setFilterPayment(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="all">All Payments</option>
                    <option value="Partial Payment">Partial Payment</option>
                    <option value="Full Payment">Full Payment</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, email, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 border border-gray-300 rounded-xl w-full md:w-80 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500"
                >
                  {sortBy === "createdAt" ? "Booking Date" : sortBy === "checkInDate" ? "Check-in Date" : "Amount"}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </button>
                {isDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200">
                    <div className="py-1">
                      {[
                        { value: "createdAt", label: "Booking Date" },
                        { value: "checkInDate", label: "Check-in Date" },
                        { value: "totalAmount", label: "Amount" }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSortBy(option.value)
                            setIsDropdownOpen(false)
                          }}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 w-full text-left rounded-md mx-1"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500"
              >
                {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </button>
            </div>
            
            <div className="mt-4 md:mt-0">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                <Eye className="w-4 h-4 mr-1" />
                {filteredBookings.length} {filteredBookings.length === 1 ? "booking" : "bookings"} found
              </span>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        {bookings.length === 0 && !loading && !error ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FileText className="h-10 w-10 text-gray-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">No Bookings Yet</h2>
            <p className="text-gray-600 text-lg">You don't have any bookings for your hostels yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {filteredBookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="p-8">
                  <div className="flex flex-col xl:flex-row xl:justify-between xl:items-start gap-6">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                            <Building2 className="w-6 h-6 mr-2 text-indigo-600" />
                            {booking.hostel?.name || "Hostel"} - {booking.room?.name || "Room"}
                          </h2>
                          <div className="flex items-center text-gray-600">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span className="text-sm">{booking.hostel?.address || "Address not available"}</span>
                          </div>
                        </div>
                        <div className="flex space-x-3">
                          <span className={`inline-flex items-center px-3 py-1 rounded-xl text-sm font-medium ${getStatusBadgeClass(booking.bookingStatus)}`}>
                            {getStatusIcon(booking.bookingStatus)}
                            {booking.bookingStatus.charAt(0).toUpperCase() + booking.bookingStatus.slice(1)}
                          </span>
                          <span className={`inline-flex items-center px-3 py-1 rounded-xl text-sm font-medium ${getPaymentStatusBadgeClass(booking.paymentStatus)}`}>
                            <DollarSign className="w-3 h-3 mr-1" />
                            {booking.paymentStatus}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm text-blue-600 font-medium mb-1">Check-in</div>
                              <div className="font-bold text-gray-900">{formatDate(booking.checkInDate)}</div>
                            </div>
                            <Calendar className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm text-purple-600 font-medium mb-1">Check-out</div>
                              <div className="font-bold text-gray-900">{formatDate(booking.checkOutDate)}</div>
                            </div>
                            <Calendar className="h-5 w-5 text-purple-600" />
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm text-green-600 font-medium mb-1">Duration</div>
                              <div className="font-bold text-gray-900">{booking.duration}</div>
                            </div>
                            <Clock className="h-5 w-5 text-green-600" />
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-100">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm text-orange-600 font-medium mb-1">Room Type</div>
                              <div className="font-bold text-gray-900">{booking.room?.type || "Standard"}</div>
                            </div>
                            <Bed className="h-5 w-5 text-orange-600" />
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Student Information */}
                      <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                          <User className="w-5 h-5 mr-2 text-indigo-600" />
                          Student Information
                        </h3>
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="flex items-center space-x-3">
                            <div className="bg-indigo-100 p-2 rounded-lg">
                              <User className="h-4 w-4 text-indigo-600" />
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 font-medium">Full Name</div>
                              <div className="font-semibold text-gray-900">{booking.student?.name || "N/A"}</div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <div className="bg-green-100 p-2 rounded-lg">
                              <Mail className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 font-medium">Email Address</div>
                              <div className="font-semibold text-gray-900">{booking.student?.email || "N/A"}</div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <div className="bg-blue-100 p-2 rounded-lg">
                              <Phone className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 font-medium">Phone Number</div>
                              <div className="font-semibold text-gray-900">{booking.student?.phoneNumber || "N/A"}</div>
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>

                    {/* Enhanced Payment Details */}
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl w-full xl:w-80 flex-shrink-0 border border-indigo-100">
                      <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                        <DollarSign className="w-5 h-5 mr-2 text-indigo-600" />
                        Payment Summary
                      </h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-medium">Total Amount:</span>
                          <span className="font-bold text-lg text-gray-900">GH₵ {booking.totalAmount}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-medium">Amount Paid:</span>
                          <span className="font-bold text-lg text-green-600">GH₵ {calculatePaymentAmount(booking)}</span>
                        </div>
                        {booking.paymentStatus === "Partial Payment" && (
                          <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg border border-amber-200">
                            <span className="text-amber-700 font-medium">Outstanding:</span>
                            <span className="font-bold text-lg text-amber-700">GH₵ {calculateRemainingAmount(booking)}</span>
                          </div>
                        )}
                        <div className="border-t border-indigo-200 pt-4">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 font-medium">Booking Date:</span>
                            <span className="font-semibold text-gray-900">{formatDate(booking.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Action Buttons */}
                  <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-gray-100">
                    <button
                      onClick={() => handleDownloadReport(booking._id)}
                      className="flex items-center bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Receipt
                    </button>

                    {booking.bookingStatus === "pending" && (
                      <button
                        onClick={() => updateBookingStatus(booking._id, "confirmed")}
                        className="flex items-center bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirm Booking
                      </button>
                    )}

                    {(booking.bookingStatus === "pending" || booking.bookingStatus === "confirmed") && (
                      <button
                        onClick={() => updateBookingStatus(booking._id, "cancelled")}
                        className="flex items-center bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancel Booking
                      </button>
                    )}

                    {booking.bookingStatus === "confirmed" && (
                      <button
                        onClick={() => updateBookingStatus(booking._id, "completed")}
                        className="flex items-center bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer"
                      >
                        <Star className="h-4 w-4 mr-2" />
                        Mark as Completed
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}