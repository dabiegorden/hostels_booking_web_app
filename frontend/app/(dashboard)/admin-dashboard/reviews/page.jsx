"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Search, Eye, Star, CheckCircle, Trash } from "lucide-react"
import { toast } from "sonner"

export default function ReviewsPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [reviews, setReviews] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [openViewDialog, setOpenViewDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [currentReview, setCurrentReview] = useState(null)

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

      // Fetch reviews
      fetchReviews()
    } catch (error) {
      console.error("Auth error:", error)
      toast.error("Authentication failed. Please login again.")
      router.push("/auth/login")
    }
  }

  const fetchReviews = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/reviews`, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch reviews")
      }

      const data = await response.json()
      setReviews(data.reviews)
    } catch (error) {
      console.error("Error fetching reviews:", error)
      toast.error("Failed to load reviews.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewReview = (review) => {
    setCurrentReview(review)
    setOpenViewDialog(true)
  }

  const handleDeleteClick = (review) => {
    setCurrentReview(review)
    setOpenDeleteDialog(true)
  }

  const handleVerifyReview = async (reviewId) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/reviews/${reviewId}/verify`, {
        method: "PUT",
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to verify review")
      }

      toast.success("Review verified successfully.")
      fetchReviews()
    } catch (error) {
      console.error("Error verifying review:", error)
      toast.error(error.message || "Failed to verify review.")
    }
  }

  const handleDeleteReview = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/${currentReview._id}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete review")
      }

      toast.success("Review deleted successfully.")
      setOpenDeleteDialog(false)
      fetchReviews()
    } catch (error) {
      console.error("Error deleting review:", error)
      toast.error(error.message || "Failed to delete review.")
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`h-4 w-4 ${i < rating ? "text-yellow-500 fill-yellow-500" : "text-slate-300"}`} />
        ))}
        <span className="ml-1 text-sm text-slate-700">{rating}/5</span>
      </div>
    )
  }

  const filteredReviews = reviews.filter((review) => {
    const searchTermLower = searchTerm.toLowerCase()
    return (
      review.student?.name?.toLowerCase().includes(searchTermLower) ||
      review.hostel?.name?.toLowerCase().includes(searchTermLower) ||
      review.title?.toLowerCase().includes(searchTermLower) ||
      review.comment?.toLowerCase().includes(searchTermLower)
    )
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-lg shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Reviews</h1>
          <p className="text-slate-500 mt-1">Manage and moderate hostel reviews</p>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-slate-100">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Search reviews..."
            className="pl-8 bg-slate-50 border-slate-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-slate-800 flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Hostel Reviews
            </CardTitle>
            <div className="text-sm text-slate-500">Total: {reviews.length}</div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold">Student</TableHead>
                <TableHead className="font-semibold">Hostel</TableHead>
                <TableHead className="font-semibold">Rating</TableHead>
                <TableHead className="font-semibold">Title</TableHead>
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                    {searchTerm ? "No reviews found matching your search." : "No reviews found."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredReviews.map((review) => (
                  <TableRow key={review._id} className="hover:bg-slate-50">
                    <TableCell className="font-medium text-slate-900">{review.student?.name || "Unknown"}</TableCell>
                    <TableCell className="text-slate-700">{review.hostel?.name || "Unknown"}</TableCell>
                    <TableCell className="text-slate-700">{renderStars(review.rating)}</TableCell>
                    <TableCell className="text-slate-700 max-w-[200px] truncate">{review.title}</TableCell>
                    <TableCell className="text-slate-700">{formatDate(review.createdAt)}</TableCell>
                    <TableCell>
                      {review.isVerified ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Verified</Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>
                      )}
                      {review.reportCount > 0 && (
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-200 ml-1">
                          {review.reportCount} Report(s)
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-slate-700">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="border-slate-200">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleViewReview(review)} className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4 text-blue-500" />
                            View Details
                          </DropdownMenuItem>
                          {!review.isVerified && (
                            <DropdownMenuItem onClick={() => handleVerifyReview(review._id)} className="cursor-pointer">
                              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                              Verify Review
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(review)}
                            className="text-red-600 cursor-pointer"
                          >
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

      {/* View Review Dialog */}
      <Dialog open={openViewDialog} onOpenChange={setOpenViewDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader className="bg-yellow-50 -mx-6 -mt-6 p-6 rounded-t-lg">
            <DialogTitle className="text-yellow-700">Review Details</DialogTitle>
          </DialogHeader>
          {currentReview && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Student</p>
                  <p className="text-slate-900 font-medium">{currentReview.student?.name || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Hostel</p>
                  <p className="text-slate-900">{currentReview.hostel?.name || "Unknown"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Rating</p>
                  <div className="text-slate-900">{renderStars(currentReview.rating)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Date</p>
                  <p className="text-slate-900">{formatDate(currentReview.createdAt)}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Title</p>
                <p className="text-slate-900 font-medium">{currentReview.title}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Comment</p>
                <p className="text-slate-900 whitespace-pre-line">{currentReview.comment}</p>
              </div>
              {currentReview.images && currentReview.images.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-slate-500">Images</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {currentReview.images.map((image, index) => (
                      <img
                        key={index}
                        src={image || "/placeholder.svg"}
                        alt={`Review image ${index + 1}`}
                        className="h-20 w-20 object-cover rounded-md border border-slate-200"
                      />
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">Status</p>
                  <p className="text-slate-900">
                    {currentReview.isVerified ? (
                      <Badge className="bg-green-100 text-green-800">Verified</Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                    )}
                  </p>
                </div>
                {currentReview.reportCount > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-500">Reports</p>
                    <p className="text-slate-900">
                      <Badge className="bg-red-100 text-red-800">{currentReview.reportCount} Report(s)</Badge>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            {!currentReview?.isVerified && (
              <Button
                onClick={() => {
                  handleVerifyReview(currentReview._id)
                  setOpenViewDialog(false)
                }}
                className="bg-green-600 hover:bg-green-700 mr-2"
              >
                Verify Review
              </Button>
            )}
            <Button onClick={() => setOpenViewDialog(false)} className="bg-yellow-600 hover:bg-yellow-700">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Review Dialog */}
      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader className="bg-red-50 -mx-6 -mt-6 p-6 rounded-t-lg">
            <DialogTitle className="text-red-700">Delete Review</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this review? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setOpenDeleteDialog(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleDeleteReview} className="bg-red-600 hover:bg-red-700">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
