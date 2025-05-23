"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import { ArrowLeft, Calendar, CreditCard, User, Mail, Phone, AlertCircle, DollarSign } from "lucide-react"

export default function BookRoomPage({ params }) {
  const resolvedParams = use(params)
  const { id: hostelId, roomId } = resolvedParams
  const router = useRouter()

  const [room, setRoom] = useState(null)
  const [hostel, setHostel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    checkInDate: "",
    duration: "First Semester",
    paymentType: "Full Payment",
    paymentMethod: "card",
    mobileNetwork: "mtn",
    mobileNumber: "",
    agreeToTerms: false,
  })
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)

  useEffect(() => {
    const fetchRoomAndHostel = async () => {
      try {
        setLoading(true)

        // Fetch room details
        const roomResponse = await fetch(`http://localhost:5000/api/public/rooms/${roomId}`)
        if (!roomResponse.ok) {
          throw new Error("Failed to fetch room details")
        }
        const roomData = await roomResponse.json()
        setRoom(roomData.room)

        // Fetch hostel details
        const hostelResponse = await fetch(`http://localhost:5000/api/public/hostels/${hostelId}`)
        if (!hostelResponse.ok) {
          throw new Error("Failed to fetch hostel details")
        }
        const hostelData = await hostelResponse.json()
        setHostel(hostelData.hostel)

        setLoading(false)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load room details. Please try again later.")
        setLoading(false)
      }
    }

    if (hostelId && roomId) {
      fetchRoomAndHostel()
    }
  }, [hostelId, roomId])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })

    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null,
      })
    }
  }

  const validateForm = () => {
    const errors = {}

    if (!formData.fullName.trim()) {
      errors.fullName = "Full name is required"
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid"
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required"
    }

    if (!formData.checkInDate) {
      errors.checkInDate = "Check-in date is required"
    } else {
      const selectedDate = new Date(formData.checkInDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (selectedDate < today) {
        errors.checkInDate = "Check-in date cannot be in the past"
      }
    }

    if (formData.paymentMethod === "mobile") {
      if (!formData.mobileNumber.trim()) {
        errors.mobileNumber = "Mobile money number is required"
      } else if (!/^\d{10}$/.test(formData.mobileNumber.replace(/\s/g, ""))) {
        errors.mobileNumber = "Please enter a valid 10-digit mobile number"
      }
    }

    if (!formData.agreeToTerms) {
      errors.agreeToTerms = "You must agree to the terms and conditions"
    }

    return errors
  }

  const calculateCheckoutDate = (checkInDate, duration) => {
    const date = new Date(checkInDate)

    // Calculate checkout date based on semester duration
    switch (duration) {
      case "First Semester":
        // First semester is typically 4 months
        date.setMonth(date.getMonth() + 4)
        break
      case "Second Semester":
        // Second semester is typically 4 months
        date.setMonth(date.getMonth() + 4)
        break
      case "Full Year":
        // Full year is 8-9 months (academic year)
        date.setMonth(date.getMonth() + 9)
        break
      default:
        // Default to 4 months if unknown
        date.setMonth(date.getMonth() + 4)
    }

    return date.toISOString()
  }

  // Calculate total price based on semester duration
  const calculateTotalPrice = (basePrice, duration) => {
    let totalPrice = 0

    switch (duration) {
      case "First Semester":
        totalPrice = basePrice * 4 // 4 months
        break
      case "Second Semester":
        totalPrice = basePrice * 4 // 4 months
        break
      case "Full Year":
        totalPrice = basePrice * 8 // 8 months
        break
      default:
        totalPrice = basePrice * 4
    }

    return totalPrice
  }

  // Calculate payment amount based on payment type
  const calculatePaymentAmount = (totalPrice, paymentType) => {
    return paymentType === "Partial Payment" ? totalPrice / 2 : totalPrice
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setIsSubmitting(true)

    try {
      // Calculate checkout date and total amount
      const checkOutDate = calculateCheckoutDate(formData.checkInDate, formData.duration)
      const totalAmount = calculateTotalPrice(room.price, formData.duration)
      const paymentAmount = calculatePaymentAmount(totalAmount, formData.paymentType)

      // Prepare customer info
      const customerInfo = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
      }

      if (formData.paymentMethod === "card") {
        // Create Stripe checkout session
        const response = await fetch("http://localhost:5000/api/bookings/create-checkout-session", {
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
            successUrl: `${window.location.origin}/bookings/success`,
            cancelUrl: `${window.location.origin}/hostels/${hostelId}/rooms/${roomId}/book`,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to create checkout session")
        }

        const { url } = await response.json()

        // Redirect to Stripe checkout
        window.location.href = url
      } else if (formData.paymentMethod === "mobile") {
        // Process mobile money payment
        const response = await fetch("http://localhost:5000/api/bookings/mobile-payment", {
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
        })

        if (!response.ok) {
          throw new Error("Failed to process mobile money payment")
        }

        const { bookingId } = await response.json()

        // Redirect to success page
        router.push(`/bookings/success?booking_id=${bookingId}`)
      }
    } catch (err) {
      console.error("Error processing payment:", err)
      setFormErrors({
        submit: "Failed to process your payment. Please try again.",
      })
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    )
  }

  if (error || !room || !hostel) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">{error || "Room not found"}</h2>
          <Link href={`/hostels/${hostelId}`}>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-md">
              Back to Hostel
            </button>
          </Link>
        </div>
      </div>
    )
  }

  // Calculate total price and payment amount
  const totalPrice = calculateTotalPrice(room.price, formData.duration)
  const paymentAmount = calculatePaymentAmount(totalPrice, formData.paymentType)

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
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Book Your Stay</h1>

              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
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
                          formErrors.fullName ? "border-red-500" : "border-gray-300"
                        } rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`}
                        placeholder="John Doe"
                      />
                    </div>
                    {formErrors.fullName && <p className="mt-1 text-sm text-red-600">{formErrors.fullName}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
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
                            formErrors.email ? "border-red-500" : "border-gray-300"
                          } rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`}
                          placeholder="your@email.com"
                        />
                      </div>
                      {formErrors.email && <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>}
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
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
                            formErrors.phone ? "border-red-500" : "border-gray-300"
                          } rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`}
                          placeholder="+233 XX XXX XXXX"
                        />
                      </div>
                      {formErrors.phone && <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="checkInDate" className="block text-sm font-medium text-gray-700 mb-1">
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
                            formErrors.checkInDate ? "border-red-500" : "border-gray-300"
                          } rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`}
                        />
                      </div>
                      {formErrors.checkInDate && <p className="mt-1 text-sm text-red-600">{formErrors.checkInDate}</p>}
                    </div>

                    <div>
                      <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                        Duration
                      </label>
                      <select
                        id="duration"
                        name="duration"
                        value={formData.duration}
                        onChange={handleInputChange}
                        className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="First Semester">First Semester</option>
                        <option value="Second Semester">Second Semester</option>
                        <option value="Full Year">Full Year</option>
                      </select>
                    </div>
                  </div>

                  {/* Payment Type Selection */}
                  <div>
                    <label htmlFor="paymentType" className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Type
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div
                        className={`border ${
                          formData.paymentType === "Full Payment" ? "border-indigo-500 bg-indigo-50" : "border-gray-300"
                        } rounded-md p-4 flex items-center cursor-pointer`}
                        onClick={() => setFormData({ ...formData, paymentType: "Full Payment" })}
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
                            <div className="text-xs text-gray-500">Pay the entire amount now</div>
                          </div>
                        </label>
                      </div>

                      <div
                        className={`border ${
                          formData.paymentType === "Partial Payment"
                            ? "border-indigo-500 bg-indigo-50"
                            : "border-gray-300"
                        } rounded-md p-4 flex items-center cursor-pointer`}
                        onClick={() => setFormData({ ...formData, paymentType: "Partial Payment" })}
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
                            <div className="font-medium">Partial Payment</div>
                            <div className="text-xs text-gray-500">Pay 50% now, 50% later</div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Method
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div
                        className={`border ${
                          formData.paymentMethod === "card" ? "border-indigo-500 bg-indigo-50" : "border-gray-300"
                        } rounded-md p-4 flex items-center cursor-pointer`}
                        onClick={() => setFormData({ ...formData, paymentMethod: "card" })}
                      >
                        <input
                          type="radio"
                          id="card"
                          name="paymentMethod"
                          value="card"
                          checked={formData.paymentMethod === "card"}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <label htmlFor="card" className="ml-3 block text-sm font-medium text-gray-700 cursor-pointer">
                          <div className="flex items-center">
                            <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
                            Credit/Debit Card
                          </div>
                        </label>
                      </div>

                      <div
                        className={`border ${
                          formData.paymentMethod === "mobile" ? "border-indigo-500 bg-indigo-50" : "border-gray-300"
                        } rounded-md p-4 flex items-center cursor-pointer`}
                        onClick={() => setFormData({ ...formData, paymentMethod: "mobile" })}
                      >
                        <input
                          type="radio"
                          id="mobile"
                          name="paymentMethod"
                          value="mobile"
                          checked={formData.paymentMethod === "mobile"}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <label htmlFor="mobile" className="ml-3 block text-sm font-medium text-gray-700 cursor-pointer">
                          <div className="flex items-center">
                            <Phone className="h-5 w-5 text-gray-400 mr-2" />
                            Mobile Money
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Money Payment Fields */}
                  {formData.paymentMethod === "mobile" && (
                    <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                      <h3 className="text-md font-medium text-gray-700 mb-3">Mobile Money Details</h3>

                      <div className="space-y-4">
                        <div>
                          <label htmlFor="mobileNetwork" className="block text-sm font-medium text-gray-700 mb-1">
                            Select Network
                          </label>
                          <select
                            id="mobileNetwork"
                            name="mobileNetwork"
                            value={formData.mobileNetwork}
                            onChange={handleInputChange}
                            className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="mtn">MTN Mobile Money</option>
                            <option value="vodafone">Vodafone Cash</option>
                            <option value="airtel">AirtelTigo Money</option>
                          </select>
                        </div>

                        <div>
                          <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-1">
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
                              className={`block w-full pl-10 pr-3 py-2 border ${
                                formErrors.mobileNumber ? "border-red-500" : "border-gray-300"
                              } rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`}
                              placeholder="0XX XXX XXXX"
                            />
                          </div>
                          {formErrors.mobileNumber && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.mobileNumber}</p>
                          )}
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                          <p className="text-sm text-yellow-800">
                            <strong>Note:</strong> After clicking "Complete Booking", you will receive a prompt on your
                            phone to authorize the payment. Please follow the instructions to complete your transaction.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

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
                      <label htmlFor="agreeToTerms" className="font-medium text-gray-700">
                        I agree to the terms and conditions
                      </label>
                      {formErrors.agreeToTerms && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.agreeToTerms}</p>
                      )}
                    </div>
                  </div>

                  {formErrors.submit && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
                      <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
                      <span>{formErrors.submit}</span>
                    </div>
                  )}

                  <div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
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
                          Processing...
                        </>
                      ) : (
                        `Complete Booking with ${formData.paymentMethod === "card" ? "Card" : "Mobile Money"}`
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
              <h2 className="text-lg font-bold text-gray-900 mb-4">Booking Summary</h2>

              <div className="mb-4">
                <div className="relative h-40 w-full rounded-lg overflow-hidden mb-4">
                  {room.images && room.images.length > 0 ? (
                    <img
                      src={`http://localhost:5000${room.images[0]}` || "/placeholder.svg"}
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
                  <span className="text-gray-600">Price per month</span>
                  <span className="font-medium">GH₵ {room.price}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Payment Type</span>
                  <span className="font-medium">{formData.paymentType}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 mt-4 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Total Cost</span>
                  <span className="font-medium">GH₵ {totalPrice}</span>
                </div>

                {formData.paymentType === "Partial Payment" && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Due Now (50%)</span>
                    <span className="font-medium">GH₵ {paymentAmount}</span>
                  </div>
                )}

                <div className="flex justify-between items-center mt-4">
                  <span className="text-lg font-bold text-gray-900">Amount to Pay</span>
                  <span className="text-lg font-bold text-indigo-600">GH₵ {paymentAmount}</span>
                </div>

                {formData.paymentType === "Partial Payment" && (
                  <p className="text-sm text-amber-600 mt-1">
                    Remaining balance of GH₵ {totalPrice - paymentAmount} due before check-in
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-1">Includes all fees and taxes</p>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="h-4 w-4 mr-1 text-green-500" />
                  <span>Secure payment with {formData.paymentMethod === "card" ? "Stripe" : "Mobile Money"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
