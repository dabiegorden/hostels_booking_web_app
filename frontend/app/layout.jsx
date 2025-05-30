import "./globals.css"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "CUHMA",
  description: "Find the perfect hostel near Catholic University of Ghana",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">{children}</div>
      </body>
    </html>
  )
}
