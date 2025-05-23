"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Table } from "@/components/ui/table"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, ArrowUpDown, DollarSign, PieChart, Calendar, User } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

const Payments = () => {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hostels, setHostels] = useState([])
  const [selectedHostel, setSelectedHostel] = useState("")
  const [sortColumn, setSortColumn] = useState("date")
  const [sortDirection, setSortDirection] = useState("desc")
  const [stats, setStats] = useState({
    totalRevenue: 0,
    paidCount: 0,
    partialCount: 0,
    averageAmount: 0
  })

  useEffect(() => {
    // First fetch the hostel owner's hostels
    const fetchHostels = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/hostel-owners/hostels", {
           credentials: "include",
        })

        if (!response.ok) {
          throw new Error("Failed to fetch hostels")
        }

        const data = await response.json()
        setHostels(data.hostels || [])

        // If there are hostels, select the first one by default
        if (data.hostels && data.hostels.length > 0) {
          setSelectedHostel(data.hostels[0]._id)
        }
      } catch (err) {
        console.error("Error fetching hostels:", err)
        setError(err.message)
      }
    }

    fetchHostels()
  }, [])

  useEffect(() => {
    // Only fetch payments if a hostel is selected
    if (selectedHostel) {
      fetchPayments(selectedHostel)
    }
  }, [selectedHostel])

  useEffect(() => {
    if (payments.length > 0) {
      calculateStats()
    }
  }, [payments])

  const calculateStats = () => {
    const totalAmount = payments.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0)
    const paidBookings = payments.filter(booking => booking.paymentStatus === "paid").length
    const partialBookings = payments.filter(booking => booking.paymentStatus === "partial").length
    
    setStats({
      totalRevenue: totalAmount,
      paidCount: paidBookings,
      partialCount: partialBookings,
      averageAmount: payments.length > 0 ? totalAmount / payments.length : 0
    })
  }

  const fetchPayments = async (hostelId) => {
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:5000/api/hostel-owners/hostels/${hostelId}/bookings`, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch payments")
      }

      const data = await response.json()

      // Extract payment information from bookings
      const bookingsWithPayments = data.bookings.filter(
        (booking) => booking.paymentStatus === "paid" || booking.paymentStatus === "partial",
      )

      setPayments(bookingsWithPayments || [])
    } catch (err) {
      console.error("Error fetching payments:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Helper function to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Helper function to get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "partial":
        return "bg-yellow-100 text-yellow-800"
      case "pending":
        return "bg-orange-100 text-orange-800"
      case "refunded":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleHostelChange = (value) => {
    setSelectedHostel(value)
  }

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const sortedPayments = [...payments].sort((a, b) => {
    switch (sortColumn) {
      case "amount":
        return sortDirection === "asc" 
          ? (a.totalAmount || 0) - (b.totalAmount || 0)
          : (b.totalAmount || 0) - (a.totalAmount || 0)
      case "status":
        return sortDirection === "asc"
          ? a.paymentStatus.localeCompare(b.paymentStatus)
          : b.paymentStatus.localeCompare(a.paymentStatus)
      case "student":
        const aName = a.student?.name || "Unknown"
        const bName = b.student?.name || "Unknown"
        return sortDirection === "asc"
          ? aName.localeCompare(bName)
          : bName.localeCompare(aName)
      case "date":
      default:
        return sortDirection === "asc"
          ? new Date(a.createdAt) - new Date(b.createdAt)
          : new Date(b.createdAt) - new Date(a.createdAt)
    }
  })

  // Loading states
  if (loading && !selectedHostel) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Payments</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-4 w-1/3 mb-2" />
              <Skeleton className="h-8 w-1/2" />
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center space-y-2">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
                <p className="text-gray-500">Loading hostels...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error && !selectedHostel) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Payments</h1>
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3 text-red-600 mb-2">
              <AlertCircle className="h-6 w-6" />
              <h3 className="font-semibold">Error Fetching Data</h3>
            </div>
            <p>{error}</p>
            <p className="mt-2 text-gray-600">Please try again later or contact support.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // No hostels state
  if (hostels.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Payments</h1>
        <Card className="text-center">
          <CardContent className="pt-6 pb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <DollarSign className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Hostels Found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              You need to create a hostel before you can view payments. Once created, your payment data will appear here.
            </p>
            <button className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
              Create Your First Hostel
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Payments</h1>
        <Select value={selectedHostel} onValueChange={handleHostelChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Hostel" />
          </SelectTrigger>
          <SelectContent>
            {hostels.map((hostel) => (
              <SelectItem key={hostel._id} value={hostel._id}>
                {hostel.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium text-blue-600">Total Revenue</p>
              <DollarSign className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold mt-2">${stats.totalRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium text-green-600">Fully Paid</p>
              <User className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold mt-2">{stats.paidCount} bookings</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium text-yellow-600">Partial Payments</p>
              <PieChart className="h-5 w-5 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold mt-2">{stats.partialCount} bookings</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium text-purple-600">Average Booking</p>
              <Calendar className="h-5 w-5 text-purple-500" />
            </div>
            <p className="text-2xl font-bold mt-2">${stats.averageAmount.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="table" className="mb-6">
        <TabsList className="mb-4 flex gap-4">
          <TabsTrigger value="table" className="bg-gradient-to-r from-indigo-600 to-purple-600 py-4 px-4 rounded-md text-white cursor-pointer">Table View</TabsTrigger>
          <TabsTrigger value="cards" className="bg-gradient-to-r from-indigo-600 to-purple-600 py-4 px-4 rounded-md text-white cursor-pointer">Card View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="table">
          {loading ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-center items-center h-64">
                  <div className="flex flex-col items-center space-y-2">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
                    <p className="text-gray-500">Loading payments...</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : error ? (
            <Card className="border-red-200">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3 text-red-600 mb-2">
                  <AlertCircle className="h-6 w-6" />
                  <h3 className="font-semibold">Error Fetching Data</h3>
                </div>
                <p>{error}</p>
                <p className="mt-2 text-gray-600">Please try again later or contact support.</p>
              </CardContent>
            </Card>
          ) : payments.length === 0 ? (
            <Card className="text-center">
              <CardContent className="pt-6 pb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <DollarSign className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Payments Found</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Payments will appear here once students make bookings for this hostel.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <div className="overflow-x-auto rounded-md">
                <Table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("student")}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Student</span>
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("amount")}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Amount</span>
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("status")}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Status</span>
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </th>
                      <th 
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("date")}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Date</span>
                          <ArrowUpDown className="h-4 w-4" />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedPayments.map((booking) => (
                      <tr 
                        key={booking._id} 
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <td className="px-4 py-3 text-sm text-gray-500">
                          <span className="font-mono">{booking._id.substring(0, 8)}...</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                              <span className="font-semibold text-blue-600">
                                {(booking.student?.name || "?")[0]}
                              </span>
                            </div>
                            <span>{booking.student ? booking.student.name : "Unknown Student"}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium">${booking.totalAmount?.toFixed(2) || "N/A"}</td>
                        <td className="px-4 py-3">
                          <Badge className={`${getStatusColor(booking.paymentStatus)} px-3 py-1`}>
                            {booking.paymentStatus}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm">{formatDate(booking.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="cards">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-8 w-1/3 mb-4" />
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card className="border-red-200">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3 text-red-600 mb-2">
                  <AlertCircle className="h-6 w-6" />
                  <h3 className="font-semibold">Error Fetching Data</h3>
                </div>
                <p>{error}</p>
                <p className="mt-2 text-gray-600">Please try again later or contact support.</p>
              </CardContent>
            </Card>
          ) : payments.length === 0 ? (
            <Card className="text-center">
              <CardContent className="pt-6 pb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <DollarSign className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Payments Found</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Payments will appear here once students make bookings for this hostel.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedPayments.map((booking) => (
                <Card key={booking._id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Payment ID</p>
                        <p className="font-mono font-medium">{booking._id.substring(0, 8)}...</p>
                      </div>
                      <Badge className={`${getStatusColor(booking.paymentStatus)} px-3 py-1 h-fit`}>
                        {booking.paymentStatus}
                      </Badge>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center mb-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <span className="font-semibold text-blue-600">
                            {(booking.student?.name || "?")[0]}
                          </span>
                        </div>
                        <span className="font-medium">{booking.student ? booking.student.name : "Unknown Student"}</span>
                      </div>
                      <div className="flex justify-between mt-4">
                        <div>
                          <p className="text-sm text-gray-500">Amount</p>
                          <p className="font-bold text-lg">${booking.totalAmount?.toFixed(2) || "N/A"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Date</p>
                          <p>{formatDate(booking.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Payments