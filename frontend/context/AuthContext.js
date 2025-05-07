"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()


  useEffect(() => {
    // Check if user is logged in
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error("Auth check error:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password, role, rememberMe = false) => {
    try {
      let endpoint
      switch (role) {
        case "admin":
          endpoint = "/api/auth/admin/login"
          break
        case "student":
          endpoint = "/api/auth/login"
          break
        case "hostel-owner":
          endpoint = "/api/auth/hostel-owner/login"
          break
        default:
          throw new Error("Invalid role")
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, rememberMe }),
        credentials: "include",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Login failed")
      }

      const data = await response.json()
      setUser(data.user)

      toast({
        title: "Login Successful",
        description: "You have been logged in successfully.",
      })

      // Redirect based on role
      switch (data.user.role) {
        case "admin":
          router.push("/admin")
          break
        case "student":
          router.push("/students")
          break
        case "hostel-owner":
          router.push("/hostel-owner-login")
          break
        default:
          router.push("/")
      }

      return data
    } catch (error) {
      console.error("Login error:", error)
      toast({
        title: "Login Failed",
        description: error.message || "Failed to login. Please check your credentials.",
        variant: "destructive",
      })
      throw error
    }
  }

  const logout = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Logout failed")
      }

      setUser(null)

      toast({
        title: "Logout Successful",
        description: "You have been logged out successfully.",
      })

      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        title: "Logout Failed",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      })
    }
  }

  const value = {
    user,
    loading,
    login,
    logout,
    checkAuthStatus,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
