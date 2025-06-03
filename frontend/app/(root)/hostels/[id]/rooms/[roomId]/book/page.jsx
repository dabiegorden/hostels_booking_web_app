"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import {
  ArrowLeft,
  Calendar,
  User,
  Mail,
  Phone,
  AlertCircle,
  DollarSign,
  Smartphone,
} from "lucide-react";

// Import Paystack Popup
import PaystackPop from "@paystack/inline-js";

export default function BookRoomPage({ params }) {
  const resolvedParams = use(params);
  const { id: hostelId, roomId } = resolvedParams;
  const router = useRouter();

  const [room, setRoom] = useState(null);
  const [hostel, setHostel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    checkInDate: "",
    duration: "First Semester",
    paymentType: "Partial Payment", // Default to partial payment
    mobileNetwork: "mtn",
    mobileNumber: "",
    agreeToTerms: false,
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchRoomAndHostel = async () => {
      try {
        setLoading(true);

        // Fetch room details
        const roomResponse = await fetch(
          `http://localhost:5000/api/public/rooms/${roomId}`
        );
        if (!roomResponse.ok) {
          throw new Error("Failed to fetch room details");
        }
        const roomData = await roomResponse.json();
        setRoom(roomData.room);

        // Fetch hostel details
        const hostelResponse = await fetch(
          `http://localhost:5000/api/public/hostels/${hostelId}`
        );
        if (!hostelResponse.ok) {
          throw new Error("Failed to fetch hostel details");
        }
        const hostelData = await hostelResponse.json();
        setHostel(hostelData.hostel);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load room details. Please try again later.");
        setLoading(false);
      }
    };

    if (hostelId && roomId) {
      fetchRoomAndHostel();
    }
  }, [hostelId, roomId]);

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

    if (!formData.fullName.trim()) {
      errors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    }

    if (!formData.checkInDate) {
      errors.checkInDate = "Check-in date is required";
    } else {
      const selectedDate = new Date(formData.checkInDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        errors.checkInDate = "Check-in date cannot be in the past";
      }
    }

    if (!formData.mobileNumber.trim()) {
      errors.mobileNumber = "Mobile money number is required";
    } else if (!/^\d{10}$/.test(formData.mobileNumber.replace(/\s/g, ""))) {
      errors.mobileNumber = "Please enter a valid 10-digit mobile number";
    }

    if (!formData.agreeToTerms) {
      errors.agreeToTerms = "You must agree to the terms and conditions";
    }

    return errors;
  };

  const calculateCheckoutDate = (checkInDate, duration) => {
    const date = new Date(checkInDate);

    // Calculate checkout date based on semester duration
    switch (duration) {
      case "First Semester":
        // First semester is 3 months
        date.setMonth(date.getMonth() + 3);
        break;
      case "Second Semester":
        // Second semester is 3 months
        date.setMonth(date.getMonth() + 3);
        break;
      case "Full Year":
        // Full year is 6 months (2 semesters)
        date.setMonth(date.getMonth() + 6);
        break;
      default:
        // Default to 3 months if unknown
        date.setMonth(date.getMonth() + 3);
    }

    return date.toISOString();
  };

  // Calculate total price - duration doesn't affect price, only payment type does
  const calculateTotalPrice = (basePrice, duration) => {
    // basePrice is the price for ANY duration (First Semester, Second Semester, or Full Year)
    // Duration is just how long they stay, not a price modifier
    return basePrice; // Always return the full price regardless of duration
  };

  // Calculate payment amount based on payment type only
  const calculatePaymentAmount = (totalPrice, paymentType) => {
    // Only payment type affects the amount to pay now
    return paymentType === "Partial Payment" ? totalPrice / 2 : totalPrice;
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
      // Calculate checkout date and total amount
      const checkOutDate = calculateCheckoutDate(
        formData.checkInDate,
        formData.duration
      );
      const totalAmount = calculateTotalPrice(room.price, formData.duration);
      const paymentAmount = calculatePaymentAmount(
        totalAmount,
        formData.paymentType
      );

      // Prepare customer info
      const customerInfo = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
      };

      // Initialize transaction with backend
      const response = await fetch(
        "http://localhost:5000/api/bookings/initialize-payment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            hostelId,
            roomId,
            checkInDate: formData.checkInDate,
            checkOutDate,
            duration: formData.duration,
            totalAmount,
            paymentAmount,
            paymentType: formData.paymentType,
            customerInfo,
            mobilePayment: {
              network: formData.mobileNetwork,
              phoneNumber: formData.mobileNumber,
            },
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to initialize payment");
      }

      if (result.success && result.access_code) {
        // Use Paystack Popup to complete the transaction
        const popup = new PaystackPop();

        popup.resumeTransaction(result.access_code, {
          onSuccess: (transaction) => {
            console.log("Payment successful:", transaction);
            // Redirect to success page with transaction reference
            router.push(
              `/bookings/success?reference=${
                transaction.reference || result.reference
              }&booking_id=${result.bookingId}`
            );
          },
          onCancel: () => {
            console.log("Payment cancelled");
            setFormErrors({
              submit: "Payment was cancelled. Please try again.",
            });
            setIsSubmitting(false);
          },
          onError: (error) => {
            console.error("Payment error:", error);
            setFormErrors({
              submit: "Payment failed. Please try again.",
            });
            setIsSubmitting(false);
          },
        });
      } else {
        throw new Error(result.message || "Failed to get payment access code");
      }
    } catch (err) {
      console.error("Error processing payment:", err);
      setFormErrors({
        submit:
          err.message || "Failed to process your payment. Please try again.",
      });
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error || !room || !hostel) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {error || "Room not found"}
          </h2>
          <Link href={`/hostels/${hostelId}`}>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-md">
              Back to Hostel
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // Calculate total price and payment amount
  const totalPrice = calculateTotalPrice(room.price, formData.duration);
  const paymentAmount = calculatePaymentAmount(
    totalPrice,
    formData.paymentType
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href={`/hostels/${hostelId}/rooms/${roomId}`}
            className="text-indigo-600 hover:underline flex items-center"
          >
            <ArrowLeft size={18} className="mr-1" /> Back to Room Details
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">
                Book Your Stay
              </h1>

              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <label
                      htmlFor="fullName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className={`block w-full pl-10 pr-3 py-2 border ${
                          formErrors.fullName
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`}
                        placeholder="John Doe"
                      />
                    </div>
                    {formErrors.fullName && (
                      <p className="mt-1 text-sm text-red-600">
                        {formErrors.fullName}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Email
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`block w-full pl-10 pr-3 py-2 border ${
                            formErrors.email
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`}
                          placeholder="your@email.com"
                        />
                      </div>
                      {formErrors.email && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Phone Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={`block w-full pl-10 pr-3 py-2 border ${
                            formErrors.phone
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`}
                          placeholder="+233 XX XXX XXXX"
                        />
                      </div>
                      {formErrors.phone && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="checkInDate"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Check-in Date
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Calendar className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="date"
                          id="checkInDate"
                          name="checkInDate"
                          value={formData.checkInDate}
                          onChange={handleInputChange}
                          min={new Date().toISOString().split("T")[0]}
                          className={`block w-full pl-10 pr-3 py-2 border ${
                            formErrors.checkInDate
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`}
                        />
                      </div>
                      {formErrors.checkInDate && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.checkInDate}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="duration"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Duration
                      </label>
                      <select
                        id="duration"
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                        className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="First Semester">
                          First Semester (3 months)
                        </option>
                        <option value="Second Semester">
                          Second Semester (3 months)
                        </option>
                        <option value="Full Year">
                          Full Academic Year (6 months)
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* Payment Type Selection - Only show for Full Year */}
                  {formData.duration === "Full Year" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Payment Type
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div
                          className={`border ${
                            formData.paymentType === "Partial Payment"
                              ? "border-indigo-500 bg-indigo-50"
                              : "border-gray-300"
                          } rounded-md p-4 flex items-center cursor-pointer transition-all hover:border-indigo-300`}
                          onClick={() =>
                            setFormData({
                              ...formData,
                              paymentType: "Partial Payment",
                            })
                          }
                        >
                          <input
                            type="radio"
                            id="partialPayment"
                            name="paymentType"
                            value="Partial Payment"
                            checked={formData.paymentType === "Partial Payment"}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                          />
                          <label
                            htmlFor="partialPayment"
                            className="ml-3 block text-sm font-medium text-gray-700 cursor-pointer"
                          >
                            <div>
                              <div className="font-medium">
                                Partial Payment (Recommended)
                              </div>
                              <div className="text-xs text-gray-500">
                                Pay 50% now, 50% later
                              </div>
                              <div className="text-xs text-green-600 font-medium">
                                Pay GH₵ {(room.price / 2).toFixed(2)} now
                              </div>
                            </div>
                          </label>
                        </div>

                        <div
                          className={`border ${
                            formData.paymentType === "Full Payment"
                              ? "border-indigo-500 bg-indigo-50"
                              : "border-gray-300"
                          } rounded-md p-4 flex items-center cursor-pointer transition-all hover:border-indigo-300`}
                          onClick={() =>
                            setFormData({
                              ...formData,
                              paymentType: "Full Payment",
                            })
                          }
                        >
                          <input
                            type="radio"
                            id="fullPayment"
                            name="paymentType"
                            value="Full Payment"
                            checked={formData.paymentType === "Full Payment"}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                          />
                          <label
                            htmlFor="fullPayment"
                            className="ml-3 block text-sm font-medium text-gray-700 cursor-pointer"
                          >
                            <div>
                              <div className="font-medium">Full Payment</div>
                              <div className="text-xs text-gray-500">
                                Pay the entire amount now
                              </div>
                              <div className="text-xs text-blue-600 font-medium">
                                Pay GH₵ {room.price.toFixed(2)} now
                              </div>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mobile Money Payment Section */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
                    <div className="flex items-center mb-4">
                      <Smartphone className="h-6 w-6 text-green-600 mr-2" />
                      <h3 className="text-lg font-medium text-gray-900">
                        Mobile Money Payment
                      </h3>
                    </div>

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
                          className="block w-full py-3 px-4 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        >
                          <option value="mtn">MTN Mobile Money</option>
                          <option value="vodafone">Vodafone Cash</option>
                          <option value="airteltigo">AirtelTigo Money</option>
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
                            className={`block w-full pl-10 pr-3 py-3 border ${
                              formErrors.mobileNumber
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white`}
                            placeholder="0XX XXX XXXX"
                          />
                        </div>
                        {formErrors.mobileNumber && (
                          <p className="mt-1 text-sm text-red-600">
                            {formErrors.mobileNumber}
                          </p>
                        )}
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                        <div className="flex items-start">
                          <AlertCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">
                              Payment Instructions:
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                              <li>
                                After clicking "Complete Booking", a secure
                                payment popup will open
                              </li>
                              <li>
                                You'll receive an OTP on your mobile money
                                number
                              </li>
                              <li>
                                Enter the OTP in the payment popup to complete
                                the transaction
                              </li>
                              <li>
                                Ensure you have sufficient balance in your
                                mobile money account
                              </li>
                              <li>Keep your phone nearby to receive the OTP</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="agreeToTerms"
                        name="agreeToTerms"
                        type="checkbox"
                        checked={formData.agreeToTerms}
                        onChange={handleInputChange}
                        className={`h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded ${
                          formErrors.agreeToTerms ? "border-red-500" : ""
                        }`}
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label
                        htmlFor="agreeToTerms"
                        className="font-medium text-gray-700"
                      >
                        I agree to the{" "}
                        <Link
                          href="/terms"
                          className="text-indigo-600 hover:underline"
                        >
                          terms and conditions
                        </Link>{" "}
                        and{" "}
                        <Link
                          href="/privacy"
                          className="text-indigo-600 hover:underline"
                        >
                          privacy policy
                        </Link>
                      </label>
                      {formErrors.agreeToTerms && (
                        <p className="mt-1 text-sm text-red-600">
                          {formErrors.agreeToTerms}
                        </p>
                      )}
                    </div>
                  </div>

                  {formErrors.submit && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
                      <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{formErrors.submit}</span>
                    </div>
                  )}

                  <div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all ${
                        isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Initializing Payment...
                        </>
                      ) : (
                        <>
                          <Smartphone className="h-5 w-5 mr-2" />
                          Complete Booking - Pay GH₵ {paymentAmount.toFixed(2)}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Booking Summary */}
          <div>
            <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 sticky top-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Booking Summary
              </h2>

              <div className="mb-4">
                <div className="relative h-40 w-full rounded-lg overflow-hidden mb-4">
                  {room.images && room.images.length > 0 ? (
                    <img
                      src={
                        `http://localhost:5000${room.images[0]}` ||
                        "/placeholder.svg"
                      }
                      alt={room.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <p className="text-gray-500">No image available</p>
                    </div>
                  )}
                </div>

                <h3 className="font-semibold text-gray-900">{room.name}</h3>
                <p className="text-gray-600 text-sm">
                  {hostel.name}, {hostel.address}
                </p>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Room Type</span>
                  <span className="font-medium">{room.type}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Capacity</span>
                  <span className="font-medium">
                    {room.capacity} {room.capacity === 1 ? "Person" : "People"}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">{formData.duration}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Room Price</span>
                  <span className="font-medium">
                    GH₵ {room.price.toFixed(2)}
                  </span>
                </div>
                {formData.duration === "Full Year" && (
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Payment Type</span>
                    <span className="font-medium">{formData.paymentType}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 mt-4 pt-4">
                {formData.duration === "Full Year" &&
                  formData.paymentType === "Partial Payment" && (
                    <>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">
                          Total Cost (Full Year)
                        </span>
                        <span className="font-medium">
                          GH₵ {totalPrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Due Now (50%)</span>
                        <span className="font-medium text-green-600">
                          GH₵ {paymentAmount.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Remaining Balance</span>
                        <span className="font-medium text-orange-600">
                          GH₵ {(totalPrice - paymentAmount).toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}

                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                  <span className="text-lg font-bold text-gray-900">
                    Amount to Pay Now
                  </span>
                  <span className="text-lg font-bold text-indigo-600">
                    GH₵ {paymentAmount.toFixed(2)}
                  </span>
                </div>

                {formData.duration === "Full Year" &&
                  formData.paymentType === "Partial Payment" && (
                    <p className="text-sm text-amber-600 mt-2 bg-amber-50 p-2 rounded">
                      <strong>Note:</strong> Remaining balance of GH₵{" "}
                      {(totalPrice - paymentAmount).toFixed(2)} is due before
                      second semester
                    </p>
                  )}
                <p className="text-sm text-gray-500 mt-1">
                  Includes all fees and taxes
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center text-sm text-gray-600">
                  <Smartphone className="h-4 w-4 mr-2 text-green-500" />
                  <span>Secure payment with Mobile Money</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <DollarSign className="h-4 w-4 mr-2 text-blue-500" />
                  <span>Powered by Paystack</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
