"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown, LogOut, Mail, Phone, Briefcase, Clock, MapPinned, Shield } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

const AdminNavbar = ({ isMobile }) => {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const profileMenuRef = useRef(null)
  const router = useRouter()

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
          if (data.user && data.user.role === "admin") {
            // Fetch complete admin profile
            const profileResponse = await fetch("http://localhost:5000/api/admin/info", {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
            })

            if (profileResponse.ok) {
              const profileData = await profileResponse.json()
              setUser(profileData.admin)
            } else {
              // If profile fetch fails, use basic session data
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

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false)
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
        // Redirect to login page
        router.push("/home")
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

  return (
    <nav className="w-full bg-gradient-to-b from-indigo-600 to-indigo-700 py-3 px-6 h-full flex items-center justify-end shadow">
      <div className="space-x-4">
        {loading ? (
          <div className="text-sm text-white">Loading...</div>
        ) : user ? (
          <div className="relative" ref={profileMenuRef}>
            <button
              type="button"
              className="flex items-center cursor-pointer text-sm gap-2 font-medium text-white hover:text-gray-100 focus:outline-none"
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            >
              <div className="bg-indigo-600 text-white p-2 rounded-full">
                <Shield className="size-5" />
              </div>
              <span>{user.name || "Admin"}</span>
              <ChevronDown
                className={`w-4 h-4 text-white ${profileMenuOpen ? "transform rotate-180" : ""} transition-transform duration-200`}
              />
            </button>

            {profileMenuOpen && (
              <div className="absolute right-0 z-10 mt-3 w-80 overflow-hidden rounded-lg bg-gradient-to-b from-indigo-800 to-indigo-900 ring-1 shadow-lg ring-indigo-900/50">
                <div className="p-4">
                  <div className="border-b border-indigo-700 pb-3 mb-3">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-indigo-600 text-white p-3 rounded-full">
                        <Shield className="size-6" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{user.name}</p>
                        <p className="text-sm text-indigo-200">Administrator</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="size-4 text-indigo-200" />
                      <span className="text-white">{user.email}</span>
                    </div>
                    {user.phoneNumber && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="size-4 text-indigo-200" />
                        <span className="text-white">{user.phoneNumber}</span>
                      </div>
                    )}
                    {user.department && (
                      <div className="flex items-center gap-2 text-sm">
                        <Briefcase className="size-4 text-indigo-200" />
                        <span className="text-white">{user.department}</span>
                      </div>
                    )}
                    {user.position && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPinned className="size-4 text-indigo-200" />
                        <span className="text-white">{user.position}</span>
                      </div>
                    )}
                    {user.createdAt && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="size-4 text-indigo-200" />
                        <span className="text-white">Joined: {formatDate(user.createdAt)}</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-indigo-700 pt-3 space-y-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 text-sm font-semibold text-white hover:text-red-200 w-full py-2 cursor-pointer"
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
          <Link href="/admin/signin" className="text-sm font-medium text-white hover:text-indigo-200">
            Sign in
          </Link>
        )}
      </div>
    </nav>
  )
}

export default AdminNavbar
