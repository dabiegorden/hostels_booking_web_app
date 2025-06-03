"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import {
  ArrowLeft,
  CreditCard,
  Phone,
  DollarSign,
  AlertTriangle,
  Loader2,
  CheckCircle,
  Info,
  Shield,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  Lock,
} from "lucide-react";

export default function CompletePaymentPage({ params }) {
  const resolvedParams = use(params);
  const bookingId = resolvedParams.id;
  const router = useRouter();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    paymentMethod: "card",
    mobileNetwork: "mtn",
    mobileNumber: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

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
          if (response.status === 401) {
            throw new Error("Please log in to complete payment");
          } else if (response.status === 403) {
            throw new Error("You are not authorized to access this booking");
          } else if (response.status === 404) {
            throw new Error("Booking not found");
          } else {
            throw new Error("Failed to fetch booking details");
          }
        }

        const data = await response.json();

        // Check if booking is eligible for payment completion
        if (data.booking.paymentStatus !== "Partial Payment") {
          throw new Error(
            "This booking is not eligible for payment completion"
          );
        }

        setBooking(data.booking);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching booking details:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }
  };

  const validateForm = () => {
    const errors = {};

    if (formData.paymentMethod === "mobile") {
      if (!formData.mobileNumber.trim()) {
        errors.mobileNumber = "Mobile money number is required";
      } else if (!/^\d{10}$/.test(formData.mobileNumber.replace(/\s/g, ""))) {
        errors.mobileNumber = "Please enter a valid 10-digit mobile number";
      }
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Calculate remaining amount (50% of total)
      const remainingAmount = booking.totalAmount / 2;

      if (formData.paymentMethod === "card") {
        // Create Stripe checkout session for remaining payment
        const response = await fetch(
          "http://localhost:5000/api/bookings/complete-checkout-session",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              bookingId: booking._id,
              paymentAmount: remainingAmount,
              successUrl: `${window.location.origin}/bookings/${booking._id}/complete-payment/success`,
              cancelUrl: `${window.location.origin}/bookings/${booking._id}/complete-payment`,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to create checkout session");
        }

        const { url } = await response.json();

        // Redirect to Stripe checkout
        window.location.href = url;
      } else if (formData.paymentMethod === "mobile") {
        // Process mobile money payment for remaining amount
        const response = await fetch(
          "http://localhost:5000/api/bookings/complete-mobile-payment",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              bookingId: booking._id,
              paymentAmount: remainingAmount,
              mobilePayment: {
                network: formData.mobileNetwork,
                phoneNumber: formData.mobileNumber,
              },
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to process mobile money payment");
        }

        // Set payment success and show success message
        setPaymentSuccess(true);

        // Redirect to success page after a delay
        setTimeout(() => {
          router.push(`/bookings/${booking._id}/complete-payment/success`);
        }, 2000);
      }
    } catch (err) {
      console.error("Error processing payment:", err);
      setFormErrors({
        submit: "Failed to process your payment. Please try again.",
      });
      setIsSubmitting(false);
    }
  };

  // Calculate remaining amount (50% of total)
  const calculateRemainingAmount = (booking) => {
    return booking ? booking.totalAmount / 2 : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center h-64">
            <div className="relative">
              <div className="h-20 w-20 border-4 border-indigo-200 rounded-full animate-pulse"></div>
              <div className="absolute top-0 left-0 h-20 w-20 border-4 border-indigo-600 rounded-full animate-spin border-t-transparent"></div>
            </div>
            <p className="text-gray-600 mt-6 text-lg font-medium">
              Loading your booking details...
            </p>
            <div className="flex space-x-1 mt-4">
              <div className="h-2 w-2 bg-indigo-600 rounded-full animate-bounce"></div>
              <div
                className="h-2 w-2 bg-indigo-600 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="h-2 w-2 bg-indigo-600 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto text-center backdrop-blur-sm border border-red-100">
            <div className="mb-6">
              <div className="bg-red-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <AlertTriangle className="h-10 w-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Oops! Something went wrong
              </h2>
              <p className="text-gray-600 mb-6">{error}</p>
            </div>
            <Link
              href="/bookings"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-xl inline-block transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Back to Bookings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto text-center backdrop-blur-sm border border-green-100">
            <div className="mb-6">
              <div className="bg-green-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center animate-pulse">
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
              <div className="relative">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Payment Successful!
                </h2>
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                Your payment has been processed successfully. Redirecting to the
                confirmation page...
              </p>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
              <span className="text-green-600 font-medium">Processing...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto text-center backdrop-blur-sm border border-gray-100">
            <div className="mb-6">
              <div className="bg-gray-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Info className="h-10 w-10 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Booking Not Found
              </h2>
              <p className="text-gray-600 mb-6">
                The booking you're looking for doesn't exist or you don't have
                permission to view it.
              </p>
            </div>
            <Link
              href="/bookings"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-xl inline-block transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Back to Bookings
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const remainingAmount = calculateRemainingAmount(booking);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href={`/bookings/${bookingId}`}
            className="text-indigo-600 hover:text-indigo-800 flex items-center group transition-all duration-200"
          >
            <ArrowLeft
              size={18}
              className="mr-2 group-hover:-translate-x-1 transition-transform duration-200"
            />
            <span className="font-medium">Back to Booking Details</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm border border-white/20">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-2 rounded-full">
                    <Lock className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">
                      Complete Your Payment
                    </h1>
                    <p className="text-indigo-100 mt-1">
                      Secure & encrypted payment processing
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <div className="flex">
                    <div className="bg-blue-100 p-2 rounded-full mr-4">
                      <Info className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900">
                        Payment Information
                      </h3>
                      <p className="text-sm text-blue-700 mt-1">
                        You're completing the remaining payment for your booking
                        at{" "}
                        <span className="font-medium">
                          {booking.hostel?.name || "the hostel"}
                        </span>
                        . After this payment, your booking will be fully
                        confirmed and paid.
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-4">
                      Choose Your Payment Method
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div
                        className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 transform hover:scale-105 ${
                          formData.paymentMethod === "card"
                            ? "border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-md"
                            : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-md"
                        }`}
                        onClick={() =>
                          setFormData({ ...formData, paymentMethod: "card" })
                        }
                      >
                        {formData.paymentMethod === "card" && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle className="h-5 w-5 text-indigo-600" />
                          </div>
                        )}
                        <input
                          type="radio"
                          id="card"
                          name="paymentMethod"
                          value="card"
                          checked={formData.paymentMethod === "card"}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <label htmlFor="card" className="cursor-pointer">
                          <div className="flex items-center">
                            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg mr-3">
                              <CreditCard className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">
                                Credit/Debit Card
                              </div>
                              <div className="text-sm text-gray-500">
                                Secure payment with Stripe
                              </div>
                            </div>
                          </div>
                        </label>
                      </div>

                      <div
                        className={`relative border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 transform hover:scale-105 ${
                          formData.paymentMethod === "mobile"
                            ? "border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-md"
                            : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-md"
                        }`}
                        onClick={() =>
                          setFormData({ ...formData, paymentMethod: "mobile" })
                        }
                      >
                        {formData.paymentMethod === "mobile" && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle className="h-5 w-5 text-indigo-600" />
                          </div>
                        )}
                        <input
                          type="radio"
                          id="mobile"
                          name="paymentMethod"
                          value="mobile"
                          checked={formData.paymentMethod === "mobile"}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <label htmlFor="mobile" className="cursor-pointer">
                          <div className="flex items-center">
                            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-lg mr-3">
                              <Phone className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">
                                Mobile Money
                              </div>
                              <div className="text-sm text-gray-500">
                                MTN, Vodafone, AirtelTigo
                              </div>
                            </div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Money Payment Fields */}
                  {formData.paymentMethod === "mobile" && (
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200 transition-all duration-300 transform scale-100">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <Phone className="h-5 w-5 mr-2 text-indigo-600" />
                        Mobile Money Details
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label
                            htmlFor="mobileNetwork"
                            className="block text-sm font-medium text-gray-700 mb-2"
                          >
                            Select Your Network
                          </label>
                          <select
                            id="mobileNetwork"
                            name="mobileNetwork"
                            value={formData.mobileNetwork}
                            onChange={handleInputChange}
                            className="block w-full py-3 px-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white"
                          >
                            <option value="mtn">MTN Mobile Money</option>
                            <option value="vodafone">Vodafone Cash</option>
                            <option value="airtel">AirtelTigo Money</option>
                          </select>
                        </div>

                        <div>
                          <label
                            htmlFor="mobileNumber"
                            className="block text-sm font-medium text-gray-700 mb-2"
                          >
                            Mobile Money Number
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Phone className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="tel"
                              id="mobileNumber"
                              name="mobileNumber"
                              value={formData.mobileNumber}
                              onChange={handleInputChange}
                              className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ${
                                formErrors.mobileNumber
                                  ? "border-red-300 bg-red-50"
                                  : "border-gray-300 bg-white"
                              }`}
                              placeholder="0XX XXX XXXX"
                            />
                          </div>
                          {formErrors.mobileNumber && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                              <AlertTriangle className="h-4 w-4 mr-1" />
                              {formErrors.mobileNumber}
                            </p>
                          )}
                        </div>

                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex">
                            <div className="bg-yellow-100 p-1 rounded-full mr-3">
                              <Info className="h-4 w-4 text-yellow-600" />
                            </div>
                            <div>
                              <p className="text-sm text-yellow-800">
                                <strong>Important:</strong> After clicking
                                "Complete Payment", you'll receive a prompt on
                                your phone to authorize the payment. Please
                                follow the instructions to complete your
                                transaction.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {formErrors.submit && (
                    <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
                      <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 text-red-500" />
                      <span className="font-medium">{formErrors.submit}</span>
                    </div>
                  )}

                  <div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-white font-semibold transition-all duration-200 transform ${
                        isSubmitting
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:scale-105 hover:shadow-xl"
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                          Processing Payment...
                        </>
                      ) : (
                        <>
                          <Lock className="h-5 w-5 mr-2" />
                          Complete Payment with{" "}
                          {formData.paymentMethod === "card"
                            ? "Card"
                            : "Mobile Money"}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div>
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden sticky top-8 backdrop-blur-sm border border-white/20">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 text-white">
                <h2 className="text-lg font-bold flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Payment Summary
                </h2>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <h3 className="font-bold text-gray-900 text-lg">
                    {booking.room?.name || "Room"}
                  </h3>
                  <div className="flex items-center text-gray-600 text-sm mt-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{booking.hostel?.name || "Hostel"}</span>
                  </div>
                  <p className="text-gray-500 text-sm">
                    {booking.hostel?.address || "Address"}
                  </p>
                </div>

                <div className="border-t border-gray-200 pt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Duration
                    </span>
                    <span className="font-medium bg-indigo-50 px-2 py-1 rounded-md text-indigo-700">
                      {booking.duration}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Check-in
                    </span>
                    <span className="font-medium">
                      {new Date(booking.checkInDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Check-out
                    </span>
                    <span className="font-medium">
                      {new Date(booking.checkOutDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-200 mt-6 pt-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Cost</span>
                      <span className="font-medium">
                        GH₵ {booking.totalAmount}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Already Paid (50%)</span>
                      <span className="font-medium text-green-600">
                        <CheckCircle className="inline h-4 w-4 mr-1" />
                        GH₵ {remainingAmount}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                      <span className="text-xl font-bold text-gray-900">
                        Amount to Pay
                      </span>
                      <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        GH₵ {remainingAmount}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg">
                    <div className="flex items-center text-sm text-green-700">
                      <Shield className="h-4 w-4 mr-2 text-green-600" />
                      <span className="font-medium">
                        Secure payment with{" "}
                        {formData.paymentMethod === "card"
                          ? "Stripe"
                          : "Mobile Money"}
                      </span>
                    </div>
                    <p className="text-xs text-green-600 mt-1">
                      Your payment information is protected with bank-level
                      security
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
