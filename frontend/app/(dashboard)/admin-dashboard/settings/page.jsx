"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { SettingsIcon, CreditCard, Mail, Phone, MapPin, Plus, Trash, Save, FileText, Lock } from "lucide-react"
import { toast } from "sonner"

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState({
    siteName: "Hostel Booking System",
    siteDescription: "Find and book the best hostels",
    contactEmail: "",
    contactPhone: "",
    address: "",
    logo: "",
    favicon: "",
    socialLinks: {
      facebook: "",
      twitter: "",
      instagram: "",
      linkedin: "",
    },
    paymentGateways: [],
    bookingFee: 0,
    taxRate: 0,
    maintenanceMode: false,
    termsAndConditions: "",
    privacyPolicy: "",
  })

  useEffect(() => {
    // Check authentication
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Authentication failed")
      }

      const data = await response.json()

      if (!data.user || data.user.role !== "admin") {
        toast.error("Access denied. Admin privileges required.")
        router.push("/auth/login")
        return
      }

      setUser(data.user)

      // Fetch settings
      fetchSettings()
    } catch (error) {
      console.error("Auth error:", error)
      toast.error("Authentication failed. Please login again.")
      router.push("/auth/login")
    }
  }

  const fetchSettings = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings`, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch settings")
      }

      const data = await response.json()
      setSettings(data.settings)
    } catch (error) {
      console.error("Error fetching settings:", error)
      toast.error("Failed to load settings.")
    } finally {
      setIsLoading(false)
    }
  }

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

  const handleSwitchChange = (name, checked) => {
    setSettings((prev) => ({
      ...prev,
      [name]: checked,
    }))
  }

  const handleNumberChange = (e) => {
    const { name, value } = e.target
    setSettings((prev) => ({
      ...prev,
      [name]: Number.parseFloat(value) || 0,
    }))
  }

  const handleAddPaymentGateway = () => {
    setSettings((prev) => ({
      ...prev,
      paymentGateways: [
        ...prev.paymentGateways,
        {
          name: "",
          apiKey: "",
          secretKey: "",
          isActive: true,
        },
      ],
    }))
  }

  const handlePaymentGatewayChange = (index, field, value) => {
    setSettings((prev) => {
      const updatedGateways = [...prev.paymentGateways]
      updatedGateways[index] = {
        ...updatedGateways[index],
        [field]: field === "isActive" ? value : value,
      }
      return {
        ...prev,
        paymentGateways: updatedGateways,
      }
    })
  }

  const handleRemovePaymentGateway = (index) => {
    setSettings((prev) => {
      const updatedGateways = [...prev.paymentGateways]
      updatedGateways.splice(index, 1)
      return {
        ...prev,
        paymentGateways: updatedGateways,
      }
    })
  }

  const saveSettings = async () => {
    try {
      setIsSaving(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update settings")
      }

      toast.success("Settings updated successfully.")
    } catch (error) {
      console.error("Error updating settings:", error)
      toast.error(error.message || "Failed to update settings.")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-lg shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Settings</h1>
          <p className="text-slate-500 mt-1">Configure your hostel booking system</p>
        </div>
        <Button
          onClick={saveSettings}
          disabled={isSaving}
          className="bg-slate-800 hover:bg-slate-900 flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="bg-white border border-slate-200 p-1">
          <TabsTrigger
            value="general"
            className="flex items-center gap-2 data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900"
          >
            <SettingsIcon className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger
            value="contact"
            className="flex items-center gap-2 data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900"
          >
            <Mail className="h-4 w-4" />
            Contact
          </TabsTrigger>
          <TabsTrigger
            value="payment"
            className="flex items-center gap-2 data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900"
          >
            <CreditCard className="h-4 w-4" />
            Payment
          </TabsTrigger>
          <TabsTrigger
            value="legal"
            className="flex items-center gap-2 data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900"
          >
            <FileText className="h-4 w-4" />
            Legal
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-800">General Settings</CardTitle>
              <CardDescription>Configure the basic information for your booking system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    name="siteName"
                    value={settings.siteName}
                    onChange={handleInputChange}
                    className="border-slate-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Input
                    id="siteDescription"
                    name="siteDescription"
                    value={settings.siteDescription}
                    onChange={handleInputChange}
                    className="border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="logo">Logo URL</Label>
                  <Input
                    id="logo"
                    name="logo"
                    value={settings.logo}
                    onChange={handleInputChange}
                    className="border-slate-200"
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="favicon">Favicon URL</Label>
                  <Input
                    id="favicon"
                    name="favicon"
                    value={settings.favicon}
                    onChange={handleInputChange}
                    className="border-slate-200"
                    placeholder="https://example.com/favicon.ico"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => handleSwitchChange("maintenanceMode", checked)}
                />
                <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                {settings.maintenanceMode && (
                  <Badge className="ml-2 bg-red-100 text-red-800 hover:bg-red-200">Enabled</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-800">Contact Information</CardTitle>
              <CardDescription>Configure your contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail" className="flex items-center gap-1">
                    <Mail className="h-4 w-4 text-slate-600" /> Email Address
                  </Label>
                  <Input
                    id="contactEmail"
                    name="contactEmail"
                    value={settings.contactEmail}
                    onChange={handleInputChange}
                    className="border-slate-200"
                    placeholder="contact@yourbusiness.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone" className="flex items-center gap-1">
                    <Phone className="h-4 w-4 text-slate-600" /> Phone Number
                  </Label>
                  <Input
                    id="contactPhone"
                    name="contactPhone"
                    value={settings.contactPhone}
                    onChange={handleInputChange}
                    className="border-slate-200"
                    placeholder="+1234567890"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-slate-600" /> Address
                </Label>
                <Textarea
                  id="address"
                  name="address"
                  value={settings.address}
                  onChange={handleInputChange}
                  className="border-slate-200"
                  placeholder="123 Main St, City, Country"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-800">Payment Settings</CardTitle>
              <CardDescription>Configure payment options and fees</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bookingFee">Booking Fee (%)</Label>
                  <Input
                    id="bookingFee"
                    name="bookingFee"
                    type="number"
                    value={settings.bookingFee}
                    onChange={handleNumberChange}
                    className="border-slate-200"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    name="taxRate"
                    type="number"
                    value={settings.taxRate}
                    onChange={handleNumberChange}
                    className="border-slate-200"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-slate-800">Payment Gateways</CardTitle>
                <CardDescription>Configure payment gateway integrations</CardDescription>
              </div>
              <Button
                onClick={handleAddPaymentGateway}
                className="bg-green-600 hover:bg-green-700 flex items-center gap-1"
              >
                <Plus className="h-4 w-4" /> Add Gateway
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {settings.paymentGateways.length === 0 ? (
                <div className="text-center py-6 text-slate-500">No payment gateways configured yet.</div>
              ) : (
                settings.paymentGateways.map((gateway, index) => (
                  <div key={index} className="border border-slate-200 rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-slate-800">Gateway #{index + 1}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemovePaymentGateway(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`gateway-${index}-name`}>Gateway Name</Label>
                        <Input
                          id={`gateway-${index}-name`}
                          value={gateway.name}
                          onChange={(e) => handlePaymentGatewayChange(index, "name", e.target.value)}
                          className="border-slate-200"
                          placeholder="e.g., PayPal, Stripe"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`gateway-${index}-active`}>Status</Label>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id={`gateway-${index}-active`}
                            checked={gateway.isActive}
                            onCheckedChange={(checked) => handlePaymentGatewayChange(index, "isActive", checked)}
                          />
                          <Label htmlFor={`gateway-${index}-active`}>{gateway.isActive ? "Active" : "Inactive"}</Label>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`gateway-${index}-apiKey`} className="flex items-center gap-1">
                          <Lock className="h-4 w-4 text-slate-600" /> API Key
                        </Label>
                        <Input
                          id={`gateway-${index}-apiKey`}
                          value={gateway.apiKey}
                          onChange={(e) => handlePaymentGatewayChange(index, "apiKey", e.target.value)}
                          className="border-slate-200"
                          type="password"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`gateway-${index}-secretKey`} className="flex items-center gap-1">
                          <Lock className="h-4 w-4 text-slate-600" /> Secret Key
                        </Label>
                        <Input
                          id={`gateway-${index}-secretKey`}
                          value={gateway.secretKey}
                          onChange={(e) => handlePaymentGatewayChange(index, "secretKey", e.target.value)}
                          className="border-slate-200"
                          type="password"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="legal" className="space-y-4">
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-800">Terms and Conditions</CardTitle>
              <CardDescription>Set your terms and conditions for the booking system</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                id="termsAndConditions"
                name="termsAndConditions"
                value={settings.termsAndConditions}
                onChange={handleInputChange}
                className="border-slate-200 min-h-[200px]"
                placeholder="Enter your terms and conditions here..."
              />
            </CardContent>
          </Card>

          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-800">Privacy Policy</CardTitle>
              <CardDescription>Set your privacy policy for the booking system</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                id="privacyPolicy"
                name="privacyPolicy"
                value={settings.privacyPolicy}
                onChange={handleInputChange}
                className="border-slate-200 min-h-[200px]"
                placeholder="Enter your privacy policy here..."
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button
          onClick={saveSettings}
          disabled={isSaving}
          className="bg-slate-800 hover:bg-slate-900 flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save All Settings"}
        </Button>
      </div>
    </div>
  )
}
