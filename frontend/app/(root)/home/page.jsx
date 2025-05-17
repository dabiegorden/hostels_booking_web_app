"use client";

import React, { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { MapPin, Search, Star, Calendar } from "lucide-react";


import hostelImage4 from "@/public/assets/hostel1.jpeg";
import hostelImage5 from "@/public/assets/hostel2.jpeg";
import hostelImage6 from "@/public/assets/hostel3.jpeg";


// Define styles for various elements
const slideStyle = {
  position: "relative",
  height: "600px",
  width: "100%",
};

const imageStyle = {
  objectFit: "cover",
  objectPosition: "center",
};

const overlayStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  padding: "0 20px",
  textAlign: "center",
};

// Carousel data with images, captions, descriptions and CTA text
const carouselData = [
  {
    image: hostelImage4,
    caption: "Find Your Perfect CUG Hostel",
    description:
      "Discover comfortable and affordable accommodations around Catholic University of Ghana, Fiapre",
    ctaText: "Search Hostels",
    ctaLink: "/hostels",
  },
  {
    image: hostelImage5,
    caption: "Student Friendly Accommodations",
    description:
      "Secure, convenient, and budget-friendly hostel options for CUG students",
    ctaText: "View Available Rooms",
    ctaLink: "/hostels",
  },
  {
    image: hostelImage6,
    caption: "Hostel Owners Welcome",
    description:
      "List your property and reach students from Catholic University of Ghana",
    ctaText: "Register Your Hostel",
    ctaLink: "/owner/register",
  },
];

const Homepage = () => {
  const controls = useAnimation();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    // Start the animation when component mounts
    controls.start({
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
        duration: 0.8,
        delay: 0.2,
      },
    });

    // Auto-slide carousel
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselData.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [controls]);

  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Hero Carousel */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={controls}
        className="relative"
      >
        <div className="relative h-[600px] w-full overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out h-full"
            style={{
              width: `${carouselData.length * 100}%`,
              transform: `translateX(-${
                currentSlide * (100 / carouselData.length)
              }%)`,
            }}
          >
            {carouselData.map((slide, index) => (
              <div
                key={index}
                className="relative h-full"
                style={{ width: `${100 / carouselData.length}%` }}
              >
                <div style={slideStyle}>
                  <Image
                    src={slide.image}
                    alt={slide.caption}
                    fill
                    style={imageStyle}
                    priority={index === 0}
                  />
                  <div style={overlayStyle}>
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 text-center leading-tight shadow-text">
                      {slide.caption}
                    </h2>
                    <p className="text-xl md:text-2xl text-white mb-8 max-w-2xl text-center shadow-text">
                      {slide.description}
                    </p>
                    <Link
                      href={slide.ctaLink}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-md text-lg transition-all duration-300 transform hover:scale-105"
                    >
                      {slide.ctaText}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Carousel Indicators */}
          <div className="absolute bottom-5 left-0 right-0 flex justify-center space-x-2">
            {carouselData.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full ${
                  currentSlide === index ? "bg-white" : "bg-white bg-opacity-50"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Featured Hostels */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-center mb-2">
              Featured Hostels
            </h2>
            <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
              Discover top-rated accommodations near Catholic University of
              Ghana
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Featured Hostel Card 1 */}
              <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  <Image
                    src={hostelImage5}
                    alt="Hostel Preview"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-white py-1 px-2 rounded-md text-sm font-medium flex items-center">
                    <Star className="text-yellow-400 mr-1" size={16} />
                    4.8
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900">
                      Sunrise Hostel
                    </h3>
                    <p className="text-indigo-600 font-bold">₵800/mo</p>
                  </div>
                  <p className="text-gray-500 text-sm mb-3 flex items-center">
                    <MapPin size={16} className="mr-1 text-gray-400" />
                    10 mins from campus
                  </p>
                  <p className="text-gray-700 mb-4">
                    Modern facilities with high-speed WiFi, 24/7 security, and
                    clean amenities.
                  </p>
                  <Link href="/hostels/sunrise-hostel">
                    <button className="w-full bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-medium py-2 px-4 rounded transition">
                      View Details
                    </button>
                  </Link>
                </div>
              </div>

              {/* Featured Hostel Card 2 */}
              <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  <Image
                    src={hostelImage6}
                    alt="Hostel Preview"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-white py-1 px-2 rounded-md text-sm font-medium flex items-center">
                    <Star className="text-yellow-400 mr-1" size={16} />
                    4.6
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900">
                      Campus View Lodge
                    </h3>
                    <p className="text-indigo-600 font-bold">₵950/mo</p>
                  </div>
                  <p className="text-gray-500 text-sm mb-3 flex items-center">
                    <MapPin size={16} className="mr-1 text-gray-400" />5 mins
                    from campus
                  </p>
                  <p className="text-gray-700 mb-4">
                    Spacious rooms with private bathrooms, study areas, and
                    shared kitchen.
                  </p>
                  <Link href="/hostels/campus-view-lodge">
                    <button className="w-full bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-medium py-2 px-4 rounded transition">
                      View Details
                    </button>
                  </Link>
                </div>
              </div>
              {/* Featured Hostel Card will be render here */}
            </div>

            <div className="text-center mt-10">
              <Link href="/hostels">
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-md transition">
                  View All Hostels
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-center mb-2">
              How It Works
            </h2>
            <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
              Book your perfect hostel in three simple steps
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="text-indigo-600" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">Search</h3>
                <p className="text-gray-600">
                  Find hostels that match your preferences in location, price,
                  and amenities.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="text-indigo-600" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">Book</h3>
                <p className="text-gray-600">
                  Reserve your room for the semester or specific time period
                  that suits your needs.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="text-indigo-600" size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">Move In</h3>
                <p className="text-gray-600">
                  Receive your booking confirmation and all details needed for a
                  smooth move-in.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-indigo-600">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to find your perfect CUG hostel?
            </h2>
            <p className="text-indigo-100 mb-8 text-lg">
              Join hundreds of students who have found their ideal accommodation
              through our platform.
            </p>
            <Link href="/">
              <button className="bg-white text-indigo-600 hover:bg-indigo-50 font-bold py-3 px-8 rounded-md text-lg transition mr-4">
                Sign Up Now
              </button>
            </Link>
            <Link href="/hostels">
              <button className="bg-transparent text-white border-2 border-white hover:bg-white hover:text-indigo-600 font-bold py-3 px-8 rounded-md text-lg transition">
                Browse Hostels
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Removed custom CSS for carousel animation since we're using inline styles now */}
      <style jsx global>{`
        .shadow-text {
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
        }
      `}</style>
    </main>
  );
};

export default Homepage;
