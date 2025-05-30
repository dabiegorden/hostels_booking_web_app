"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  User,
  Building,
  Settings,
  Mail,
  Lock,
  Phone,
  BookOpen,
  School,
  Briefcase,
  MapPin,
  ChevronDown,
  LogIn,
} from "lucide-react"

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [userRole, setUserRole] = useState("student")
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  // Form data state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    studentId: "",
    phoneNumber: "",
    program: "",
    level: "",
    department: "",
    businessName: "",
    businessAddress: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRoleSelect = (role) => {
    setUserRole(role)
    setIsRoleMenuOpen(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      let endpoint = ""
      let payload = {}

      // Determine endpoint and payload based on action and role
      if (isLogin) {
        // Login endpoints
        if (userRole === "student") {
          endpoint = "http://localhost:5000/api/auth/login"
          payload = {
            email: formData.email,
            password: formData.password,
            rememberMe,
          }
        } else if (userRole === "hostel-owner") {
          endpoint = "http://localhost:5000/api/auth/hostel-owner/login"
          payload = {
            email: formData.email,
            password: formData.password,
            rememberMe,
          }
        } else if (userRole === "admin") {
          endpoint = "http://localhost:5000/api/auth/admin/login"
          payload = {
            email: formData.email,
            password: formData.password,
          }
        }
      } else {
        // Registration endpoints
        if (userRole === "student") {
          endpoint = "http://localhost:5000/api/auth/signup"
          payload = {
            name: formData.name,
            email: formData.email,
            studentId: formData.studentId,
            phoneNumber: formData.phoneNumber,
            program: formData.program,
            level: formData.level,
            department: formData.department,
            password: formData.password,
            role: "student",
          }
        } else if (userRole === "hostel-owner") {
          endpoint = "http://localhost:5000/api/auth/hostel-owner/signup"
          payload = {
            name: formData.name,
            email: formData.email,
            phoneNumber: formData.phoneNumber,
            businessName: formData.businessName,
            businessAddress: formData.businessAddress,
            password: formData.password,
            role: "hostel-owner",
          }
        }
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important for cookies
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong")
      }

      if (isLogin) {
        // Redirect based on role after successful login
        if (userRole === "student") {
          router.push("/home")
        } else if (userRole === "hostel-owner") {
          router.push("/home")
        } else if (userRole === "admin") {
          router.push("/home")
        }
      } else {
        // Show success message after registration
        setSuccess("Registration successful! You can now log in.")
        setIsLogin(true)
        // Reset form
        setFormData({
          name: "",
          email: "",
          password: "",
          studentId: "",
          phoneNumber: "",
          program: "",
          level: "",
          department: "",
          businessName: "",
          businessAddress: "",
        })
      }
    } catch (error) {
      setError(error.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  // Role icon mapping
  const roleIcons = {
    student: <User className="size-5" />,
    "hostel-owner": <Building className="size-5" />,
    admin: <Settings className="size-5" />,
  }

  // Role display names
  const roleNames = {
    student: "Student",
    "hostel-owner": "Hostel Owner",
    admin: "Administrator",
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {isLogin ? "Sign in to your account" : "Create a new account"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLogin ? "Enter your credentials to access your account" : "Fill in your details to register"}
          </p>
        </div>

        {/* Error and Success Messages */}
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{error}</div>}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">{success}</div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Role Selector */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">I am a</label>
            <div className="relative">
              <button
                type="button"
                className="flex items-center justify-between w-full px-4 py-2 text-left border border-gray-300 rounded-md shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
              >
                <div className="flex items-center">
                  {roleIcons[userRole]}
                  <span className="ml-2">{roleNames[userRole]}</span>
                </div>
                <ChevronDown className="size-5 text-gray-400" />
              </button>

              {isRoleMenuOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <button
                      type="button"
                      className={`flex items-center w-full px-4 py-2 text-sm ${
                        userRole === "student" ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-100"
                      }`}
                      onClick={() => handleRoleSelect("student")}
                    >
                      <User className="size-5 mr-2" />
                      Student
                    </button>
                    <button
                      type="button"
                      className={`flex items-center w-full px-4 py-2 text-sm ${
                        userRole === "hostel-owner" ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-100"
                      }`}
                      onClick={() => handleRoleSelect("hostel-owner")}
                    >
                      <Building className="size-5 mr-2" />
                      Hostel Owner
                    </button>
                    {isLogin && (
                      <button
                        type="button"
                        className={`flex items-center w-full px-4 py-2 text-sm ${
                          userRole === "admin" ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-100"
                        }`}
                        onClick={() => handleRoleSelect("admin")}
                      >
                        <Settings className="size-5 mr-2" />
                        Administrator
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {/* Common Fields */}
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="size-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="pl-10 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="size-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="size-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Student-specific fields */}
            {!isLogin && userRole === "student" && (
              <>
                <div>
                  <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">
                    Student ID
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="size-5 text-gray-400" />
                    </div>
                    <input
                      id="studentId"
                      name="studentId"
                      type="text"
                      required
                      value={formData.studentId}
                      onChange={handleChange}
                      className="pl-10 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="10XXXXXXXX"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="size-5 text-gray-400" />
                    </div>
                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      required
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="pl-10 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="+233 XX XXX XXXX"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="program" className="block text-sm font-medium text-gray-700">
                    Program
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <BookOpen className="size-5 text-gray-400" />
                    </div>
                    <input
                      id="program"
                      name="program"
                      type="text"
                      required
                      value={formData.program}
                      onChange={handleChange}
                      className="pl-10 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="BSc. Computer Science"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="level" className="block text-sm font-medium text-gray-700">
                      Level
                    </label>
                    <select
                      id="level"
                      name="level"
                      required
                      value={formData.level}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Select Level</option>
                      <option value="100">100</option>
                      <option value="200">200</option>
                      <option value="300">300</option>
                      <option value="400">400</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                      Department
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <School className="size-5 text-gray-400" />
                      </div>
                      <input
                        id="department"
                        name="department"
                        type="text"
                        required
                        value={formData.department}
                        onChange={handleChange}
                        className="pl-10 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Computing"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Hostel Owner-specific fields */}
            {!isLogin && userRole === "hostel-owner" && (
              <>
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="size-5 text-gray-400" />
                    </div>
                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      required
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="pl-10 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="+233 XX XXX XXXX"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
                    Business Name
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Briefcase className="size-5 text-gray-400" />
                    </div>
                    <input
                      id="businessName"
                      name="businessName"
                      type="text"
                      required
                      value={formData.businessName}
                      onChange={handleChange}
                      className="pl-10 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Comfort Hostels Ltd."
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="businessAddress" className="block text-sm font-medium text-gray-700">
                    Business Address
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="size-5 text-gray-400" />
                    </div>
                    <input
                      id="businessAddress"
                      name="businessAddress"
                      type="text"
                      required
                      value={formData.businessAddress}
                      onChange={handleChange}
                      className="pl-10 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="123 Main St, Cape Coast"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Remember me checkbox for login */}
            {isLogin && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                    Forgot your password?
                  </a>
                </div>
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <LogIn className="size-5 text-indigo-500 group-hover:text-indigo-400" />
              </span>
              {loading ? "Processing..." : isLogin ? "Sign in" : "Register"}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin)
                setError("")
                setSuccess("")
                // Reset form when switching between login and register
                setFormData({
                  name: "",
                  email: "",
                  password: "",
                  studentId: "",
                  phoneNumber: "",
                  program: "",
                  level: "",
                  department: "",
                  businessName: "",
                  businessAddress: "",
                })
                // If switching to login and current role is admin, change to student
                if (!isLogin && userRole === "admin") {
                  setUserRole("student")
                }
              }}
              className="ml-1 font-medium text-indigo-600 hover:text-indigo-500"
            >
              {isLogin ? "Register here" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
