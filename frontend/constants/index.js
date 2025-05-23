import Navbar from "@/components/Navbar";
import HostelOwnersNavbar from "@/components/HostelOwnersNavbar";
import HostelOwnersSidebar from "@/components/HostelOwnersSidebar";
import DashboardNave from "@/components/dashboard-nav";

export { Navbar, DashboardNave, HostelOwnersNavbar, HostelOwnersSidebar };

//AuthForm
import AuthForm from "@/components/AuthForm";
export { AuthForm };


import {
  LayoutDashboard,
  Building,
  Users,
  CalendarCheck,
  CreditCard,
  Star,
  Settings,
} from "lucide-react";


// Sidebar links for the admin dashboard
export const AdminSidebarLinks = [
  {
    id: 1,
    title: "Dashboard",
    url: "/admin-dashboard",
    icon: LayoutDashboard,
  },
  {
    id: 2,
    title: "Hostels",
    url: "/admin-dashboard/hostels",
    icon: Building,
  },
  {
    id: 3,
    title: "Students",
    url: "/admin-dashboard/students",
    icon: Users,
  },
  {
    id: 4,
    title: "Hostel Owners",
    url: "/admin-dashboard/hostel-owners",
    icon: Users,
  },
  {
    id: 5,
    title: "Bookings",
    url: "/admin-dashboard/bookings",
    icon: CalendarCheck,
  },
  {
    id: 6,
    title: "Payments",
    url: "/admin-dashboard/payments",
    icon: CreditCard,
  },
  {
    id: 7,
    title: "System Settings",
    url: "/admin-dashboard/settings",
    icon: Settings,
  },
];


// Sidebar links for the hostel owners dashboard
export const hostelOwnersDashboard = [
  {
    id: 1,
    title: "Dashboard",
    url: "/hostel-owners-dashboard",
    icon: LayoutDashboard,
  },
  {
    id: 2,
    title: "Hostels",
    url: "/hostel-owners-dashboard/hostels",
    icon: Building,
  },
  {
    id: 3,
    title: "Rooms",
    url: "/hostel-owners-dashboard/rooms",
    icon: Building,
  },
  {
    id: 4,
    title: "Bookings",
    url: "/hostel-owners-dashboard/bookings",
    icon: CalendarCheck,
  },
  {
    id: 5,
    title: "Payments",
    url: "/hostel-owners-dashboard/payments",
    icon: CreditCard,
  },
  {
    id: 6,
    title: "Reviews",
    url: "/hostel-owners-dashboard/reviews",
    icon: Star,
  },
  {
    id: 7,
    title: "Settings",
    url: "/hostel-owners-dashboard/settings",
    icon: Settings,
  },
];
