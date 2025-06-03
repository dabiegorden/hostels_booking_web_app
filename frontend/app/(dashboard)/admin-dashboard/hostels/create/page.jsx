"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Building,
  ArrowLeft,
  Loader2,
  Plus,
  X,
  User,
  Mail,
  Phone,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CreateHostel() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    description: "",
    policies: "",
    amenities: [],
    // Owner information fields
    ownerName: "",
    ownerEmail: "",
    ownerPhone: "",
    ownerBusinessName: "",
    ownerBusinessAddress: "",
  });
  const [newAmenity, setNewAmenity] = useState("");
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddAmenity = () => {
    if (newAmenity.trim() !== "") {
      setFormData((prev) => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()],
      }));
      setNewAmenity("");
    }
  };

  const handleRemoveAmenity = (index) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index),
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setImages((prevImages) => [...prevImages, ...files]);

      // Create preview URLs for the images
      const newPreviewImages = files.map((file) => URL.createObjectURL(file));
      setPreviewImages((prevPreviews) => [
        ...prevPreviews,
        ...newPreviewImages,
      ]);
    }
  };

  const handleRemoveImage = (index) => {
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(previewImages[index]);

    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    setPreviewImages((prevPreviews) =>
      prevPreviews.filter((_, i) => i !== index)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.address) {
      toast.error("Please fill in all required hostel fields");
      return;
    }

    if (
      !formData.ownerName ||
      !formData.ownerEmail ||
      !formData.ownerPhone ||
      !formData.ownerBusinessName
    ) {
      toast.error("Please fill in all required owner information fields");
      return;
    }

    try {
      setLoading(true);

      // Create FormData object for multipart/form-data submission
      const formDataObj = new FormData();

      // Add hostel fields
      formDataObj.append("name", formData.name);
      formDataObj.append("address", formData.address);
      formDataObj.append("description", formData.description || "");
      formDataObj.append("policies", formData.policies || "");

      // Add owner information
      formDataObj.append("ownerName", formData.ownerName);
      formDataObj.append("ownerEmail", formData.ownerEmail);
      formDataObj.append("ownerPhone", formData.ownerPhone);
      formDataObj.append("ownerBusinessName", formData.ownerBusinessName);
      formDataObj.append(
        "ownerBusinessAddress",
        formData.ownerBusinessAddress || ""
      );

      // Add amenities as JSON string
      formDataObj.append("amenities", JSON.stringify(formData.amenities));

      // Add images
      images.forEach((image) => {
        formDataObj.append("images", image);
      });

      // Send the request with FormData
      const response = await fetch("http://localhost:5000/api/admin/hostels", {
        method: "POST",
        body: formDataObj,
        credentials: "include",
      });

      if (!response.ok) {
        console.error("Hostel creation failed with status:", response.status);
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Failed to create hostel: ${errorData.message || response.statusText}`
        );
      }

      toast.success("Hostel created successfully");
      router.push("/admin-dashboard/hostels");
    } catch (error) {
      console.error("Error creating hostel:", error);
      toast.error(`Failed to create hostel: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

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

      <div className="flex items-center mb-6">
        <Building className="h-6 w-6 mr-2" />
        <h1 className="text-2xl font-bold">Create New Hostel</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6">
          <h2 className="text-lg font-semibold mb-4">Hostel Information</h2>

          <div className="mb-6">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Hostel Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="policies"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Policies
            </label>
            <textarea
              id="policies"
              name="policies"
              value={formData.policies}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amenities
            </label>
            <div className="flex items-center mb-2">
              <input
                type="text"
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add an amenity (e.g., WiFi, Parking)"
              />
              <button
                type="button"
                onClick={handleAddAmenity}
                className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.amenities.map((amenity, index) => (
                <div
                  key={index}
                  className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
                >
                  <span>{amenity}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAmenity(index)}
                    className="ml-2 text-blue-800 hover:text-blue-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 mb-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-gray-500" />
              Hostel Owner Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label
                  htmlFor="ownerName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Owner Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    id="ownerName"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="ownerEmail"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Owner Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="email"
                    id="ownerEmail"
                    name="ownerEmail"
                    value={formData.ownerEmail}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label
                  htmlFor="ownerPhone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Owner Phone <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="tel"
                    id="ownerPhone"
                    name="ownerPhone"
                    value={formData.ownerPhone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="ownerBusinessName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Business Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    id="ownerBusinessName"
                    name="ownerBusinessName"
                    value={formData.ownerBusinessName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label
                htmlFor="ownerBusinessAddress"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Business Address
              </label>
              <input
                type="text"
                id="ownerBusinessAddress"
                name="ownerBusinessAddress"
                value={formData.ownerBusinessAddress}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hostel Images
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
              <input
                type="file"
                id="images"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
              <label
                htmlFor="images"
                className="cursor-pointer flex flex-col items-center justify-center"
              >
                <Plus className="h-10 w-10 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">
                  Click to upload images
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  PNG, JPG, JPEG up to 5MB
                </span>
              </label>
            </div>

            {previewImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {previewImages.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview || "/placeholder.svg"}
                      alt={`Preview ${index + 1}`}
                      className="h-32 w-full object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <Link
              href="/admin-dashboard/hostels"
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 flex items-center"
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {loading ? "Creating Hostel..." : "Create Hostel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
