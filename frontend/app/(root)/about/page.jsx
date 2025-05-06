import React from 'react';
import { Info, Clock, Users, MapPin, Book, Phone, Mail, Shield } from 'lucide-react';
import {motion} from 'framer-motion';

const About = () => {
  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } }
  };
  
  const slideUp = {
    hidden: { y: 60, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6 } }
  };
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="bg-blue-900 text-white py-16"
      >
        <div className="container mx-auto px-4 md:px-8">
          <motion.h1 
            variants={slideUp}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            About Our Hostel Booking System
          </motion.h1>
          <motion.p 
            variants={slideUp}
            className="text-lg md:text-xl max-w-3xl"
          >
            Simplifying accommodation for students at Catholic University of Ghana, Fiapre.
          </motion.p>
        </div>
      </motion.div>

      {/* Mission Statement */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeIn}
        className="container mx-auto px-4 md:px-8 py-12"
      >
        <motion.div 
          variants={slideUp}
          className="bg-white rounded-lg shadow-md p-8"
        >
          <div className="flex items-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <Info className="text-blue-700 mr-3" size={28} />
            </motion.div>
            <h2 className="text-2xl font-semibold">Our Mission</h2>
          </div>
          <motion.p 
            variants={fadeIn}
            className="text-gray-700 mb-6"
          >
            Our mission is to provide a seamless and stress-free hostel booking experience for all students at 
            Catholic University of Ghana, Fiapre. We strive to make the process of finding and securing 
            accommodation as simple as possible, so you can focus on your academic journey.
          </motion.p>
          
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10"
          >
            <motion.div 
              variants={slideUp}
              className="bg-blue-50 p-6 rounded-lg"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="flex items-center mb-4">
                <Clock className="text-blue-700 mr-3" size={24} />
                <h3 className="text-xl font-medium">Quick & Easy Booking</h3>
              </div>
              <p className="text-gray-600">
                Book your preferred hostel in minutes, with real-time availability updates and instant confirmation.
              </p>
            </motion.div>
            
            <motion.div 
              variants={slideUp}
              className="bg-blue-50 p-6 rounded-lg"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="flex items-center mb-4">
                <Users className="text-blue-700 mr-3" size={24} />
                <h3 className="text-xl font-medium">Student-Centered</h3>
              </div>
              <p className="text-gray-600">
                Designed with student needs in mind, offering affordable options and flexible payment plans.
              </p>
            </motion.div>
            
            <motion.div 
              variants={slideUp}
              className="bg-blue-50 p-6 rounded-lg"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="flex items-center mb-4">
                <MapPin className="text-blue-700 mr-3" size={24} />
                <h3 className="text-xl font-medium">Strategic Locations</h3>
              </div>
              <p className="text-gray-600">
                All our hostels are strategically located with easy access to campus facilities and amenities.
              </p>
            </motion.div>
            
            <motion.div 
              variants={slideUp}
              className="bg-blue-50 p-6 rounded-lg"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="flex items-center mb-4">
                <Shield className="text-blue-700 mr-3" size={24} />
                <h3 className="text-xl font-medium">Secure & Reliable</h3>
              </div>
              <p className="text-gray-600">
                Ensuring your data and payments are protected with our secure booking platform.
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* How It Works */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeIn}
        className="bg-gray-100 py-12"
      >
        <div className="container mx-auto px-4 md:px-8">
          <motion.div 
            variants={slideUp}
            className="mb-10 text-center"
          >
            <h2 className="text-2xl font-semibold mb-2">How It Works</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Booking your hostel accommodation is simple with our user-friendly system.
            </p>
          </motion.div>
          
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <motion.div 
              variants={slideUp}
              className="bg-white p-6 rounded-lg shadow-md text-center"
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div 
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, delay: 0.1 }}
                className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4"
              >
                <span className="text-blue-700 font-bold text-xl">1</span>
              </motion.div>
              <h3 className="text-lg font-medium mb-3">Create an Account</h3>
              <p className="text-gray-600">
                Sign up using your student ID and email address to access the booking platform.
              </p>
            </motion.div>
            
            <motion.div 
              variants={slideUp}
              className="bg-white p-6 rounded-lg shadow-md text-center"
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div 
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, delay: 0.3 }}
                className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4"
              >
                <span className="text-blue-700 font-bold text-xl">2</span>
              </motion.div>
              <h3 className="text-lg font-medium mb-3">Browse Available Hostels</h3>
              <p className="text-gray-600">
                Explore different hostel options, view amenities, and check real-time availability.
              </p>
            </motion.div>
            
            <motion.div 
              variants={slideUp}
              className="bg-white p-6 rounded-lg shadow-md text-center"
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div 
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, delay: 0.5 }}
                className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4"
              >
                <span className="text-blue-700 font-bold text-xl">3</span>
              </motion.div>
              <h3 className="text-lg font-medium mb-3">Book & Pay</h3>
              <p className="text-gray-600">
                Select your preferred room, complete the booking process, and make payment securely.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* University Information */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeIn}
        className="container mx-auto px-4 md:px-8 py-12"
      >
        <motion.div 
          variants={slideUp}
          className="bg-white rounded-lg shadow-md p-8"
        >
          <div className="flex items-center mb-6">
            <motion.div
              initial={{ rotate: -180, opacity: 0 }}
              whileInView={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Book className="text-blue-700 mr-3" size={28} />
            </motion.div>
            <h2 className="text-2xl font-semibold">About Catholic University of Ghana</h2>
          </div>
          
          <motion.p 
            variants={fadeIn}
            className="text-gray-700 mb-6"
          >
            Catholic University of Ghana, Fiapre, is a premier institution dedicated to academic excellence 
            and holistic education. Established with the vision to provide quality higher education grounded in 
            Catholic values, the university has grown to become a center of academic excellence in Ghana.
          </motion.p>
          
          <motion.p 
            variants={fadeIn}
            className="text-gray-700"
          >
            Our campus in Fiapre offers modern facilities, including well-equipped libraries, laboratories, 
            sports facilities, and comfortable student accommodation. The university is committed to creating 
            a conducive environment for learning and personal development.
          </motion.p>
        </motion.div>
      </motion.div>

      {/* Contact Information */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeIn}
        className="bg-blue-900 text-white py-12"
      >
        <div className="container mx-auto px-4 md:px-8">
          <motion.h2 
            variants={slideUp}
            className="text-2xl font-semibold mb-8 text-center"
          >
            Contact Us
          </motion.h2>
          
          <motion.div 
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <motion.div 
              variants={slideUp}
              className="flex flex-col items-center text-center"
              whileHover={{ y: -5 }}
            >
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Phone size={32} className="mb-4" />
              </motion.div>
              <h3 className="text-lg font-medium mb-2">Phone</h3>
              <p>+233 XX XXX XXXX</p>
              <p>+233 XX XXX XXXX</p>
            </motion.div>
            
            <motion.div 
              variants={slideUp}
              className="flex flex-col items-center text-center"
              whileHover={{ y: -5 }}
            >
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
              >
                <Mail size={32} className="mb-4" />
              </motion.div>
              <h3 className="text-lg font-medium mb-2">Email</h3>
              <p>hostels@cug.edu.gh</p>
              <p>support@cughostels.edu.gh</p>
            </motion.div>
            
            <motion.div 
              variants={slideUp}
              className="flex flex-col items-center text-center"
              whileHover={{ y: -5 }}
            >
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, delay: 0.4 }}
              >
                <MapPin size={32} className="mb-4" />
              </motion.div>
              <h3 className="text-lg font-medium mb-2">Address</h3>
              <p>Catholic University of Ghana</p>
              <p>Fiapre, Sunyani, Ghana</p>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="bg-gray-800 text-white py-6"
      >
        <div className="container mx-auto px-4 md:px-8 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            © {new Date().getFullYear()} Catholic University of Ghana Hostel Booking System. All rights reserved.
          </motion.p>
        </div>
      </motion.footer>
    </div>
  );
};

export default About;