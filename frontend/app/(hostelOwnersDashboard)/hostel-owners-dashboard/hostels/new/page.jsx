"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Building, MapPin, ImageIcon, Wifi, Plus, X, Loader, ArrowLeft, Save } from "lucide-react"
import { toast } from "sonner"

export default function NewHostelPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    locationText: "", // For display purposes only
    amenities: [],
    policies: "",
  })

  // New amenity input
  const [newAmenity, setNewAmenity] = useState("")

  // Image upload state
  const [images, setImages] = useState([])
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreviewUrls, setImagePreviewUrls] = useState([])

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Handle amenities
  const addAmenity = () => {
    if (newAmenity.trim() !== "" && !formData.amenities.includes(newAmenity.trim())) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, newAmenity.trim()],
      })
      setNewAmenity("")
    }
  }

  const removeAmenity = (index) => {
    const updatedAmenities = [...formData.amenities]
    updatedAmenities.splice(index, 1)
    setFormData({
      ...formData,
      amenities: updatedAmenities,
    })
  }

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      setUploadingImage(true)

      // Create preview URLs for the images
      const newImagePreviewUrls = files.map((file) => URL.createObjectURL(file))
      setImagePreviewUrls([...imagePreviewUrls, ...newImagePreviewUrls])

      // Store the actual files for upload
      setImages([...images, ...files])
      setUploadingImage(false)
    }
  }

  const removeImage = (index) => {
    const updatedImages = [...images]
    updatedImages.splice(index, 1)
    setImages(updatedImages)

    const updatedPreviewUrls = [...imagePreviewUrls]
    URL.revokeObjectURL(updatedPreviewUrls[index]) // Clean up the URL
    updatedPreviewUrls.splice(index, 1)
    setImagePreviewUrls(updatedPreviewUrls)
  }

  // Form validation
  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Hostel name is required")
      return false
    }
    if (!formData.description.trim()) {
      toast.error("Description is required")
      return false
    }
    if (!formData.address.trim()) {
      toast.error("Address is required")
      return false
    }
    return true
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // Create FormData object for file upload
      const formDataObj = new FormData()

      // Append text fields
      formDataObj.append("name", formData.name)
      formDataObj.append("description", formData.description)
      formDataObj.append("address", formData.address)

      // Create the location object with the required structure
      const locationObj = {
        type: "Point", // This is the required field in the schema
        coordinates: [0, 0], // Default coordinates
      }
      formDataObj.append("location", JSON.stringify(locationObj))

      // Parse amenities as JSON string
      formDataObj.append("amenities", JSON.stringify(formData.amenities))
      formDataObj.append("policies", formData.policies)

      // Append images
      images.forEach((image) => {
        formDataObj.append("images", image)
      })

      const response = await fetch("http://localhost:5000/api/hostel-owners/hostels", {
        method: "POST",
        credentials: "include", // Important for sending cookies
        body: formDataObj,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to create hostel")
      }

      toast.success("Hostel created successfully")

      // Redirect to hostels list after a short delay
      setTimeout(() => {
        router.push("/hostel-owners-dashboard/hostels")
      }, 1000)
    } catch (err) {
      console.error("Create hostel error:", err)
      toast.error(err.message || "Failed to create hostel")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/hostel-owners-dashboard/hostels"
          className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 mb-4"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Hostels
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Building className="mr-2 h-6 w-6" />
          Add New Hostel
        </h1>
        <p className="text-gray-600 mt-1">Fill in the details to add a new hostel</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Building className="mr-2 h-5 w-5" />
              Basic Information
            </h2>
          </div>

          <div className="space-y-4 md:col-span-2">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                Hostel Name*
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter hostel name"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                Description*
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Describe your hostel"
                rows="4"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
                Address*
              </label>
              <input
                id="address"
                name="address"
                type="text"
                value={formData.address}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter full address"
                required
              />
            </div>
          </div>

          {/* Location */}
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <MapPin className="mr-2 h-5 w-5" />
              Location
            </h2>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="locationText">
              Location
            </label>
            <input
              id="locationText"
              name="locationText"
              type="text"
              value={formData.locationText}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="e.g., Cape Coast, Ghana"
            />
            <p className="text-xs text-gray-500 mt-1">Enter the general location of your hostel</p>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="policies">
              Hostel Policies
            </label>
            <textarea
              id="policies"
              name="policies"
              value={formData.policies}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter hostel policies, rules, check-in/out times, etc."
              rows="4"
            />
          </div>

          {/* Amenities */}
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Wifi className="mr-2 h-5 w-5" />
              Amenities
            </h2>
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-700 text-sm font-bold mb-2">Amenities</label>
            <div className="flex mb-2">
              <input
                type="text"
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                className="shadow appearance-none border rounded-l w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="e.g. WiFi, Air Conditioning, etc."
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addAmenity()
                  }
                }}
              />
              <button
                type="button"
                onClick={addAmenity}
                className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-r focus:outline-none focus:shadow-outline"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {formData.amenities.map((amenity, index) => (
                <div key={index} className="bg-gray-100 rounded-full px-3 py-1 text-sm flex items-center">
                  <Wifi className="mr-1 h-4 w-4 text-indigo-500" />
                  {amenity}
                  <button
                    type="button"
                    onClick={() => removeAmenity(index)}
                    className="ml-1 text-gray-500 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {formData.amenities.length === 0 && <p className="text-sm text-gray-500">No amenities added yet</p>}
            </div>
          </div>

          {/* Images */}
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <ImageIcon className="mr-2 h-5 w-5" />
              Images
            </h2>
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-700 text-sm font-bold mb-2">Hostel Images</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                id="images"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <label htmlFor="images" className="cursor-pointer">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-1 text-sm text-gray-600">Click to upload images or drag and drop</p>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </label>
            </div>

            {uploadingImage && (
              <div className="mt-4 flex items-center justify-center">
                <Loader className="animate-spin mr-2 h-5 w-5 text-indigo-500" />
                <span>Uploading...</span>
              </div>
            )}

            {imagePreviewUrls.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {imagePreviewUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url || "/placeholder.svg"}
                      alt={`Hostel image ${index + 1}`}
                      className="h-32 w-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit button */}
        <div className="mt-8 flex justify-end">
          <Link
            href="/hostel-owners-dashboard/hostels"
            className="mr-4 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {loading ? (
              <>
                <Loader className="animate-spin -ml-1 mr-2 h-5 w-5" />
                Creating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" />
                Create Hostel
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
