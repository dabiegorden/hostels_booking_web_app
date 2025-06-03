"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import {
  Check,
  Download,
  FileText,
  Info,
  ArrowLeft,
  Star,
  Calendar,
  MapPin,
  CreditCard,
  Sparkles,
} from "lucide-react";

export default function PaymentSuccessPage({ params }) {
  const resolvedParams = use(params);
  const bookingId = resolvedParams.id;
  const router = useRouter();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:5000/api/bookings/${bookingId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch booking details");
        }

        const data = await response.json();
        setBooking(data.booking);
        setLoading(false);

        // Trigger confetti animation after successful load
        setTimeout(() => setShowConfetti(true), 500);
      } catch (err) {
        console.error("Error fetching booking details:", err);
        setError(
          "Failed to load booking details. Please check your bookings page."
        );
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const handleDownloadReport = async () => {
    if (!booking) return;

    try {
      // Request booking report from the server
      const response = await fetch(
        `http://localhost:5000/api/bookings/${booking._id}/report`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate booking report");
      }

      // Get the blob from the response
      const blob = await response.blob();

      // Create a download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `booking-${booking._id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading report:", err);
      alert("Failed to download booking report. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16 flex justify-center items-center">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto"></div>
              <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-r-purple-400 animate-pulse mx-auto"></div>
            </div>
            <p className="mt-4 text-gray-600 font-medium">
              Loading your booking details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="bg-white p-8 rounded-2xl shadow-lg max-w-lg mx-auto border border-red-100">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Info className="text-red-500 w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              {error || "Booking information not found"}
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              We couldn't find details for your booking. It may have been
              processed successfully, but we're having trouble retrieving the
              information right now.
            </p>
            <div className="flex flex-col space-y-4">
              <Link
                href="/bookings"
                className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <FileText className="mr-2 h-5 w-5" />
                View My Bookings
              </Link>

              <Link
                href="/hostels"
                className="flex items-center justify-center bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-bold py-3 px-8 rounded-xl transition-all duration-200 transform hover:scale-105"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Return to Hostels
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* <Navbar /> */}

      {/* Animated background elements */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ top: "80px" }}
      >
        <div
          className={`absolute top-10 left-10 w-32 h-32 bg-green-200 rounded-full opacity-20 animate-bounce ${
            showConfetti ? "animate-ping" : ""
          }`}
        ></div>
        <div
          className={`absolute top-20 right-20 w-24 h-24 bg-blue-200 rounded-full opacity-20 animate-pulse ${
            showConfetti ? "animate-spin" : ""
          }`}
        ></div>
        <div
          className={`absolute bottom-20 left-20 w-28 h-28 bg-purple-200 rounded-full opacity-20 animate-bounce ${
            showConfetti ? "animate-pulse" : ""
          }`}
        ></div>
        <div
          className={`absolute bottom-10 right-10 w-20 h-20 bg-indigo-200 rounded-full opacity-20 animate-pulse ${
            showConfetti ? "animate-bounce" : ""
          }`}
        ></div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-12 relative">
        <div className="text-center mb-8">
          {/* Success animation */}
          <div
            className={`transform transition-all duration-1000 ${
              showConfetti ? "scale-100 opacity-100" : "scale-75 opacity-0"
            }`}
          >
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className="absolute inset-0 bg-green-100 rounded-full animate-ping"></div>
              <div className="relative w-32 h-32 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                <Check className="text-white w-16 h-16 animate-bounce" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="text-yellow-400 w-8 h-8 animate-pulse" />
              </div>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 animate-fade-in">
            🎉 Payment Successful! 🎉
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Congratulations! Your booking at{" "}
            <span className="font-semibold text-indigo-600">
              {booking.hostel?.name || "the hostel"}
            </span>{" "}
            is now fully confirmed and paid.
          </p>
        </div>

        {/* Enhanced booking details card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-gray-100 hover:shadow-3xl transition-all duration-300">
          {/* Booking header */}
          <div className="border-b border-gray-200 pb-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <Star className="text-yellow-400 w-6 h-6 mr-2" />
                Booking Confirmed
              </h2>
              <span className="bg-green-100 text-green-800 text-sm font-semibold px-4 py-2 rounded-full flex items-center">
                <CreditCard className="w-4 h-4 mr-1" />
                Fully Paid
              </span>
            </div>
            <p className="text-gray-600">
              Booking ID:{" "}
              <span className="font-mono text-indigo-600">{booking._id}</span>
            </p>
          </div>

          {/* Booking details grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-blue-50 rounded-xl">
                <MapPin className="text-blue-600 w-6 h-6 mr-3" />
                <div>
                  <p className="font-semibold text-gray-800">
                    {booking.room?.name || "Your Room"}
                  </p>
                  <p className="text-gray-600">
                    at {booking.hostel?.name || "the hostel"}
                  </p>
                </div>
              </div>

              <div className="flex items-center p-4 bg-purple-50 rounded-xl">
                <Calendar className="text-purple-600 w-6 h-6 mr-3" />
                <div>
                  <p className="font-semibold text-gray-800">
                    Duration: {booking.duration}
                  </p>
                  <p className="text-gray-600">
                    {new Date(booking.checkInDate).toLocaleDateString()} -{" "}
                    {new Date(booking.checkOutDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-green-600" />
                  Payment Summary
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-bold text-2xl text-green-600">
                      GH₵ {booking.totalAmount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status:</span>
                    <span className="font-semibold text-green-600">
                      ✓ Complete
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <button
            onClick={handleDownloadReport}
            className="flex items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer"
          >
            <Download className="mr-2 h-5 w-5" />
            Download Receipt
          </button>

          <Link
            href={`/bookings/${booking._id}`}
            className="flex items-center justify-center bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <FileText className="mr-2 h-5 w-5" />
            View Full Details
          </Link>

          <Link
            href="/bookings"
            className="flex items-center justify-center bg-gray-100 border-2 border-gray-300 text-gray-700 hover:bg-gray-200 font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            My Bookings
          </Link>
        </div>

        {/* Additional info */}
        <div className="mt-12 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 max-w-2xl mx-auto">
            <div className="flex items-start justify-center">
              <Info className="h-6 w-6 text-blue-500 mr-3 flex-shrink-0 mt-1" />
              <div className="text-left">
                <h3 className="font-bold text-blue-800 mb-2">What's Next?</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• You'll receive a confirmation email shortly</li>
                  <li>• Save your receipt for your records</li>
                  <li>• Arrive at the hostel on your check-in date</li>
                  <li>• Present your booking ID at reception</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
