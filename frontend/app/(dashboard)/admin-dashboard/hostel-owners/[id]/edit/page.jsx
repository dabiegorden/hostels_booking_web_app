"use client"

import { useState, use, useEffect } from "react"
import { toast } from "sonner"
import { User, ArrowLeft, Loader2, Building } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function EditHostelOwner({ params }) {
  const ownerId = use(params).id
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    businessName: "",
    businessAddress: "",
    businessDescription: "",
    verified: false,
    password: "",
    confirmPassword: "",
  })

  // Fetch hostel owner data on component mount
  useEffect(() => {
    const fetchHostelOwner = async () => {
      try {
        setInitialLoading(true)
        const response = await fetch(`http://localhost:5000/api/admin/hostel-owners/${ownerId}`, {
          credentials: "include",
        })

        if (!response.ok) {
          throw new Error("Failed to fetch hostel owner details")
        }

        const data = await response.json()
        const owner = data.hostelOwner

        // Set form data without password fields
        setFormData({
          name: owner.name || "",
          email: owner.email || "",
          phoneNumber: owner.phoneNumber || "",
          businessName: owner.businessName || "",
          businessAddress: owner.businessAddress || "",
          businessDescription: owner.businessDescription || "",
          verified: owner.verified || false,
          password: "",
          confirmPassword: "",
        })
      } catch (error) {
        console.error("Error fetching hostel owner:", error)
        toast.error("Failed to load hostel owner details")
      } finally {
        setInitialLoading(false)
      }
    }

    fetchHostelOwner()
  }, [ownerId])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Basic validation
    if (
      !formData.name ||
      !formData.email ||
      !formData.phoneNumber ||
      !formData.businessName ||
      !formData.businessAddress
    ) {
      toast.error("Please fill in all required fields")
      return
    }

    // Only validate passwords if they are provided
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    try {
      setLoading(true)

      // Prepare data for update - only include password if it was changed
      const updateData = {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        businessName: formData.businessName,
        businessAddress: formData.businessAddress,
        businessDescription: formData.businessDescription,
        verified: formData.verified,
      }

      // Only include password if it was provided
      if (formData.password) {
        updateData.password = formData.password
      }

      // Using the correct admin endpoint for updating hostel owners
      const response = await fetch(`http://localhost:5000/api/admin/hostel-owners/${ownerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to update hostel owner: ${response.status} ${response.statusText}`)
      }

      toast.success("Hostel owner updated successfully")
      router.push("/admin-dashboard/hostel-owners")
    } catch (error) {
      console.error("Error updating hostel owner:", error)
      toast.error(error.message || "Failed to update hostel owner")
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
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <Link href="/admin-dashboard/hostel-owners" className="flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Hostel Owners
        </Link>
      </div>

      <div className="flex items-center mb-6">
        <User className="h-6 w-6 mr-2" />
        <h1 className="text-xl md:text-2xl font-bold">Edit Hostel Owner</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-4 md:p-6">
          {/* Personal Information Section */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Personal Information</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div className="mt-4 md:mt-6">
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder="Enter phone number"
              />
            </div>
          </div>

          {/* Business Information Section */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Building className="h-5 w-5 mr-2 text-gray-500" />
              Business Information
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
              <div>
                <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="businessName"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="e.g., Sunshine Hostels Ltd."
                />
              </div>

              <div>
                <label htmlFor="businessAddress" className="block text-sm font-medium text-gray-700 mb-1">
                  Business Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="businessAddress"
                  name="businessAddress"
                  value={formData.businessAddress}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="e.g., 123 University Road, Accra"
                />
              </div>
            </div>

            <div className="mb-4 md:mb-6">
              <label htmlFor="businessDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Business Description
              </label>
              <textarea
                id="businessDescription"
                name="businessDescription"
                value={formData.businessDescription}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Brief description of the hostel business..."
              />
              <p className="text-xs text-gray-500 mt-1">Optional - Provide a brief description of the business</p>
            </div>

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
                Verified Business
              </label>
            </div>
          </div>

          {/* Account Security Section */}
          <div className="border-t border-gray-200 pt-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Change Password (Optional)</h2>
            <p className="text-sm text-gray-500 mb-4">Leave blank to keep the current password</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  minLength={6}
                  placeholder="Enter new password"
                />
                <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm new password"
                />
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8">
            <Link
              href="/admin-dashboard/hostel-owners"
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-center order-2 sm:order-1"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 flex items-center justify-center order-1 sm:order-2"
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {loading ? "Updating Hostel Owner..." : "Update Hostel Owner"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
