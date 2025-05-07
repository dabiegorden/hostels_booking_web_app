"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Plus, MoreHorizontal, Search, Edit, Trash, Eye } from "lucide-react"
import { toast } from "sonner"

export default function HostelOwnersPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [hostelOwners, setHostelOwners] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [openCreateDialog, setOpenCreateDialog] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [openViewDialog, setOpenViewDialog] = useState(false)
  const [currentHostelOwner, setCurrentHostelOwner] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    businessName: "",
    businessAddress: "",
    password: "",
  })

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
      // Fetch hostel owners
      fetchHostelOwners()
    }
  }, [user, loading, router, toast])

  const fetchHostelOwners = async () => {
    try {
      setIsLoading(true)
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
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreateHostelOwner = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/hostel-owners`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create hostel owner")
      }

      toast({
        title: "Success",
        description: "Hostel owner created successfully.",
      })

      setOpenCreateDialog(false)
      setFormData({
        name: "",
        email: "",
        phoneNumber: "",
        businessName: "",
        businessAddress: "",
        password: "",
      })
      fetchHostelOwners()
    } catch (error) {
      console.error("Error creating hostel owner:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create hostel owner.",
        variant: "destructive",
      })
    }
  }

  const handleEditHostelOwner = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/hostel-owners/${currentHostelOwner._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
          credentials: "include",
        },
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update hostel owner")
      }

      toast({
        title: "Success",
        description: "Hostel owner updated successfully.",
      })

      setOpenEditDialog(false)
      fetchHostelOwners()
    } catch (error) {
      console.error("Error updating hostel owner:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update hostel owner.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteHostelOwner = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/hostel-owners/${currentHostelOwner._id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete hostel owner")
      }

      toast({
        title: "Success",
        description: "Hostel owner deleted successfully.",
      })

      setOpenDeleteDialog(false)
      fetchHostelOwners()
    } catch (error) {
      console.error("Error deleting hostel owner:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete hostel owner.",
        variant: "destructive",
      })
    }
  }

  const handleViewHostelOwner = (hostelOwner) => {
    setCurrentHostelOwner(hostelOwner)
    setOpenViewDialog(true)
  }

  const handleEditClick = (hostelOwner) => {
    setCurrentHostelOwner(hostelOwner)
    setFormData({
      name: hostelOwner.name,
      email: hostelOwner.email,
      phoneNumber: hostelOwner.phoneNumber,
      businessName: hostelOwner.businessName,
      businessAddress: hostelOwner.businessAddress,
      // Don't set password for editing
    })
    setOpenEditDialog(true)
  }

  const handleDeleteClick = (hostelOwner) => {
    setCurrentHostelOwner(hostelOwner)
    setOpenDeleteDialog(true)
  }

  const filteredHostelOwners = hostelOwners.filter((hostelOwner) => {
    const searchTermLower = searchTerm.toLowerCase()
    return (
      hostelOwner.name.toLowerCase().includes(searchTermLower) ||
      hostelOwner.email.toLowerCase().includes(searchTermLower) ||
      hostelOwner.businessName.toLowerCase().includes(searchTermLower) ||
      hostelOwner.businessAddress.toLowerCase().includes(searchTermLower)
    )
  })

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
          <h1 className="text-3xl font-bold tracking-tight">Hostel Owners</h1>
          <p className="text-muted-foreground">Manage hostel owner accounts and information</p>
        </div>
        <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Hostel Owner
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Hostel Owner</DialogTitle>
              <DialogDescription>Create a new hostel owner account. All fields are required.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateHostelOwner} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessAddress">Business Address</Label>
                <Input
                  id="businessAddress"
                  name="businessAddress"
                  value={formData.businessAddress}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpenCreateDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Hostel Owner</Button>
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
            placeholder="Search hostel owners..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hostel Owners List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Business Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHostelOwners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    {searchTerm ? "No hostel owners found matching your search." : "No hostel owners found."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredHostelOwners.map((hostelOwner) => (
                  <TableRow key={hostelOwner._id}>
                    <TableCell className="font-medium">{hostelOwner.name}</TableCell>
                    <TableCell>{hostelOwner.businessName}</TableCell>
                    <TableCell>{hostelOwner.email}</TableCell>
                    <TableCell>{hostelOwner.phoneNumber}</TableCell>
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
                          <DropdownMenuItem onClick={() => handleViewHostelOwner(hostelOwner)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditClick(hostelOwner)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteClick(hostelOwner)} className="text-red-600">
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

      {/* View Hostel Owner Dialog */}
      <Dialog open={openViewDialog} onOpenChange={setOpenViewDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Hostel Owner Details</DialogTitle>
          </DialogHeader>
          {currentHostelOwner && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p>{currentHostelOwner.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p>{currentHostelOwner.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                  <p>{currentHostelOwner.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Business Name</p>
                  <p>{currentHostelOwner.businessName}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Business Address</p>
                <p>{currentHostelOwner.businessAddress}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Hostel Owner Dialog */}
      <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Hostel Owner</DialogTitle>
            <DialogDescription>Update hostel owner information.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditHostelOwner} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input id="edit-name" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-phoneNumber">Phone Number</Label>
                <Input
                  id="edit-phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-businessName">Business Name</Label>
                <Input
                  id="edit-businessName"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-businessAddress">Business Address</Label>
              <Input
                id="edit-businessAddress"
                name="businessAddress"
                value={formData.businessAddress}
                onChange={handleInputChange}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenEditDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Hostel Owner</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Hostel Owner Dialog */}
      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this hostel owner? This action cannot be undone and will also delete all
              associated hostels.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setOpenDeleteDialog(false)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteHostelOwner}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
