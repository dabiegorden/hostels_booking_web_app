"use client";

import { useState } from 'react';
import { Search, MapPin, Star, Filter, Grid, List, Wifi, Coffee, Tv, Snowflake, Utensils } from 'lucide-react';

export default function HostelsListingPage() {
  const [viewMode, setViewMode] = useState('grid');
  
  // Sample data - in a real application this would come from your API
  const hostels = [
    {
      id: 1,
      name: "University Gardens Hostel",
      description: "Modern accommodations just 5 minutes from the campus main gate. Features spacious rooms with natural lighting and study areas.",
      location: "123 University Road",
      distance: "0.5km from campus",
      price: 550,
      rating: 4.8,
      reviews: 124,
      image: "/api/placeholder/400/250",
      amenities: ["wifi", "cafeteria", "tv", "ac", "kitchen"]
    },
    {
      id: 2,
      name: "Academic Heights Residence",
      description: "Quiet and secure accommodation ideal for serious students. Featuring 24/7 security and dedicated study rooms on each floor.",
      location: "45 Scholar Avenue",
      distance: "1.2km from campus",
      price: 450,
      rating: 4.5,
      reviews: 89,
      image: "/api/placeholder/400/250",
      amenities: ["wifi", "tv", "kitchen"]
    },
    {
      id: 3,
      name: "Campus View Apartments",
      description: "Luxurious self-contained units with amazing campus views. Perfect for students who prefer their own space and privacy.",
      location: "7 Hillside Drive",
      distance: "0.8km from campus",
      price: 650,
      rating: 4.9,
      reviews: 156,
      image: "/api/placeholder/400/250",
      amenities: ["wifi", "cafeteria", "tv", "ac"]
    },
    {
      id: 4,
      name: "Scholars' Haven",
      description: "Budget-friendly accommodation with great community atmosphere. Regular social events and shared study spaces.",
      location: "234 College Street",
      distance: "1.5km from campus",
      price: 350,
      rating: 4.2,
      reviews: 78,
      image: "/api/placeholder/400/250",
      amenities: ["wifi", "kitchen"]
    }
  ];

  // Function to render amenity icons
  const renderAmenity = (amenity) => {
    switch(amenity) {
      case 'wifi':
        return <div className="flex items-center text-sm"><Wifi size={16} className="mr-1" /> WiFi</div>;
      case 'cafeteria':
        return <div className="flex items-center text-sm"><Coffee size={16} className="mr-1" /> Cafeteria</div>;
      case 'tv':
        return <div className="flex items-center text-sm"><Tv size={16} className="mr-1" /> TV</div>;
      case 'ac':
        return <div className="flex items-center text-sm"><Snowflake size={16} className="mr-1" /> A/C</div>;
      case 'kitchen':
        return <div className="flex items-center text-sm"><Utensils size={16} className="mr-1" /> Kitchen</div>;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">Find Your Perfect Hostel</h1>
        <div className="flex space-x-4">
          <button 
            className={`px-3 py-2 rounded-md flex items-center ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setViewMode('grid')}
          >
            <Grid size={18} className="mr-1" /> Grid
          </button>
          <button 
            className={`px-3 py-2 rounded-md flex items-center ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setViewMode('list')}
          >
            <List size={18} className="mr-1" /> List
          </button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-8">
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search hostels..."
              className="w-full pl-10 pr-4 py-2 border rounded-md"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
          <div className="flex space-x-4">
            <select className="px-4 py-2 border rounded-md">
              <option>Price: Any</option>
              <option>Under GH₵ 400</option>
              <option>GH₵ 400 - 600</option>
              <option>Above GH₵ 600</option>
            </select>
            <select className="px-4 py-2 border rounded-md">
              <option>Distance: Any</option>
              <option>Under 1km</option>
              <option>1km - 2km</option>
              <option>Above 2km</option>
            </select>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center">
              <Filter size={18} className="mr-1" /> More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Hostels Grid/List View */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}>
        {hostels.map(hostel => (
          viewMode === 'grid' ? (
            // Grid View
            <div key={hostel.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <img src={hostel.image} alt={hostel.name} className="w-full h-48 object-cover" />
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-semibold text-gray-800">{hostel.name}</h2>
                  <div className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    <Star size={16} className="fill-current text-yellow-400 mr-1" />
                    <span>{hostel.rating}</span>
                    <span className="text-xs text-gray-600 ml-1">({hostel.reviews})</span>
                  </div>
                </div>
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin size={16} className="mr-1" />
                  <span className="text-sm">{hostel.location} • {hostel.distance}</span>
                </div>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{hostel.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {hostel.amenities.map((amenity, index) => (
                    <div key={index} className="bg-gray-100 px-2 py-1 rounded">
                      {renderAmenity(amenity)}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-lg font-bold text-blue-600">GH₵ {hostel.price}<span className="text-sm font-normal text-gray-500">/month</span></div>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">Book Now</button>
                </div>
              </div>
            </div>
          ) : (
            // List View
            <div key={hostel.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col md:flex-row">
              <img src={hostel.image} alt={hostel.name} className="w-full md:w-64 h-48 object-cover" />
              <div className="p-4 flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-semibold text-gray-800">{hostel.name}</h2>
                  <div className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    <Star size={16} className="fill-current text-yellow-400 mr-1" />
                    <span>{hostel.rating}</span>
                    <span className="text-xs text-gray-600 ml-1">({hostel.reviews})</span>
                  </div>
                </div>
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin size={16} className="mr-1" />
                  <span className="text-sm">{hostel.location} • {hostel.distance}</span>
                </div>
                <p className="text-gray-600 text-sm mb-4">{hostel.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {hostel.amenities.map((amenity, index) => (
                    <div key={index} className="bg-gray-100 px-2 py-1 rounded">
                      {renderAmenity(amenity)}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-lg font-bold text-blue-600">GH₵ {hostel.price}<span className="text-sm font-normal text-gray-500">/month</span></div>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">Book Now</button>
                </div>
              </div>
            </div>
          )
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-8 flex justify-center">
        <div className="inline-flex">
          <button className="px-4 py-2 border rounded-l-md bg-gray-100">Previous</button>
          <button className="px-4 py-2 border-t border-b border-r bg-blue-600 text-white">1</button>
          <button className="px-4 py-2 border-t border-b border-r bg-gray-100">2</button>
          <button className="px-4 py-2 border-t border-b border-r bg-gray-100">3</button>
          <button className="px-4 py-2 border rounded-r-md bg-gray-100">Next</button>
        </div>
      </div>
    </div>
  );
}