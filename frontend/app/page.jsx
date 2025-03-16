"use client"

import React, { useEffect } from 'react';
import { Carousel, Button } from 'antd';
import Image from 'next/image';
import { motion, useAnimation } from 'framer-motion';

import hostelImage1 from "@/public/assets/hostel1_bg.jpeg";
import hostelImage2 from "@/public/assets/hostel2_bg.jpeg";
import hostelImage3 from "@/public/assets/hostel3_bg.jpeg";
import hostelImage4 from "@/public/assets/hostel4_bg.jpeg";
import { Navbar } from '@/constants';

// Define styles for various elements
const slideStyle = {
  position: 'relative',
  height: '500px',
  width: '100%',
};

const imageStyle = {
  objectFit: 'cover',
  objectPosition: 'center',
};

const overlayStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '0 20px',
  textAlign: 'center',
};

const captionStyle = {
  color: '#fff',
  fontSize: '2.5rem',
  fontWeight: 'bold',
  marginBottom: '1rem',
  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
};

const descriptionStyle = {
  color: '#fff',
  fontSize: '1.2rem',
  maxWidth: '600px',
  marginBottom: '2rem',
  textShadow: '1px 1px 3px rgba(0, 0, 0, 0.5)',
};

// Carousel data with images, captions, descriptions and CTA text
const carouselData = [
  {
    image: hostelImage1,
    caption: 'Find Your Perfect Hostel',
    description: 'Discover comfortable and affordable accommodations worldwide',
    ctaText: 'Search Hostels',
    ctaLink: '/search'
  },
  {
    image: hostelImage2,
    caption: 'Experience Local Culture',
    description: 'Connect with fellow travelers and immerse yourself in new experiences',
    ctaText: 'Browse Popular Spots',
    ctaLink: '/popular'
  },
  {
    image: hostelImage3,
    caption: 'Best Rates Guaranteed',
    description: 'Enjoy exclusive deals and special discounts on top-rated hostels',
    ctaText: 'View Deals',
    ctaLink: '/deals'
  },
  {
    image: hostelImage4,
    caption: 'Host Your Property',
    description: 'List your property and reach travelers from around the world',
    ctaText: 'Become a Host',
    ctaLink: '/host-signup'
  }
];

const App = () => {
  const controls = useAnimation();

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
        delay: 0.2
      }
    });
  }, [controls]);

  return (
    <main>
      <Navbar />
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={controls}
    >
      <Carousel autoplay>
        {carouselData.map((slide, index) => (
          <div key={index}>
            <div style={slideStyle}>
              <Image
                src={slide.image}
                alt={slide.caption}
                fill
                style={imageStyle}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADZWUDgg"
              />
              <div style={overlayStyle}>
                <motion.h2 
                  style={captionStyle}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.7 }}
                >
                  {slide.caption}
                </motion.h2>
                <motion.p 
                  style={descriptionStyle}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.7 }}
                >
                  {slide.description}
                </motion.p>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.7 }}
                >
                  <Button 
                    type="primary" 
                    size="large" 
                    href={slide.ctaLink}
                    style={{
                      fontSize: '1.1rem',
                      height: 'auto',
                      padding: '10px 24px',
                      borderRadius: '4px',
                      fontWeight: 'bold',
                    }}
                  >
                    {slide.ctaText}
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        ))}
      </Carousel>
    </motion.div>
    </main>
  );
};

export default App;