"use client"

import { useState, useEffect } from "react"
import { Building, Home, CreditCard, Calendar, Loader, Clock, TrendingUp, Users } from "lucide-react"
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
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader className="h-12 w-12 text-indigo-600 animate-spin mx-auto" />
          <span className="block mt-4 text-gray-600 font-medium">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Unable to load dashboard</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
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
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "cancelled":
      case "failed":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {getGreeting()}, {getFirstName(ownerInfo?.name || "")}
              </h1>
              <p className="text-gray-600 mt-2">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            {ownerInfo?.businessName && (
              <div className="mt-4 md:mt-0 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500">Business</p>
                <p className="font-medium text-gray-900">{ownerInfo.businessName}</p>
              </div>
            )}
          </div>
        </header>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600">
                  <Building className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Hostels</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.totalHostels}</p>
                </div>
              </div>
            </div>
            <div className="bg-indigo-50 px-6 py-2">
              <div className="text-xs text-indigo-600 flex items-center">
                <Home className="h-3 w-3 mr-1" />
                <span>Property overview</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
                  <Users className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Rooms</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.totalRooms}</p>
                </div>
              </div>
            </div>
            <div className="bg-emerald-50 px-6 py-2">
              <div className="text-xs text-emerald-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>{dashboardData.stats.occupancyRate}% occupancy rate</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
                  <Calendar className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.totalBookings}</p>
                </div>
              </div>
            </div>
            <div className="bg-amber-50 px-6 py-2">
              <div className="text-xs text-amber-600 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                <span>Booking activity</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(dashboardData.stats.totalRevenue)}</p>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 px-6 py-2">
              <div className="text-xs text-purple-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>Financial summary</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Bookings</h2>

          {dashboardData.bookings.length === 0 ? (
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">No booking data available</p>
              <p className="text-gray-500 mt-2">You don't have any bookings in the system yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Room
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Check In
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.bookings.slice(0, 5).map((booking) => (
                    <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{booking.student?.name || "Unknown"}</div>
                        <div className="text-xs text-gray-500">{booking.student?.email || "No email"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{booking.room?.name || "Unknown Room"}</div>
                        <div className="text-xs text-gray-500">{booking.room?.type || ""}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{formatDate(booking.checkInDate)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 inline-flex text-xs font-medium rounded-full border ${getStatusClasses(booking.bookingStatus)}`}
                        >
                          {booking.bookingStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {formatCurrency(booking.totalAmount || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {dashboardData.bookings.length > 5 && (
                <div className="text-center mt-4">
                  <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                    View all bookings
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Payments</h2>

          {dashboardData.payments.length === 0 ? (
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">No payment data available</p>
              <p className="text-gray-500 mt-2">No payments have been recorded in the system yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.payments.slice(0, 5).map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{payment.student?.name || "Unknown"}</div>
                        <div className="text-xs text-gray-500">{payment.student?.email || "No email"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{formatDate(payment.paymentDate)}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{payment.paymentMethod}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 inline-flex text-xs font-medium rounded-full border ${getStatusClasses(payment.status)}`}
                        >
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {formatCurrency(payment.amount || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {dashboardData.payments.length > 5 && (
                <div className="text-center mt-4">
                  <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                    View all payments
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
