"use client"

import { useState, use, useEffect } from "react"
import { toast } from "sonner"
import { Bed, ArrowLeft, Loader2, Plus, X, User, DollarSign } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function EditRoom({ params }) {
  const { id: hostelId, roomId } = use(params);
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [hostel, setHostel] = useState(null)
  const [images, setImages] = useState([])
  const [previewImages, setPreviewImages] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    description: "",
    price: "",
    capacity: 1,
    availability: true,
    amenities: [],
  })
  const [newAmenity, setNewAmenity] = useState("")

  // Fetch hostel and room data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setInitialLoading(true)

        // Fetch hostel details
        const hostelResponse = await fetch(`http://localhost:5000/api/admin/hostels/${hostelId}`, {
          credentials: "include",
        })

        if (!hostelResponse.ok) {
          throw new Error("Failed to fetch hostel details")
        }

        const hostelData = await hostelResponse.json()
        setHostel(hostelData.hostel)

        // Fetch room details
        const roomResponse = await fetch(`http://localhost:5000/api/public/rooms/${roomId}`, {
          credentials: "include",
        })

        if (!roomResponse.ok) {
          throw new Error("Failed to fetch room details")
        }

        const roomData = await roomResponse.json()
        const room = roomData.room

        // Set form data
        setFormData({
          name: room.name || "",
          type: room.type || "",
          description: room.description || "",
          price: room.price || "",
          capacity: room.capacity || 1,
          availability: room.availability !== undefined ? room.availability : true,
          amenities: room.amenities || [],
        })

        // Set existing images
        if (room.images && room.images.length > 0) {
          setExistingImages(
            room.images.map((path) => ({
              path,
              url: `http://localhost:5000${path}`,
            })),
          )
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Failed to load room data")
      } finally {
        setInitialLoading(false)
      }
    }

    fetchData()
  }, [hostelId, roomId])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? Number.parseFloat(value) || "" : value,
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

  // Update the room update endpoint
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.type || !formData.price) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      setLoading(true)

      // First upload any new images
      const newImagePaths = await uploadImages()

      // Combine existing and new image paths
      const allImagePaths = [...existingImages.map((img) => img.path), ...newImagePaths]

      // Use the correct admin endpoint for updating a room
      const response = await fetch(`http://localhost:5000/api/admin/rooms/${roomId}`, {
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
        console.error("Room update failed with status:", response.status)
        throw new Error(`Failed to update room: ${response.status} ${response.statusText}`)
      }

      toast.success("Room updated successfully")
      router.push(`/admin-dashboard/hostels/${hostelId}/rooms/${roomId}`)
    } catch (error) {
      console.error("Error updating room:", error)
      toast.error(`Failed to update room: ${error.message}`)
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

  if (!hostel) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Hostel Not Found</h2>
          <p className="text-gray-500 mb-6">
            The hostel you're trying to edit a room for doesn't exist or you don't have permission to view it.
          </p>
          <Link
            href="/admin-dashboard/hostels"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Hostels
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link
          href={`/admin-dashboard/hostels/${hostelId}/rooms/${roomId}`}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Room Details
        </Link>
      </div>

      <div className="flex items-center mb-6">
        <Bed className="h-6 w-6 mr-2" />
        <h1 className="text-2xl font-bold">Edit Room in {hostel.name}</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Room Name <span className="text-red-500">*</span>
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
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Room Type <span className="text-red-500">*</span>
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Room Type</option>
                <option value="1 in 1">1 in 1</option>
                <option value="2 in 1">2 in 1</option>
                <option value="3 in 1">3 in 1</option>
                <option value="4 in 1">4 in 1</option>
                <option value="other">other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Price (GH₵) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
                Capacity
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  min="1"
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="availability"
                name="availability"
                checked={formData.availability}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="availability" className="ml-2 block text-sm text-gray-700">
                Available for Booking
              </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Amenities</label>
            <div className="flex items-center mb-2">
              <input
                type="text"
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add an amenity (e.g., TV, Air Conditioning)"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Existing Images</label>
            {existingImages.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {existingImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.url || "/placeholder.svg"}
                      alt={`Room Image ${index + 1}`}
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
              href={`/admin-dashboard/hostels/${hostelId}/rooms/${roomId}`}
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
              {uploading ? "Uploading Images..." : loading ? "Updating Room..." : "Update Room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
