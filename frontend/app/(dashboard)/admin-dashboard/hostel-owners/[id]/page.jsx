"use client";

import { useState, use, useEffect } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  Mail,
  Phone,
  Building,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function HostelOwnerDetails({ params }) {
  const ownerId = use(params).id;
  const router = useRouter();
  const [owner, setOwner] = useState(null);
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const fetchOwnerDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:5000/api/admin/hostel-owners/${ownerId}`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch hostel owner details");
        }

        const data = await response.json();
        setOwner(data.hostelOwner);

        // Fetch hostels owned by this owner
        const hostelsResponse = await fetch(
          `http://localhost:5000/api/admin/hostels`,
          {
            credentials: "include",
          }
        );

        if (hostelsResponse.ok) {
          const hostelsData = await hostelsResponse.json();
          // Filter hostels by owner ID
          const ownerHostels = hostelsData.hostels.filter(
            (hostel) => hostel.owner._id === ownerId
          );
          setHostels(ownerHostels);
        }
      } catch (error) {
        console.error("Error fetching hostel owner details:", error);
        toast.error("Failed to load hostel owner details");
      } finally {
        setLoading(false);
      }
    };

    fetchOwnerDetails();
  }, [ownerId]);

  const handleVerifyToggle = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/hostel-owners/${ownerId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ verified: !owner.verified }),
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update verification status");
      }

      setOwner({ ...owner, verified: !owner.verified });
      toast.success(
        `Hostel owner ${
          owner.verified ? "unverified" : "verified"
        } successfully`
      );
    } catch (error) {
      console.error("Error updating verification:", error);
      toast.error("Failed to update verification status");
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/hostel-owners/${ownerId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete hostel owner");
      }

      toast.success("Hostel owner deleted successfully");
      router.push("/admin-dashboard/hostel-owners");
    } catch (error) {
      console.error("Error deleting hostel owner:", error);
      toast.error("Failed to delete hostel owner");
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

  if (!owner) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">
            Hostel Owner Not Found
          </h2>
          <p className="text-gray-500 mb-6">
            The hostel owner you're looking for doesn't exist or you don't have
            permission to view it.
          </p>
          <Link
            href="/admin-dashboard/hostel-owners"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Hostel Owners
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <Link
          href="/admin-dashboard/hostel-owners"
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Hostel Owners
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
        <div className="flex items-center">
          <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
            <span className="text-purple-600 font-medium text-lg">
              {owner.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold">{owner.name}</h1>
            <p className="text-gray-600">{owner.businessName}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-4 sm:mt-0">
          <button
            onClick={handleVerifyToggle}
            className={`flex items-center px-4 py-2 rounded-lg ${
              owner.verified
                ? "bg-green-100 text-green-800 hover:bg-green-200"
                : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
            }`}
          >
            {owner.verified ? (
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
            href={`/admin-dashboard/hostel-owners/${ownerId}/edit`}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Owner
          </Link>

          <button
            onClick={handleDeleteClick}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Owner
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Personal Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Full Name
                  </h3>
                  <p className="text-gray-900">{owner.name}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Email Address
                  </h3>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="text-gray-900">{owner.email}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Phone Number
                  </h3>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="text-gray-900">{owner.phoneNumber}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Business Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Business Name
                  </h3>
                  <div className="flex items-center">
                    <Building className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="text-gray-900">{owner.businessName}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Business Address
                  </h3>
                  <p className="text-gray-900">{owner.businessAddress}</p>
                </div>

                {owner.businessDescription && (
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">
                      Business Description
                    </h3>
                    <p className="text-gray-900">{owner.businessDescription}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                Owned Hostels ({hostels.length})
              </h2>

              {hostels.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    No Hostels
                  </h3>
                  <p className="text-gray-500">
                    This owner doesn't have any hostels yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hostels.map((hostel) => (
                    <div
                      key={hostel._id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {hostel.name}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {hostel.address}
                          </p>
                          <div className="mt-2">
                            {hostel.verified ? (
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                Verified
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                                Pending
                              </span>
                            )}
                          </div>
                        </div>
                        <Link
                          href={`/admin-dashboard/hostels/${hostel._id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Account Status</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Verification Status
                  </h3>
                  <div className="flex items-center">
                    {owner.verified ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-green-800">Verified</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-yellow-500 mr-2" />
                        <span className="text-yellow-800">
                          Pending Verification
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Account Created
                  </h3>
                  <p className="text-gray-900">
                    {new Date(owner.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Last Updated
                  </h3>
                  <p className="text-gray-900">
                    {new Date(owner.updatedAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Quick Actions</h2>

              <div className="space-y-3">
                <Link
                  href={`/admin-dashboard/hostel-owners/${ownerId}/edit`}
                  className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Edit className="h-5 w-5 text-blue-600 mr-3" />
                  <span>Edit Owner Information</span>
                </Link>

                <button
                  onClick={handleVerifyToggle}
                  className="w-full flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 text-left transition-colors"
                >
                  {owner.verified ? (
                    <>
                      <XCircle className="h-5 w-5 text-yellow-600 mr-3" />
                      <span>Remove Verification</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                      <span>Verify Owner</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDeleteClick}
                  className="w-full flex items-center p-3 bg-gray-50 rounded-lg hover:bg-red-50 text-left transition-colors"
                >
                  <Trash2 className="h-5 w-5 text-red-600 mr-3" />
                  <span>Delete Owner Account</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Confirm Deletion</h3>
            <p className="mb-6">
              Are you sure you want to delete the hostel owner "{owner.name}" (
              {owner.businessName})? This action cannot be undone and will also
              delete all associated hostels.
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100 order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 order-1 sm:order-2"
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
