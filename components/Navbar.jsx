"use client"

import React, { useState } from 'react'
import { 
  ChevronDown, 
  Menu, 
  X, 
  Home,
  Building,
  Calendar,
  MapPin,
  Info,
  Contact,
  User,
  LogIn,
  UserPlus,
  Settings
} from 'lucide-react'
import logoImage from "@/public/assets/cug-logo.jpg";
import Image from 'next/image';
import Link from 'next/link';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [hostelsMenuOpen, setHostelsMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5 flex items-center">
            {/* <span className="">CUG Hostel Booking</span> */}
            <Image src={logoImage} height={32} width={32} className="mr-2" alt="CUG Logo" />
            <span className="font-bold text-xl text-indigo-700">CUG Hostels booking</span>
          </Link>
        </div>
        <div className="flex lg:hidden">
          <button 
            type="button" 
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open main menu</span>
            <Menu className="size-6" />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          <Link href="/" className="text-sm/6 font-semibold text-gray-900 flex items-center gap-1">
            <Home className="size-4" />
            Home
          </Link>
          
          <div className="relative">
            <button 
              type="button" 
              className="cursor-pointer flex items-center gap-x-1 text-sm/6 font-semibold text-gray-900" 
              aria-expanded={hostelsMenuOpen}
              onClick={() => setHostelsMenuOpen(!hostelsMenuOpen)}
            >
              <Building className="size-4" />
              Hostels
              <ChevronDown className="size-5 flex-none text-gray-400" />
            </button>

            {hostelsMenuOpen && (
              <div className="absolute top-full -left-8 z-10 mt-3 w-screen max-w-md overflow-hidden rounded-3xl bg-white ring-1 shadow-lg ring-gray-900/5">
                <div className="p-4">
                  <div className="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm/6 hover:bg-gray-50">
                    <div className="flex size-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                      <Building className="size-6 text-gray-600 group-hover:text-indigo-600" />
                    </div>
                    <div className="flex-auto">
                      <Link href="/hostels" className="block font-semibold text-gray-900">
                        Browse All Hostels
                        <span className="absolute inset-0"></span>
                      </Link>
                      <p className="mt-1 text-gray-600">View all available accommodations</p>
                    </div>
                  </div>
                  <div className="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm/6 hover:bg-gray-50">
                    <div className="flex size-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                      <MapPin className="size-6 text-gray-600 group-hover:text-indigo-600" />
                    </div>
                    <div className="flex-auto">
                      <Link href="/hostels/map" className="block font-semibold text-gray-900">
                        Map View
                        <span className="absolute inset-0"></span>
                      </Link>
                      <p className="mt-1 text-gray-600">Find hostels by location</p>
                    </div>
                  </div>
                  <div className="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm/6 hover:bg-gray-50">
                    <div className="flex size-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                      <Settings className="size-6 text-gray-600 group-hover:text-indigo-600" />
                    </div>
                    <div className="flex-auto">
                      <Link href="/hostels/compare" className="block font-semibold text-gray-900">
                        Compare Hostels
                        <span className="absolute inset-0"></span>
                      </Link>
                      <p className="mt-1 text-gray-600">Side-by-side comparison of options</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link href="/bookings" className="text-sm/6 font-semibold text-gray-900 flex items-center gap-1">
            <Calendar className="size-4" />
            Bookings
          </Link>
          
          <Link href="/about" className="text-sm/6 font-semibold text-gray-900 flex items-center gap-1">
            <Info className="size-4" />
            About
          </Link>
          
          <Link href="/contact" className="text-sm/6 font-semibold text-gray-900 flex items-center gap-1">
            <Contact className="size-4" />
            Contact
          </Link>
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-6">
          <Link href="/auth/login" className="text-sm/6 font-semibold text-gray-900 flex items-center cursor-pointer gap-1">
            <LogIn className="size-4" />
            Log in
          </Link>
          <Link href="/auth/signup" className="rounded-md bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 cursor-pointer flex items-center gap-1">
            <UserPlus className="size-4" />
            Sign up
          </Link>
        </div>
      </nav>
      
      {mobileMenuOpen && (
        <div className="lg:hidden" role="dialog" aria-modal="true">
          <div className="fixed inset-0 z-10"></div>
          <div className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <Link href="/" className="-m-1.5 p-1.5 flex items-center">
                <span className="sr-only">CUG Hostel Booking</span>
                <img className="h-8 w-auto mr-2" src="/logo.png" alt="CUG Logo" />
                <span className="font-bold text-indigo-700">CUG Hostels</span>
              </Link>
              <button 
                type="button" 
                className="-m-2.5 rounded-md p-2.5 text-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <X className="size-6" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  <Link href="/" className="-mx-3 flex items-center rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50">
                    <Home className="mr-2 size-5" />
                    Home
                  </Link>
                  
                  <div className="-mx-3">
                    <button 
                      type="button" 
                      className="flex w-full items-center justify-between rounded-lg py-2 pr-3.5 pl-3 text-base/7 font-semibold text-gray-900 hover:bg-gray-50" 
                      aria-controls="disclosure-1" 
                      aria-expanded={hostelsMenuOpen}
                      onClick={() => setHostelsMenuOpen(!hostelsMenuOpen)}
                    >
                      <div className="flex items-center">
                        <Building className="mr-2 size-5" />
                        Hostels
                      </div>
                      <ChevronDown className="size-5 flex-none" />
                    </button>
                    {hostelsMenuOpen && (
                      <div className="mt-2 space-y-2" id="disclosure-1">
                        <Link href="/hostels" className="block rounded-lg py-2 pr-3 pl-6 text-sm/7 font-semibold text-gray-900 hover:bg-gray-50">Browse All Hostels</Link>
                        <Link href="/hostels/map" className="block rounded-lg py-2 pr-3 pl-6 text-sm/7 font-semibold text-gray-900 hover:bg-gray-50">Map View</Link>
                        <Link href="/hostels/compare" className="block rounded-lg py-2 pr-3 pl-6 text-sm/7 font-semibold text-gray-900 hover:bg-gray-50">Compare Hostels</Link>
                      </div>
                    )}
                  </div>
                  
                  <Link href="/bookings" className="-mx-3 flex items-center rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50">
                    <Calendar className="mr-2 size-5" />
                    Bookings
                  </Link>
                  
                  <Link href="/about" className="-mx-3 flex items-center rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50">
                    <Info className="mr-2 size-5" />
                    About
                  </Link>
                  
                  <Link href="/contact" className="-mx-3 flex items-center rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50">
                    <Contact className="mr-2 size-5" />
                    Contact
                  </Link>
                </div>
                <div className="py-6 space-y-2">
                  <Link href="/auth/login" className="-mx-3 flex items-center rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50">
                    <LogIn className="mr-2 size-5" />
                    Log in
                  </Link>
                  <Link href="/auth/signup" className="-mx-3 flex items-center rounded-lg px-3 py-2.5 text-base/7 font-semibold bg-indigo-600 text-white hover:bg-indigo-500">
                    <UserPlus className="mr-2 size-5" />
                    Sign up
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar