"use client"

import { useState, use, useEffect } from "react"
import { toast } from "sonner"
import { Building, ArrowLeft, Loader2, Plus, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function EditHostel({ params }) {
  const hostelId = use(params).id;
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [images, setImages] = useState([])
  const [previewImages, setPreviewImages] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    description: "",
    policies: "",
    amenities: [],
    verified: false,
  })
  const [newAmenity, setNewAmenity] = useState("")

  // Fetch hostel data on component mount
  useEffect(() => {
    const fetchHostel = async () => {
      try {
        setInitialLoading(true)
        const response = await fetch(`http://localhost:5000/api/admin/hostels/${hostelId}`, {
          credentials: "include",
        })

        if (!response.ok) {
          throw new Error("Failed to fetch hostel details")
        }

        const data = await response.json()
        const hostel = data.hostel

        // Set form data
        setFormData({
          name: hostel.name || "",
          address: hostel.address || "",
          description: hostel.description || "",
          policies: hostel.policies || "",
          amenities: hostel.amenities || [],
          verified: hostel.verified || false,
        })

        // Set existing images
        if (hostel.images && hostel.images.length > 0) {
          setExistingImages(
            hostel.images.map((path) => ({
              path,
              url: `http://localhost:5000${path}`,
            })),
          )
        }
      } catch (error) {
        console.error("Error fetching hostel:", error)
        toast.error("Failed to load hostel details")
      } finally {
        setInitialLoading(false)
      }
    }

    fetchHostel()
  }, [hostelId])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleAddAmenity = () => {
    if (newAmenity.trim() !== "") {
      setFormData((prev) => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()],
      }))
      setNewAmenity("")
    }
  }

  const handleRemoveAmenity = (index) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index),
    }))
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      setImages((prevImages) => [...prevImages, ...files])

      // Create preview URLs for the images
      const newPreviewImages = files.map((file) => URL.createObjectURL(file))
      setPreviewImages((prevPreviews) => [...prevPreviews, ...newPreviewImages])
    }
  }

  const handleRemoveImage = (index) => {
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(previewImages[index])

    setImages((prevImages) => prevImages.filter((_, i) => i !== index))
    setPreviewImages((prevPreviews) => prevPreviews.filter((_, i) => i !== index))
  }

  const handleRemoveExistingImage = (index) => {
    setExistingImages((prevImages) => prevImages.filter((_, i) => i !== index))
  }

  // Update the image upload endpoint
  const uploadImages = async () => {
    if (images.length === 0) return []

    setUploading(true)
    const uploadedImagePaths = []

    try {
      for (const image of images) {
        const formData = new FormData()
        formData.append("image", image)

        // Try the correct endpoint
        const response = await fetch("http://localhost:5000/api/upload", {
          method: "POST",
          body: formData,
          credentials: "include",
        })

        if (!response.ok) {
          console.error("Image upload failed with status:", response.status)
          toast.warning("Failed to upload images, continuing with existing images only")
          return []
        }

        const data = await response.json()
        uploadedImagePaths.push(data.imagePath || data.path || data.url)
      }

      return uploadedImagePaths
    } catch (error) {
      console.error("Error uploading images:", error)
      toast.warning("Failed to upload images, continuing with existing images only")
      return []
    } finally {
      setUploading(false)
    }
  }

  // Update the hostel update endpoint
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.address) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      setLoading(true)

      // First upload any new images
      const newImagePaths = await uploadImages()

      // Combine existing and new image paths
      const allImagePaths = [...existingImages.map((img) => img.path), ...newImagePaths]

      // Use the correct admin endpoint for updating a hostel
      const response = await fetch(`http://localhost:5000/api/admin/hostels/${hostelId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          images: allImagePaths,
        }),
        credentials: "include",
      })

      if (!response.ok) {
        console.error("Hostel update failed with status:", response.status)
        throw new Error(`Failed to update hostel: ${response.status} ${response.statusText}`)
      }

      toast.success("Hostel updated successfully")
      router.push(`/admin-dashboard/hostels/${hostelId}`)
    } catch (error) {
      console.error("Error updating hostel:", error)
      toast.error(`Failed to update hostel: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
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
          Back to Hostel Details
        </Link>
      </div>

      <div className="flex items-center mb-6">
        <Building className="h-6 w-6 mr-2" />
        <h1 className="text-2xl font-bold">Edit Hostel</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
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

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
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
          </div>

          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
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
            <label htmlFor="policies" className="block text-sm font-medium text-gray-700 mb-1">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Amenities</label>
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
                <div key={index} className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
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

          <div className="mb-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="verified"
                name="verified"
                checked={formData.verified}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="verified" className="ml-2 block text-sm text-gray-700">
                Verified Hostel
              </label>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Existing Images</label>
            {existingImages.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {existingImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.url || "/placeholder.svg"}
                      alt={`Hostel Image ${index + 1}`}
                      className="h-32 w-full object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No existing images</p>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Add New Images</label>
            <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
              <input
                type="file"
                id="images"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
              <label htmlFor="images" className="cursor-pointer flex flex-col items-center justify-center">
                <Plus className="h-10 w-10 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Click to upload new images</span>
                <span className="text-xs text-gray-400 mt-1">PNG, JPG, JPEG up to 5MB</span>
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
              href={`/admin-dashboard/hostels/${hostelId}`}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || uploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 flex items-center"
            >
              {(loading || uploading) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {uploading ? "Uploading Images..." : loading ? "Updating Hostel..." : "Update Hostel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
