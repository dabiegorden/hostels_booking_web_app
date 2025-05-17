"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { use } from "react"
import { Home, Building, DollarSign, ImageIcon, Plus, X, Loader, ArrowLeft, Save } from "lucide-react"
import { toast } from "sonner"

export default function NewRoomPage({ params }) {
  // In Next.js 15, params is a promise, so we need to use React.use
  const hostelId = use(params).id

  const [loading, setLoading] = useState(false)
  const [hostel, setHostel] = useState(null)
  const [fetchLoading, setFetchLoading] = useState(true)
  const router = useRouter()

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    type: "1 in 1", // Changed from "single" to "1 in 1"
    description: "",
    price: "",
    capacity: 1,
    availability: true,
    features: [],
  })

  // New feature input
  const [newFeature, setNewFeature] = useState("")

  // Image upload state
  const [images, setImages] = useState([])
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreviewUrls, setImagePreviewUrls] = useState([])

  // Fetch hostel data to display hostel name
  useEffect(() => {
    const fetchHostel = async () => {
      try {
        setFetchLoading(true)
        const response = await fetch(`http://localhost:5000/api/hostel-owners/hostels/${hostelId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        })

        if (!response.ok) {
          throw new Error("Failed to fetch hostel details")
        }

        const data = await response.json()
        setHostel(data.hostel)
      } catch (err) {
        console.error("Error fetching hostel:", err)
        toast.error("Failed to load hostel data")
      } finally {
        setFetchLoading(false)
      }
    }

    if (hostelId) {
      fetchHostel()
    }
  }, [hostelId])

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  // Handle features
  const addFeature = () => {
    if (newFeature.trim() !== "" && !formData.features.includes(newFeature.trim())) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()],
      })
      setNewFeature("")
    }
  }

  const removeFeature = (index) => {
    const updatedFeatures = [...formData.features]
    updatedFeatures.splice(index, 1)
    setFormData({
      ...formData,
      features: updatedFeatures,
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
      toast.error("Room name is required")
      return false
    }
    if (!formData.description.trim()) {
      toast.error("Description is required")
      return false
    }
    if (!formData.price || isNaN(formData.price) || Number.parseFloat(formData.price) <= 0) {
      toast.error("Please enter a valid price")
      return false
    }
    if (!formData.capacity || isNaN(formData.capacity) || Number.parseInt(formData.capacity) <= 0) {
      toast.error("Please enter a valid capacity")
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
      formDataObj.append("type", formData.type)
      formDataObj.append("description", formData.description)
      formDataObj.append("price", formData.price)
      formDataObj.append("capacity", formData.capacity)
      formDataObj.append("availability", formData.availability)

      // Parse features as JSON string and append as amenities (backend uses amenities)
      formDataObj.append("amenities", JSON.stringify(formData.features))

      // Append images
      images.forEach((image) => {
        formDataObj.append("images", image)
      })

      const response = await fetch(`http://localhost:5000/api/hostel-owners/hostels/${hostelId}/rooms`, {
        method: "POST",
        credentials: "include", // Important for sending cookies
        body: formDataObj,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to create room")
      }

      toast.success("Room created successfully")

      // Redirect to hostel details page after a short delay
      setTimeout(() => {
        router.push(`/hostel-owners-dashboard/hostels/${hostelId}`)
      }, 1000)
    } catch (err) {
      console.error("Create room error:", err)
      toast.error(err.message || "Failed to create room")
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-screen">
        <Loader className="h-8 w-8 text-indigo-600 animate-spin" />
        <span className="ml-2 text-gray-600">Loading hostel data...</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/hostel-owners-dashboard/hostels/${hostelId}`}
          className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 mb-4"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Hostel
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Home className="mr-2 h-6 w-6" />
          Add New Room
        </h1>
        {hostel && (
          <p className="text-gray-600 mt-1 flex items-center">
            <Building className="mr-1 h-4 w-4 text-gray-400" />
            {hostel.name}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Home className="mr-2 h-5 w-5" />
              Basic Information
            </h2>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Room Name*
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter room name"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="type">
              Room Type*
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            >
              <option value="1 in 1">1 in 1 (Single)</option>
              <option value="2 in 1">2 in 1 (Double)</option>
              <option value="3 in 1">3 in 1 (Triple)</option>
              <option value="4 in 1">4 in 1 (Quad)</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
              Description*
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Describe the room"
              rows="4"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">
              Price (GHS)*
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 pl-10 pr-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="capacity">
              Capacity (Persons)*
            </label>
            <input
              id="capacity"
              name="capacity"
              type="number"
              min="1"
              value={formData.capacity}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="availability"
                checked={formData.availability}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-gray-700 text-sm font-bold">Available for booking</span>
            </label>
          </div>

          {/* Features */}
          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Plus className="mr-2 h-5 w-5" />
              Features
            </h2>
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-700 text-sm font-bold mb-2">Room Features</label>
            <div className="flex mb-2">
              <input
                type="text"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                className="shadow appearance-none border rounded-l w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="e.g. Private Bathroom, TV, etc."
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addFeature()
                  }
                }}
              />
              <button
                type="button"
                onClick={addFeature}
                className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-r focus:outline-none focus:shadow-outline"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {formData.features.map((feature, index) => (
                <div key={index} className="bg-gray-100 rounded-full px-3 py-1 text-sm flex items-center">
                  <span>{feature}</span>
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="ml-1 text-gray-500 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {formData.features.length === 0 && <p className="text-sm text-gray-500">No features added yet</p>}
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
            <label className="block text-gray-700 text-sm font-bold mb-2">Room Images</label>
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
                      alt={`Room image ${index + 1}`}
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
            href={`/hostel-owners-dashboard/hostels/${hostelId}`}
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
                Create Room
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
