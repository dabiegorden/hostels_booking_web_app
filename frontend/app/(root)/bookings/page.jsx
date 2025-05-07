"use client";

import { useState } from 'react';
import { Calendar, Clock, MapPin, Check, AlertCircle, X, FileText, Download, ChevronDown, ChevronRight, Search } from 'lucide-react';

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [expandedBooking, setExpandedBooking] = useState(null);
  
  // Sample data - in a real application this would come from your API
  const bookings = {
    upcoming: [
      {
        id: 1,
        hostelName: "University Gardens Hostel",
        roomType: "Single Room with Bathroom",
        checkInDate: "2025-08-15",
        checkOutDate: "2025-12-15",
        paymentStatus: "paid",
        amount: 2200,
        bookingDate: "2025-05-01",
        reference: "UGH-25080115",
        image: "/api/placeholder/400/250",
        hostelAddress: "123 University Road, 0.5km from campus",
        amenities: ["WiFi", "Air Conditioning", "Study Desk", "Private Bathroom"],
        contact: "+233 20 123 4567"
      },
      {
        id: 2,
        hostelName: "Academic Heights Residence",
        roomType: "Shared Room (2 Person)",
        checkInDate: "2025-08-20",
        checkOutDate: "2025-12-20",
        paymentStatus: "pending",
        amount: 1800,
        bookingDate: "2025-05-02",
        reference: "AHR-25082012",
        image: "/api/placeholder/400/250",
        hostelAddress: "45 Scholar Avenue, 1.2km from campus",
        amenities: ["WiFi", "Shared Bathroom", "Study Area", "Cafeteria Access"],
        contact: "+233 20 987 6543"
      }
    ],
    past: [
      {
        id: 3,
        hostelName: "Campus View Apartments",
        roomType: "Self-Contained Studio",
        checkInDate: "2025-01-10",
        checkOutDate: "2025-05-10",
        paymentStatus: "paid",
        amount: 2600,
        bookingDate: "2024-12-15",
        reference: "CVA-25011005",
        image: "/api/placeholder/400/250",
        hostelAddress: "7 Hillside Drive, 0.8km from campus",
        amenities: ["WiFi", "Air Conditioning", "Kitchenette", "Private Bathroom"],
        contact: "+233 20 456 7890"
      },
      {
        id: 4,
        hostelName: "Scholars' Haven",
        roomType: "Standard Single Room",
        checkInDate: "2024-08-15",
        checkOutDate: "2024-12-15",
        paymentStatus: "paid",
        amount: 1400,
        bookingDate: "2024-07-20",
        reference: "SH-24081522",
        image: "/api/placeholder/400/250",
        hostelAddress: "234 College Street, 1.5km from campus",
        amenities: ["WiFi", "Shared Bathroom", "Study Desk", "Common Room Access"],
        contact: "+233 20 345 6789"
      }
    ],
    cancelled: [
      {
        id: 5,
        hostelName: "University Gardens Hostel",
        roomType: "Double Room",
        checkInDate: "2025-08-10",
        checkOutDate: "2025-12-10",
        paymentStatus: "refunded",
        amount: 1900,
        bookingDate: "2025-04-15",
        cancellationDate: "2025-04-25",
        reference: "UGH-25081010",
        image: "/api/placeholder/400/250",
        hostelAddress: "123 University Road, 0.5km from campus",
        amenities: ["WiFi", "Shared Bathroom", "Study Desk", "Common Room Access"],
        contact: "+233 20 123 4567"
      }
    ]
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'paid':
        return (
          <span className="flex items-center px-2 py-1 text-sm bg-green-100 text-green-800 rounded-full">
            <Check size={14} className="mr-1" /> Paid
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center px-2 py-1 text-sm bg-yellow-100 text-yellow-800 rounded-full">
            <Clock size={14} className="mr-1" /> Pending
          </span>
        );
      case 'refunded':
        return (
          <span className="flex items-center px-2 py-1 text-sm bg-gray-100 text-gray-800 rounded-full">
            <Check size={14} className="mr-1" /> Refunded
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const toggleBookingDetails = (id) => {
    if (expandedBooking === id) {
      setExpandedBooking(null);
    } else {
      setExpandedBooking(id);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">My Bookings</h1>
        <div className="flex w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder="Search bookings..."
              className="w-full pl-10 pr-4 py-2 border rounded-md"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <button 
            onClick={() => setActiveTab('upcoming')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'upcoming' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Upcoming Bookings
          </button>
          <button 
            onClick={() => setActiveTab('past')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'past' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Past Bookings
          </button>
          <button 
            onClick={() => setActiveTab('cancelled')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'cancelled' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Cancelled Bookings
          </button>
        </nav>
      </div>

      {/* Booking Cards */}
      <div className="space-y-4">
        {bookings[activeTab].length > 0 ? (
          bookings[activeTab].map(booking => (
            <div key={booking.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4">
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-1/4 mb-4 md:mb-0">
                    <img 
                      src={booking.image} 
                      alt={booking.hostelName} 
                      className="w-full h-32 object-cover rounded-md"
                    />
                  </div>
                  <div className="md:ml-4 flex-1">
                    <div className="flex justify-between items-start">
                      <h2 className="text-xl font-semibold text-gray-800">{booking.hostelName}</h2>
                      {getStatusBadge(booking.paymentStatus)}
                    </div>
                    <p className="text-gray-600 mb-2">{booking.roomType}</p>
                    <div className="flex items-center text-gray-600 mb-1">
                      <MapPin size={16} className="mr-1" />
                      <span className="text-sm">{booking.hostelAddress}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Calendar size={16} className="mr-1" />
                        <span>{formatDate(booking.checkInDate)}</span>
                        <span className="mx-1">-</span>
                        <span>{formatDate(booking.checkOutDate)}</span>
                      </div>
                      <div>
                        <span className="font-medium">GH₵ {booking.amount}</span>
                        <span className="text-gray-500"> total</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2">
                        <button className="flex items-center text-sm text-blue-600 hover:text-blue-800">
                          <FileText size={16} className="mr-1" />
                          View Receipt
                        </button>
                        {booking.paymentStatus === 'pending' && (
                          <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            Complete Payment
                          </button>
                        )}
                        {activeTab === 'upcoming' && (
                          <button className="flex items-center text-sm text-red-600 hover:text-red-800">
                            <X size={16} className="mr-1" />
                            Cancel Booking
                          </button>
                        )}
                      </div>
                      <button 
                        onClick={() => toggleBookingDetails(booking.id)}
                        className="flex items-center text-sm text-gray-600 hover:text-gray-800"
                      >
                        {expandedBooking === booking.id ? (
                          <>
                            Hide Details <ChevronDown size={16} className="ml-1" />
                          </>
                        ) : (
                          <>
                            View Details <ChevronRight size={16} className="ml-1" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedBooking === booking.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h3 className="font-medium text-gray-800 mb-2">Booking Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm"><span className="font-medium">Booking Reference:</span> {booking.reference}</p>
                        <p className="text-sm"><span className="font-medium">Booking Date:</span> {formatDate(booking.bookingDate)}</p>
                        {booking.cancellationDate && (
                          <p className="text-sm"><span className="font-medium">Cancellation Date:</span> {formatDate(booking.cancellationDate)}</p>
                        )}
                        <p className="text-sm"><span className="font-medium">Contact:</span> {booking.contact}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Amenities:</p>
                        <div className="flex flex-wrap gap-2">
                          {booking.amenities.map((amenity, index) => (
                            <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {activeTab === 'upcoming' && (
                      <div className="mt-4 p-4 bg-blue-50 text-blue-800 rounded-md">
                        <h4 className="font-medium flex items-center">
                          <AlertCircle size={18} className="mr-2" />
                          Important Information
                        </h4>
                        <ul className="list-disc list-inside text-sm mt-2">
                          <li>Check-in time starts at 2:00 PM</li>
                          <li>Please bring your student ID and booking reference</li>
                          <li>Contact the hostel management 24 hours before arrival</li>
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-600">No {activeTab} bookings found.</p>
          </div>
        )}
      </div>
    </div>
  );
}