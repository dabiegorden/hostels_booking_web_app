"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { LayoutDashboard, Users, Building, Home, Settings, Menu, LogOut, BookOpen, BarChart } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

export default function AdminSidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { logout } = useAuth()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Initial check
    checkScreenSize()

    // Add event listener
    window.addEventListener("resize", checkScreenSize)

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  const handleLogout = async () => {
    await logout()
  }

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/admin-dashboard",
      active: pathname === "/admin",
    },
    {
      label: "Students",
      icon: Users,
      href: "/admin-dashboard/students",
      active: pathname.includes("/admin-dashboard/students"),
    },
    {
      label: "Hostel Owners",
      icon: Building,
      href: "/admin-dashboard/hostel-owners",
      active: pathname.includes("/admin-dashboard/hostel-owners"),
    },
    {
      label: "Hostels",
      icon: Home,
      href: "/admin-dashboard/hostels",
      active: pathname.includes("/admin-dashboard/hostels"),
    },
    {
      label: "Bookings",
      icon: BookOpen,
      href: "/admin-dashboard/bookings",
      active: pathname.includes("/admin-dashboard/bookings"),
    },
    {
      label: "Reviews",
      icon: BarChart,
      href: "/admin-dashboard/reviews",
      active: pathname.includes("/admin-dashboard/reviews"),
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/admin-dashboard/settings",
      active: pathname.includes("/admin-dashboard/settings"),
    },
  ]

  const SidebarContent = () => (
    <div className="h-full flex flex-col border-r bg-background">
      <div className="p-6">
        <h2 className="text-lg font-semibold tracking-tight">Admin Panel</h2>
      </div>
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1 py-2">
          {routes.map((route) => (
            <Link key={route.href} href={route.href} onClick={() => setOpen(false)}>
              <Button
                variant={route.active ? "secondary" : "ghost"}
                className={cn("w-full justify-start gap-2", {
                  "bg-secondary": route.active,
                })}
              >
                <route.icon className="h-5 w-5" />
                {route.label}
              </Button>
            </Link>
          ))}
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  )

  // Mobile sidebar with sheet component
  if (isMobile) {
    return (
      <>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden fixed top-4 left-4 z-40">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </>
    )
  }

  // Desktop sidebar
  return (
    <div className="hidden md:block w-64 h-screen sticky top-0">
      <SidebarContent />
    </div>
  )
}
