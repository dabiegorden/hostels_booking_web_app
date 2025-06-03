"use client";

import { useState, use, useEffect } from "react";
import { toast } from "sonner";
import {
  MapPin,
  Star,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Bed,
  Edit,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function HostelDetails({ params }) {
  const hostelId = use(params).id;
  const router = useRouter();
  const [hostel, setHostel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchHostelDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:5000/api/admin/hostels/${hostelId}`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch hostel details");
        }

        const data = await response.json();
        setHostel(data.hostel);

        // Fetch rooms for this hostel
        const roomsResponse = await fetch(
          `http://localhost:5000/api/admin/hostels/${hostelId}/rooms`,
          {
            credentials: "include",
          }
        );

        if (roomsResponse.ok) {
          const roomsData = await roomsResponse.json();
          setRooms(roomsData.rooms || []);
        }
      } catch (error) {
        console.error("Error fetching hostel details:", error);
        toast.error("Failed to load hostel details");
      } finally {
        setLoading(false);
      }
    };

    fetchHostelDetails();
  }, [hostelId]);

  const handleVerifyToggle = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/hostels/${hostelId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ verified: !hostel.verified }),
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update hostel verification status");
      }

      setHostel({ ...hostel, verified: !hostel.verified });
      toast.success(
        `Hostel ${hostel.verified ? "unverified" : "verified"} successfully`
      );
    } catch (error) {
      console.error("Error updating hostel verification:", error);
      toast.error("Failed to update hostel verification status");
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/hostels/${hostelId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete hostel");
      }

      toast.success("Hostel deleted successfully");
      router.push("/admin-dashboard/hostels");
    } catch (error) {
      console.error("Error deleting hostel:", error);
      toast.error("Failed to delete hostel");
    } finally {
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!hostel) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">
            Hostel Not Found
          </h2>
          <p className="text-gray-500 mb-6">
            The hostel you're looking for doesn't exist or you don't have
            permission to view it.
          </p>
          <Link
            href="/admin-dashboard/hostels"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Hostels
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          href="/admin-dashboard/hostels"
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Hostels
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start gap-6 mb-6">
        <div>
          <h1 className="text-3xl font-bold">{hostel.name}</h1>
          <div className="flex items-center text-gray-600 mt-2">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{hostel.address}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleVerifyToggle}
            className={`flex items-center px-4 py-2 rounded-lg ${
              hostel.verified
                ? "bg-green-100 text-green-800 hover:bg-green-200"
                : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
            }`}
          >
            {hostel.verified ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Verified
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 mr-2" />
                Not Verified
              </>
            )}
          </button>

          <Link
            href={`/admin-dashboard/hostels/${hostelId}/edit`}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Hostel
          </Link>

          <button
            onClick={handleDeleteClick}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Hostel
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
        <div className="border-b">
          <div className="flex overflow-x-auto">
            <button
              className={`px-6 py-3 font-medium text-sm focus:outline-none ${
                activeTab === "details"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("details")}
            >
              Hostel Details
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm focus:outline-none ${
                activeTab === "rooms"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("rooms")}
            >
              Rooms ({rooms.length})
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm focus:outline-none ${
                activeTab === "bookings"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("bookings")}
            >
              Bookings
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === "details" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="mb-6">
                  <h2 className="text-xl font-bold mb-4">Description</h2>
                  <p className="text-gray-700">
                    {hostel.description || "No description provided."}
                  </p>
                </div>

                <div className="mb-6">
                  <h2 className="text-xl font-bold mb-4">Amenities</h2>
                  {hostel.amenities && hostel.amenities.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {hostel.amenities.map((amenity, index) => (
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

                <div className="mb-6">
                  <h2 className="text-xl font-bold mb-4">Policies</h2>
                  <p className="text-gray-700">
                    {hostel.policies || "No policies provided."}
                  </p>
                </div>
              </div>

              <div>
                <div className="bg-gray-50 rounded-lg p-6">
                  <h2 className="text-xl font-bold mb-4">Hostel Info</h2>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Owner</p>
                      <div className="flex items-center mt-1">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <p className="font-medium">
                          {hostel.owner?.name ||
                            hostel.owner?.businessName ||
                            "N/A"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Rating</p>
                      <div className="flex items-center mt-1">
                        <Star className="h-4 w-4 text-amber-400 mr-2" />
                        <p className="font-medium">
                          {hostel.rating
                            ? `${hostel.rating.toFixed(1)} / 5`
                            : "No ratings yet"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Created On</p>
                      <div className="flex items-center mt-1">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <p className="font-medium">
                          {new Date(hostel.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h2 className="text-xl font-bold mb-4">Hostel Images</h2>
                  {hostel.images && hostel.images.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {hostel.images.map((image, index) => (
                        <div
                          key={index}
                          className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden"
                        >
                          <img
                            src={`http://localhost:5000${image}`}
                            alt={`${hostel.name} - Image ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No images available.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "rooms" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Available Rooms</h2>
                <Link
                  href={`/admin-dashboard/hostels/${hostelId}/rooms/create`}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Room
                </Link>
              </div>

              {rooms.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Bed className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    No Rooms Available
                  </h3>
                  <p className="text-gray-500 mb-6">
                    This hostel doesn't have any rooms yet.
                  </p>
                  <Link
                    href={`/admin-dashboard/hostels/${hostelId}/rooms/create`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Add First Room
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rooms.map((room) => (
                    <div
                      key={room._id}
                      className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="aspect-video bg-gray-100 relative">
                        {room.images && room.images.length > 0 ? (
                          <img
                            src={`http://localhost:5000${room.images[0]}`}
                            alt={room.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Bed className="h-10 w-10 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                          GH₵ {room.price.toLocaleString()}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-lg mb-1">{room.name}</h3>
                        <p className="text-gray-500 text-sm mb-3">
                          {room.type}
                        </p>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center text-sm text-gray-600">
                            <User className="h-4 w-4 mr-1" />
                            <span>Capacity: {room.capacity}</span>
                          </div>
                          <div>
                            {room.availability ? (
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                Available
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                                Booked
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="mt-4 flex justify-end space-x-2">
                          <Link
                            href={`/admin-dashboard/hostels/${hostelId}/rooms/${room._id}`}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "bookings" && (
            <div>
              <h2 className="text-xl font-bold mb-6">
                Bookings for this Hostel
              </h2>
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  Booking Information
                </h3>
                <p className="text-gray-500 mb-6">
                  View all bookings related to this hostel.
                </p>
                <Link
                  href={`/admin-dashboard/bookings?hostelId=${hostelId}`}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  View Bookings
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Confirm Deletion</h3>
            <p className="mb-6">
              Are you sure you want to delete the hostel "{hostel.name}"? This
              action cannot be undone and will also delete all rooms associated
              with this hostel.
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
  );
}
