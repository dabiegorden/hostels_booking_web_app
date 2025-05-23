"use client"

import { useState, use, useEffect } from "react"
import { toast } from "sonner"
import { Bed, User, DollarSign, CheckCircle, XCircle, ArrowLeft, Edit, Trash2, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function RoomDetails({ params }) {
  const { id: hostelId, roomId } = use(params);
  const router = useRouter()
  const [room, setRoom] = useState(null)
  const [hostel, setHostel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        setLoading(true)
        // Fetch room details
        const roomResponse = await fetch(`http://localhost:5000/api/public/rooms/${roomId}`, {
          credentials: "include",
        })

        if (!roomResponse.ok) {
          throw new Error("Failed to fetch room details")
        }

        const roomData = await roomResponse.json()
        setRoom(roomData.room)

        // Fetch hostel details
        const hostelResponse = await fetch(`http://localhost:5000/api/admin/hostels/${hostelId}`, {
          credentials: "include",
        })

        if (hostelResponse.ok) {
          const hostelData = await hostelResponse.json()
          setHostel(hostelData.hostel)
        }
      } catch (error) {
        console.error("Error fetching room details:", error)
        toast.error("Failed to load room details")
      } finally {
        setLoading(false)
      }
    }

    fetchRoomDetails()
  }, [hostelId, roomId])

  const handleAvailabilityToggle = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/rooms/${roomId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ availability: !room.availability }),
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to update room availability")
      }

      setRoom({ ...room, availability: !room.availability })
      toast.success(`Room marked as ${room.availability ? "unavailable" : "available"}`)
    } catch (error) {
      console.error("Error updating room availability:", error)
      toast.error("Failed to update room availability")
    }
  }

  const handleDeleteClick = () => {
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/rooms/${roomId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to delete room")
      }

      toast.success("Room deleted successfully")
      router.push(`/admin-dashboard/hostels/${hostelId}`)
    } catch (error) {
      console.error("Error deleting room:", error)
      toast.error("Failed to delete room")
    } finally {
      setShowDeleteModal(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (!room) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Room Not Found</h2>
          <p className="text-gray-500 mb-6">
            The room you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Link
            href={`/admin-dashboard/hostels/${hostelId}`}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Hostel
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          href={`/admin-dashboard/hostels/${hostelId}`}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Hostel
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start gap-6 mb-6">
        <div>
          <h1 className="text-3xl font-bold">{room.name}</h1>
          <div className="flex items-center text-gray-600 mt-2">
            <Bed className="h-4 w-4 mr-1" />
            <span>{room.type}</span>
            {hostel && (
              <>
                <span className="mx-2">•</span>
                <span>{hostel.name}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleAvailabilityToggle}
            className={`flex items-center px-4 py-2 rounded-lg ${
              room.availability
                ? "bg-green-100 text-green-800 hover:bg-green-200"
                : "bg-red-100 text-red-800 hover:bg-red-200"
            }`}
          >
            {room.availability ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Available
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 mr-2" />
                Unavailable
              </>
            )}
          </button>

          <Link
            href={`/admin-dashboard/hostels/${hostelId}/rooms/${roomId}/edit`}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Room
          </Link>

          <button
            onClick={handleDeleteClick}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Room
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Room Details</h2>

              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-2">Description</h3>
                <p className="text-gray-600">{room.description || "No description provided."}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Price</h3>
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-green-600 mr-1" />
                    <span className="text-2xl font-bold">GH₵ {room.price.toLocaleString()}</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Capacity</h3>
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-blue-600 mr-1" />
                    <span className="text-2xl font-bold">
                      {room.capacity} {room.capacity > 1 ? "People" : "Person"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-2">Amenities</h3>
                {room.amenities && room.amenities.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {room.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No amenities listed.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Room Images</h2>
              {room.images && room.images.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {room.images.map((image, index) => (
                    <div key={index} className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={`http://localhost:5000${image}`}
                        alt={`${room.name} - Image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No images available.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Confirm Deletion</h3>
            <p className="mb-6">
              Are you sure you want to delete the room "{room.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
