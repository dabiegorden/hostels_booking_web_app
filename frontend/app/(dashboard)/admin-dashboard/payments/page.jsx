"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { CreditCard, Search, Eye, CheckCircle, XCircle, Building, User, DollarSign, Loader2, Phone } from "lucide-react"
import Link from "next/link"

export default function Payments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [paymentToUpdate, setPaymentToUpdate] = useState(null)
  const [newStatus, setNewStatus] = useState("")

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:5000/api/admin/payments", {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch payments")
      }

      const data = await response.json()
      setPayments(data.payments || [])
    } catch (error) {
      console.error("Error fetching payments:", error)
      toast.error("Failed to load payments")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusClick = (payment, status) => {
    setPaymentToUpdate(payment)
    setNewStatus(status)
    setShowStatusModal(true)
  }

  const handleStatusConfirm = async () => {
    if (!paymentToUpdate || !newStatus) return

    try {
      const response = await fetch(`http://localhost:5000/api/admin/payments/${paymentToUpdate._id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to update payment status")
      }

      // Update payment in state
      setPayments(payments.map((p) => (p._id === paymentToUpdate._id ? { ...p, status: newStatus } : p)))

      toast.success(`Payment status updated to ${newStatus}`)
    } catch (error) {
      console.error("Error updating payment status:", error)
      toast.error("Failed to update payment status")
    } finally {
      setShowStatusModal(false)
      setPaymentToUpdate(null)
      setNewStatus("")
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
      case "refunded":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case "credit_card":
        return <CreditCard className="h-4 w-4 text-blue-600" />
      case "debit_card":
        return <CreditCard className="h-4 w-4 text-green-600" />
      case "mobile_money":
        return <Phone className="h-4 w-4 text-purple-600" />
      case "bank_transfer":
        return <Building className="h-4 w-4 text-amber-600" />
      case "cash":
        return <DollarSign className="h-4 w-4 text-green-600" />
      default:
        return <CreditCard className="h-4 w-4 text-gray-600" />
    }
  }

  const filteredPayments = payments.filter((payment) => {
    // Apply status filter
    if (statusFilter !== "all" && payment.status !== statusFilter) {
      return false
    }

    // Apply search filter
    const searchFields = [
      payment.student?.name,
      payment.student?.email,
      payment.student?.studentId,
      payment.hostel?.name,
      payment.transactionId,
      payment._id,
    ]
      .filter(Boolean)
      .map((field) => field.toLowerCase())

    return searchTerm === "" || searchFields.some((field) => field.includes(searchTerm.toLowerCase()))
  })

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center">
          <CreditCard className="mr-2 h-6 w-6" />
          Manage Payments
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm mb-6">
        <div className="p-4 border-b">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search payments by student, hostel, or transaction ID..."
                className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex-shrink-0">
              <select
                className="px-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="text-center p-8 text-gray-500">No payments found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hostel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {payment.transactionId.substring(0, 12)}...
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{payment.student?.name || "Guest"}</div>
                          <div className="text-xs text-gray-500">{payment.student?.email || "N/A"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 flex-shrink-0 bg-green-100 rounded-full flex items-center justify-center">
                          <Building className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {payment.hostel?.name || "Unknown Hostel"}
                          </div>
                          <div className="text-xs text-gray-500">
                            Booking: {payment.booking?._id.substring(0, 8) || "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1 text-green-500" />
                        <div className="text-sm font-medium text-gray-900">
                          GH₵ {payment.amount?.toLocaleString() || "0"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 flex-shrink-0 bg-purple-100 rounded-full flex items-center justify-center">
                          {getPaymentMethodIcon(payment.paymentMethod)}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm text-gray-900">
                            {payment.paymentMethod.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(payment.status)}`}
                      >
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          href={`/admin-dashboard/payments/${payment._id}`}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="View Details"
                        >
                          <Eye className="h-5 w-5" />
                        </Link>
                        <div className="relative group">
                          <button className="text-gray-600 hover:text-gray-900 p-1" title="Change Status">
                            <span className="font-medium text-xs">Status</span>
                          </button>
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg hidden group-hover:block z-10">
                            <div className="py-1">
                              <button
                                onClick={() => handleStatusClick(payment, "completed")}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <CheckCircle className="h-4 w-4 inline mr-2 text-green-500" />
                                Mark as Completed
                              </button>
                              <button
                                onClick={() => handleStatusClick(payment, "failed")}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <XCircle className="h-4 w-4 inline mr-2 text-red-500" />
                                Mark as Failed
                              </button>
                              <button
                                onClick={() => handleStatusClick(payment, "refunded")}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <CreditCard className="h-4 w-4 inline mr-2 text-blue-500" />
                                Mark as Refunded
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Status Update Confirmation Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Confirm Status Change</h3>
            <p className="mb-6">
              Are you sure you want to change the payment status to "{newStatus}"?
              {newStatus === "refunded" && (
                <span className="block mt-2 text-red-600">Note: This will also cancel the associated booking.</span>
              )}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusConfirm}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
