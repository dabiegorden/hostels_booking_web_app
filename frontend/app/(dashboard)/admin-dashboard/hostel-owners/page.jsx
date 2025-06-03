"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  User,
  Search,
  Plus,
  Edit,
  Trash2,
  Mail,
  Phone,
  Building,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function HostelOwners() {
  const [hostelOwners, setHostelOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [ownerToDelete, setOwnerToDelete] = useState(null);

  useEffect(() => {
    fetchHostelOwners();
  }, []);

  const fetchHostelOwners = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:5000/api/admin/hostel-owners",
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch hostel owners");
      }

      const data = await response.json();
      setHostelOwners(data.hostelOwners || []);
    } catch (error) {
      console.error("Error fetching hostel owners:", error);
      toast.error("Failed to load hostel owners");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (owner) => {
    setOwnerToDelete(owner);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!ownerToDelete) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/hostel-owners/${ownerToDelete._id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete hostel owner");
      }

      toast.success("Hostel owner deleted successfully");
      setHostelOwners(hostelOwners.filter((o) => o._id !== ownerToDelete._id));
    } catch (error) {
      console.error("Error deleting hostel owner:", error);
      toast.error("Failed to delete hostel owner");
    } finally {
      setShowDeleteModal(false);
      setOwnerToDelete(null);
    }
  };

  const filteredOwners = hostelOwners.filter(
    (owner) =>
      owner.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      owner.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      owner.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      owner.businessAddress?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold flex items-center">
          <User className="mr-2 h-6 w-6" />
          Manage Hostel Owners
        </h1>
        <Link
          href="/admin-dashboard/hostel-owners/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Hostel Owner
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm mb-6">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search hostel owners by name, email, business name or address..."
              className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : filteredOwners.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            No hostel owners found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px] min-w-[200px]">
                    Owner
                  </TableHead>
                  <TableHead className="hidden md:table-cell min-w-[200px]">
                    Contact
                  </TableHead>
                  <TableHead className="min-w-[180px]">Business</TableHead>
                  <TableHead className="hidden lg:table-cell w-[100px]">
                    Status
                  </TableHead>
                  <TableHead className="text-right w-[100px]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOwners.map((owner) => (
                  <TableRow key={owner._id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center min-w-0">
                        <div className="h-10 w-10 flex-shrink-0 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 font-medium text-sm">
                            {owner.name?.charAt(0).toUpperCase() || "O"}
                          </span>
                        </div>
                        <div className="ml-3 min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {owner.name}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            ID: {owner._id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="hidden md:table-cell">
                      <div className="space-y-1">
                        <div className="text-sm text-gray-900 flex items-center">
                          <Mail className="h-3 w-3 mr-1 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{owner.email}</span>
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Phone className="h-3 w-3 mr-1 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{owner.phoneNumber}</span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <Building className="h-3 w-3 mr-1 text-gray-400 flex-shrink-0" />
                          <div className="text-sm text-gray-900 truncate">
                            {owner.businessName}
                          </div>
                        </div>
                        {/* <div className="text-sm text-gray-500 truncate">{owner.businessAddress}</div> */}
                        <div className="lg:hidden">
                          {owner.verified ? (
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Verified
                            </span>
                          ) : (
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          )}
                        </div>
                        <div className="md:hidden mt-2 space-y-1">
                          <div className="text-xs text-gray-600 flex items-center">
                            <Mail className="h-3 w-3 mr-1 text-gray-400" />
                            <span className="truncate">{owner.email}</span>
                          </div>
                          <div className="text-xs text-gray-600 flex items-center">
                            <Phone className="h-3 w-3 mr-1 text-gray-400" />
                            <span className="truncate">
                              {owner.phoneNumber}
                            </span>
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="hidden lg:table-cell">
                      {owner.verified ? (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Verified
                        </span>
                      ) : (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <Link
                          href={`/admin-dashboard/hostel-owners/${owner._id}/edit`}
                          className="text-amber-600 hover:text-amber-900 p-1 hover:bg-amber-50 rounded"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(owner)}
                          className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Confirm Deletion</h3>
            <p className="mb-6">
              Are you sure you want to delete the hostel owner "
              {ownerToDelete?.name}" ({ownerToDelete?.businessName})? This
              action cannot be undone and will also delete all associated
              hostels.
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
