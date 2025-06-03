"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
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
  AlertCircle,
} from "lucide-react";

export default function BookingSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Get parameters from URL - mobile money payments use reference and booking_id
  const reference = searchParams.get("reference");
  const bookingId = searchParams.get("booking_id");
  // Keep Stripe support for backward compatibility
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setLoading(true);

        let endpoint;

        if (reference && bookingId) {
          // Mobile money payment - verify payment and get booking details
          try {
            // First verify the payment with Paystack
            const verifyResponse = await fetch(
              `http://localhost:5000/api/payments/verify/${reference}`,
              {
                method: "GET",
                credentials: "include",
              }
            );

            if (verifyResponse.ok) {
              const verifyData = await verifyResponse.json();
              console.log("Payment verification:", verifyData);
            }

            // Then fetch the booking details
            endpoint = `http://localhost:5000/api/bookings/${bookingId}`;
          } catch (verifyError) {
            console.error("Payment verification error:", verifyError);
            // Continue to fetch booking even if verification fails
            endpoint = `http://localhost:5000/api/bookings/${bookingId}`;
          }
        } else if (sessionId) {
          // Stripe payment
          endpoint = `http://localhost:5000/api/bookings/stripe-success?session_id=${sessionId}`;
        } else if (bookingId) {
          // Direct booking ID access
          endpoint = `http://localhost:5000/api/bookings/${bookingId}`;
        } else {
          // Fallback to most recent booking
          endpoint = `http://localhost:5000/api/bookings/recent`;
        }

        const response = await fetch(endpoint, {
          method: "GET",
          credentials: "include",
        });

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

    fetchBookingDetails();
  }, [reference, bookingId, sessionId]);

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

  // Calculate payment amount based on payment status
  const paymentAmount =
    booking.paymentStatus === "Partial Payment"
      ? booking.totalAmount / 2
      : booking.totalAmount;
  const remainingAmount =
    booking.paymentStatus === "Partial Payment" ? booking.totalAmount / 2 : 0;

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-green-50 via-white to-blue-50">
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
            🎉 Booking Successful! 🎉
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Congratulations! Your booking at{" "}
            <span className="font-semibold text-indigo-600">
              {booking.hostel?.name || "the hostel"}
            </span>{" "}
            is now confirmed.
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
              <span
                className={`text-sm font-semibold px-4 py-2 rounded-full flex items-center ${
                  booking.paymentStatus === "Partial Payment"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                <CreditCard className="w-4 h-4 mr-1" />
                {booking.paymentStatus}
              </span>
            </div>
            <p className="text-gray-600">
              Booking ID:{" "}
              <span className="font-mono text-indigo-600">{booking._id}</span>
            </p>
            {reference && (
              <p className="text-gray-600 mt-1">
                Payment Reference:{" "}
                <span className="font-mono text-green-600">{reference}</span>
              </p>
            )}
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
                    <span className="text-gray-600">Amount Paid:</span>
                    <span className="font-bold text-green-600">
                      GH₵ {paymentAmount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-semibold text-blue-600">
                      Mobile Money
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status:</span>
                    <span
                      className={`font-semibold ${
                        booking.paymentStatus === "Partial Payment"
                          ? "text-amber-600"
                          : "text-green-600"
                      }`}
                    >
                      {booking.paymentStatus === "Partial Payment"
                        ? "⚠️ Partial"
                        : "✓ Complete"}
                    </span>
                  </div>
                  {remainingAmount > 0 && (
                    <div className="flex justify-between mt-2 pt-2 border-t border-amber-200">
                      <span className="text-amber-700 font-medium">
                        Remaining Balance:
                      </span>
                      <span className="font-bold text-amber-700">
                        GH₵ {remainingAmount}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Partial payment warning if applicable */}
          {booking.paymentStatus === "Partial Payment" && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-6 text-left">
              <div className="flex">
                <AlertCircle className="h-6 w-6 text-amber-500 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-amber-800">
                    Partial Payment Notice
                  </h3>
                  <p className="text-amber-700 mt-1">
                    You've made a partial payment for this booking. Please
                    remember to pay the remaining balance of GH₵{" "}
                    {remainingAmount} before your check-in date to secure your
                    reservation.
                  </p>
                </div>
              </div>
            </div>
          )}
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
