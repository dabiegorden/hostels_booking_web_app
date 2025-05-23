"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
  Building,
  Users,
  User,
  CreditCard,
  BookOpen,
  Settings,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  TrendingUp,
  Activity,
  Calendar,
  Eye,
} from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    students: 0,
    hostelOwners: 0,
    hostels: 0,
    bookings: {
      total: 0,
      pending: 0,
      confirmed: 0,
    },
    payments: {
      total: 0,
      amount: 0,
    },
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true)
        const response = await fetch("http://localhost:5000/api/admin/dashboard/stats", {
          credentials: "include",
        })

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard stats")
        }

        const data = await response.json()

        // Fetch booking stats
        const bookingResponse = await fetch("http://localhost:5000/api/admin/bookings", {
          credentials: "include",
        })

        const bookingData = await bookingResponse.json()
        const bookings = bookingData.bookings || []

        // Fetch payment stats
        const paymentResponse = await fetch("http://localhost:5000/api/admin/payments/stats", {
          credentials: "include",
        })

        const paymentData = await paymentResponse.json()

        setStats({
          ...data.stats,
          bookings: {
            total: bookings.length,
            pending: bookings.filter((b) => b.bookingStatus === "pending").length,
            confirmed: bookings.filter((b) => b.bookingStatus === "confirmed").length,
          },
          payments: {
            total: paymentData?.stats?.totalPayments || 0,
            amount: paymentData?.stats?.totalValue || 0,
          },
        })
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
        toast.error("Failed to load dashboard statistics")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardStats()
  }, [])

  const statCards = [
    {
      title: "Total Students",
      value: stats.students,
      icon: <Users className="h-7 w-7" />,
      change: "+12%",
      trend: "up",
      link: "/admin-dashboard/students",
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100",
      iconBg: "bg-gradient-to-br from-blue-500 to-blue-600",
    },
    {
      title: "Hostel Owners",
      value: stats.hostelOwners,
      icon: <User className="h-7 w-7" />,
      change: "+5%",
      trend: "up",
      link: "/admin-dashboard/hostel-owners",
      gradient: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-50 to-purple-100",
      iconBg: "bg-gradient-to-br from-purple-500 to-purple-600",
    },
    {
      title: "Total Hostels",
      value: stats.hostels,
      icon: <Building className="h-7 w-7" />,
      change: "+8%",
      trend: "up",
      link: "/admin-dashboard/hostels",
      gradient: "from-green-500 to-green-600",
      bgGradient: "from-green-50 to-green-100",
      iconBg: "bg-gradient-to-br from-green-500 to-green-600",
    },
    {
      title: "Active Bookings",
      value: stats.bookings.confirmed,
      icon: <BookOpen className="h-7 w-7" />,
      change: "+15%",
      trend: "up",
      link: "/admin-dashboard/bookings",
      gradient: "from-amber-500 to-amber-600",
      bgGradient: "from-amber-50 to-amber-100",
      iconBg: "bg-gradient-to-br from-amber-500 to-amber-600",
    },
    {
      title: "Total Revenue",
      value: `GH₵ ${stats.payments.amount.toLocaleString()}`,
      icon: <DollarSign className="h-7 w-7" />,
      change: "+20%",
      trend: "up",
      link: "/admin-dashboard/payments",
      gradient: "from-emerald-500 to-emerald-600",
      bgGradient: "from-emerald-50 to-emerald-100",
      iconBg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
    },
    {
      title: "Pending Bookings",
      value: stats.bookings.pending,
      icon: <CreditCard className="h-7 w-7" />,
      change: "-3%",
      trend: "down",
      link: "/admin-dashboard/bookings",
      gradient: "from-red-500 to-red-600",
      bgGradient: "from-red-50 to-red-100",
      iconBg: "bg-gradient-to-br from-red-500 to-red-600",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-3 rounded-2xl shadow-lg">
            <Activity className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin-dashboard/settings"
            className="flex items-center gap-2 px-6 py-3 bg-white/70 backdrop-blur-sm rounded-xl hover:bg-white/90 transition-all duration-200 shadow-lg hover:shadow-xl border border-white/50"
          >
            <Settings className="h-5 w-5 text-gray-700" />
            <span className="font-medium text-gray-700">Settings</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 animate-pulse border border-white/50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="h-4 w-24 bg-gray-200 rounded-lg mb-3"></div>
                  <div className="h-8 w-20 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 w-32 bg-gray-200 rounded-lg"></div>
                </div>
                <div className="h-14 w-14 bg-gray-200 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((card, index) => (
            <Link
              href={card.link}
              key={index}
              className="group bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-white/50 hover:scale-105 hover:bg-white/80"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-gray-600 font-medium text-sm uppercase tracking-wide">{card.title}</p>
                  <h3 className="text-3xl font-bold mt-3 mb-4 text-gray-900 group-hover:text-gray-800 transition-colors">
                    {card.value}
                  </h3>
                  <div className="flex items-center">
                    {card.trend === "up" ? (
                      <div className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded-full">
                        <ArrowUpRight className="h-3 w-3 text-green-600" />
                        <span className="text-green-600 text-sm font-semibold">{card.change}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 px-2 py-1 bg-red-100 rounded-full">
                        <ArrowDownRight className="h-3 w-3 text-red-600" />
                        <span className="text-red-600 text-sm font-semibold">{card.change}</span>
                      </div>
                    )}
                    <span className="text-gray-500 text-sm ml-2">from last month</span>
                  </div>
                </div>
                <div className={`${card.iconBg} p-4 rounded-xl shadow-lg text-white group-hover:scale-110 transition-transform duration-200`}>
                  {card.icon}
                </div>
              </div>
              
              {/* Decorative gradient line */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient} rounded-b-2xl opacity-60 group-hover:opacity-100 transition-opacity`}></div>
            </Link>
          ))}
        </div>
      )}

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Bookings Card */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/50 hover:shadow-xl transition-shadow duration-300">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-2 rounded-lg">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Recent Bookings</h2>
            </div>
            <Link
              href="/admin-dashboard/bookings"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold group transition-colors"
            >
              <span>View all</span>
              <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          <div className="space-y-4">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-xl animate-pulse">
                  <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 w-24 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                </div>
              ))
            ) : stats.bookings.total === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No bookings found</p>
                <p className="text-sm">Bookings will appear here when available</p>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-2xl inline-block mb-4">
                  <Eye className="h-8 w-8 text-white" />
                </div>
                <Link 
                  href="/admin-dashboard/bookings" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                >
                  View all bookings
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Hostels Card */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/50 hover:shadow-xl transition-shadow duration-300">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-2 rounded-lg">
                <Building className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Recent Hostels</h2>
            </div>
            <Link
              href="/admin-dashboard/hostels"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold group transition-colors"
            >
              <span>View all</span>
              <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          <div className="space-y-4">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-xl animate-pulse">
                  <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 w-24 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                </div>
              ))
            ) : stats.hostels === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Building className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No hostels found</p>
                <p className="text-sm">Hostels will appear here when available</p>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-2xl inline-block mb-4">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <Link 
                  href="/admin-dashboard/hostels" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                >
                  View all hostels
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}