"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { use } from "react"
import { Home, Building, ImageIcon, ArrowLeft, Edit, Trash2, AlertCircle, Loader, Users, Check, X } from "lucide-react"
import { toast } from "sonner"

export default function ViewRoomPage({ params }) {
  // In Next.js 15, params is a promise, so we need to use React.use
  const roomId = use(params).id

  const [room, setRoom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const router = useRouter()

  // Fetch room data
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setLoading(true)
        console.log("Fetching room data for ID:", roomId)

        const response = await fetch(`http://localhost:5000/api/hostel-owners/rooms/${roomId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        })

        if (!response.ok) {
          throw new Error("Failed to fetch room details")
        }

        const data = await response.json()
        console.log("Room data received:", data)

        // If the room has a hostelId property, fetch the hostel details
        if (data.room && data.room.hostelId) {
          try {
            const hostelResponse = await fetch(
              `http://localhost:5000/api/hostel-owners/hostels/${data.room.hostelId}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                },
                credentials: "include",
              },
            )

            if (hostelResponse.ok) {
              const hostelData = await hostelResponse.json()
              // Add hostel information to the room
              data.room.hostel = hostelData.hostel
            }
          } catch (hostelErr) {
            console.error("Error fetching hostel for room:", hostelErr)
          }
        }

        setRoom(data.room)
      } catch (err) {
        console.error("Error fetching room:", err)
        setError(err.message)
        toast.error("Failed to load room data")
      } finally {
        setLoading(false)
      }
    }

    if (roomId) {
      fetchRoom()
    }
  }, [roomId])

  const handleDeleteClick = () => {
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    try {
      setDeleteLoading(true)
      const response = await fetch(`http://localhost:5000/api/hostel-owners/rooms/${roomId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to delete room")
      }

      toast.success("Room deleted successfully")

      // Redirect to rooms list after a short delay
      setTimeout(() => {
        router.push("/hostel-owners-dashboard/rooms")
      }, 1000)
    } catch (err) {
      console.error("Delete error:", err)
      toast.error(err.message || "Failed to delete room")
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
        <span className="ml-2 text-gray-600">Loading room data...</span>
      </div>
    )
  }

  if (error && !room) {
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
                <Link href="/hostel-owners-dashboard/rooms" className="text-red-700 underline">
                  Return to rooms
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">Room not found</p>
              <p className="text-sm mt-2">
                <Link href="/hostel-owners-dashboard/rooms" className="text-yellow-700 underline">
                  Return to rooms
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
          href="/hostel-owners-dashboard/rooms"
          className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 mb-4"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Rooms
        </Link>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Home className="mr-2 h-6 w-6" />
              {room.name}
            </h1>
            {room.hostel && (
              <p className="text-gray-600 mt-1 flex items-center">
                <Building className="mr-1 h-4 w-4 text-gray-400" />
                {typeof room.hostel === "object"
                  ? room.hostel.name
                  : typeof room.hostelId === "object"
                    ? room.hostelId.name
                    : "Hostel ID: " + (room.hostelId || room.hostel)}
              </p>
            )}
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <Link
              href={`/hostel-owners-dashboard/rooms/${roomId}/edit`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Edit className="mr-2 h-5 w-5" />
              Edit Room
            </Link>
            <button
              onClick={handleDeleteClick}
              className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <Trash2 className="mr-2 h-5 w-5" />
              Delete Room
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* Room Images */}
        {room.images && room.images.length > 0 ? (
          <div className="relative h-64 md:h-96 bg-gray-200">
            <img
              src={`http://localhost:5000${room.images[0]}`}
              alt={room.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null
                e.target.src = "/placeholder.svg?height=384&width=768"
              }}
            />
            {!room.availability && (
              <div className="absolute top-4 right-4 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                Not Available
              </div>
            )}
          </div>
        ) : (
          <div className="h-64 md:h-96 bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">No images available</p>
            </div>
          </div>
        )}

        {/* Room Details */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="text-gray-700 whitespace-pre-line">{room.description}</p>

              {room.features && room.features.length > 0 && (
                <div className="mt-6">
                  <h2 className="text-xl font-semibold mb-4">Features</h2>
                  <ul className="list-disc pl-5 space-y-1">
                    {room.features.map((feature, index) => (
                      <li key={index} className="text-gray-700">
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Details</h2>
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">ROOM TYPE</h3>
                  <p className="text-gray-700 capitalize">{room.type}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">PRICE</h3>
                  <p className="text-gray-700 font-semibold">{room.price.toFixed(2)} GHS</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">CAPACITY</h3>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1 text-gray-500" />
                    <p className="text-gray-700">
                      {room.capacity} {room.capacity > 1 ? "persons" : "person"}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">AVAILABILITY</h3>
                  <div className="flex items-center">
                    {room.availability ? (
                      <>
                        <Check className="h-4 w-4 mr-1 text-green-500" />
                        <p className="text-green-600">Available</p>
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 mr-1 text-red-500" />
                        <p className="text-red-600">Not Available</p>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">ADDED ON</h3>
                  <p className="text-gray-700">
                    {new Date(room.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* More Images */}
          {room.images && room.images.length > 1 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">More Images</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {room.images.slice(1).map((image, index) => (
                  <div key={index} className="relative h-32 bg-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={`http://localhost:5000${image}`}
                      alt={`${room.name} - Image ${index + 2}`}
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
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Room</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this room? This action cannot be undone.
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
