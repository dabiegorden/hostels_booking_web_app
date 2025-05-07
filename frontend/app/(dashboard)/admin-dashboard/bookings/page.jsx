"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MoreHorizontal, Search, Eye, BookOpen, RefreshCw } from "lucide-react"
import { toast } from "sonner"

export default function BookingsPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [bookings, setBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [openViewDialog, setOpenViewDialog] = useState(false)
  const [openStatusDialog, setOpenStatusDialog] = useState(false)
  const [currentBooking, setCurrentBooking] = useState(null)
  const [newStatus, setNewStatus] = useState("")

  useEffect(() => {
    // Check authentication
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Authentication failed")
      }

      const data = await response.json()

      if (!data.user || data.user.role !== "admin") {
        toast.error("Access denied. Admin privileges required.")
        router.push("/auth/login")
        return
      }

      setUser(data.user)

      // Fetch bookings
      fetchBookings()
    } catch (error) {
      console.error("Auth error:", error)
      toast.error("Authentication failed. Please login again.")
      router.push("/auth/login")
    }
  }

  const fetchBookings = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/bookings`, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch bookings")
      }

      const data = await response.json()
      setBookings(data.bookings)
    } catch (error) {
      console.error("Error fetching bookings:", error)
      toast.error("Failed to load bookings.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewBooking = (booking) => {
    setCurrentBooking(booking)
    setOpenViewDialog(true)
  }

  const handleStatusClick = (booking) => {
    setCurrentBooking(booking)
    setNewStatus(booking.bookingStatus)
    setOpenStatusDialog(true)
  }

  const handleUpdateStatus = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings/${currentBooking._id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookingStatus: newStatus }),
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update booking status")
      }

      toast.success("Booking status updated successfully.")
      setOpenStatusDialog(false)
      fetchBookings()
    } catch (error) {
      console.error("Error updating booking status:", error)
      toast.error(error.message || "Failed to update booking status.")
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Confirmed</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Cancelled</Badge>
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Completed</Badge>
      default:
        return <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-200">{status}</Badge>
    }
  }

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Paid</Badge>
      case "partial":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Partial</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>
      default:
        return <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-200">{status}</Badge>
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const filteredBookings = bookings.filter((booking) => {
    const searchTermLower = searchTerm.toLowerCase()
    return (
      booking.student?.name?.toLowerCase().includes(searchTermLower) ||
      booking.hostel?.name?.toLowerCase().includes(searchTermLower) ||
      booking.room?.roomNumber?.toLowerCase().includes(searchTermLower) ||
      booking.bookingStatus?.toLowerCase().includes(searchTermLower)
    )
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-lg shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Bookings</h1>
          <p className="text-slate-500 mt-1">Manage and track all hostel bookings</p>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-slate-100">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Search bookings..."
            className="pl-8 bg-slate-50 border-slate-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-slate-800 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-amber-500" />
              Booking Records
            </CardTitle>
            <div className="text-sm text-slate-500">Total: {bookings.length}</div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold">Student</TableHead>
                <TableHead className="font-semibold">Hostel</TableHead>
                <TableHead className="font-semibold">Room</TableHead>
                <TableHead className="font-semibold">Check-in</TableHead>
                <TableHead className="font-semibold">Duration</TableHead>
                <TableHead className="font-semibold">Amount</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                    {searchTerm ? "No bookings found matching your search." : "No bookings found."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredBookings.map((booking) => (
                  <TableRow key={booking._id} className="hover:bg-slate-50">
                    <TableCell className="font-medium text-slate-900">{booking.student?.name || "Unknown"}</TableCell>
                    <TableCell className="text-slate-700">{booking.hostel?.name || "Unknown"}</TableCell>
                    <TableCell className="text-slate-700">
                      {booking.room?.roomNumber || "Unknown"} ({booking.room?.type || "N/A"})
                    </TableCell>
                    <TableCell className="text-slate-700">{formatDate(booking.checkInDate)}</TableCell>
                    <TableCell className="text-slate-700">{booking.duration} month(s)</TableCell>
                    <TableCell className="text-slate-700 font-medium">{formatCurrency(booking.totalAmount)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {getStatusBadge(booking.bookingStatus)}
                        <div className="mt-1">{getPaymentStatusBadge(booking.paymentStatus)}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-slate-700">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="border-slate-200">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleViewBooking(booking)} className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4 text-blue-500" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusClick(booking)} className="cursor-pointer">
                            <RefreshCw className="mr-2 h-4 w-4 text-amber-500" />
                            Update Status
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Booking Dialog */}
      <Dialog open={openViewDialog} onOpenChange={setOpenViewDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader className="bg-amber-50 -mx-6 -mt-6 p-6 rounded-t-lg">
            <DialogTitle className="text-amber-700">Booking Details</DialogTitle>
          </DialogHeader>
          {currentBooking && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Student</p>
                  <p className="text-slate-900 font-medium">{currentBooking.student?.name || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Student ID</p>
                  <p className="text-slate-900">{currentBooking.student?.studentId || "N/A"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Hostel</p>
                  <p className="text-slate-900">{currentBooking.hostel?.name || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Room</p>
                  <p className="text-slate-900">
                    {currentBooking.room?.roomNumber || "Unknown"} ({currentBooking.room?.type || "N/A"})
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Check-in Date</p>
                  <p className="text-slate-900">{formatDate(currentBooking.checkInDate)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Check-out Date</p>
                  <p className="text-slate-900">{formatDate(currentBooking.checkOutDate)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Duration</p>
                  <p className="text-slate-900">{currentBooking.duration} month(s)</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Total Amount</p>
                  <p className="text-slate-900 font-semibold">{formatCurrency(currentBooking.totalAmount)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Booking Status</p>
                  <p className="text-slate-900">{getStatusBadge(currentBooking.bookingStatus)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Payment Status</p>
                  <p className="text-slate-900">{getPaymentStatusBadge(currentBooking.paymentStatus)}</p>
                </div>
              </div>
              {currentBooking.specialRequests && (
                <div>
                  <p className="text-sm font-medium text-slate-500">Special Requests</p>
                  <p className="text-slate-900">{currentBooking.specialRequests}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setOpenViewDialog(false)} className="bg-amber-600 hover:bg-amber-700">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={openStatusDialog} onOpenChange={setOpenStatusDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader className="bg-amber-50 -mx-6 -mt-6 p-6 rounded-t-lg">
            <DialogTitle className="text-amber-700">Update Booking Status</DialogTitle>
            <DialogDescription>
              Change the status of booking for {currentBooking?.student?.name}'s reservation
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Status</label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 mt-1">
                Note: Changing to "Cancelled" will make the room available for new bookings.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setOpenStatusDialog(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleUpdateStatus} className="bg-amber-600 hover:bg-amber-700">
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
