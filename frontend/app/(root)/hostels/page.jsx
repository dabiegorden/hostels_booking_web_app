"use client"

import { useState, useEffect, useRef } from "react"
import { Search, MapPin, Star, Grid, List, Wifi, Coffee, Tv, Snowflake, Utensils } from "lucide-react"
import Link from "next/link"
import useDebounce from "@/hooks/useDebounce"
import { useRouter } from "next/navigation"

const HostelsList = () => {
  const router = useRouter()
  const [viewMode, setViewMode] = useState("grid")
  const [hostels, setHostels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const searchInputRef = useRef(null)

  // Function to fetch hostels
  const fetchHostels = async (search = "") => {
    try {
      setLoading(true)
      // Add search parameter if provided
      const url = search
        ? `http://localhost:5000/api/public/hostels?search=${encodeURIComponent(search)}`
        : "http://localhost:5000/api/public/hostels"

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch hostels")
      }

      const data = await response.json()
      setHostels(data.hostels || [])
      setLoading(false)
    } catch (err) {
      console.error("Error fetching hostels:", err)
      setError("Failed to load hostels. Please try again later.")
      setLoading(false)
    }
  }

  // Initial fetch on component mount
  useEffect(() => {
    fetchHostels()
  }, [])

  // Fetch when debounced search term changes
  useEffect(() => {
    fetchHostels(debouncedSearchTerm)
  }, [debouncedSearchTerm])

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchHostels(searchTerm)
  }

  // Navigate to hostel details page
  const navigateToHostel = (hostelId) => {
    router.push(`/hostels/${hostelId}`)
  }

  // Function to render amenity icons
  const renderAmenity = (amenity) => {
    switch (amenity) {
      case "wifi":
        return (
          <div className="flex items-center text-sm">
            <Wifi size={16} className="mr-1" /> WiFi
          </div>
        )
      case "cafeteria":
        return (
          <div className="flex items-center text-sm">
            <Coffee size={16} className="mr-1" /> Cafeteria
          </div>
        )
      case "tv":
        return (
          <div className="flex items-center text-sm">
            <Tv size={16} className="mr-1" /> TV
          </div>
        )
      case "ac":
        return (
          <div className="flex items-center text-sm">
            <Snowflake size={16} className="mr-1" /> A/C
          </div>
        )
      case "kitchen":
        return (
          <div className="flex items-center text-sm">
            <Utensils size={16} className="mr-1" /> Kitchen
          </div>
        )
      default:
        return null
    }
  }

  // Function to extract amenities from hostel data
  const getAmenities = (hostel) => {
    if (!hostel.amenities || !hostel.amenities.length) return []

    // Handle case where amenities might be stored as a JSON string
    let amenitiesList = hostel.amenities
    if (typeof hostel.amenities[0] === "string" && hostel.amenities[0].startsWith("[")) {
      try {
        amenitiesList = JSON.parse(hostel.amenities[0])
      } catch (e) {
        console.error("Error parsing amenities:", e)
        amenitiesList = []
      }
    }

    // Map amenities to standard format
    return amenitiesList
      .map((item) => {
        const amenity = typeof item === "string" ? item.toLowerCase() : ""
        if (amenity.includes("wifi")) return "wifi"
        if (amenity.includes("cafe")) return "cafeteria"
        if (amenity.includes("tv")) return "tv"
        if (amenity.includes("ac") || amenity.includes("air")) return "ac"
        if (amenity.includes("kitchen")) return "kitchen"
        return null
      })
      .filter(Boolean)
  }

  // Render loading state
  if (loading && hostels.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  // Render error state
  if (error && hostels.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="text-center py-12 bg-red-50 rounded-lg border border-red-100">
          <p className="text-red-600 font-medium text-lg">{error}</p>
          <button
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors duration-200"
            onClick={() => fetchHostels()}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 pb-12 pt-28 max-w-7xl">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 md:mb-0">Find Your Perfect Hostel</h1>
        <div className="flex items-center space-x-3 bg-gray-100 p-1 rounded-lg">
          <button
            className={`px-4 py-2 rounded-md flex items-center transition-colors duration-200 ${
              viewMode === "grid" ? "bg-white shadow-sm text-blue-600 font-medium" : "text-gray-600 hover:bg-gray-200"
            }`}
            onClick={() => setViewMode("grid")}
            aria-label="Grid view"
          >
            <Grid size={18} className="mr-2" /> Grid
          </button>
          <button
            className={`px-4 py-2 rounded-md flex items-center transition-colors duration-200 ${
              viewMode === "list" ? "bg-white shadow-sm text-blue-600 font-medium" : "text-gray-600 hover:bg-gray-200"
            }`}
            onClick={() => setViewMode("list")}
            aria-label="List view"
          >
            <List size={18} className="mr-2" /> List
          </button>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-10">
        <form onSubmit={handleSearchSubmit}>
          <div className="relative max-w-3xl mx-auto">
            <input
              type="text"
              placeholder="Search hostels by name or location..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
              value={searchTerm}
              onChange={handleSearchChange}
              ref={searchInputRef}
              aria-label="Search hostels"
            />
            <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
            <button 
              type="submit" 
              className="absolute right-2 top-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-1 rounded-lg transition-colors duration-200"
              aria-label="Search"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* No results message */}
      {hostels.length === 0 && !loading && (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-gray-500 text-lg">No hostels found. Try adjusting your search criteria.</p>
        </div>
      )}

      {/* Results count */}
      {hostels.length > 0 && (
        <div className="mb-6 text-gray-600">
          <p>{hostels.length} {hostels.length === 1 ? 'hostel' : 'hostels'} found</p>
        </div>
      )}

      {/* Hostels Grid/List View */}
      <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-8"}>
        {hostels.map((hostel) =>
          viewMode === "grid" ? (
            // Grid View
            <div
              key={hostel._id}
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
            >
              <div className="relative h-56">
                {hostel.images && hostel.images.length > 0 ? (
                  <img
                    src={`http://localhost:5000${hostel.images[0]}`}
                    alt={`${hostel.name} Preview`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <p className="text-gray-500">No image available</p>
                  </div>
                )}
                {hostel.rating > 0 && (
                  <div className="absolute top-3 right-3 bg-white py-1 px-3 rounded-full text-sm font-medium flex items-center shadow-sm">
                    <Star size={16} className="fill-current text-yellow-400 mr-1" />
                    <span>{hostel.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-xl font-semibold text-gray-800">{hostel.name}</h2>
                </div>
                <div className="flex items-center text-gray-600 mb-3">
                  <MapPin size={16} className="mr-1 flex-shrink-0" />
                  <span className="text-sm">{hostel.address}</span>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{hostel.description}</p>
                <div className="flex flex-wrap gap-2 mb-5">
                  {getAmenities(hostel).map((amenity, index) => (
                    <div key={index} className="bg-gray-100 px-3 py-1 rounded-full text-gray-700">
                      {renderAmenity(amenity)}
                    </div>
                  ))}
                </div>
                <Link href={`/hostels/${hostel._id}`} className="block w-full">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 cursor-pointer py-3 rounded-lg transition-colors duration-200">
                    View Details
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            // List View
            <div
              key={hostel._id}
              className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row hover:shadow-md transition-shadow"
            >
              <div className="relative w-full md:w-72 h-56 md:h-auto">
                {hostel.images && hostel.images.length > 0 ? (
                  <img
                    src={`http://localhost:5000${hostel.images[0]}`}
                    alt={`${hostel.name} Preview`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <p className="text-gray-500">No image available</p>
                  </div>
                )}
              </div>
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-2xl font-semibold text-gray-800">{hostel.name}</h2>
                  {hostel.rating > 0 && (
                    <div className="flex items-center bg-blue-50 text-blue-800 px-3 py-1 rounded-full">
                      <Star size={16} className="fill-current text-yellow-400 mr-1" />
                      <span className="font-medium">{hostel.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center text-gray-600 mb-3">
                  <MapPin size={16} className="mr-1 flex-shrink-0" />
                  <span className="text-sm">{hostel.address}</span>
                </div>
                <p className="text-gray-600 mb-4">{hostel.description}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {getAmenities(hostel).map((amenity, index) => (
                    <div key={index} className="bg-gray-100 px-3 py-1 rounded-full text-gray-700">
                      {renderAmenity(amenity)}
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <Link href={`/hostels/${hostel._id}`}>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 cursor-pointer py-3 rounded-lg transition-colors duration-200">
                      View Details
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ),
        )}
      </div>

      {/* Pagination */}
      {hostels.length > 0 && (
        <div className="mt-12 flex justify-center">
          <nav className="inline-flex rounded-md shadow-sm" aria-label="Pagination">
            <button className="px-4 py-2 rounded-l-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors duration-200">
              Previous
            </button>
            <button className="px-4 py-2 border-t border-b border-r border-gray-300 bg-blue-600 text-white font-medium">
              1
            </button>
            <button className="px-4 py-2 border-t border-b border-r border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors duration-200">
              2
            </button>
            <button className="px-4 py-2 border-t border-b border-r border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors duration-200">
              3
            </button>
            <button className="px-4 py-2 rounded-r-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors duration-200">
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  )
}

export default HostelsList