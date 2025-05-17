"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Building, Plus, Search, MapPin, Wifi, Loader, AlertCircle, Eye, Edit, Trash2 } from "lucide-react"
import { toast } from "sonner"

export default function HostelsPage() {
  const [hostels, setHostels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [hostelToDelete, setHostelToDelete] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    fetchHostels()
  }, [])

  const fetchHostels = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:5000/api/hostel-owners/hostels", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch hostels")
      }

      const data = await response.json()
      setHostels(data.hostels || [])
    } catch (err) {
      console.error("Error fetching hostels:", err)
      setError(err.message)
      toast.error("Failed to load hostels")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (hostel) => {
    setHostelToDelete(hostel)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!hostelToDelete) return

    try {
      setDeleteLoading(true)
      const response = await fetch(`http://localhost:5000/api/hostel-owners/hostels/${hostelToDelete._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to delete hostel")
      }

      // Remove the deleted hostel from the state
      setHostels(hostels.filter((h) => h._id !== hostelToDelete._id))
      toast.success("Hostel deleted successfully")
    } catch (err) {
      console.error("Error deleting hostel:", err)
      toast.error(err.message || "Failed to delete hostel")
    } finally {
      setDeleteLoading(false)
      setShowDeleteModal(false)
      setHostelToDelete(null)
    }
  }

  const cancelDelete = () => {
    setShowDeleteModal(false)
    setHostelToDelete(null)
  }

  // Filter hostels based on search term
  const filteredHostels = hostels.filter(
    (hostel) =>
      hostel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hostel.address.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Building className="mr-2 h-6 w-6" />
            My Hostels
          </h1>
          <p className="text-gray-600 mt-1">Manage your hostels and their details</p>
        </div>
        <Link
          href="/hostel-owners-dashboard/hostels/new"
          className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="mr-2 h-5 w-5" />
          Add New Hostel
        </Link>
      </div>

      {/* Search bar */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Search hostels by name or address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader className="h-8 w-8 text-indigo-600 animate-spin" />
          <span className="ml-2 text-gray-600">Loading hostels...</span>
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
      {!loading && !error && filteredHostels.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Building className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hostels found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? "No hostels match your search criteria." : "Get started by creating a new hostel."}
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
                href="/hostel-owners-dashboard/hostels/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="-ml-1 mr-2 h-5 w-5" />
                Add New Hostel
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Hostels grid */}
      {!loading && !error && filteredHostels.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHostels.map((hostel) => (
            <div
              key={hostel._id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Hostel image */}
              <div className="relative h-48 bg-gray-200">
                {hostel.images && hostel.images.length > 0 ? (
                  <img
                    src={`http://localhost:5000${hostel.images[0]}`}
                    alt={hostel.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = "/placeholder.svg?height=192&width=384"
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <Building className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Hostel details */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{hostel.name}</h3>
                <p className="text-gray-600 text-sm mb-2 flex items-center">
                  <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                  {hostel.address}
                </p>

                {/* Amenities preview */}
                {hostel.amenities && hostel.amenities.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1 mt-2">
                      {hostel.amenities.slice(0, 3).map((amenity, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800"
                        >
                          <Wifi className="mr-1 h-3 w-3" />
                          {amenity}
                        </span>
                      ))}
                      {hostel.amenities.length > 3 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          +{hostel.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex justify-between mt-4 pt-4 border-t border-gray-100">
                  <Link
                    href={`/hostel-owners-dashboard/hostels/${hostel._id}`}
                    className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Eye className="mr-1 h-4 w-4" />
                    View
                  </Link>
                  <Link
                    href={`/hostel-owners-dashboard/hostels/${hostel._id}/edit`}
                    className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Edit className="mr-1 h-4 w-4" />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteClick(hostel)}
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
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Hostel</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete {hostelToDelete?.name}? This action cannot be undone and will
                        also delete all rooms associated with this hostel.
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
