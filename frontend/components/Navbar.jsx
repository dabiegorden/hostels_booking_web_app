"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Settings,
  LogOut,
  GraduationCap,
  Phone,
  Mail,
  BookOpen,
  School,
  Clock,
} from "lucide-react";
import logoImage from "@/public/assets/cug-logo.jpg";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hostelsMenuOpen, setHostelsMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const profileMenuRef = useRef(null);
  const hostelsMenuRef = useRef(null);
  const router = useRouter();

  // Check if student is logged in
  const isLoggedIn = !!student;

  // Fetch current user on component mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/auth/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Important for sending cookies
        });

        if (response.ok) {
          const data = await response.json();
          if (data.user && data.user.role === "student") {
            // Fetch complete student profile if we only have basic session info
            const profileResponse = await fetch(
              "http://localhost:5000/api/students/profile",
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                },
                credentials: "include",
              }
            );

            if (profileResponse.ok) {
              const profileData = await profileResponse.json();
              setStudent(profileData.student);
            } else {
              // If profile fetch fails, use basic session data
              setStudent(data.user);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching current user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  // Handle click outside to close menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close profile menu when clicking outside
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setProfileMenuOpen(false);
      }

      // Close hostels menu when clicking outside
      if (
        hostelsMenuRef.current &&
        !hostelsMenuRef.current.contains(event.target)
      ) {
        setHostelsMenuOpen(false);
      }
    };

    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Clean up
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Implement logout functionality
  const handleLogout = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        // Clear the student state
        setStudent(null);
        // Close any open menus
        setProfileMenuOpen(false);
        setMobileMenuOpen(false);
        // Redirect to home page
        router.push("/students/signin");
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <header>
      <nav
        className="flex items-center justify-between p-6 lg:px-8 fixed w-full top-0 left-0 right-0 z-10 bg-white shadow-sm"
        aria-label="Global"
      >
        <div className="flex items-center lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5 flex items-center">
            <Image
              src={logoImage}
              height={32}
              width={32}
              className="mr-2"
              alt="CUG Logo"
            />
            <span className="font-bold text-xl text-indigo-700">
              CUG Hostels booking
            </span>
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
          <Link
            href="/"
            className="text-sm/6 font-semibold text-gray-900 flex items-center gap-1"
          >
            <Home className="size-4" />
            Home
          </Link>

          <div className="relative" ref={hostelsMenuRef}>
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
                      <Link
                        href="/hostels"
                        className="block font-semibold text-gray-900"
                      >
                        Browse All Hostels
                        <span className="absolute inset-0"></span>
                      </Link>
                      <p className="mt-1 text-gray-600">
                        View all available accommodations
                      </p>
                    </div>
                  </div>
                  <div className="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm/6 hover:bg-gray-50">
                    <div className="flex size-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                      <MapPin className="size-6 text-gray-600 group-hover:text-indigo-600" />
                    </div>
                    <div className="flex-auto">
                      <Link
                        href="/hostels/map"
                        className="block font-semibold text-gray-900"
                      >
                        Map View
                        <span className="absolute inset-0"></span>
                      </Link>
                      <p className="mt-1 text-gray-600">
                        Find hostels by location
                      </p>
                    </div>
                  </div>
                  <div className="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm/6 hover:bg-gray-50">
                    <div className="flex size-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                      <Settings className="size-6 text-gray-600 group-hover:text-indigo-600" />
                    </div>
                    <div className="flex-auto">
                      <Link
                        href="/hostels/compare"
                        className="block font-semibold text-gray-900"
                      >
                        Compare Hostels
                        <span className="absolute inset-0"></span>
                      </Link>
                      <p className="mt-1 text-gray-600">
                        Side-by-side comparison of options
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/bookings"
            className="text-sm/6 font-semibold text-gray-900 flex items-center gap-1"
          >
            <Calendar className="size-4" />
            Bookings
          </Link>

          <Link
            href="/about"
            className="text-sm/6 font-semibold text-gray-900 flex items-center gap-1"
          >
            <Info className="size-4" />
            About
          </Link>

          <Link
            href="/contact"
            className="text-sm/6 font-semibold text-gray-900 flex items-center gap-1"
          >
            <Contact className="size-4" />
            Contact
          </Link>
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-6">
          {loading ? (
            <div className="text-sm/6 text-gray-500">Loading...</div>
          ) : isLoggedIn ? (
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                className="cursor-pointer flex items-center gap-x-1 text-sm/6 font-semibold text-gray-900"
                aria-expanded={profileMenuOpen}
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              >
                <User className="size-4" />
                {student.name || "Student"}
                <ChevronDown className="size-5 flex-none text-gray-400" />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 z-10 mt-3 w-80 overflow-hidden rounded-3xl bg-white ring-1 shadow-lg ring-gray-900/5">
                  <div className="p-4">
                    <div className="border-b pb-3 mb-3">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-indigo-100 text-indigo-700 p-3 rounded-full">
                          <User className="size-6" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {student.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {student.role || "Student"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="size-4 text-gray-500" />
                        <span className="text-gray-700">{student.email}</span>
                      </div>
                      {student.studentId && (
                        <div className="flex items-center gap-2 text-sm">
                          <GraduationCap className="size-4 text-gray-500" />
                          <span className="text-gray-700">
                            {student.studentId}
                          </span>
                        </div>
                      )}
                      {student.phoneNumber && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="size-4 text-gray-500" />
                          <span className="text-gray-700">
                            {student.phoneNumber}
                          </span>
                        </div>
                      )}
                      {student.program && student.level && (
                        <div className="flex items-center gap-2 text-sm">
                          <BookOpen className="size-4 text-gray-500" />
                          <span className="text-gray-700">
                            {student.program} - Level {student.level}
                          </span>
                        </div>
                      )}
                      {student.department && (
                        <div className="flex items-center gap-2 text-sm">
                          <School className="size-4 text-gray-500" />
                          <span className="text-gray-700">
                            {student.department}
                          </span>
                        </div>
                      )}
                      {student.createdAt && (
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="size-4 text-gray-500" />
                          <span className="text-gray-700">
                            Joined: {formatDate(student.createdAt)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="border-t pt-3 space-y-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-sm/6 font-semibold text-red-600 hover:text-red-700 w-full py-2 cursor-pointer"
                      >
                        <LogOut className="size-4" />
                        Log Out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/students/signin"
              className="text-sm/6 font-semibold flex items-center cursor-pointer gap-1 bg-indigo-500 text-white px-3 py-2 rounded-md"
            >
              <LogIn className="size-4" />
              Log in
            </Link>
          )}
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="lg:hidden" role="dialog" aria-modal="true">
          <div className="fixed inset-0 z-10"></div>
          <div className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <Link href="/" className="-m-1.5 p-1.5 flex items-center">
                <span className="sr-only">CUG Hostel Booking</span>
                <Image
                  src={logoImage}
                  height={32}
                  width={32}
                  className="mr-2"
                  alt="CUG Logo"
                />
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
                {!loading && isLoggedIn && (
                  <div className="py-6">
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-indigo-100 text-indigo-700 p-3 rounded-full">
                          <User className="size-6" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {student.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {student.email}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        {student.studentId && (
                          <div className="flex items-center gap-2">
                            <GraduationCap className="size-4 text-gray-500" />
                            <span className="text-gray-700">
                              {student.studentId}
                            </span>
                          </div>
                        )}
                        {student.phoneNumber && (
                          <div className="flex items-center gap-2">
                            <Phone className="size-4 text-gray-500" />
                            <span className="text-gray-700">
                              {student.phoneNumber}
                            </span>
                          </div>
                        )}
                        {student.program && student.level && (
                          <div className="flex items-center gap-2">
                            <BookOpen className="size-4 text-gray-500" />
                            <span className="text-gray-700">
                              {student.program} - Level {student.level}
                            </span>
                          </div>
                        )}
                        {student.department && (
                          <div className="flex items-center gap-2">
                            <School className="size-4 text-gray-500" />
                            <span className="text-gray-700">
                              {student.department}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2 py-6">
                  <Link
                    href="/"
                    className="-mx-3 flex items-center rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                  >
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
                        <Link
                          href="/hostels"
                          className="block rounded-lg py-2 pr-3 pl-6 text-sm/7 font-semibold text-gray-900 hover:bg-gray-50"
                        >
                          Browse All Hostels
                        </Link>
                        <Link
                          href="/hostels/map"
                          className="block rounded-lg py-2 pr-3 pl-6 text-sm/7 font-semibold text-gray-900 hover:bg-gray-50"
                        >
                          Map View
                        </Link>
                        <Link
                          href="/hostels/compare"
                          className="block rounded-lg py-2 pr-3 pl-6 text-sm/7 font-semibold text-gray-900 hover:bg-gray-50"
                        >
                          Compare Hostels
                        </Link>
                      </div>
                    )}
                  </div>

                  <Link
                    href="/bookings"
                    className="-mx-3 flex items-center rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                  >
                    <Calendar className="mr-2 size-5" />
                    Bookings
                  </Link>

                  <Link
                    href="/about"
                    className="-mx-3 flex items-center rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                  >
                    <Info className="mr-2 size-5" />
                    About
                  </Link>

                  <Link
                    href="/contact"
                    className="-mx-3 flex items-center rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                  >
                    <Contact className="mr-2 size-5" />
                    Contact
                  </Link>
                </div>
                <div className="py-6 space-y-2">
                  {loading ? (
                    <div className="text-sm text-gray-500 p-3">Loading...</div>
                  ) : isLoggedIn ? (
                    <>
                      <Link
                        href="/students/profile"
                        className="-mx-3 flex items-center rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                      >
                        <Settings className="mr-2 size-5" />
                        Edit Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="-mx-3 flex w-full items-center rounded-lg px-3 py-2.5 text-base/7 font-semibold text-red-600 hover:bg-gray-50"
                      >
                        <LogOut className="mr-2 size-5" />
                        Log out
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/students/signin"
                      className="-mx-3 flex items-center rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                    >
                      <LogIn className="mr-2 size-5" />
                      Log in
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
