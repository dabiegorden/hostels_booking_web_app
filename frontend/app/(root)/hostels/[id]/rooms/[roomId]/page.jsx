"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import Navbar from "@/components/Navbar"
import { MapPin, Users, Home, DollarSign, Calendar, ArrowLeft, Check, ChevronLeft, ChevronRight } from "lucide-react"

export default function RoomDetailPage({ params }) {
  // Unwrap the params promise using React.use()
  const resolvedParams = use(params)
  const { id: hostelId, roomId } = resolvedParams

  const [room, setRoom] = useState(null)
  const [hostel, setHostel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    const fetchRoomAndHostel = async () => {
      try {
        setLoading(true)

        // Fetch room details
        const roomResponse = await fetch(`http://localhost:5000/api/public/rooms/${roomId}`)
        
        if (!roomResponse.ok) {
          throw new Error(`Failed to fetch room details: ${roomResponse.status}`)
        }

        const roomData = await roomResponse.json()
        setRoom(roomData.room)

        // Fetch hostel details
        const hostelResponse = await fetch(`http://localhost:5000/api/public/hostels/${hostelId}`)
        
        if (!hostelResponse.ok) {
          throw new Error(`Failed to fetch hostel details: ${hostelResponse.status}`)
        }

        const hostelData = await hostelResponse.json()
        setHostel(hostelData.hostel)

        setLoading(false)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(`Failed to load details: ${err.message}`)
        setLoading(false)
      }
    }

    if (hostelId && roomId) {
      fetchRoomAndHostel()
    }
  }, [hostelId, roomId])

  // Move to next image in carousel
  const nextImage = () => {
    if (room?.images?.length > 0) {
      setActiveImage((prev) => (prev === room.images.length - 1 ? 0 : prev + 1))
    }
  }

  // Move to previous image in carousel
  const prevImage = () => {
    if (room?.images?.length > 0) {
      setActiveImage((prev) => (prev === 0 ? room.images.length - 1 : prev - 1))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading room details...</p>
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
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-md transition-colors duration-200 flex items-center mx-auto">
              <ArrowLeft size={18} className="mr-2" /> Back to Hostel
            </button>
          </Link>
        </div>
      </div>
    )
  }

  // Parse amenities if they're stored as a JSON string
  let parsedAmenities = []
  if (room.amenities && room.amenities.length > 0) {
    if (typeof room.amenities[0] === "string" && room.amenities[0].startsWith("[")) {
      try {
        parsedAmenities = JSON.parse(room.amenities[0])
      } catch (e) {
        console.error("Error parsing amenities:", e)
        parsedAmenities = []
      }
    } else {
      parsedAmenities = room.amenities
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back button with improved visibility */}
        <div className="mb-6">
          <Link href={`/hostels/${hostelId}`} className="inline-flex items-center px-4 py-2 bg-white hover:bg-gray-50 text-indigo-600 rounded-md shadow-sm transition-colors duration-200">
            <ArrowLeft size={18} className="mr-2" /> 
            <span>Back to {hostel.name}</span>
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* Room status banner */}
          {room.availability === false && (
            <div className="bg-red-50 text-red-700 px-6 py-3 border-b border-red-100">
              <p className="text-center font-medium">This room is currently not available for booking</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            {/* Image gallery section */}
            <div className="space-y-4">
              <div className="relative h-96 w-full rounded-lg overflow-hidden shadow-md">
                {room.images && room.images.length > 0 ? (
                  <>
                    <img
                      src={`http://localhost:5000${room.images[activeImage]}` || "/placeholder.svg"}
                      alt={`${room.name} - Image ${activeImage + 1}`}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Image navigation buttons */}
                    {room.images.length > 1 && (
                      <>
                        <button 
                          onClick={prevImage}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors duration-200"
                          aria-label="Previous image"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <button 
                          onClick={nextImage}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors duration-200"
                          aria-label="Next image"
                        >
                          <ChevronRight size={20} />
                        </button>
                        
                        {/* Image counter */}
                        <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                          {activeImage + 1} / {room.images.length}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <p className="text-gray-500">No image available</p>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {room.images && room.images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                  {room.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(index)}
                      className={`relative h-20 w-20 rounded-md overflow-hidden flex-shrink-0 transition-all duration-200 ${
                        activeImage === index ? "ring-2 ring-indigo-600 scale-105" : "opacity-80 hover:opacity-100"
                      }`}
                      aria-label={`View image ${index + 1}`}
                    >
                      <img
                        src={`http://localhost:5000${image}` || "/placeholder.svg"}
                        alt={`${room.name} thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Room details section */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{room.name}</h1>
                    <p className="text-gray-600 flex items-center mt-2">
                      <MapPin size={18} className="mr-1 flex-shrink-0" />
                      <span>{hostel.name}, {hostel.address}</span>
                    </p>
                  </div>
                  
                  {room.availability !== false ? (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                      Available
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Room specs */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 px-4 py-3 rounded-lg flex flex-col items-center text-center transition-colors duration-200 hover:bg-gray-100">
                  <Home size={22} className="mb-2 text-indigo-600" />
                  <p className="text-sm text-gray-500">Room Type</p>
                  <p className="font-medium text-gray-900">{room.type}</p>
                </div>

                <div className="bg-gray-50 px-4 py-3 rounded-lg flex flex-col items-center text-center transition-colors duration-200 hover:bg-gray-100">
                  <Users size={22} className="mb-2 text-indigo-600" />
                  <p className="text-sm text-gray-500">Capacity</p>
                  <p className="font-medium text-gray-900">
                    {room.capacity} {room.capacity === 1 ? "Person" : "People"}
                  </p>
                </div>

                <div className="bg-gray-50 px-4 py-3 rounded-lg flex flex-col items-center text-center transition-colors duration-200 hover:bg-gray-100">
                  <DollarSign size={22} className="mb-2 text-indigo-600" />
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="font-medium text-gray-900">
                    GH₵ {room.price}<span className="text-sm text-gray-500">/month</span>
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h2 className="text-xl font-semibold mb-2">Description</h2>
                <p className="text-gray-700 leading-relaxed">{room.description}</p>
              </div>

              {/* Amenities */}
              {parsedAmenities.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h2 className="text-xl font-semibold mb-3">Room Amenities</h2>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                    {parsedAmenities.map((amenity, index) => (
                      <div key={index} className="flex items-center text-gray-700">
                        <Check size={18} className="mr-2 text-green-500 flex-shrink-0" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Booking CTA */}
              <div className="pt-4">
                {room.availability !== false ? (
                  <Link href={`/hostels/${hostelId}/rooms/${roomId}/book`} className="block">
                    <button className="w-full cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center shadow-md hover:shadow-lg">
                      <Calendar className="mr-3" size={20} />
                      Book This Room Now
                    </button>
                  </Link>
                ) : (
                  <div className="space-y-3">
                    <button disabled className="w-full bg-gray-300 text-gray-600 font-bold py-4 px-6 rounded-lg cursor-not-allowed">
                      Currently Unavailable
                    </button>
                    <p className="text-center text-sm text-gray-500">This room cannot be booked at the moment. Please check back later or browse other available rooms.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}