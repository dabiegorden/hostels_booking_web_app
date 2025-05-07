import { Inter } from "next/font/google"
import AdminSidebar from "@/components/admin/AdminSidebar"
import AdminHeader from "@/components/admin/AdminHeader"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Admin Dashboard - Hostel Booking System",
  description: "Admin dashboard for managing the hostel booking system",
}

export default function AdminLayout({ children }) {
  return (
    <div className={`${inter.className} min-h-screen bg-slate-50 flex`}>
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
      <Toaster />
    </div>
  )
}
