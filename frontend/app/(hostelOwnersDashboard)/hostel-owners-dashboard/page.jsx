"use client"

import { useState, useEffect } from "react"
import { Building, Home, CreditCard, Calendar, Loader, Clock, TrendingUp, Users, Star, BarChart3, DollarSign, ArrowUpRight, Eye, CheckCircle } from "lucide-react"
import { toast } from "sonner"

export default function HostelOwnerDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [ownerInfo, setOwnerInfo] = useState(null)
  const [dashboardData, setDashboardData] = useState({
    hostels: [],
    bookings: [],
    payments: [],
    stats: {
      totalHostels: 0,
      totalRooms: 0,
      totalBookings: 0,
      totalRevenue: 0,
      occupancyRate: 0,
    },
  })

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)

        // Fetch owner profile information
        try {
          const profileResponse = await fetch("http://localhost:5000/api/hostel-owners/profile", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          })

          if (profileResponse.ok) {
            const profileData = await profileResponse.json()
            setOwnerInfo(profileData.hostelOwner)
            console.log("Owner profile:", profileData.hostelOwner)
          }
        } catch (err) {
          console.log("Error fetching owner profile:", err)
        }

        // Fetch hostels
        const hostelsResponse = await fetch("http://localhost:5000/api/hostel-owners/hostels", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        })

        if (!hostelsResponse.ok) {
          throw new Error("Failed to fetch hostels")
        }

        const hostelsData = await hostelsResponse.json()

        // Initialize stats
        let totalRooms = 0
        let totalBookings = 0
        let totalRevenue = 0
        let occupiedRooms = 0
        const allBookings = []
        const allPayments = []

        // For each hostel, fetch rooms, bookings, and payments
        if (hostelsData.hostels && hostelsData.hostels.length > 0) {
          // Process each hostel sequentially
          for (const hostel of hostelsData.hostels) {
            try {
              // Fetch bookings for this hostel
              try {
                const bookingsResponse = await fetch(`http://localhost:5000/api/hostels/${hostel._id}/bookings`, {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  credentials: "include",
                })

                if (bookingsResponse.ok) {
                  const bookingsData = await bookingsResponse.json()

                  if (bookingsData.bookings) {
                    allBookings.push(...bookingsData.bookings)
                    totalBookings += bookingsData.bookings.length

                    // Count active bookings for occupancy calculation
                    bookingsData.bookings.forEach((booking) => {
                      if (booking.bookingStatus === "confirmed") {
                        occupiedRooms++
                      }
                    })
                  }
                }
              } catch (err) {
                console.log(`Error fetching bookings for hostel ${hostel._id}:`, err)
              }

              // Fetch payments for this hostel
              try {
                const paymentsResponse = await fetch(`http://localhost:5000/api/hostels/${hostel._id}/payments`, {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  credentials: "include",
                })

                if (paymentsResponse.ok) {
                  const paymentsData = await paymentsResponse.json()

                  if (paymentsData.payments) {
                    allPayments.push(...paymentsData.payments)
                    // Calculate total revenue
                    paymentsData.payments.forEach((payment) => {
                      if (payment.status === "completed") {
                        totalRevenue += payment.amount
                      }
                    })
                  }
                }
              } catch (err) {
                console.log(`Error fetching payments for hostel ${hostel._id}:`, err)
              }

              // Count rooms for this hostel
              const roomsResponse = await fetch(`http://localhost:5000/api/hostel-owners/hostels/${hostel._id}/rooms`, {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                },
                credentials: "include",
              })

              if (roomsResponse.ok) {
                const roomsData = await roomsResponse.json()
                if (roomsData.rooms) {
                  totalRooms += roomsData.rooms.length
                }
              }
            } catch (err) {
              console.error(`Error fetching data for hostel ${hostel._id}:`, err)
            }
          }
        }

        // Calculate occupancy rate
        const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0

        // Update dashboard data
        setDashboardData({
          hostels: hostelsData.hostels || [],
          bookings: allBookings,
          payments: allPayments,
          stats: {
            totalHostels: hostelsData.hostels ? hostelsData.hostels.length : 0,
            totalRooms,
            totalBookings,
            totalRevenue,
            occupancyRate,
          },
        })
      } catch (err) {
        console.error("Dashboard data fetch error:", err)
        setError(err.message)
        toast.error("Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  // Get first name from full name
  const getFirstName = (fullName) => {
    if (!fullName) return ""
    return fullName.split(" ")[0]
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="relative">
            <Loader className="h-16 w-16 text-indigo-600 animate-spin mx-auto" />
            <div className="absolute inset-0 h-16 w-16 border-4 border-indigo-200 rounded-full animate-pulse mx-auto"></div>
          </div>
          <div className="mt-6 space-y-2">
            <span className="block text-xl font-semibold text-gray-800 animate-pulse">Loading your dashboard...</span>
            <span className="block text-sm text-gray-500">Gathering your latest business insights</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-lg mx-auto bg-white p-8 rounded-2xl shadow-xl border border-red-100">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-4">Unable to load dashboard</h2>
            <p className="text-gray-700 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 transform hover:scale-105 font-medium shadow-md"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date)
  }

  // Get status class
  const getStatusClasses = (status) => {
    switch (status) {
      case "confirmed":
      case "completed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200 shadow-sm"
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200 shadow-sm"
      case "cancelled":
      case "failed":
        return "bg-red-100 text-red-800 border-red-200 shadow-sm"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 shadow-sm"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {getGreeting()}, {getFirstName(ownerInfo?.name || "")} 👋
              </h1>
              <p className="text-gray-600 text-lg">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            {ownerInfo?.businessName && (
              <div className="mt-6 md:mt-0 bg-white px-6 py-4 rounded-2xl shadow-lg border border-gray-100 transform hover:scale-105 transition-all duration-200">
                <p className="text-sm text-gray-500 font-medium">Your Business</p>
                <p className="font-bold text-gray-900 text-lg">{ownerInfo.businessName}</p>
                <div className="flex items-center mt-2">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600 ml-1">Premium Account</span>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Enhanced Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="group bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-200">
                    <Building className="h-4 w-4" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Hostels</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{dashboardData.stats.totalHostels}</p>
                  </div>
                </div>
                <ArrowUpRight className="h-6 w-6 text-gray-400 group-hover:text-indigo-600 transition-colors duration-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 px-8 py-4">
              <div className="text-sm text-indigo-700 flex items-center font-medium">
                <Home className="h-4 w-4 mr-2" />
                <span>Property Portfolio</span>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-200">
                    <Users className="h-4 w-4" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Rooms</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{dashboardData.stats.totalRooms}</p>
                  </div>
                </div>
                <ArrowUpRight className="h-6 w-6 text-gray-400 group-hover:text-emerald-600 transition-colors duration-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 px-8 py-4">
              <div className="text-sm text-emerald-700 flex items-center font-medium">
                <TrendingUp className="h-4 w-4 mr-2" />
                <span>{dashboardData.stats.occupancyRate}% Occupancy Rate</span>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-200">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Bookings</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{dashboardData.stats.totalBookings}</p>
                  </div>
                </div>
                <ArrowUpRight className="h-6 w-6 text-gray-400 group-hover:text-amber-600 transition-colors duration-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-amber-50 to-amber-100 px-8 py-4">
              <div className="text-sm text-amber-700 flex items-center font-medium">
                <Clock className="h-4 w-4 mr-2" />
                <span>Booking Activity</span>
              </div>
            </div>
          </div>

          <div className="group bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-200">
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm  text-gray-500 uppercase tracking-wide">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(dashboardData.stats.totalRevenue)}</p>
                  </div>
                </div>
                <ArrowUpRight className="h-6 w-6 text-gray-400 group-hover:text-purple-600 transition-colors duration-200" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-8 py-4">
              <div className="text-sm text-purple-700 flex items-center font-medium">
                <BarChart3 className="h-4 w-4 mr-2" />
                <span>Financial Growth</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Recent Bookings */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-12 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Recent Bookings</h2>
                <p className="text-gray-500">Latest booking activity across your properties</p>
              </div>
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors duration-200 font-medium">
              <Eye className="h-4 w-4" />
              <span>View All</span>
            </button>
          </div>

          {dashboardData.bookings.length === 0 ? (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-12 rounded-2xl text-center">
              <div className="relative">
                <Calendar className="h-20 w-20 text-gray-300 mx-auto mb-6" />
                <div className="absolute -top-2 -right-2 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-lg">🎯</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Bookings Yet</h3>
              <p className="text-gray-600 mb-6">Your booking journey starts here. Once students start booking, you'll see all the activity here.</p>
              <button className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 font-medium">
                Promote Your Hostels
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Room</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Check In</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  {dashboardData.bookings.slice(0, 5).map((booking, index) => (
                    <tr key={booking._id} className="group hover:bg-blue-50 transition-all duration-200 rounded-xl">
                      <td className="px-6 py-6">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                            {booking.student?.name ? booking.student.name.charAt(0).toUpperCase() : "?"}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{booking.student?.name || "Unknown"}</div>
                            <div className="text-xs text-gray-500">{booking.student?.email || "No email"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="text-sm font-medium text-gray-900">{booking.room?.name || "Unknown Room"}</div>
                        <div className="text-xs text-gray-500 capitalize">{booking.room?.type || ""}</div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="text-sm font-medium text-gray-900">{formatDate(booking.checkInDate)}</div>
                      </td>
                      <td className="px-6 py-6">
                        <span className={`px-4 py-2 inline-flex text-xs font-bold rounded-full border-2 ${getStatusClasses(booking.bookingStatus)} capitalize`}>
                          {booking.bookingStatus === "confirmed" && <CheckCircle className="h-3 w-3 mr-1" />}
                          {booking.bookingStatus}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-sm font-bold text-gray-900">
                        {formatCurrency(booking.totalAmount || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {dashboardData.bookings.length > 5 && (
                <div className="text-center mt-8">
                  <button className="px-8 py-3 text-blue-600 hover:text-blue-800 text-sm font-bold border-2 border-blue-200 hover:border-blue-300 rounded-xl transition-all duration-200 hover:shadow-md">
                    View All {dashboardData.bookings.length} Bookings
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Enhanced Recent Payments */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Recent Payments</h2>
                <p className="text-gray-500">Track your revenue and payment history</p>
              </div>
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors duration-200 font-medium">
              <BarChart3 className="h-4 w-4" />
              <span>View Reports</span>
            </button>
          </div>

          {dashboardData.payments.length === 0 ? (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-12 rounded-2xl text-center">
              <div className="relative">
                <CreditCard className="h-20 w-20 text-gray-300 mx-auto mb-6" />
                <div className="absolute -top-2 -right-2 h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-lg">💰</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Payments Yet</h3>
              <p className="text-gray-600 mb-6">Once bookings are confirmed and payments are made, you'll see all transaction details here.</p>
              <button className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors duration-200 font-medium">
                Set Up Payment Methods
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Method</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  {dashboardData.payments.slice(0, 5).map((payment, index) => (
                    <tr key={payment._id} className="group hover:bg-green-50 transition-all duration-200 rounded-xl">
                      <td className="px-6 py-6">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold">
                            {payment.student?.name ? payment.student.name.charAt(0).toUpperCase() : "?"}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{payment.student?.name || "Unknown"}</div>
                            <div className="text-xs text-gray-500">{payment.student?.email || "No email"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="text-sm font-medium text-gray-900">{formatDate(payment.paymentDate)}</div>
                      </td>
                      <td className="px-6 py-6 text-sm font-medium text-gray-900 capitalize">{payment.paymentMethod}</td>
                      <td className="px-6 py-6">
                        <span className={`px-4 py-2 inline-flex text-xs font-bold rounded-full border-2 ${getStatusClasses(payment.status)} capitalize`}>
                          {payment.status === "completed" && <CheckCircle className="h-3 w-3 mr-1" />}
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-sm font-bold text-green-600">
                        {formatCurrency(payment.amount || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {dashboardData.payments.length > 5 && (
                <div className="text-center mt-8">
                  <button className="px-8 py-3 text-green-600 hover:text-green-800 text-sm font-bold border-2 border-green-200 hover:border-green-300 rounded-xl transition-all duration-200 hover:shadow-md">
                    View All {dashboardData.payments.length} Payments
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}