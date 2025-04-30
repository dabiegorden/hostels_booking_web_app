import Navbar from "@/components/Navbar";
import DashboardNave from "@/components/dashboard-nav";

export { Navbar, DashboardNave };

import {
  LayoutDashboard,
  Building,
  Users,
  CalendarCheck,
  CreditCard,
  Star,
  Settings,
  BarChart2,
} from "lucide-react";

// Sidebar links for the admin dashboard
export const sidebarLinks = [
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
    title: "Users",
    url: "/admin-dashboard/users",
    icon: Users,
  },
  {
    id: 4,
    title: "Bookings",
    url: "/admin-dashboard/bookings",
    icon: CalendarCheck,
  },
  {
    id: 5,
    title: "Payments",
    url: "/admin-dashboard/payments",
    icon: CreditCard,
  },
  {
    id: 6,
    title: "Reviews",
    url: "/admin-dashboard/reviews",
    icon: Star,
  },
  {
    id: 7,
    title: "System Settings",
    url: "/admin-dashboard/settings",
    icon: Settings,
  },
  {
    id: 8,
    title: "Reports",
    url: "/admin-dashboard/reports",
    icon: BarChart2,
  },
];
