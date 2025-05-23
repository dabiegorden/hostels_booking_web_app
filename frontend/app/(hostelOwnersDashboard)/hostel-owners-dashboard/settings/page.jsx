"use client"

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  Settings as SettingsIcon, 
  Save, 
  Building, 
  Phone, 
  Mail, 
  MapPin, 
  FileText, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  CreditCard, 
  Receipt, 
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from "lucide-react";

const Settings = () => {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [activeTab, setActiveTab] = useState("general")

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/settings", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch settings")
        }

        const data = await response.json()
        setSettings(data.settings || {})
      } catch (err) {
        console.error("Error fetching settings:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSocialLinkChange = (e) => {
    const { name, value } = e.target
    setSettings((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [name]: value,
      },
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSaveSuccess(false)
    setSaveError(null)

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        throw new Error("Failed to update settings")
      }

      setSaveSuccess(true)

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false)
      }, 3000)
    } catch (err) {
      console.error("Error updating settings:", err)
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center space-x-3 mb-8">
            <SettingsIcon className="h-8 w-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-gray-600 font-medium">Loading your settings...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center space-x-3 mb-8">
            <SettingsIcon className="h-8 w-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md text-red-800 flex items-start">
              <AlertTriangle className="h-6 w-6 mr-3 flex-shrink-0 text-red-500" />
              <div>
                <p className="font-semibold">Error loading settings: {error}</p>
                <p className="mt-1">Please try again later or contact support.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center space-x-3 mb-8">
            <SettingsIcon className="h-8 w-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
          </div>
          
          <Card className="p-8 text-center bg-white rounded-xl shadow-lg">
            <p className="text-gray-500">No settings found. Configure your settings to get started.</p>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <SettingsIcon className="h-8 w-8 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
          </div>
          
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              className={`px-4 py-2 rounded-md transition duration-200 ${
                activeTab === "general" 
                  ? "bg-white text-indigo-600 shadow-md" 
                  : "text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => setActiveTab("general")}
            >
              General
            </button>
            <button
              className={`px-4 py-2 rounded-md transition duration-200 ${
                activeTab === "social" 
                  ? "bg-white text-indigo-600 shadow-md" 
                  : "text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => setActiveTab("social")}
            >
              Social
            </button>
            <button
              className={`px-4 py-2 rounded-md transition duration-200 ${
                activeTab === "booking" 
                  ? "bg-white text-indigo-600 shadow-md" 
                  : "text-gray-600 hover:bg-gray-200"
              }`}
              onClick={() => setActiveTab("booking")}
            >
              Booking
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Settings */}
          <div className={activeTab === "general" ? "block" : "hidden"}>
            <Card className="bg-white rounded-xl shadow-lg overflow-hidden border-0">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  General Information
                </h2>
              </div>
              <div className="p-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Site Name</label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input 
                        name="siteName" 
                        value={settings.siteName || ""} 
                        onChange={handleInputChange} 
                        className="pl-10 w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Contact Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        name="contactEmail"
                        type="email"
                        value={settings.contactEmail || ""}
                        onChange={handleInputChange}
                        className="pl-10 w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        name="contactPhone"
                        value={settings.contactPhone || ""}
                        onChange={handleInputChange}
                        className="pl-10 w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input 
                        name="address" 
                        value={settings.address || ""} 
                        onChange={handleInputChange} 
                        className="pl-10 w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" 
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
                    <Textarea
                      name="siteDescription"
                      value={settings.siteDescription || ""}
                      onChange={handleInputChange}
                      className="pl-10 w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                      rows={4}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Social Media Settings */}
          <div className={activeTab === "social" ? "block" : "hidden"}>
            <Card className="bg-white rounded-xl shadow-lg overflow-hidden border-0">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-600 px-6 py-4">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  Social Media Links
                </h2>
              </div>
              <div className="p-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Facebook</label>
                    <div className="relative">
                      <Facebook className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 h-5 w-5" />
                      <Input
                        name="facebook"
                        value={settings.socialLinks?.facebook || ""}
                        onChange={handleSocialLinkChange}
                        className="pl-10 w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="https://facebook.com/yourbusiness"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Twitter</label>
                    <div className="relative">
                      <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-5 w-5" />
                      <Input
                        name="twitter"
                        value={settings.socialLinks?.twitter || ""}
                        onChange={handleSocialLinkChange}
                        className="pl-10 w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="https://twitter.com/yourbusiness"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Instagram</label>
                    <div className="relative">
                      <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-600 h-5 w-5" />
                      <Input
                        name="instagram"
                        value={settings.socialLinks?.instagram || ""}
                        onChange={handleSocialLinkChange}
                        className="pl-10 w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="https://instagram.com/yourbusiness"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">LinkedIn</label>
                    <div className="relative">
                      <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-700 h-5 w-5" />
                      <Input
                        name="linkedin"
                        value={settings.socialLinks?.linkedin || ""}
                        onChange={handleSocialLinkChange}
                        className="pl-10 w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder="https://linkedin.com/company/yourbusiness"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">💡 Tip:</span> Adding your social media profiles 
                    helps your customers stay connected and improves your online presence.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Booking Settings */}
          <div className={activeTab === "booking" ? "block" : "hidden"}>
            <Card className="bg-white rounded-xl shadow-lg overflow-hidden border-0">
              <div className="bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-4">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Booking Settings
                </h2>
              </div>
              <div className="p-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Booking Fee (%)</label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        name="bookingFee"
                        type="number"
                        min="0"
                        step="0.01"
                        value={settings.bookingFee || 0}
                        onChange={handleInputChange}
                        className="pl-10 w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <p className="text-xs text-gray-500">Additional fee charged for processing bookings</p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Tax Rate (%)</label>
                    <div className="relative">
                      <Receipt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <Input
                        name="taxRate"
                        type="number"
                        min="0"
                        step="0.01"
                        value={settings.taxRate || 0}
                        onChange={handleInputChange}
                        className="pl-10 w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <p className="text-xs text-gray-500">Tax rate applied to bookings</p>
                  </div>
                </div>
                
                <div className="mt-6 bg-green-50 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-800">
                        <span className="font-medium">Note:</span> Changes to rates will only affect new bookings.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Status Messages */}
          {saveSuccess && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg flex items-center">
              <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
              <p className="text-green-800 font-medium">Settings saved successfully!</p>
            </div>
          )}

          {saveError && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-center">
              <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
              <p className="text-red-800 font-medium">Error saving settings: {saveError}</p>
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={saving}
              className={`px-6 py-2 cursor-pointer text-white rounded-lg font-semibold flex items-center space-x-2 ${
                saving 
                  ? "bg-gray-400" 
                  : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              }`}
            >
              {saving ? (
                <>
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

const Globe = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
  </svg>
);

export default Settings