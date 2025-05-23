"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import { MapPin, Star, Wifi, Shield, Coffee, BookOpen, Users, Home, ChevronLeft, Calendar, ArrowRight } from "lucide-react"

// Debugging function unchanged
const debugRoomFetch = async (hostelId) => {
  try {
    const hostelResponse = await fetch(`http://localhost:5000/api/public/hostels/${hostelId}`)
    console.log("Hostel response status:", hostelResponse.status)

    if (hostelResponse.ok) {
      console.log("Hostel fetch successful")
    } else {
      console.error("Hostel fetch failed")
    }

    const roomsResponse = await fetch(`http://localhost:5000/api/public/hostels/${hostelId}/rooms`)

    if (roomsResponse.ok) {
      const data = await roomsResponse.json()
    } else {
      const errorText = await roomsResponse.text()
      console.error("Rooms fetch failed:", errorText)
    }
  } catch (err) {
    console.error("Debug error:", err)
  }
}

export default function HostelDetailPage({ params }) {
  const resolvedParams = use(params)
  const id = resolvedParams.id
  const router = useRouter()

  const [hostel, setHostel] = useState(null)
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [roomsLoading, setRoomsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [roomsError, setRoomsError] = useState(null)
  const [activeImage, setActiveImage] = useState(0)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const fetchHostel = async () => {
      try {
        setLoading(true)
        const response = await fetch(`http://localhost:5000/api/public/hostels/${id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch hostel details")
        }

        const data = await response.json()
        setHostel(data.hostel)
        setLoading(false)

        debugRoomFetch(id)
      } catch (err) {
        console.error("Error fetching hostel:", err)
        setError("Failed to load hostel details. Please try again later.")
        setLoading(false)
      }
    }

    if (id) {
      fetchHostel()
    }
  }, [id])

  useEffect(() => {
    const fetchRooms = async () => {
      if (!id) return

      try {
        setRoomsLoading(true)
        console.log("Fetching rooms for hostel ID:", id)

        const roomsUrl = `http://localhost:5000/api/public/hostels/${id}/rooms`
        console.log("Rooms API URL:", roomsUrl)

        const response = await fetch(roomsUrl)
        console.log("Rooms API response status:", response.status)

        if (!response.ok) {
          const errorText = await response.text()
          console.error("Error response body:", errorText)
          throw new Error(`Failed to fetch rooms: ${response.status}`)
        }

        const data = await response.json()
        console.log("Rooms data received:", data)

        if (!data.rooms) {
          console.warn("No rooms array in response:", data)
        }

        setRooms(data.rooms || [])
        setRoomsLoading(false)
      } catch (err) {
        console.error("Error fetching rooms:", err)
        setRoomsError(`Failed to load rooms: ${err.message}`)
        setRoomsLoading(false)
      }
    }

    fetchRooms()
  }, [id])

  const navigateToRoom = (roomId) => {
    router.push(`/hostels/${id}/rooms/${roomId}`)
  }

  // Helper function to get amenity icon
  const getAmenityIcon = (amenity) => {
    if (amenity.includes("WiFi") || amenity.includes("Internet")) {
      return <Wifi size={18} />
    } else if (amenity.includes("Study")) {
      return <BookOpen size={18} />
    } else {
      return <Coffee size={18} />
    }
  }

  // Parse amenities if they're stored as a JSON string
  let parsedAmenities = hostel?.amenities || []
  if (hostel?.amenities && typeof hostel.amenities[0] === "string" && hostel.amenities[0].startsWith("[")) {
    try {
      parsedAmenities = JSON.parse(hostel.amenities[0])
    } catch (e) {
      console.error("Error parsing amenities:", e)
    }
  }

  // Function to parse room amenities
  const parseRoomAmenities = (roomAmenities) => {
    if (!roomAmenities || !roomAmenities.length) return []

    if (typeof roomAmenities[0] === "string" && roomAmenities[0].startsWith("[")) {
      try {
        return JSON.parse(roomAmenities[0])
      } catch (e) {
        console.error("Error parsing room amenities:", e)
        return []
      }
    }

    return roomAmenities
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-indigo-600 font-medium">Loading hostel details...</span>
        </div>
      </div>
    )
  }

  if (error || !hostel) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-xl shadow-md p-8 max-w-lg mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{error || "Hostel not found"}</h2>
            <p className="text-gray-600 mb-6">We couldn't find the hostel you're looking for.</p>
            <Link href="/hostels">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-md transition duration-200">
                Browse Other Hostels
              </button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb navigation */}
        <div className="mb-5">
          <Link href="/hostels" className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center group transition-colors duration-200">
            <ChevronLeft size={20} className="mr-1 group-hover:transform group-hover:-translate-x-1 transition-transform duration-200" />
            <span>Back to Hostels</span>
          </Link>
        </div>

        {/* Hostel Header with Hero Image */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <div className="relative h-64 md:h-80 w-full">
            {hostel.images && hostel.images.length > 0 ? (
              <img
                src={`http://localhost:5000${hostel.images[activeImage]}` || "/placeholder.svg"}
                alt={hostel.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <p className="text-gray-500">No image available</p>
              </div>
            )}
            
            {/* Overlay with hostel name and ratings */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{hostel.name}</h1>
                  <p className="text-white/90 flex items-center">
                    <MapPin size={18} className="mr-1" />
                    {hostel.address}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  {hostel.verified && (
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full flex items-center mb-2">
                      <Shield className="w-3 h-3 mr-1" /> Verified Property
                    </span>
                  )}
                  {hostel.rating > 0 && (
                    <div className="flex items-center bg-white/90 px-3 py-1 rounded-full">
                      <Star className="text-yellow-400 w-5 h-5" />
                      <span className="ml-1 font-medium">{hostel.rating.toFixed(1)}</span>
                      <span className="text-gray-700 ml-1">
                        ({hostel.reviews.length} {hostel.reviews.length === 1 ? "review" : "reviews"})
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Thumbnail Gallery */}
          {hostel.images && hostel.images.length > 1 && (
            <div className="flex space-x-2 p-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {hostel.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(index)}
                  className={`relative h-16 w-24 rounded-md overflow-hidden flex-shrink-0 transition-all duration-200 ${
                    activeImage === index ? "ring-2 ring-indigo-600 scale-105" : "opacity-80 hover:opacity-100"
                  }`}
                >
                  <img
                    src={`http://localhost:5000${image}` || "/placeholder.svg"}
                    alt={`${hostel.name} thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
          
          {/* Tab Navigation */}
          <div className="border-t border-gray-200">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-4 font-medium text-sm transition-colors duration-200 whitespace-nowrap ${
                  activeTab === 'overview' 
                    ? 'text-indigo-600 border-b-2 border-indigo-600' 
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('rooms')}
                className={`px-6 py-4 font-medium text-sm transition-colors duration-200 whitespace-nowrap ${
                  activeTab === 'rooms' 
                    ? 'text-indigo-600 border-b-2 border-indigo-600' 
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                Rooms & Pricing
              </button>
              <button
                onClick={() => setActiveTab('amenities')}
                className={`px-6 py-4 font-medium text-sm transition-colors duration-200 whitespace-nowrap ${
                  activeTab === 'amenities' 
                    ? 'text-indigo-600 border-b-2 border-indigo-600' 
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                Amenities
              </button>
              <button
                onClick={() => setActiveTab('policies')}
                className={`px-6 py-4 font-medium text-sm transition-colors duration-200 whitespace-nowrap ${
                  activeTab === 'policies' 
                    ? 'text-indigo-600 border-b-2 border-indigo-600' 
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                Policies
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="p-6">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Hostel</h2>
                <p className="text-gray-700 leading-relaxed">{hostel.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Quick Facts */}
                <div className="bg-gray-50 p-5 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-indigo-600" /> 
                    Quick Facts
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-center text-gray-700">
                      <div className="w-6 h-6 mr-2 flex items-center justify-center text-indigo-600">
                        <MapPin size={16} />
                      </div>
                      <span>{hostel.address}</span>
                    </li>
                    {hostel.rating > 0 && (
                      <li className="flex items-center text-gray-700">
                        <div className="w-6 h-6 mr-2 flex items-center justify-center text-indigo-600">
                          <Star size={16} />
                        </div>
                        <span>Rated {hostel.rating.toFixed(1)} out of 5</span>
                      </li>
                    )}
                    {/* Add more quick facts as needed */}
                  </ul>
                </div>
                
                {/* Popular Amenities Preview */}
                <div className="bg-gray-50 p-5 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <Coffee className="w-5 h-5 mr-2 text-indigo-600" /> 
                    Popular Amenities
                  </h3>
                  <ul className="space-y-2">
                    {Array.isArray(parsedAmenities) && parsedAmenities.slice(0, 4).map((amenity, index) => (
                      <li key={index} className="flex items-center text-gray-700">
                        <div className="w-6 h-6 mr-2 flex items-center justify-center text-indigo-600">
                          {getAmenityIcon(amenity)}
                        </div>
                        {amenity}
                      </li>
                    ))}
                    {Array.isArray(parsedAmenities) && parsedAmenities.length > 4 && (
                      <li>
                        <button 
                          onClick={() => setActiveTab('amenities')}
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center mt-1"
                        >
                          View all {parsedAmenities.length} amenities
                          <ArrowRight size={14} className="ml-1" />
                        </button>
                      </li>
                    )}
                  </ul>
                </div>
                
                {/* Booking Info */}
                <div className="bg-gray-50 p-5 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-indigo-600" /> 
                    Booking Information
                  </h3>
                  <p className="text-gray-700 mb-4">Rooms are available for monthly booking. Select a room to see availability and pricing details.</p>
                  <button
                    onClick={() => setActiveTab('rooms')}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded transition duration-200 flex items-center justify-center"
                  >
                    View Available Rooms
                    <ArrowRight size={16} className="ml-2" />
                  </button>
                </div>
              </div>
            </div>  
          )}

          {/* Rooms Tab */}
          {activeTab === 'rooms' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Rooms</h2>
              
              {roomsLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
                  <span className="ml-3 text-gray-600">Loading rooms...</span>
                </div>
              ) : roomsError ? (
                <div className="text-center py-8 bg-red-50 rounded-lg border border-red-100">
                  <p className="text-red-600 mb-4">{roomsError}</p>
                  <button
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded transition duration-200"
                    onClick={() => window.location.reload()}
                  >
                    Try Again
                  </button>
                </div>
              ) : rooms.length === 0 ? (
                <div className="text-center py-12 bg-yellow-50 rounded-lg border border-yellow-100">
                  <p className="text-yellow-700 mb-2 font-medium">No rooms available at the moment</p>
                  <p className="text-gray-600">Please check back later or contact the hostel directly for more information.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rooms.map((room) => (
                    <div
                      key={room._id}
                      className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                      onClick={() => navigateToRoom(room._id)}
                    >
                      <div className="relative h-48">
                        {room.images && room.images.length > 0 ? (
                          <img
                            src={`http://localhost:5000${room.images[0]}` || "/placeholder.svg"}
                            alt={`${room.name} Preview`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <p className="text-gray-500">No image available</p>
                          </div>
                        )}
                        {room.availability === false && (
                          <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 text-sm font-medium">
                            Not Available
                          </div>
                        )}
                        {room.availability !== false && (
                          <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 text-sm font-medium">
                            Available
                          </div>
                        )}
                      </div>
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
                          <div className="text-lg font-bold text-indigo-600 flex items-center">
                            <span className="mr-1">GH₵</span> {room.price}
                            <span className="text-sm font-normal text-gray-500">/month</span>
                          </div>
                        </div>
                        <p className="text-gray-700 text-sm mb-4 line-clamp-2">{room.description}</p>
                        
                        <div className="flex flex-wrap gap-4 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <Home size={16} className="mr-1 text-indigo-500" /> {room.type}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Users size={16} className="mr-1 text-indigo-500" /> {room.capacity}{" "}
                            {room.capacity === 1 ? "Person" : "People"}
                          </div>
                        </div>

                        {/* Room amenities preview */}
                        {room.amenities && room.amenities.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Amenities:</p>
                            <div className="flex flex-wrap gap-2">
                              {parseRoomAmenities(room.amenities)
                                .slice(0, 3)
                                .map((amenity, index) => (
                                  <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                                    {amenity}
                                  </span>
                                ))}
                              {parseRoomAmenities(room.amenities).length > 3 && (
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                                  +{parseRoomAmenities(room.amenities).length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        <Link href={`/hostels/${id}/rooms/${room._id}`}>
                          <button
                            className={`w-full px-4 py-2 rounded-md ${
                              room.availability !== false
                                ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                                : "bg-gray-300 cursor-not-allowed text-gray-600"
                            } transition duration-200 font-medium mt-2`}
                            disabled={room.availability === false}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {room.availability !== false ? "View Details" : "Unavailable"}
                          </button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Amenities Tab */}
          {activeTab === 'amenities' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Hostel Amenities</h2>
              {Array.isArray(parsedAmenities) && parsedAmenities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {parsedAmenities.map((amenity, index) => (
                    <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 mr-4">
                        {getAmenityIcon(amenity)}
                      </div>
                      <span className="text-gray-800">{amenity}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">No amenities information available for this hostel.</p>
              )}
            </div>
          )}
          
          {/* Policies Tab */}
          {activeTab === 'policies' && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Hostel Policies</h2>
              {hostel.policies ? (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-line">{hostel.policies}</p>
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">No specific policies information available for this hostel.</p>
              )}
              
              <div className="mt-8 p-4 bg-yellow-50 border border-yellow-100 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Important Notice</h3>
                <p className="text-gray-700">Please read all policies carefully before booking. For any questions or special arrangements, contact the hostel directly.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}