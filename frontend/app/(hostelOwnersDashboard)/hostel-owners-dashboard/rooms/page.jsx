"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Home, Search, Building, Loader, AlertCircle, Eye, Edit, Trash2, DollarSign } from "lucide-react"
import { toast } from "sonner"

export default function RoomsPage() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [roomToDelete, setRoomToDelete] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    fetchRooms()
  }, [])

  const fetchRooms = async () => {
    try {
      setLoading(true)

      // First, get all hostels owned by the user
      const hostelsResponse = await fetch("http://localhost:5000/api/hostel-owners/hostels", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      if (!hostelsResponse.ok) {
        throw new Error("Failed to fetch hostels")
      }

      const hostelsData = await hostelsResponse.json()
      const hostels = hostelsData.hostels || []

      // Then fetch rooms for each hostel and combine them
      let allRooms = []

      for (const hostel of hostels) {
        try {
          const roomsResponse = await fetch(`http://localhost:5000/api/hostel-owners/hostels/${hostel._id}/rooms`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          })

          if (roomsResponse.ok) {
            const roomsData = await roomsResponse.json()
            // Add hostel information to each room
            const roomsWithHostel = (roomsData.rooms || []).map((room) => ({
              ...room,
              hostel: {
                _id: hostel._id,
                name: hostel.name,
              },
            }))
            allRooms = [...allRooms, ...roomsWithHostel]
          }
        } catch (err) {
          console.error(`Error fetching rooms for hostel ${hostel._id}:`, err)
        }
      }

      setRooms(allRooms)
    } catch (err) {
      console.error("Error fetching rooms:", err)
      setError(err.message)
      toast.error("Failed to load rooms")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (room) => {
    setRoomToDelete(room)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!roomToDelete) return

    try {
      setDeleteLoading(true)
      const response = await fetch(`http://localhost:5000/api/hostel-owners/rooms/${roomToDelete._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to delete room")
      }

      // Remove the deleted room from the state
      setRooms(rooms.filter((r) => r._id !== roomToDelete._id))
      toast.success("Room deleted successfully")
    } catch (err) {
      console.error("Error deleting room:", err)
      toast.error(err.message || "Failed to delete room")
    } finally {
      setDeleteLoading(false)
      setShowDeleteModal(false)
      setRoomToDelete(null)
    }
  }

  const cancelDelete = () => {
    setShowDeleteModal(false)
    setRoomToDelete(null)
  }

  // Filter rooms based on search term
  const filteredRooms = rooms.filter(
    (room) =>
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (room.hostel && room.hostel.name && room.hostel.name.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Home className="mr-2 h-6 w-6" />
            My Rooms
          </h1>
          <p className="text-gray-600 mt-1">Manage your hostel rooms and their details</p>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Search rooms by name, type, or hostel..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader className="h-8 w-8 text-indigo-600 animate-spin" />
          <span className="ml-2 text-gray-600">Loading rooms...</span>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filteredRooms.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Home className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No rooms found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? "No rooms match your search criteria." : "Get started by creating a new room."}
          </p>
          {searchTerm ? (
            <button
              onClick={() => setSearchTerm("")}
              className="mt-4 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Clear search
            </button>
          ) : (
            <div className="mt-6">
              <Link
                href="/hostel-owners-dashboard/hostels"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Building className="-ml-1 mr-2 h-5 w-5" />
                Go to Hostels to Add Rooms
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Rooms grid */}
      {!loading && !error && filteredRooms.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
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
              </div>

              {/* Room details */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
                  <div className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">{room.type}</div>
                </div>

                {room.hostel && room.hostel.name && (
                  <div className="flex items-center text-gray-600 mb-2">
                    <Building className="h-4 w-4 mr-1 text-gray-500" />
                    <span>{room.hostel.name}</span>
                  </div>
                )}

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
                    <Eye className="mr-1 h-4 w-4" />
                    View
                  </Link>
                  <Link
                    href={`/hostel-owners-dashboard/rooms/${room._id}/edit`}
                    className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Edit className="mr-1 h-4 w-4" />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteClick(room)}
                    className="inline-flex items-center px-2.5 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
                        Are you sure you want to delete {roomToDelete?.name}? This action cannot be undone.
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
