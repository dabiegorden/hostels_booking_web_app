"use client"

import { useState, useEffect, useRef } from "react"
import {
  ChevronDown,
  Menu,
  X,
  Home,
  Building,
  Calendar,
  Info,
  Contact,
  User,
  LogIn,
  Settings,
  LogOut,
  GraduationCap,
  Phone,
  Mail,
  BookOpen,
  School,
  Clock,
  Briefcase,
  MapPinned,
} from "lucide-react"
import logoImage from "@/public/assets/cug-logo.jpg"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [hostelsMenuOpen, setHostelsMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [authMenuOpen, setAuthMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const profileMenuRef = useRef(null)
  const hostelsMenuRef = useRef(null)
  const authMenuRef = useRef(null)
  const router = useRouter()

  // Check if user is logged in
  const isLoggedIn = !!user

  // Fetch current user on component mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/auth/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Important for sending cookies
        })

        if (response.ok) {
          const data = await response.json()
          if (data.user) {
            if (data.user.role === "student") {
              // Fetch complete student profile if we only have basic session info
              const profileResponse = await fetch("http://localhost:5000/api/students/profile", {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                },
                credentials: "include",
              })

              if (profileResponse.ok) {
                const profileData = await profileResponse.json()
                setUser(profileData.student)
              } else {
                // If profile fetch fails, use basic session data
                setUser(data.user)
              }
            } else if (data.user.role === "hostel-owner") {
              // Fetch complete hostel owner profile
              const profileResponse = await fetch("http://localhost:5000/api/hostel-owners/profile", {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                },
                credentials: "include",
              })

              if (profileResponse.ok) {
                const profileData = await profileResponse.json()
                setUser(profileData.hostelOwner)
              } else {
                // If profile fetch fails, use basic session data
                setUser(data.user)
              }
            } else if (data.user.role === "admin") {
              // For admin users
              setUser(data.user)
            }
          }
        }
      } catch (error) {
        console.error("Error fetching current user:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCurrentUser()
  }, [])

  // Handle click outside to close menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close profile menu when clicking outside
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false)
      }

      // Close hostels menu when clicking outside
      if (hostelsMenuRef.current && !hostelsMenuRef.current.contains(event.target)) {
        setHostelsMenuOpen(false)
      }

      // Close auth menu when clicking outside
      if (authMenuRef.current && !authMenuRef.current.contains(event.target)) {
        setAuthMenuOpen(false)
      }
    }

    // Add event listener
    document.addEventListener("mousedown", handleClickOutside)

    // Clean up
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Implement logout functionality
  const handleLogout = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      if (response.ok) {
        // Clear the user state
        setUser(null)
        // Close any open menus
        setProfileMenuOpen(false)
        setMobileMenuOpen(false)
        // Redirect to login page
        router.push("/auth")
      } else {
        console.error("Logout failed")
      }
    } catch (error) {
      console.error("Error during logout:", error)
    }
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Render user profile content based on role
  const renderProfileContent = () => {
    if (!user) return null

    if (user.role === "student") {
      return (
        <>
          <div className="border-b pb-3 mb-3">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-indigo-100 text-indigo-700 p-3 rounded-full">
                <User className="size-6" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-500">Student</p>
              </div>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="size-4 text-gray-500" />
              <span className="text-gray-700">{user.email}</span>
            </div>
            {user.studentId && (
              <div className="flex items-center gap-2 text-sm">
                <GraduationCap className="size-4 text-gray-500" />
                <span className="text-gray-700">{user.studentId}</span>
              </div>
            )}
            {user.phoneNumber && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="size-4 text-gray-500" />
                <span className="text-gray-700">{user.phoneNumber}</span>
              </div>
            )}
            {user.program && user.level && (
              <div className="flex items-center gap-2 text-sm">
                <BookOpen className="size-4 text-gray-500" />
                <span className="text-gray-700">
                  {user.program} - Level {user.level}
                </span>
              </div>
            )}
            {user.department && (
              <div className="flex items-center gap-2 text-sm">
                <School className="size-4 text-gray-500" />
                <span className="text-gray-700">{user.department}</span>
              </div>
            )}
            {user.createdAt && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="size-4 text-gray-500" />
                <span className="text-gray-700">Joined: {formatDate(user.createdAt)}</span>
              </div>
            )}
          </div>
        </>
      )
    } else if (user.role === "hostel-owner") {
      return (
        <>
          <div className="border-b pb-3 mb-3">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-green-100 text-green-700 p-3 rounded-full">
                <Building className="size-6" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-500">Hostel Owner</p>
              </div>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="size-4 text-gray-500" />
              <span className="text-gray-700">{user.email}</span>
            </div>
            {user.phoneNumber && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="size-4 text-gray-500" />
                <span className="text-gray-700">{user.phoneNumber}</span>
              </div>
            )}
            {user.businessName && (
              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="size-4 text-gray-500" />
                <span className="text-gray-700">{user.businessName}</span>
              </div>
            )}
            {user.businessAddress && (
              <div className="flex items-center gap-2 text-sm">
                <MapPinned className="size-4 text-gray-500" />
                <span className="text-gray-700">{user.businessAddress}</span>
              </div>
            )}
            {user.createdAt && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="size-4 text-gray-500" />
                <span className="text-gray-700">Joined: {formatDate(user.createdAt)}</span>
              </div>
            )}
          </div>
        </>
      )
    } else if (user.role === "admin") {
      return (
        <>
          <div className="border-b pb-3 mb-3">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-red-100 text-red-700 p-3 rounded-full">
                <Settings className="size-6" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-500">Administrator</p>
              </div>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="size-4 text-gray-500" />
              <span className="text-gray-700">{user.email}</span>
            </div>
          </div>
        </>
      )
    }
  }

  // Render mobile profile content
  const renderMobileProfileContent = () => {
    if (!user) return null

    if (user.role === "student") {
      return (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-indigo-100 text-indigo-700 p-3 rounded-full">
              <User className="size-6" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            {user.studentId && (
              <div className="flex items-center gap-2">
                <GraduationCap className="size-4 text-gray-500" />
                <span className="text-gray-700">{user.studentId}</span>
              </div>
            )}
            {user.phoneNumber && (
              <div className="flex items-center gap-2">
                <Phone className="size-4 text-gray-500" />
                <span className="text-gray-700">{user.phoneNumber}</span>
              </div>
            )}
            {user.program && user.level && (
              <div className="flex items-center gap-2">
                <BookOpen className="size-4 text-gray-500" />
                <span className="text-gray-700">
                  {user.program} - Level {user.level}
                </span>
              </div>
            )}
            {user.department && (
              <div className="flex items-center gap-2">
                <School className="size-4 text-gray-500" />
                <span className="text-gray-700">{user.department}</span>
              </div>
            )}
          </div>
        </div>
      )
    } else if (user.role === "hostel-owner") {
      return (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-green-100 text-green-700 p-3 rounded-full">
              <Building className="size-6" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            {user.phoneNumber && (
              <div className="flex items-center gap-2">
                <Phone className="size-4 text-gray-500" />
                <span className="text-gray-700">{user.phoneNumber}</span>
              </div>
            )}
            {user.businessName && (
              <div className="flex items-center gap-2">
                <Briefcase className="size-4 text-gray-500" />
                <span className="text-gray-700">{user.businessName}</span>
              </div>
            )}
            {user.businessAddress && (
              <div className="flex items-center gap-2">
                <MapPinned className="size-4 text-gray-500" />
                <span className="text-gray-700">{user.businessAddress}</span>
              </div>
            )}
          </div>
        </div>
      )
    } else if (user.role === "admin") {
      return (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-red-100 text-red-700 p-3 rounded-full">
              <Settings className="size-6" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
        </div>
      )
    }
  }

  return (
    <header>
      <nav
        className="flex items-center justify-between p-6 lg:px-8 fixed w-full top-0 left-0 right-0 z-10 bg-white shadow-sm"
        aria-label="Global"
      >
        <div className="flex items-center lg:flex-1">
          <Link href="/home" className="-m-1.5 p-1.5 flex items-center">
            <Image src={logoImage || "/placeholder.svg"} height={32} width={32} className="mr-2" alt="CUG Logo" />
            <span className="font-bold text-xl text-indigo-700">CUHMA</span>
          </Link>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Menu className="size-6" />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          <Link href="/home" className="text-sm/6 font-semibold text-gray-900 flex items-center gap-1">
            <Home className="size-4" />
            Home
          </Link>

          <div className="relative" ref={hostelsMenuRef}>
            <button
              type="button"
              className="cursor-pointer flex items-center gap-x-1 text-sm/6 font-semibold text-gray-900"
              aria-expanded={hostelsMenuOpen}
              onClick={() => setHostelsMenuOpen(!hostelsMenuOpen)}
            >
              <Building className="size-4" />
              Hostels
            </button>
          </div>

          <Link href="/about" className="text-sm/6 font-semibold text-gray-900 flex items-center gap-1">
            <Info className="size-4" />
            About
          </Link>

          <Link href="/contact" className="text-sm/6 font-semibold text-gray-900 flex items-center gap-1">
            <Contact className="size-4" />
            Contact
          </Link>
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-6">
          {loading ? (
            <div className="text-sm/6 text-gray-500">Loading...</div>
          ) : isLoggedIn ? (
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                className="cursor-pointer flex items-center gap-x-1 text-sm/6 font-semibold text-gray-900"
                aria-expanded={profileMenuOpen}
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              >
                {user.role === "hostel-owner" ? (
                  <Building className="size-4" />
                ) : user.role === "admin" ? (
                  <Settings className="size-4" />
                ) : (
                  <User className="size-4" />
                )}
                {user.name || "User"}
                <ChevronDown className="size-5 flex-none text-gray-400" />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 z-10 mt-3 w-80 overflow-hidden rounded-3xl bg-white ring-1 shadow-lg ring-gray-900/5">
                  <div className="p-4">
                    {renderProfileContent()}

                    <div className="border-t pt-3 space-y-2">
                      {user.role === "student" && (
                        <Link
                          href="/students/profile"
                          className="flex items-center gap-2 text-sm/6 font-semibold text-gray-600 hover:text-gray-900 w-full py-2 cursor-pointer"
                        >
                          <Settings className="size-4" />
                          Edit Profile
                        </Link>
                      )}
                      {user.role === "hostel-owner" && (
                        <Link
                          href="/hostel-owners-dashboard"
                          className="flex items-center gap-2 text-sm/6 font-semibold text-gray-600 hover:text-gray-900 w-full py-2 cursor-pointer"
                        >
                          <Settings className="size-4" />
                          Manage Hostels
                        </Link>
                      )}
                      {user.role === "admin" && (
                        <Link
                          href="/admin/dashboard"
                          className="flex items-center gap-2 text-sm/6 font-semibold text-gray-600 hover:text-gray-900 w-full py-2 cursor-pointer"
                        >
                          <Settings className="size-4" />
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-sm/6 font-semibold text-red-600 hover:text-red-700 w-full py-2 cursor-pointer"
                      >
                        <LogOut className="size-4" />
                        Log Out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="relative" ref={authMenuRef}>
              <button
                type="button"
                className="text-sm/6 font-semibold flex items-center cursor-pointer gap-1 bg-indigo-500 text-white px-3 py-2 rounded-md"
                onClick={() => setAuthMenuOpen(!authMenuOpen)}
              >
                <LogIn className="size-4" />
                Log in
                <ChevronDown className="size-4 flex-none" />
              </button>

              {authMenuOpen && (
                <div className="absolute right-0 z-10 mt-3 w-60 overflow-hidden rounded-xl bg-white ring-1 shadow-lg ring-gray-900/5">
                  <div className="p-2">
                    <Link
                      href="/auth"
                      className="flex items-center gap-2 text-sm/6 font-semibold text-gray-700 hover:bg-gray-100 w-full p-2 rounded-md"
                    >
                      <GraduationCap className="size-4" />
                      Student Login
                    </Link>
                    <Link
                      href="/auth"
                      className="flex items-center gap-2 text-sm/6 font-semibold text-gray-700 hover:bg-gray-100 w-full p-2 rounded-md"
                    >
                      <Building className="size-4" />
                      Hostel Owner Login
                    </Link>
                    <Link
                      href="/auth"
                      className="flex items-center gap-2 text-sm/6 font-semibold text-gray-700 hover:bg-gray-100 w-full p-2 rounded-md"
                    >
                      <Settings className="size-4" />
                      Admin Login
                    </Link>
                    <div className="border-t my-1"></div>
                    <Link
                      href="/auth"
                      className="flex items-center gap-2 text-sm/6 font-semibold text-indigo-600 hover:bg-gray-100 w-full p-2 rounded-md"
                    >
                      <User className="size-4" />
                      Register
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="lg:hidden" role="dialog" aria-modal="true">
          <div className="fixed inset-0 z-10"></div>
          <div className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <Link href="/" className="-m-1.5 p-1.5 flex items-center">
                <span className="sr-only">CUG Hostel Booking</span>
                <Image
                  src={logoImage || "/placeholder.svg"}
                  height={32}
                  width={32}
                  className="mr-2 rounded-full"
                  alt="CUG Logo"
                />
                <span className="font-bold text-indigo-700">CUG Hostels</span>
              </Link>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <X className="size-6" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                {!loading && isLoggedIn && renderMobileProfileContent()}

                <div className="space-y-2 py-6">
                  <Link
                    href="/"
                    className="-mx-3 flex items-center rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                  >
                    <Home className="mr-2 size-5" />
                    Home
                  </Link>

                  <div className="-mx-3">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between rounded-lg py-2 pr-3.5 pl-3 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                      aria-controls="disclosure-1"
                      aria-expanded={hostelsMenuOpen}
                      onClick={() => setHostelsMenuOpen(!hostelsMenuOpen)}
                    >
                      <div className="flex items-center">
                        <Building className="mr-2 size-5" />
                        Hostels
                      </div>
                      <ChevronDown className="size-5 flex-none" />
                    </button>
                  </div>

                  <Link
                    href="/bookings"
                    className="-mx-3 flex items-center rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                  >
                    <Calendar className="mr-2 size-5" />
                    Bookings
                  </Link>

                  <Link
                    href="/about"
                    className="-mx-3 flex items-center rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                  >
                    <Info className="mr-2 size-5" />
                    About
                  </Link>

                  <Link
                    href="/contact"
                    className="-mx-3 flex items-center rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                  >
                    <Contact className="mr-2 size-5" />
                    Contact
                  </Link>
                </div>
                <div className="py-6 space-y-2">
                  {loading ? (
                    <div className="text-sm text-gray-500 p-3">Loading...</div>
                  ) : isLoggedIn ? (
                    <>
                      {user.role === "student" && (
                        <Link
                          href="/students/profile"
                          className="-mx-3 flex items-center rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                        >
                          <Settings className="mr-2 size-5" />
                          Edit Profile
                        </Link>
                      )}
                      {user.role === "hostel-owner" && (
                        <Link
                          href="/hostel-owners/dashboard"
                          className="-mx-3 flex items-center rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                        >
                          <Settings className="mr-2 size-5" />
                          Manage Hostels
                        </Link>
                      )}
                      {user.role === "admin" && (
                        <Link
                          href="/admin/dashboard"
                          className="-mx-3 flex items-center rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                        >
                          <Settings className="mr-2 size-5" />
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="-mx-3 flex w-full items-center rounded-lg px-3 py-2.5 text-base/7 font-semibold text-red-600 hover:bg-gray-50"
                      >
                        <LogOut className="mr-2 size-5" />
                        Log out
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="border-b pb-2 mb-2">
                        <p className="text-sm font-medium text-gray-500 mb-2">Login as:</p>
                        <Link
                          href="/auth"
                          className="-mx-3 flex items-center rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                        >
                          <GraduationCap className="mr-2 size-5" />
                          Student
                        </Link>
                        <Link
                          href="/auth"
                          className="-mx-3 flex items-center rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                        >
                          <Building className="mr-2 size-5" />
                          Hostel Owner
                        </Link>
                        <Link
                          href="/auth"
                          className="-mx-3 flex items-center rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                        >
                          <Settings className="mr-2 size-5" />
                          Admin
                        </Link>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-2">Register as:</p>
                        <Link
                          href="/auth"
                          className="-mx-3 flex items-center rounded-lg px-3 py-2 text-base/7 font-semibold text-indigo-600 hover:bg-gray-50"
                        >
                          <User className="mr-2 size-5" />
                          Student
                        </Link>
                        <Link
                          href="/auth"
                          className="-mx-3 flex items-center rounded-lg px-3 py-2 text-base/7 font-semibold text-indigo-600 hover:bg-gray-50"
                        >
                          <Building className="mr-2 size-5" />
                          Hostel Owner
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
