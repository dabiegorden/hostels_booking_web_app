"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Settings, Save, Loader2, Shield, User, Bell, Globe, Key } from "lucide-react"

export default function AdminSettings() {
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("general")
  const [generalSettings, setGeneralSettings] = useState({
    siteName: "Hostel Booking System",
    siteDescription: "Find and book the best student hostels",
    contactEmail: "admin@hostelbooking.com",
    contactPhone: "+233 123 456 789",
    address: "University Area, Accra, Ghana",
  })
  const [securitySettings, setSecuritySettings] = useState({
    requireEmailVerification: true,
    twoFactorAuth: false,
    passwordExpiryDays: 90,
    sessionTimeoutMinutes: 30,
  })
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    newBookingNotifications: true,
    paymentNotifications: true,
    systemAlerts: true,
  })
  const [adminProfile, setAdminProfile] = useState({
    name: "Admin User",
    email: "admin@hostelbooking.com",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Fetch settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setInitialLoading(true)
        // Fetch settings from API using the correct endpoint
        const response = await fetch("http://localhost:5000/api/settings", {
          credentials: "include",
        })

        if (response.ok) {
          const data = await response.json()

          // Update state with fetched settings
          if (data.settings) {
            setGeneralSettings({
              siteName: data.settings.siteName || generalSettings.siteName,
              siteDescription: data.settings.siteDescription || generalSettings.siteDescription,
              contactEmail: data.settings.contactEmail || generalSettings.contactEmail,
              contactPhone: data.settings.contactPhone || generalSettings.contactPhone,
              address: data.settings.address || generalSettings.address,
            })
          }
        }

        // Fetch admin profile
        const adminResponse = await fetch("http://localhost:5000/api/admin/info", {
          credentials: "include",
        })

        if (adminResponse.ok) {
          const adminData = await adminResponse.json()
          if (adminData.admin) {
            setAdminProfile({
              ...adminProfile,
              name: adminData.admin.name || adminProfile.name,
              email: adminData.admin.email || adminProfile.email,
              currentPassword: "",
              newPassword: "",
              confirmPassword: "",
            })
          }
        }
      } catch (error) {
        console.error("Error fetching settings:", error)
        // Don't show error toast on initial load as settings might not be set up yet
      } finally {
        setInitialLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleGeneralChange = (e) => {
    const { name, value } = e.target
    setGeneralSettings((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSecurityChange = (e) => {
    const { name, value, type, checked } = e.target
    setSecuritySettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value,
    }))
  }

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target
    setNotificationSettings((prev) => ({
      ...prev,
      [name]: checked,
    }))
  }

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setAdminProfile((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const saveGeneralSettings = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const response = await fetch("http://localhost:5000/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          siteName: generalSettings.siteName,
          siteDescription: generalSettings.siteDescription,
          contactEmail: generalSettings.contactEmail,
          contactPhone: generalSettings.contactPhone,
          address: generalSettings.address,
        }),
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to save general settings")
      }

      toast.success("General settings saved successfully")
    } catch (error) {
      console.error("Error saving general settings:", error)
      toast.error("Failed to save general settings")
    } finally {
      setLoading(false)
    }
  }

  const saveSecuritySettings = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const response = await fetch("http://localhost:5000/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          security: securitySettings,
        }),
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to save security settings")
      }

      toast.success("Security settings saved successfully")
    } catch (error) {
      console.error("Error saving security settings:", error)
      toast.error("Failed to save security settings")
    } finally {
      setLoading(false)
    }
  }

  const saveNotificationSettings = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const response = await fetch("http://localhost:5000/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notifications: notificationSettings,
        }),
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to save notification settings")
      }

      toast.success("Notification settings saved successfully")
    } catch (error) {
      console.error("Error saving notification settings:", error)
      toast.error("Failed to save notification settings")
    } finally {
      setLoading(false)
    }
  }

  const updateAdminProfile = async (e) => {
    e.preventDefault()

    if (adminProfile.newPassword && adminProfile.newPassword !== adminProfile.confirmPassword) {
      toast.error("New passwords do not match")
      return
    }

    if (adminProfile.newPassword && !adminProfile.currentPassword) {
      toast.error("Current password is required to set a new password")
      return
    }

    try {
      setLoading(true)
      const response = await fetch("http://localhost:5000/api/admin/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: adminProfile.name,
          email: adminProfile.email,
          currentPassword: adminProfile.currentPassword,
          newPassword: adminProfile.newPassword,
        }),
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to update admin profile")
      }

      toast.success("Admin profile updated successfully")

      // Clear password fields after successful update
      setAdminProfile({
        ...adminProfile,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      console.error("Error updating admin profile:", error)
      toast.error("Failed to update admin profile")
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
      <div className="flex items-center mb-6">
        <Settings className="h-6 w-6 mr-2" />
        <h1 className="text-2xl font-bold">Admin Settings</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="flex border-b">
          <button
            className={`px-6 py-3 font-medium text-sm focus:outline-none ${
              activeTab === "general" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("general")}
          >
            <Globe className="h-4 w-4 inline mr-2" />
            General
          </button>
          <button
            className={`px-6 py-3 font-medium text-sm focus:outline-none ${
              activeTab === "security"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("security")}
          >
            <Shield className="h-4 w-4 inline mr-2" />
            Security
          </button>
          <button
            className={`px-6 py-3 font-medium text-sm focus:outline-none ${
              activeTab === "notifications"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("notifications")}
          >
            <Bell className="h-4 w-4 inline mr-2" />
            Notifications
          </button>
          <button
            className={`px-6 py-3 font-medium text-sm focus:outline-none ${
              activeTab === "profile" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("profile")}
          >
            <User className="h-4 w-4 inline mr-2" />
            Admin Profile
          </button>
        </div>

        <div className="p-6">
          {activeTab === "general" && (
            <form onSubmit={saveGeneralSettings}>
              <div className="mb-6">
                <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 mb-1">
                  Site Name
                </label>
                <input
                  type="text"
                  id="siteName"
                  name="siteName"
                  value={generalSettings.siteName}
                  onChange={handleGeneralChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-6">
                <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Site Description
                </label>
                <textarea
                  id="siteDescription"
                  name="siteDescription"
                  value={generalSettings.siteDescription}
                  onChange={handleGeneralChange}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    id="contactEmail"
                    name="contactEmail"
                    value={generalSettings.contactEmail}
                    onChange={handleGeneralChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    id="contactPhone"
                    name="contactPhone"
                    value={generalSettings.contactPhone}
                    onChange={handleGeneralChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={generalSettings.address}
                  onChange={handleGeneralChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 flex items-center"
                >
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <Save className="h-4 w-4 mr-2" />
                  Save General Settings
                </button>
              </div>
            </form>
          )}

          {activeTab === "security" && (
            <form onSubmit={saveSecuritySettings}>
              <div className="mb-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="requireEmailVerification"
                    name="requireEmailVerification"
                    checked={securitySettings.requireEmailVerification}
                    onChange={handleSecurityChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="requireEmailVerification" className="ml-2 block text-sm text-gray-700">
                    Require Email Verification for New Accounts
                  </label>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="twoFactorAuth"
                    name="twoFactorAuth"
                    checked={securitySettings.twoFactorAuth}
                    onChange={handleSecurityChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="twoFactorAuth" className="ml-2 block text-sm text-gray-700">
                    Enable Two-Factor Authentication
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="passwordExpiryDays" className="block text-sm font-medium text-gray-700 mb-1">
                    Password Expiry (Days)
                  </label>
                  <input
                    type="number"
                    id="passwordExpiryDays"
                    name="passwordExpiryDays"
                    value={securitySettings.passwordExpiryDays}
                    onChange={handleSecurityChange}
                    min="0"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Set to 0 for no expiry</p>
                </div>

                <div>
                  <label htmlFor="sessionTimeoutMinutes" className="block text-sm font-medium text-gray-700 mb-1">
                    Session Timeout (Minutes)
                  </label>
                  <input
                    type="number"
                    id="sessionTimeoutMinutes"
                    name="sessionTimeoutMinutes"
                    value={securitySettings.sessionTimeoutMinutes}
                    onChange={handleSecurityChange}
                    min="5"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 flex items-center"
                >
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <Save className="h-4 w-4 mr-2" />
                  Save Security Settings
                </button>
              </div>
            </form>
          )}

          {activeTab === "notifications" && (
            <form onSubmit={saveNotificationSettings}>
              <div className="mb-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="emailNotifications"
                    name="emailNotifications"
                    checked={notificationSettings.emailNotifications}
                    onChange={handleNotificationChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-700">
                    Enable Email Notifications
                  </label>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="smsNotifications"
                    name="smsNotifications"
                    checked={notificationSettings.smsNotifications}
                    onChange={handleNotificationChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="smsNotifications" className="ml-2 block text-sm text-gray-700">
                    Enable SMS Notifications
                  </label>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Notification Types</h3>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="newBookingNotifications"
                      name="newBookingNotifications"
                      checked={notificationSettings.newBookingNotifications}
                      onChange={handleNotificationChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="newBookingNotifications" className="ml-2 block text-sm text-gray-700">
                      New Booking Notifications
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="paymentNotifications"
                      name="paymentNotifications"
                      checked={notificationSettings.paymentNotifications}
                      onChange={handleNotificationChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="paymentNotifications" className="ml-2 block text-sm text-gray-700">
                      Payment Notifications
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="systemAlerts"
                      name="systemAlerts"
                      checked={notificationSettings.systemAlerts}
                      onChange={handleNotificationChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="systemAlerts" className="ml-2 block text-sm text-gray-700">
                      System Alerts
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 flex items-center"
                >
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <Save className="h-4 w-4 mr-2" />
                  Save Notification Settings
                </button>
              </div>
            </form>
          )}

          {activeTab === "profile" && (
            <form onSubmit={updateAdminProfile}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={adminProfile.name}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={adminProfile.email}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6 mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <Key className="h-4 w-4 mr-2" />
                  Change Password
                </h3>

                <div className="mb-6">
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={adminProfile.currentPassword}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={adminProfile.newPassword}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={adminProfile.confirmPassword}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 flex items-center"
                >
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <Save className="h-4 w-4 mr-2" />
                  Update Profile
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
