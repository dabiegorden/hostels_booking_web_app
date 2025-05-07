"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, MoreHorizontal, Search, Edit, Trash, Eye, MapPin } from "lucide-react"
import { toast } from "sonner"

export default function HostelsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [hostels, setHostels] = useState([])
  const [hostelOwners, setHostelOwners] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [openCreateDialog, setOpenCreateDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [openViewDialog, setOpenViewDialog] = useState(false)
  const [currentHostel, setCurrentHostel] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    location: {
      coordinates: [0, 0],
    },
    owner: "",
    amenities: [],
    policies: "",
    images: [],
    basePrice: 0,
    priceRange: {
      min: 0,
      max: 0,
    },
    discountRate: 0,
    pricingNotes: "",
    currency: "NGN",
  })
  const [amenityInput, setAmenityInput] = useState("")

  useEffect(() => {
    // Redirect if not authenticated or not an admin
    if (!loading && (!user || user.role !== "admin")) {
      toast({
        title: "Access Denied",
        description: "You must be an admin to view this page.",
        variant: "destructive",
      })
      router.push("/auth/login")
    } else if (!loading && user) {
      // Fetch hostels and hostel owners
      fetchHostels()
      fetchHostelOwners()
    }
  }, [user, loading, router, toast])

  const fetchHostels = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/hostels`, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch hostels")
      }

      const data = await response.json()
      setHostels(data.hostels)
    } catch (error) {
      console.error("Error fetching hostels:", error)
      toast({
        title: "Error",
        description: "Failed to load hostels.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchHostelOwners = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/hostel-owners`, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch hostel owners")
      }

      const data = await response.json()
      setHostelOwners(data.hostelOwners)
    } catch (error) {
      console.error("Error fetching hostel owners:", error)
      toast({
        title: "Error",
        description: "Failed to load hostel owners.",
        variant: "destructive",
      })
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNumberInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: Number(value) || 0 }))
  }

  const handlePriceRangeChange = (e) => {
    const { name, value } = e.target
    const field = name.split(".")[1] // Extract 'min' or 'max' from 'priceRange.min' or 'priceRange.max'
    setFormData((prev) => ({
      ...prev,
      priceRange: {
        ...prev.priceRange,
        [field]: Number(value) || 0,
      },
    }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleLocationChange = (e) => {
    const { name, value } = e.target
    const [lat, lng] =
      name === "latitude"
        ? [Number.parseFloat(value), formData.location.coordinates[1]]
        : [formData.location.coordinates[0], Number.parseFloat(value)]

    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        coordinates: [lng, lat], // GeoJSON format is [longitude, latitude]
      },
    }))
  }

  const handleAddAmenity = () => {
    if (amenityInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        amenities: [...prev.amenities, amenityInput.trim()],
      }))
      setAmenityInput("")
    }
  }

  const handleRemoveAmenity = (index) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index),
    }))
  }

  const handleCreateHostel = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/hostels`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create hostel")
      }

      toast({
        title: "Success",
        description: "Hostel created successfully.",
      })

      setOpenCreateDialog(false)
      setFormData({
        name: "",
        description: "",
        address: "",
        location: {
          coordinates: [0, 0],
        },
        owner: "",
        amenities: [],
        policies: "",
        images: [],
        basePrice: 0,
        priceRange: {
          min: 0,
          max: 0,
        },
        discountRate: 0,
        pricingNotes: "",
        currency: "GHS",
      })
      fetchHostels()
    } catch (error) {
      console.error("Error creating hostel:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create hostel.",
        variant: "destructive",
      })
    }
  }

  const handleEditHostel = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/hostels/${currentHostel._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update hostel")
      }

      toast({
        title: "Success",
        description: "Hostel updated successfully.",
      })

      setOpenEditDialog(false)
      fetchHostels()
    } catch (error) {
      console.error("Error updating hostel:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update hostel.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteHostel = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/hostels/${currentHostel._id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete hostel")
      }

      toast({
        title: "Success",
        description: "Hostel deleted successfully.",
      })

      setOpenDeleteDialog(false)
      fetchHostels()
    } catch (error) {
      console.error("Error deleting hostel:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete hostel.",
        variant: "destructive",
      })
    }
  }

  const handleViewHostel = (hostel) => {
    setCurrentHostel(hostel)
    setOpenViewDialog(true)
  }

  const handleEditClick = (hostel) => {
    setCurrentHostel(hostel)
    // Extract latitude and longitude from GeoJSON format
    const [longitude, latitude] = hostel.location.coordinates

    setFormData({
      name: hostel.name,
      description: hostel.description,
      address: hostel.address,
      location: {
        coordinates: [longitude, latitude],
      },
      owner: hostel.owner._id || hostel.owner,
      amenities: hostel.amenities || [],
      policies: hostel.policies || "",
      images: hostel.images || [],
      basePrice: hostel.basePrice || 0,
      priceRange: {
        min: hostel.priceRange?.min || 0,
        max: hostel.priceRange?.max || 0,
      },
      discountRate: hostel.discountRate || 0,
      pricingNotes: hostel.pricingNotes || "",
      currency: hostel.currency || "GHS",
    })
    setOpenEditDialog(true)
  }

  const handleDeleteClick = (hostel) => {
    setCurrentHostel(hostel)
    setOpenDeleteDialog(true)
  }

  const filteredHostels = hostels.filter((hostel) => {
    const searchTermLower = searchTerm.toLowerCase()
    return (
      hostel.name.toLowerCase().includes(searchTermLower) ||
      hostel.address.toLowerCase().includes(searchTermLower) ||
      (hostel.owner.name && hostel.owner.name.toLowerCase().includes(searchTermLower)) ||
      (hostel.owner.businessName && hostel.owner.businessName.toLowerCase().includes(searchTermLower))
    )
  })

  const getOwnerName = (hostel) => {
    if (hostel.owner.name) {
      return hostel.owner.businessName ? `${hostel.owner.name} (${hostel.owner.businessName})` : hostel.owner.name
    }

    // If owner is just an ID, find the owner in the hostelOwners array
    const owner = hostelOwners.find((o) => o._id === hostel.owner)
    return owner ? (owner.businessName ? `${owner.name} (${owner.businessName})` : owner.name) : "Unknown Owner"
  }

  const formatCurrency = (amount, currency = "GHS") => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency,
    }).format(amount)
  }

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hostels</h1>
          <p className="text-muted-foreground">Manage hostel listings and information</p>
        </div>
        <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Hostel
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Hostel</DialogTitle>
              <DialogDescription>Create a new hostel listing. Fill in the details below.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateHostel} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Hostel Name</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="owner">Hostel Owner</Label>
                  <Select value={formData.owner} onValueChange={(value) => handleSelectChange("owner", value)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select owner" />
                    </SelectTrigger>
                    <SelectContent>
                      {hostelOwners.map((owner) => (
                        <SelectItem key={owner._id} value={owner._id}>
                          {owner.businessName ? `${owner.name} (${owner.businessName})` : owner.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" value={formData.address} onChange={handleInputChange} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    name="latitude"
                    type="number"
                    step="any"
                    value={formData.location.coordinates[1]}
                    onChange={handleLocationChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    name="longitude"
                    type="number"
                    step="any"
                    value={formData.location.coordinates[0]}
                    onChange={handleLocationChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                />
              </div>

              {/* Price Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="basePrice">Base Price</Label>
                  <Input
                    id="basePrice"
                    name="basePrice"
                    type="number"
                    value={formData.basePrice}
                    onChange={handleNumberInputChange}
                    required
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={formData.currency} onValueChange={(value) => handleSelectChange("currency", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GH₵">Ghana Cedis (₵)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priceRange.min">Minimum Price</Label>
                  <Input
                    id="priceRange.min"
                    name="priceRange.min"
                    type="number"
                    value={formData.priceRange.min}
                    onChange={handlePriceRangeChange}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priceRange.max">Maximum Price</Label>
                  <Input
                    id="priceRange.max"
                    name="priceRange.max"
                    type="number"
                    value={formData.priceRange.max}
                    onChange={handlePriceRangeChange}
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discountRate">Discount Rate (%)</Label>
                  <Input
                    id="discountRate"
                    name="discountRate"
                    type="number"
                    value={formData.discountRate}
                    onChange={handleNumberInputChange}
                    min="0"
                    max="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pricingNotes">Pricing Notes</Label>
                  <Input
                    id="pricingNotes"
                    name="pricingNotes"
                    value={formData.pricingNotes}
                    onChange={handleInputChange}
                    placeholder="E.g., Special rates for long stays"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="policies">Policies</Label>
                <Textarea
                  id="policies"
                  name="policies"
                  value={formData.policies}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Amenities</Label>
                <div className="flex gap-2">
                  <Input
                    value={amenityInput}
                    onChange={(e) => setAmenityInput(e.target.value)}
                    placeholder="Add amenity"
                  />
                  <Button type="button" onClick={handleAddAmenity}>
                    Add
                  </Button>
                </div>
                {formData.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.amenities.map((amenity, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm"
                      >
                        {amenity}
                        <button
                          type="button"
                          onClick={() => handleRemoveAmenity(index)}
                          className="text-secondary-foreground/70 hover:text-secondary-foreground"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenCreateDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Hostel</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search hostels..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hostels List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Base Price</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHostels.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {searchTerm ? "No hostels found matching your search." : "No hostels found."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredHostels.map((hostel) => (
                  <TableRow key={hostel._id}>
                    <TableCell className="font-medium">{hostel.name}</TableCell>
                    <TableCell>{hostel.address}</TableCell>
                    <TableCell>{getOwnerName(hostel)}</TableCell>
                    <TableCell>{formatCurrency(hostel.basePrice || 0, hostel.currency)}</TableCell>
                    <TableCell>
                      {hostel.verified ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleViewHostel(hostel)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditClick(hostel)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteClick(hostel)} className="text-red-600">
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Hostel Dialog */}
      <Dialog open={openViewDialog} onOpenChange={setOpenViewDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Hostel Details</DialogTitle>
          </DialogHeader>
          {currentHostel && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="font-medium">{currentHostel.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Owner</p>
                  <p>{getOwnerName(currentHostel)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Address</p>
                <p className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {currentHostel.address}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p className="text-sm">{currentHostel.description}</p>
              </div>

              {/* Price Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Base Price</p>
                  <p className="font-medium">{formatCurrency(currentHostel.basePrice || 0, currentHostel.currency)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Price Range</p>
                  <p>
                    {currentHostel.priceRange?.min && currentHostel.priceRange?.max
                      ? `${formatCurrency(currentHostel.priceRange.min, currentHostel.currency)} - ${formatCurrency(currentHostel.priceRange.max, currentHostel.currency)}`
                      : "Not specified"}
                  </p>
                </div>
              </div>

              {currentHostel.discountRate > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Discount</p>
                  <p>{currentHostel.discountRate}%</p>
                </div>
              )}

              {currentHostel.pricingNotes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pricing Notes</p>
                  <p className="text-sm">{currentHostel.pricingNotes}</p>
                </div>
              )}

              {currentHostel.policies && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Policies</p>
                  <p className="text-sm">{currentHostel.policies}</p>
                </div>
              )}
              {currentHostel.amenities && currentHostel.amenities.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Amenities</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {currentHostel.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-xs"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Verification Status</p>
                  <p>
                    {currentHostel.verified ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created At</p>
                  <p>{new Date(currentHostel.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Hostel Dialog */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Hostel</DialogTitle>
            <DialogDescription>Update hostel information.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditHostel} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Hostel Name</Label>
                <Input id="edit-name" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-owner">Hostel Owner</Label>
                <Select value={formData.owner} onValueChange={(value) => handleSelectChange("owner", value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select owner" />
                  </SelectTrigger>
                  <SelectContent>
                    {hostelOwners.map((owner) => (
                      <SelectItem key={owner._id} value={owner._id}>
                        {owner.businessName ? `${owner.name} (${owner.businessName})` : owner.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Address</Label>
              <Input id="edit-address" name="address" value={formData.address} onChange={handleInputChange} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-latitude">Latitude</Label>
                <Input
                  id="edit-latitude"
                  name="latitude"
                  type="number"
                  step="any"
                  value={formData.location.coordinates[1]}
                  onChange={handleLocationChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-longitude">Longitude</Label>
                <Input
                  id="edit-longitude"
                  name="longitude"
                  type="number"
                  step="any"
                  value={formData.location.coordinates[0]}
                  onChange={handleLocationChange}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
              />
            </div>

            {/* Price Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-basePrice">Base Price</Label>
                <Input
                  id="edit-basePrice"
                  name="basePrice"
                  type="number"
                  value={formData.basePrice}
                  onChange={handleNumberInputChange}
                  required
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-currency">Currency</Label>
                <Select value={formData.currency} onValueChange={(value) => handleSelectChange("currency", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NGN">Nigerian Naira (₦)</SelectItem>
                    <SelectItem value="USD">US Dollar ($)</SelectItem>
                    <SelectItem value="EUR">Euro (€)</SelectItem>
                    <SelectItem value="GBP">British Pound (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-priceRange.min">Minimum Price</Label>
                <Input
                  id="edit-priceRange.min"
                  name="priceRange.min"
                  type="number"
                  value={formData.priceRange.min}
                  onChange={handlePriceRangeChange}
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-priceRange.max">Maximum Price</Label>
                <Input
                  id="edit-priceRange.max"
                  name="priceRange.max"
                  type="number"
                  value={formData.priceRange.max}
                  onChange={handlePriceRangeChange}
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-discountRate">Discount Rate (%)</Label>
                <Input
                  id="edit-discountRate"
                  name="discountRate"
                  type="number"
                  value={formData.discountRate}
                  onChange={handleNumberInputChange}
                  min="0"
                  max="100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-pricingNotes">Pricing Notes</Label>
                <Input
                  id="edit-pricingNotes"
                  name="pricingNotes"
                  value={formData.pricingNotes}
                  onChange={handleInputChange}
                  placeholder="E.g., Special rates for long stays"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-policies">Policies</Label>
              <Textarea
                id="edit-policies"
                name="policies"
                value={formData.policies}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Amenities</Label>
              <div className="flex gap-2">
                <Input
                  value={amenityInput}
                  onChange={(e) => setAmenityInput(e.target.value)}
                  placeholder="Add amenity"
                />
                <Button type="button" onClick={handleAddAmenity}>
                  Add
                </Button>
              </div>
              {formData.amenities.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.amenities.map((amenity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm"
                    >
                      {amenity}
                      <button
                        type="button"
                        onClick={() => handleRemoveAmenity(index)}
                        className="text-secondary-foreground/70 hover:text-secondary-foreground"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenEditDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Hostel</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Hostel Dialog */}
      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this hostel? This action cannot be undone and will also delete all
              associated rooms.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setOpenDeleteDialog(false)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteHostel}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
