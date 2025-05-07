"use client";

import Image from 'next/image';
import Link from 'next/link';



import { motion } from "framer-motion";

import hostel1 from '@/public/assets/hostel1_bg.jpeg';
import hostel2 from '@/public/assets/hostel1_bg.jpeg';
import hostel3 from '@/public/assets/hostel1_bg.jpeg';
import hostel4 from '@/public/assets/hostel1_bg.jpeg';

export default function AboutPage() {
  return (
     <section>
        <main className="min-h-screen bg-gray-50">
              {/* Hero Section */}
              <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  // className="max-w-3xl mx-auto"
                >

            <section className="relative bg-blue-600 text-white py-16 md:py-24">
              <div className="container mx-auto px-4 max-w-7xl">
                <div className="flex flex-col md:flex-row items-center">
                  <div className="md:w-1/2 mb-8 md:mb-0">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">About CUG Hostels</h1>
                    <p className="text-lg md:text-xl opacity-90">
                      Connecting students with comfortable, affordable, and convenient accommodation options near campus.
                    </p>
                  </div>
                  <div className="md:w-1/2 flex justify-center md:justify-end">
                    <div className="relative w-72 h-72 rounded-full bg-blue-500 overflow-hidden">
                      <Image 
                        src={hostel1}
                        alt="Student accommodation" 
                        fill
                        className="object-cover"
                        priority
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gray-50 clip-path-curve"></div>
            </section>
      </motion.div>

      {/* Our Mission */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <div className="relative h-96 w-full rounded-xl overflow-hidden shadow-xl">
                <Image 
                  src={hostel2}
                  alt="CUG Campus" 
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-6 text-gray-800">Our Mission</h2>
              <p className="text-gray-600 mb-4">
                At CUG Hostels, we believe that comfortable and convenient accommodation is fundamental to academic success. Our mission is to simplify the hostel search and booking process for students while providing hostel owners with an efficient platform to showcase their properties.
              </p>
              <p className="text-gray-600">
                We're committed to building a transparent, reliable, and user-friendly ecosystem that addresses the unique accommodation needs of the CUG community.
              </p>
            </div>
          </div>
        </div>
      </section>
      </motion.div>

      {/* How It Works */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >

      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 className="text-3xl font-bold mb-12 text-center text-gray-800">How CUG Hostels Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* For Students */}
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">For Students</h3>
              <ul className="text-gray-600 space-y-2">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Search for hostels based on your preferences
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Compare amenities, prices, and locations
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Book and pay securely online
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Access virtual tours and reviews
                </li>
              </ul>
            </div>

            {/* For Hostel Owners */}
            <motion.div
        initial={{ y: 30, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >

            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">For Hostel Owners</h3>
              <ul className="text-gray-600 space-y-2">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  List your property for free
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Manage room availability and bookings
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Receive secure payments
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Get detailed analytics and insights
                </li>
              </ul>
            </div>
      </motion.div>

            {/* For Administrators */}
            <motion.div
        initial={{ y: 30, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >

            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">For University Admin</h3>
              <ul className="text-gray-600 space-y-2">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Monitor accommodation availability
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Verify hostel quality and safety
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Access comprehensive reports
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Support student accommodation needs
                </li>
              </ul>
            </div>
      </motion.div>
          </div>
        </div>
      </section>
      </motion.div>

      {/* Key Features */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 className="text-3xl font-bold mb-12 text-center text-gray-800">What Makes Us Different</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Advanced Search</h3>
              <p className="text-gray-600">
                Find the perfect hostel with our powerful search filters by location, price, amenities, and more.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Virtual Tours</h3>
              <p className="text-gray-600">
                Explore hostels remotely with 360° virtual tours before making your booking decision.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Secure Payments</h3>
              <p className="text-gray-600">
                Pay securely via Paystack with support for multiple payment methods including mobile money.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Flexible Bookings</h3>
              <p className="text-gray-600">
                Book accommodations for a semester, monthly, or even shorter stays based on your needs.
              </p>
            </div>
          </div>
        </div>
      </section>
      </motion.div>

      {/* Team/Founders Section */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >

      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 className="text-3xl font-bold mb-12 text-center text-gray-800">Meet Our Team</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Team Member 1 */}
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-4">
                <Image 
                  src={hostel3}
                  alt="Team Member" 
                  width={128}
                  height={128}
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold mb-1 text-gray-800">Alex Johnson</h3>
              <p className="text-blue-600 mb-3">Founder & CEO</p>
              <p className="text-gray-600">
                Alex is a CUG alumnus who experienced firsthand the challenges of finding quality student accommodation.
              </p>
            </div>

            {/* Team Member 2 */}
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-4">
                <Image 
                  src={hostel4}
                  alt="Team Member" 
                  width={128}
                  height={128}
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold mb-1 text-gray-800">Sarah Mensah</h3>
              <p className="text-blue-600 mb-3">CTO</p>
              <p className="text-gray-600">
                Sarah leads our technical team, ensuring the platform provides a seamless experience for all users.
              </p>
            </div>

            {/* Team Member 3 */}
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-4">
                <Image 
                  src={hostel1}
                  alt="Team Member" 
                  width={128}
                  height={128}
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold mb-1 text-gray-800">David Asamoah</h3>
              <p className="text-blue-600 mb-3">Operations Manager</p>
              <p className="text-gray-600">
                David oversees day-to-day operations and builds relationships with hostel owners and university partners.
              </p>
            </div>
          </div>
        </div>
      </section>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >

      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Find Your Perfect Hostel?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join thousands of CUG students who have found their ideal accommodation through our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/hostels" className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
              Browse Hostels
            </Link>
            <Link href="/" className="px-8 py-3 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors">
              Sign Up Today
            </Link>
          </div>
        </div>
      </section>
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 className="text-3xl font-bold mb-12 text-center text-gray-800">Frequently Asked Questions</h2>
          
          <div className="max-w-3xl mx-auto space-y-6">
            {/* FAQ Item 1 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">How do I book a hostel?</h3>
              <p className="text-gray-600">
                Browse available hostels, select your preferred room type, choose your dates, and proceed to payment. Once payment is confirmed, you'll receive a booking confirmation.
              </p>
            </div>

            {/* FAQ Item 2 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">What payment methods are accepted?</h3>
              <p className="text-gray-600">
                We accept various payment methods through Paystack, including credit/debit cards and mobile money options like MTN Mobile Money, Vodafone Cash, and AirtelTigo Money.
              </p>
            </div>

            {/* FAQ Item 3 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Can I cancel my booking?</h3>
              <p className="text-gray-600">
                Cancellation policies vary by hostel. You can find specific cancellation terms on each hostel's page before booking. Most hostels offer free cancellation up to 7 days before check-in.
              </p>
            </div>

            {/* FAQ Item 4 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">How do I list my hostel on the platform?</h3>
              <p className="text-gray-600">
                If you're a hostel owner, you can register as a hostel owner, submit your property details for verification, and start managing your listings once approved.
              </p>
            </div>
          </div>
        </div>
      </section>
      </motion.div>

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
    </main>
     </section>
  );
}