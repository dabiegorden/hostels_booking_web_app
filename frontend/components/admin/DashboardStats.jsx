import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Building, Home, BookOpen } from "lucide-react"

export default function DashboardStats({ stats }) {
  const statCards = [
    {
      title: "Total Students",
      value: stats?.students || 0,
      icon: Users,
      description: "Registered students",
      change: "+12.5%",
      changeType: "positive",
    },
    {
      title: "Hostel Owners",
      value: stats?.hostelOwners || 0,
      icon: Building,
      description: "Registered hostel owners",
      change: "+5.2%",
      changeType: "positive",
    },
    {
      title: "Hostels",
      value: stats?.hostels || 0,
      icon: Home,
      description: "Listed hostels",
      change: "+7.8%",
      changeType: "positive",
    },
    {
      title: "Bookings",
      value: stats?.bookings || 0,
      icon: BookOpen,
      description: "Total bookings",
      change: "+24.3%",
      changeType: "positive",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
            {stat.change && (
              <div className={`text-xs mt-1 ${stat.changeType === "positive" ? "text-green-500" : "text-red-500"}`}>
                {stat.change} from last month
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
