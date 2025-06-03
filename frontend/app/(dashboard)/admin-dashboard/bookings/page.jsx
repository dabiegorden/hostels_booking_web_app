"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  BookOpen,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Calendar,
  Building,
  User,
  DollarSign,
  Loader2,
  Filter,
  Clock,
  MapPin,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [bookingToUpdate, setBookingToUpdate] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/admin/bookings", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch bookings");
      }

      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusClick = (booking, status) => {
    setBookingToUpdate(booking);
    setNewStatus(status);
    setShowStatusModal(true);
  };

  const handleStatusConfirm = async () => {
    if (!bookingToUpdate || !newStatus) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/bookings/${bookingToUpdate._id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ bookingStatus: newStatus }),
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update booking status");
      }

      // Update booking in state
      setBookings(
        bookings.map((b) =>
          b._id === bookingToUpdate._id ? { ...b, bookingStatus: newStatus } : b
        )
      );

      toast.success(`Booking status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast.error("Failed to update booking status");
    } finally {
      setShowStatusModal(false);
      setBookingToUpdate(null);
      setNewStatus("");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border border-amber-200";
      case "confirmed":
        return "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border border-emerald-200";
      case "cancelled":
        return "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200";
      case "completed":
        return "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200";
      default:
        return "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-200";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "Full Payment":
        return "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border border-emerald-200";
      case "Partial Payment":
        return "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border border-amber-200";
      default:
        return "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="h-3 w-3 mr-1" />;
      case "confirmed":
        return <CheckCircle className="h-3 w-3 mr-1" />;
      case "cancelled":
        return <XCircle className="h-3 w-3 mr-1" />;
      case "completed":
        return <Sparkles className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    // Apply status filter
    if (statusFilter !== "all" && booking.bookingStatus !== statusFilter) {
      return false;
    }

    // Apply search filter
    const searchFields = [
      booking.student?.name,
      booking.student?.email,
      booking.student?.studentId,
      booking.hostel?.name,
      booking.room?.name,
      booking._id,
    ]
      .filter(Boolean)
      .map((field) => field.toLowerCase());

    return (
      searchTerm === "" ||
      searchFields.some((field) => field.includes(searchTerm.toLowerCase()))
    );
  });

  // Calculate stats for dashboard
  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.bookingStatus === "pending").length,
    confirmed: bookings.filter((b) => b.bookingStatus === "confirmed").length,
    completed: bookings.filter((b) => b.bookingStatus === "completed").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-2 sm:p-4 lg:p-6">
      {/* Compact Header Section */}
      <div className="relative mb-4 sm:mb-6 lg:mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl sm:rounded-3xl opacity-10 blur-xl"></div>
        <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-md border border-white/20 p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl sm:rounded-2xl blur opacity-75"></div>
                <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-2 sm:p-3 lg:p-4 rounded-xl sm:rounded-2xl">
                  <BookOpen className="h-4 w-4 sm:h-4 sm:w-4 lg:h-4 lg:w-4 text-white" />
                </div>
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-xl lg:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Booking Management
                </h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base lg:text-lg">
                  Manage and track all hostel bookings
                </p>
              </div>
            </div>

            {/* Quick Stats - Hidden on mobile, grid on tablet+ */}
            <div className="grid grid-cols-4 gap-2 sm:gap-4 lg:flex lg:space-x-6">
              <div className="text-center">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">
                  {stats.total}
                </div>
                <div className="text-xs sm:text-sm text-gray-500">Total</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-amber-600">
                  {stats.pending}
                </div>
                <div className="text-xs sm:text-sm text-gray-500">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-emerald-600">
                  {stats.confirmed}
                </div>
                <div className="text-xs sm:text-sm text-gray-500">
                  Confirmed
                </div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-indigo-600">
                  {stats.completed}
                </div>
                <div className="text-xs sm:text-sm text-gray-500">
                  Completed
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Search and Filter Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-white/20 mb-4 sm:mb-6 lg:mb-8">
        <div className="p-4 sm:p-6 border-b border-gray-100/50">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-6">
            {/* Search Bar */}
            <div className="relative flex-1">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-xl sm:rounded-2xl blur"></div>
              <div className="relative">
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5 z-10" />
                <input
                  type="text"
                  placeholder="Search bookings..."
                  className="pl-10 sm:pl-12 pr-4 sm:pr-6 py-3 sm:py-4 border-2 border-transparent rounded-xl sm:rounded-2xl w-full focus:outline-none focus:border-blue-500 bg-white/90 backdrop-blur-sm shadow-lg text-gray-700 placeholder-gray-400 transition-all duration-300 text-sm sm:text-base"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Filter Dropdown */}
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded-xl sm:rounded-2xl blur"></div>
              <div className="relative">
                <Filter className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5 z-10" />
                <select
                  className="pl-10 sm:pl-12 pr-4 sm:pr-6 py-3 sm:py-4 border-2 border-transparent rounded-xl sm:rounded-2xl focus:outline-none focus:border-indigo-500 bg-white/90 backdrop-blur-sm shadow-lg text-gray-700 transition-all duration-300 appearance-none cursor-pointer text-sm sm:text-base"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center p-8 sm:p-12 lg:p-16">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur opacity-75 animate-pulse"></div>
              <Loader2 className="relative h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 animate-spin text-blue-600" />
            </div>
            <p className="mt-4 text-gray-600 font-medium text-sm sm:text-base">
              Loading your bookings...
            </p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center p-8 sm:p-12 lg:p-16">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full blur opacity-50"></div>
              <BookOpen className="relative h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 text-gray-400 mx-auto mb-4" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
              No bookings found
            </h3>
            <p className="text-gray-500 text-sm sm:text-base">
              Try adjusting your search criteria or filters
            </p>
          </div>
        ) : (
          <div className="overflow-hidden">
            {/* Table wrapper with horizontal scroll */}
            <div className="overflow-x-auto">
              <div className="min-w-full inline-block align-middle">
                <table className="min-w-full" style={{ width: "max-content" }}>
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50/80 to-slate-50/80 backdrop-blur-sm">
                      <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                        Booking Details
                      </th>
                      <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                        Student Info
                      </th>
                      <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                        Accommodation
                      </th>
                      <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                        Duration
                      </th>
                      {/* <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                        Payment
                      </th> */}
                      {/* <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                        Status
                      </th> */}
                      {/* <th className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                        Actions
                      </th> */}
                    </tr>
                  </thead>
                  <tbody className="bg-white/50 backdrop-blur-sm divide-y divide-gray-100/50">
                    {filteredBookings.map((booking, index) => (
                      <tr
                        key={booking._id}
                        className="hover:bg-white/80 transition-all duration-300 group"
                      >
                        {/* <td className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6 whitespace-nowrap">
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <div className="relative flex-shrink-0">
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-lg sm:rounded-xl blur opacity-25"></div>
                              <div className="relative bg-gradient-to-r from-blue-500 to-indigo-600 p-2 sm:p-3 rounded-lg sm:rounded-xl">
                                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                              </div>
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs sm:text-sm font-bold text-gray-900 truncate">#{booking._id.substring(0, 8)}</div>
                              <div className="text-xs text-gray-500 flex items-center mt-1">
                                <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                                <span className="truncate">{new Date(booking.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </td> */}

                        <td className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6 whitespace-nowrap">
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <div className="relative flex-shrink-0">
                              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-500 rounded-lg sm:rounded-xl blur opacity-25"></div>
                              <div className="relative h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-r from-emerald-100 to-green-100 rounded-lg sm:rounded-xl flex items-center justify-center border border-emerald-200">
                                <User className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                              </div>
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs sm:text-sm font-bold text-gray-900 truncate max-w-32 sm:max-w-none">
                                {booking.student?.name || "Guest"}
                              </div>
                              <div className="text-xs text-gray-500 truncate max-w-32 sm:max-w-none">
                                {booking.student?.email ||
                                  booking.customerInfo?.email ||
                                  "N/A"}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6 whitespace-nowrap">
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl p-2 sm:p-3 border border-blue-100 min-w-48">
                            <div className="flex items-center text-xs sm:text-sm font-semibold text-blue-700">
                              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
                              <span className="truncate">
                                {booking.duration}
                              </span>
                            </div>
                            <div className="text-xs text-gray-600 mt-1 truncate">
                              {new Date(
                                booking.checkInDate
                              ).toLocaleDateString()}{" "}
                              -{" "}
                              {new Date(
                                booking.checkOutDate
                              ).toLocaleDateString()}
                            </div>
                          </div>
                        </td>

                        <td className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6 whitespace-nowrap">
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg sm:rounded-xl p-2 sm:p-3 border border-green-100 min-w-36">
                            <div className="flex items-center text-xs sm:text-sm font-bold text-green-700">
                              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                              <span className="truncate">
                                GH₵{" "}
                                {booking.totalAmount?.toLocaleString() || "0"}
                              </span>
                            </div>
                            <div className="mt-2">
                              <span
                                className={`px-2 sm:px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(
                                  booking.paymentStatus
                                )} truncate`}
                              >
                                {booking.paymentStatus}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6 whitespace-nowrap">
                          <span
                            className={`px-3 sm:px-4 py-2 inline-flex items-center text-xs leading-5 font-bold rounded-full ${getStatusColor(
                              booking.bookingStatus
                            )} shadow-sm`}
                          >
                            {getStatusIcon(booking.bookingStatus)}
                            <span className="truncate">
                              {booking.bookingStatus.charAt(0).toUpperCase() +
                                booking.bookingStatus.slice(1)}
                            </span>
                          </span>
                        </td>

                        <td className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6 whitespace-nowrap text-right">
                          <div className="flex justify-end space-x-2 sm:space-x-3">
                            {/* <Link
                              href={`/admin-dashboard/bookings/${booking._id}`}
                              className="relative group flex-shrink-0"
                              title="View Details"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-lg sm:rounded-xl blur opacity-0 group-hover:opacity-25 transition-all duration-300"></div>
                              <div className="relative bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-lg sm:rounded-xl text-white hover:shadow-lg transition-all duration-300">
                                <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                              </div>
                            </Link> */}

                            <div className="relative group flex-shrink-0">
                              {/* <div className="absolute inset-0 bg-gradient-to-r from-gray-400 to-slate-500 rounded-lg sm:rounded-xl blur opacity-0 group-hover:opacity-25 transition-all duration-300"></div>
                              <button className="relative bg-gradient-to-r from-slate-100 to-gray-100 hover:from-gray-200 hover:to-slate-200 p-2 rounded-lg sm:rounded-xl border border-gray-200 transition-all duration-300 shadow-sm hover:shadow-md" title="Change Status">
                                <span className="font-bold text-xs text-gray-700">Status</span>
                              </button> */}

                              <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-2xl border border-white/20 hidden group-hover:block z-20 overflow-hidden">
                                <div className="py-2">
                                  <button
                                    onClick={() =>
                                      handleStatusClick(booking, "confirmed")
                                    }
                                    className="block w-full text-left px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 transition-all duration-200"
                                  >
                                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 inline mr-2 sm:mr-3 text-emerald-500" />
                                    Mark as Confirmed
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleStatusClick(booking, "cancelled")
                                    }
                                    className="block w-full text-left px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 transition-all duration-200"
                                  >
                                    <XCircle className="h-3 w-3 sm:h-4 sm:w-4 inline mr-2 sm:mr-3 text-red-500" />
                                    Mark as Cancelled
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleStatusClick(booking, "completed")
                                    }
                                    className="block w-full text-left px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200"
                                  >
                                    <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 inline mr-2 sm:mr-3 text-blue-500" />
                                    Mark as Completed
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
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Status Update Confirmation Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl sm:rounded-3xl blur opacity-25"></div>
            <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20">
              <div className="text-center mb-6">
                <div className="relative inline-block mb-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-xl sm:rounded-2xl blur opacity-50"></div>
                  <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-3 sm:p-4 rounded-xl sm:rounded-2xl">
                    <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  Confirm Status Change
                </h3>
                <p className="text-gray-600 text-sm sm:text-base">
                  Are you sure you want to change the booking status to{" "}
                  <span className="font-semibold text-gray-800">
                    "{newStatus}"
                  </span>
                  ?
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="flex-1 px-4 sm:px-6 py-3 border-2 border-gray-200 rounded-xl sm:rounded-2xl hover:bg-gray-50 transition-all duration-300 font-semibold text-gray-700 text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusConfirm}
                  className="flex-1 px-4 sm:px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl sm:rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl text-sm sm:text-base"
                >
                  Confirm Change
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
