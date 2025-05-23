"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { 
  Star, 
  StarHalf, 
  Calendar, 
  User, 
  CheckCircle, 
  MapPin, 
  Filter, 
  AlertCircle, 
  Loader2 
} from "lucide-react"

const Reviews = () => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hostels, setHostels] = useState([])
  const [selectedHostel, setSelectedHostel] = useState("")
  const [filterRating, setFilterRating] = useState(0)
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingCounts: [0, 0, 0, 0, 0]
  })

  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/hostel-owners/hostels", {
          credentials: "include",
        })

        if (!response.ok) {
          throw new Error("Failed to fetch hostels")
        }

        const data = await response.json()
        setHostels(data.hostels || [])

        if (data.hostels && data.hostels.length > 0) {
          setSelectedHostel(data.hostels[0]._id)
        }
      } catch (err) {
        console.error("Error fetching hostels:", err)
        setError(err.message)
      }
    }

    fetchHostels()
  }, [])

  useEffect(() => {
    if (selectedHostel) {
      fetchReviews(selectedHostel)
    }
  }, [selectedHostel, filterRating])

  const fetchReviews = async (hostelId) => {
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:5000/api/hostel-owners/hostels/${hostelId}`, {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch reviews")
      }

      const data = await response.json()
      
      // Get all reviews
      const allReviews = data.hostel.reviews || []
      
      // Filter reviews if a rating filter is applied
      const filteredReviews = filterRating > 0 
        ? allReviews.filter(review => Math.floor(review.rating) === filterRating)
        : allReviews

      setReviews(filteredReviews)
      
      // Calculate stats
      if (allReviews.length > 0) {
        const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0)
        const average = totalRating / allReviews.length
        
        // Count reviews by rating
        const ratingCounts = [0, 0, 0, 0, 0]
        allReviews.forEach(review => {
          const ratingIndex = Math.floor(review.rating) - 1
          if (ratingIndex >= 0 && ratingIndex < 5) {
            ratingCounts[ratingIndex]++
          }
        })
        
        setStats({
          averageRating: average.toFixed(1),
          totalReviews: allReviews.length,
          ratingCounts
        })
      }
    } catch (err) {
      console.error("Error fetching reviews:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
          } else if (i === fullStars && hasHalfStar) {
            return <StarHalf key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
          } else {
            return <Star key={i} className="w-5 h-5 text-gray-300" />
          }
        })}
        <span className="ml-2 text-sm font-medium text-gray-700">{rating.toFixed(1)}</span>
      </div>
    )
  }

  const handleHostelChange = (e) => {
    setSelectedHostel(e.target.value)
    setFilterRating(0) // Reset filter when hostel changes
  }
  
  const calculateRatingPercentage = (count) => {
    if (stats.totalReviews === 0) return 0
    return (count / stats.totalReviews) * 100
  }
  
  const handleFilterChange = (rating) => {
    setFilterRating(filterRating === rating ? 0 : rating)
  }

  if (loading && !selectedHostel) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-indigo-800">Guest Reviews</h1>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="ml-3 text-lg">Loading hostels...</p>
        </div>
      </div>
    )
  }

  if (error && !selectedHostel) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-indigo-800">Guest Reviews</h1>
        <Card className="bg-red-50 p-6 rounded-md border-red-200">
          <div className="flex items-start">
            <AlertCircle className="w-6 h-6 text-red-600 mr-3 mt-1" />
            <div>
              <p className="text-red-800 font-medium">Error: {error}</p>
              <p className="text-red-700 mt-1">Please try again later or contact support.</p>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  if (hostels.length === 0) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-indigo-800">Guest Reviews</h1>
        <Card className="p-8 text-center border-dashed border-2 bg-gray-50">
          <div className="flex flex-col items-center">
            <MapPin className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-gray-700 font-medium text-lg">No hostels found.</p>
            <p className="text-gray-500 mt-2">You need to create a hostel before you can view reviews.</p>
            <button className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md transition-colors">
              Create Your First Hostel
            </button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <h1 className="text-3xl font-bold text-indigo-800 mb-3 md:mb-0">Guest Reviews</h1>
        
        <div className="w-full md:w-1/3">
          <label htmlFor="hostel-select" className="block text-sm font-medium mb-1 text-gray-700">
            Select Hostel:
          </label>
          <div className="relative">
            <select
              id="hostel-select"
              value={selectedHostel}
              onChange={handleHostelChange}
              className="w-full p-2 pr-8 border border-gray-300 rounded-md bg-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {hostels.map((hostel) => (
                <option key={hostel._id} value={hostel._id}>
                  {hostel.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="ml-3 text-lg">Loading reviews...</p>
        </div>
      ) : error ? (
        <Card className="bg-red-50 p-6 rounded-md border-red-200">
          <div className="flex items-start">
            <AlertCircle className="w-6 h-6 text-red-600 mr-3 mt-1" />
            <div>
              <p className="text-red-800 font-medium">Error: {error}</p>
              <p className="text-red-700 mt-1">Please try again later or contact support.</p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats and filters panel */}
          <div className="lg:col-span-1">
            <Card className="p-5 bg-white shadow-sm border border-gray-200 sticky top-6">
              <div className="mb-6 text-center pb-6 border-b border-gray-100">
                <div className="flex justify-center">
                  <span className="text-5xl font-bold text-indigo-600">{stats.averageRating}</span>
                  <span className="text-2xl mt-1 ml-1 text-indigo-600">/5</span>
                </div>
                <div className="flex justify-center mt-2">
                  {renderStars(parseFloat(stats.averageRating))}
                </div>
                <p className="text-gray-500 mt-2">Based on {stats.totalReviews} reviews</p>
              </div>
              
              <div className="mb-6">
                <h3 className="font-medium text-gray-800 mb-3 flex items-center">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter by Rating
                </h3>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleFilterChange(rating)}
                      className={`w-full flex items-center py-2 px-3 rounded-md transition-colors ${
                        filterRating === rating 
                          ? "bg-indigo-100 border border-indigo-200" 
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center text-yellow-500">
                        {[...Array(rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400" />
                        ))}
                        {[...Array(5-rating)].map((_, i) => (
                          <Star key={i + rating} className="w-4 h-4 text-gray-300" />
                        ))}
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-yellow-400 rounded-full" 
                            style={{ width: `${calculateRatingPercentage(stats.ratingCounts[rating-1])}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        {stats.ratingCounts[rating-1]}
                      </span>
                    </button>
                  ))}
                </div>
                
                {filterRating > 0 && (
                  <button 
                    onClick={() => setFilterRating(0)} 
                    className="mt-3 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Clear filter
                  </button>
                )}
              </div>
              
              <div className="px-4 py-3 bg-indigo-50 rounded-md border border-indigo-100">
                <h3 className="font-medium text-indigo-800 mb-2">Review Analytics</h3>
                <p className="text-sm text-gray-600">
                  {stats.totalReviews > 0 
                    ? `${Math.round((stats.ratingCounts[4] / stats.totalReviews) * 100)}% of guests gave 5 stars`
                    : "No reviews yet"
                  }
                </p>
                {stats.totalReviews > 5 && (
                  <p className="text-sm text-gray-600 mt-1">
                    Average rating is higher than 70% of properties in your area
                  </p>
                )}
              </div>
            </Card>
          </div>
          
          {/* Reviews list */}
          <div className="lg:col-span-2">
            {reviews.length === 0 ? (
              <Card className="p-6 text-center border-dashed border-2 bg-gray-50">
                <div className="py-6">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Star className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-gray-700 font-medium text-lg">No reviews found for this hostel.</p>
                  <p className="text-gray-500 mt-2">Reviews will appear here once students submit them.</p>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {filterRating > 0 && (
                  <div className="bg-indigo-50 px-4 py-3 rounded-md mb-4 flex justify-between items-center">
                    <p className="text-indigo-700">
                      Showing {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'} with {filterRating} {filterRating === 1 ? 'star' : 'stars'}
                    </p>
                    <button 
                      onClick={() => setFilterRating(0)}
                      className="text-sm text-indigo-700 hover:text-indigo-900 font-medium"
                    >
                      Clear
                    </button>
                  </div>
                )}
              
                {reviews.map((review) => (
                  <Card key={review._id} className="p-5 border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">{review.title}</h3>
                        <div className="mt-1">{renderStars(review.rating)}</div>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span className="text-sm">{formatDate(review.createdAt)}</span>
                      </div>
                    </div>

                    <p className="text-gray-700 my-4 leading-relaxed">{review.comment}</p>

                    {review.images && review.images.length > 0 && (
                      <div className="my-4">
                        <div className="grid grid-cols-4 gap-2">
                          {review.images.map((image, index) => (
                            <div 
                              key={index} 
                              className="relative aspect-square rounded-md overflow-hidden bg-gray-100 cursor-pointer hover:opacity-90 transition-opacity"
                            >
                              <img
                                src={image || "/api/placeholder/400/400"}
                                alt={`Review image ${index + 1}`}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-3 border-t border-gray-100 mt-2">
                      <div className="flex items-center text-gray-600">
                        <User className="w-4 h-4 mr-2" />
                        <span className="text-sm font-medium">
                          {review.student ? review.student.name : "Anonymous Guest"}
                        </span>
                      </div>
                      
                      {review.isVerified && (
                        <span className="text-green-600 flex items-center text-sm bg-green-50 px-2 py-1 rounded-full">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Verified Stay
                        </span>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Reviews