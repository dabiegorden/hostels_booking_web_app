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
import { MoreHorizontal, Search, Eye, CreditCard, CheckCircle, RefreshCw } from "lucide-react"
import { toast } from "sonner"

export default function PaymentsPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [payments, setPayments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [openViewDialog, setOpenViewDialog] = useState(false)
  const [openStatusDialog, setOpenStatusDialog] = useState(false)
  const [currentPayment, setCurrentPayment] = useState(null)
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

      // Fetch payments
      fetchPayments()
    } catch (error) {
      console.error("Auth error:", error)
      toast.error("Authentication failed. Please login again.")
      router.push("/auth/login")
    }
  }

  const fetchPayments = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/payments`, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch payments")
      }

      const data = await response.json()
      setPayments(data.payments)
    } catch (error) {
      console.error("Error fetching payments:", error)
      toast.error("Failed to load payments.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewPayment = (payment) => {
    setCurrentPayment(payment)
    setOpenViewDialog(true)
  }

  const handleStatusClick = (payment) => {
    setCurrentPayment(payment)
    setNewStatus(payment.status)
    setOpenStatusDialog(true)
  }

  const handleUpdateStatus = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/payments/${currentPayment._id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
          credentials: "include",
        },
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update payment status")
      }

      toast.success("Payment status updated successfully.")
      setOpenStatusDialog(false)
      fetchPayments()
    } catch (error) {
      console.error("Error updating payment status:", error)
      toast.error(error.message || "Failed to update payment status.")
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Completed</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Failed</Badge>
      case "refunded":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Refunded</Badge>
      default:
        return <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-200">{status}</Badge>
    }
  }

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case "credit_card":
      case "debit_card":
        return <CreditCard className="h-4 w-4 text-purple-500" />
      case "bank_transfer":
        return <RefreshCw className="h-4 w-4 text-blue-500" />
      case "cash":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "mobile_money":
        return <CreditCard className="h-4 w-4 text-orange-500" />
      default:
        return <CreditCard className="h-4 w-4 text-slate-500" />
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const filteredPayments = payments.filter((payment) => {
    const searchTermLower = searchTerm.toLowerCase()
    return (
      payment.student?.name?.toLowerCase().includes(searchTermLower) ||
      payment.hostel?.name?.toLowerCase().includes(searchTermLower) ||
      payment.transactionId?.toLowerCase().includes(searchTermLower) ||
      payment.status?.toLowerCase().includes(searchTermLower) ||
      payment.paymentMethod?.toLowerCase().includes(searchTermLower)
    )
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-lg shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Payments</h1>
          <p className="text-slate-500 mt-1">Manage and track all payment transactions</p>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-slate-100">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Search payments..."
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
              <CreditCard className="h-5 w-5 text-green-500" />
              Payment Transactions
            </CardTitle>
            <div className="text-sm text-slate-500">Total: {payments.length}</div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold">Transaction ID</TableHead>
                <TableHead className="font-semibold">Student</TableHead>
                <TableHead className="font-semibold">Hostel</TableHead>
                <TableHead className="font-semibold">Amount</TableHead>
                <TableHead className="font-semibold">Method</TableHead>
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                    {searchTerm ? "No payments found matching your search." : "No payments found."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((payment) => (
                  <TableRow key={payment._id} className="hover:bg-slate-50">
                    <TableCell className="font-medium text-slate-900">{payment.transactionId}</TableCell>
                    <TableCell className="text-slate-700">{payment.student?.name || "Unknown"}</TableCell>
                    <TableCell className="text-slate-700">{payment.hostel?.name || "Unknown"}</TableCell>
                    <TableCell className="text-slate-700 font-medium">{formatCurrency(payment.amount)}</TableCell>
                    <TableCell className="text-slate-700">
                      <div className="flex items-center gap-1">
                        {getPaymentMethodIcon(payment.paymentMethod)}
                        <span className="capitalize">{payment.paymentMethod?.replace("_", " ")}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-700">{formatDate(payment.paymentDate)}</TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
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
                          <DropdownMenuItem onClick={() => handleViewPayment(payment)} className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4 text-blue-500" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusClick(payment)} className="cursor-pointer">
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

      {/* View Payment Dialog */}
      <Dialog open={openViewDialog} onOpenChange={setOpenViewDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader className="bg-green-50 -mx-6 -mt-6 p-6 rounded-t-lg">
            <DialogTitle className="text-green-700">Payment Details</DialogTitle>
          </DialogHeader>
          {currentPayment && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Transaction ID</p>
                  <p className="text-slate-900 font-medium">{currentPayment.transactionId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Status</p>
                  <p className="text-slate-900">{getStatusBadge(currentPayment.status)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Student</p>
                  <p className="text-slate-900">{currentPayment.student?.name || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Student ID</p>
                  <p className="text-slate-900">{currentPayment.student?.studentId || "N/A"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Hostel</p>
                  <p className="text-slate-900">{currentPayment.hostel?.name || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Amount</p>
                  <p className="text-slate-900 font-semibold">{formatCurrency(currentPayment.amount)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Payment Method</p>
                  <p className="text-slate-900 capitalize flex items-center gap-1">
                    {getPaymentMethodIcon(currentPayment.paymentMethod)}
                    <span>{currentPayment.paymentMethod?.replace("_", " ")}</span>
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Payment Date</p>
                  <p className="text-slate-900">{formatDate(currentPayment.paymentDate)}</p>
                </div>
              </div>
              {currentPayment.booking && (
                <div>
                  <p className="text-sm font-medium text-slate-500">Booking Details</p>
                  <p className="text-slate-900">
                    Status: {currentPayment.booking.bookingStatus}
                    <br />
                    Duration: {currentPayment.booking.duration} month(s)
                    <br />
                    Total Amount: {formatCurrency(currentPayment.booking.totalAmount)}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setOpenViewDialog(false)} className="bg-green-600 hover:bg-green-700">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={openStatusDialog} onOpenChange={setOpenStatusDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader className="bg-amber-50 -mx-6 -mt-6 p-6 rounded-t-lg">
            <DialogTitle className="text-amber-700">Update Payment Status</DialogTitle>
            <DialogDescription>Change the status of payment {currentPayment?.transactionId}</DialogDescription>
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
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 mt-1">
                Note: Changing to "Refunded" will also update the associated booking status.
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
