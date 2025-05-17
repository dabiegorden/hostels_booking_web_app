"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { use } from "react"
import {
  Building,
  MapPin,
  Wifi,
  ArrowLeft,
  Home,
  DollarSign,
  ImageIcon,
  Edit,
  Trash2,
  AlertCircle,
  Loader,
  Plus,
} from "lucide-react"
import { toast } from "sonner"

export default function ViewHostelPage({ params }) {
  // In Next.js 15, params is a promise, so we need to use React.use
  const hostelId = use(params).id

  const [hostel, setHostel] = useState(null)
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const router = useRouter()

  // Fetch hostel and rooms data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        console.log("Fetching hostel data for ID:", hostelId)

        // Fetch hostel details
        const hostelResponse = await fetch(`http://localhost:5000/api/hostel-owners/hostels/${hostelId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        })

        if (!hostelResponse.ok) {
          throw new Error("Failed to fetch hostel details")
        }

        const hostelData = await hostelResponse.json()
        console.log("Hostel data received:", hostelData)
        setHostel(hostelData.hostel)

        // Fetch rooms for this hostel
        const roomsResponse = await fetch(`http://localhost:5000/api/hostel-owners/hostels/${hostelId}/rooms`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        })

        if (roomsResponse.ok) {
          const roomsData = await roomsResponse.json()
          console.log("Rooms data received:", roomsData)
          setRooms(roomsData.rooms || [])
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(err.message)
        toast.error("Failed to load hostel data")
      } finally {
        setLoading(false)
      }
    }

    if (hostelId) {
      fetchData()
    }
  }, [hostelId])

  const handleDeleteClick = () => {
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    try {
      setDeleteLoading(true)
      const response = await fetch(`http://localhost:5000/api/hostel-owners/hostels/${hostelId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to delete hostel")
      }

      toast.success("Hostel deleted successfully")

      // Redirect to hostels list after a short delay
      setTimeout(() => {
        router.push("/hostel-owners-dashboard/hostels")
      }, 1000)
    } catch (err) {
      console.error("Delete error:", err)
      toast.error(err.message || "Failed to delete hostel")
      setDeleteLoading(false)
      setShowDeleteModal(false)
    }
  }

  const cancelDelete = () => {
    setShowDeleteModal(false)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-screen">
        <Loader className="h-8 w-8 text-indigo-600 animate-spin" />
        <span className="ml-2 text-gray-600">Loading hostel data...</span>
      </div>
    )
  }

  if (error && !hostel) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <p className="text-sm mt-2">
                <Link href="/hostel-owners-dashboard/hostels" className="text-red-700 underline">
                  Return to hostels
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!hostel) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">Hostel not found</p>
              <p className="text-sm mt-2">
                <Link href="/hostel-owners-dashboard/hostels" className="text-yellow-700 underline">
                  Return to hostels
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/hostel-owners-dashboard/hostels"
          className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 mb-4"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Hostels
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Building className="mr-2 h-6 w-6" />
              {hostel.name}
            </h1>
            <p className="text-gray-600 mt-1 flex items-center">
              <MapPin className="mr-1 h-4 w-4 text-gray-400" />
              {hostel.address}
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <Link
              href={`/hostel-owners-dashboard/hostels/${hostelId}/edit`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Edit className="mr-2 h-5 w-5" />
              Edit Hostel
            </Link>
            <button
              onClick={handleDeleteClick}
              className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <Trash2 className="mr-2 h-5 w-5" />
              Delete Hostel
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* Hostel Images */}
        {hostel.images && hostel.images.length > 0 ? (
          <div className="relative h-64 md:h-96 bg-gray-200">
            <img
              src={`http://localhost:5000${hostel.images[0]}`}
              alt={hostel.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null
                e.target.src = "/placeholder.svg?height=384&width=768"
              }}
            />
          </div>
        ) : (
          <div className="h-64 md:h-96 bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">No images available</p>
            </div>
          </div>
        )}

        {/* Hostel Details */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="text-gray-700 whitespace-pre-line">{hostel.description}</p>

              {hostel.policies && (
                <div className="mt-6">
                  <h2 className="text-xl font-semibold mb-4">Policies</h2>
                  <p className="text-gray-700 whitespace-pre-line">{hostel.policies}</p>
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Details</h2>
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">ADDRESS</h3>
                  <p className="text-gray-700">{hostel.address}</p>
                </div>

                {hostel.rating > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">RATING</h3>
                    <p className="text-gray-700">{hostel.rating} / 5</p>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-gray-500">ADDED ON</h3>
                  <p className="text-gray-700">
                    {new Date(hostel.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Amenities */}
          {hostel.amenities && hostel.amenities.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {hostel.amenities.map((amenity, index) => (
                  <div
                    key={index}
                    className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm flex items-center"
                  >
                    <Wifi className="mr-1 h-4 w-4" />
                    {amenity}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* More Images */}
          {hostel.images && hostel.images.length > 1 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">More Images</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {hostel.images.slice(1).map((image, index) => (
                  <div key={index} className="relative h-32 bg-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={`http://localhost:5000${image}`}
                      alt={`${hostel.name} - Image ${index + 2}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = "/placeholder.svg?height=128&width=256"
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rooms Section */}
      <div className="mt-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Home className="mr-2 h-6 w-6" />
            Rooms
          </h2>
          <Link
            href={`/hostel-owners-dashboard/hostels/${hostelId}/rooms/new`}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add New Room
          </Link>
        </div>

        {rooms.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Home className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No rooms found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new room.</p>
            <div className="mt-6">
              <Link
                href={`/hostel-owners-dashboard/hostels/${hostelId}/rooms/new`}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="-ml-1 mr-2 h-5 w-5" />
                Add New Room
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div
                key={room._id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Room image */}
                <div className="relative h-48 bg-gray-200">
                  {room.images && room.images.length > 0 ? (
                    <img
                      src={`http://localhost:5000${room.images[0]}`}
                      alt={room.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = "/placeholder.svg?height=192&width=384"
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <Home className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  {!room.availability && (
                    <div className="absolute top-2 right-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                      Not Available
                    </div>
                  )}
                </div>

                {/* Room details */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
                    <div className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">{room.type}</div>
                  </div>

                  <div className="flex items-center text-gray-700 mb-2">
                    <DollarSign className="h-4 w-4 mr-1 text-gray-500" />
                    <span className="font-medium">{room.price.toFixed(2)} GHS</span>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{room.description}</p>

                  {/* Action buttons */}
                  <div className="flex justify-between mt-4 pt-4 border-t border-gray-100">
                    <Link
                      href={`/hostel-owners-dashboard/rooms/${room._id}`}
                      className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      View Details
                    </Link>
                    <Link
                      href={`/hostel-owners-dashboard/rooms/${room._id}/edit`}
                      className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Edit Room
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Hostel</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this hostel? This action cannot be undone and will also delete
                        all rooms associated with this hostel.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={confirmDelete}
                  disabled={deleteLoading}
                >
                  {deleteLoading ? (
                    <>
                      <Loader className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={cancelDelete}
                  disabled={deleteLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
