"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  ArrowLeft, Save, User, Phone, BookOpen, Building, 
  Calendar, MapPin, Mail, BadgeCheck, BookmarkPlus, 
  AlertCircle, CheckCircle2, ChevronDown 
} from "lucide-react"

export default function StudentProfile() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const successRef = useRef(null)

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    studentId: "",
    phoneNumber: "",
    program: "",
    level: "",
    department: "",
    avatar: null,
    bio: "",
    address: "",
    dateOfBirth: "",
    joinDate: "",
  })

  // Programmatic departments for the dropdown
  const departments = [
    "Computer Science",
    "Information Technology",
    "Software Engineering",
    "Civil Engineering",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Business Administration",
    "Economics",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Medicine",
    "Law",
    "Other"
  ]

  // Fetch student profile on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const response = await fetch("http://localhost:5000/api/students/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Important for sending cookies
        })

        if (!response.ok) {
          if (response.status === 401) {
            // Unauthorized, redirect to login
            router.push("/students/signin")
            return
          }
          throw new Error("Failed to fetch profile")
        }

        const data = await response.json()
        setProfile(prev => ({
          ...prev,
          ...data.student,
          // Set default values for new fields if they don't exist
          bio: data.student.bio || "",
          address: data.student.address || "",
          dateOfBirth: data.student.dateOfBirth || "",
          joinDate: data.student.joinDate || new Date().toISOString().split('T')[0],
        }))
      } catch (err) {
        setError(err.message || "An error occurred while fetching your profile")
        console.error("Error fetching profile:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [router])

  // Scroll to success message when it appears
  useEffect(() => {
    if (success && successRef.current) {
      successRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [success]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      setError(null)
      setSuccess(false)

      const response = await fetch("http://localhost:5000/api/students/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: profile.name,
          phoneNumber: profile.phoneNumber,
          program: profile.program,
          level: profile.level,
          department: profile.department,
          bio: profile.bio,
          address: profile.address,
          dateOfBirth: profile.dateOfBirth,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      const data = await response.json()
      setProfile(prev => ({
        ...prev,
        ...data.student
      }))
      setSuccess(true)
    } catch (err) {
      setError(err.message || "An error occurred while updating your profile")
      console.error("Error updating profile:", err)
    } finally {
      setSaving(false)
    }
  }

  const getInitials = (name) => {
    if (!name) return "S";
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/4"></div>
            </div>
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="rounded-full bg-gray-200 h-24 w-24 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-20 mb-3"></div>
                </div>
                <div className="flex-1 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-10 bg-gray-200 rounded"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-10 bg-gray-200 rounded"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/home" className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 transition-colors font-medium">
            <ArrowLeft className="size-4 mr-1" />
            Back to Home
          </Link>
        </div>

        {success && (
          <div 
            ref={successRef}
            className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg shadow-sm flex items-start gap-3 animate-fadeIn"
          >
            <CheckCircle2 className="size-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium">Profile Updated!</h3>
              <p className="text-sm text-green-600">Your profile has been updated successfully.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg shadow-sm flex items-start gap-3">
            <AlertCircle className="size-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium">Error</h3>
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b bg-gradient-to-r from-indigo-50 to-white">
            <h1 className="text-2xl font-bold text-gray-900">Student Profile</h1>
            <p className="text-gray-500 mt-1">Update your personal information and preferences</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Avatar and Student ID Section */}
              <div className="md:w-1/4 flex flex-col items-center">
                <div className="relative group">
                  <div className="h-24 w-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-bold border-2 border-indigo-200 mb-3">
                    {getInitials(profile.name)}
                  </div>
                  <button 
                    type="button"
                    className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={() => alert("Avatar upload feature coming soon!")}
                  >
                    <span className="text-xs font-medium">Change</span>
                  </button>
                </div>
                <div className="w-full mt-2">
                  <div className="flex items-center justify-center gap-1 text-sm font-medium text-gray-700 mb-1">
                    <BadgeCheck className="size-4 text-indigo-500" />
                    Student ID
                  </div>
                  <div className="text-center bg-indigo-50 py-2 px-4 rounded-md text-indigo-700 font-mono text-sm">
                    {profile.studentId || "—"}
                  </div>
                  <div className="mt-4">
                    <div className="text-sm font-medium text-gray-700 mb-1 flex items-center justify-center gap-1">
                      <Calendar className="size-4 text-gray-500" />
                      Joined
                    </div>
                    <div className="text-center text-gray-600 text-sm">
                      {new Date(profile.joinDate || Date.now()).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="flex-1">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="size-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={profile.name || ""}
                          onChange={handleChange}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="size-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          id="email"
                          value={profile.email || ""}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-700"
                          disabled
                        />
                      </div>
                      <p className="text-xs text-gray-500">Email cannot be changed</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="size-5 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          id="phoneNumber"
                          name="phoneNumber"
                          value={profile.phoneNumber || ""}
                          onChange={handleChange}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                          placeholder="e.g. +1 234 567 8900"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                        Date of Birth
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Calendar className="size-5 text-gray-400" />
                        </div>
                        <input
                          type="date"
                          id="dateOfBirth"
                          name="dateOfBirth"
                          value={profile.dateOfBirth || ""}
                          onChange={handleChange}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                      Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="size-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={profile.address || ""}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        placeholder="Your current address"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="program" className="block text-sm font-medium text-gray-700">
                        Program
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <BookOpen className="size-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="program"
                          name="program"
                          value={profile.program || ""}
                          onChange={handleChange}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                          placeholder="e.g. Bachelor of Science"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="level" className="block text-sm font-medium text-gray-700">
                        Level
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <ChevronDown className="size-5 text-gray-400" />
                        </div>
                        <select
                          id="level"
                          name="level"
                          value={profile.level || ""}
                          onChange={handleChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none transition-all"
                        >
                          <option value="">Select Level</option>
                          <option value="100">100 Level</option>
                          <option value="200">200 Level</option>
                          <option value="300">300 Level</option>
                          <option value="400">400 Level</option>
                          <option value="500">500 Level</option>
                          <option value="600">600 Level</option>
                          <option value="700">700 Level</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                      Department
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building className="size-5 text-gray-400" />
                      </div>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <ChevronDown className="size-5 text-gray-400" />
                      </div>
                      <select
                        id="department"
                        name="department"
                        value={profile.department || ""}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none transition-all"
                      >
                        <option value="">Select Department</option>
                        {departments.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={profile.bio || ""}
                      onChange={handleChange}
                      rows="3"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
                      placeholder="Tell us a little about yourself..."
                    ></textarea>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <BookmarkPlus className="size-3" />
                      This information may be displayed in your student profile
                    </p>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex justify-center items-center px-6 py-2.5 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                    >
                      {saving ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="size-5 mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}