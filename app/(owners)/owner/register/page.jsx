'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

const HostelOwnerRegistration = () => {
  const router = useRouter();
  
  // Personal Information State
  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    idType: 'nationalID',
    idNumber: '',
    profileImage: null,
  });
  
  // Payment Information State
  const [paymentInfo, setPaymentInfo] = useState({
    momoProvider: 'mtn',
    momoNumber: '',
    accountName: '',
  });
  
  // Initial Hostel Information State
  const [hostelInfo, setHostelInfo] = useState({
    hostelName: '',
    hostelDescription: '',
    hostelAddress: '',
    hostelLocation: { lat: '', lng: '' },
    hostelImages: [],
    amenities: {
      wifi: false,
      waterSupply: false,
      security: false,
      studyRoom: false,
      parking: false,
      generator: false,
    },
    policies: '',
  });
  
  // Form Step State (1: Personal Info, 2: Payment Info, 3: Hostel Info)
  const [formStep, setFormStep] = useState(1);
  
  // Error State
  const [errors, setErrors] = useState({});
  // Loading State
  const [isLoading, setIsLoading] = useState(false);
  
  // Function to handle personal info changes
  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo(prev => ({ ...prev, [name]: value }));
  };
  
  // Function to handle profile image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPersonalInfo(prev => ({ ...prev, profileImage: file }));
    }
  };
  
  // Function to handle payment info changes
  const handlePaymentInfoChange = (e) => {
    const { name, value } = e.target;
    setPaymentInfo(prev => ({ ...prev, [name]: value }));
  };
  
  // Function to handle hostel info changes
  const handleHostelInfoChange = (e) => {
    const { name, value } = e.target;
    setHostelInfo(prev => ({ ...prev, [name]: value }));
  };
  
  // Function to handle amenities toggle
  const handleAmenitiesToggle = (amenity) => {
    setHostelInfo(prev => ({
      ...prev,
      amenities: {
        ...prev.amenities,
        [amenity]: !prev.amenities[amenity]
      }
    }));
  };
  
  // Function to handle hostel images upload
  const handleHostelImagesUpload = (e) => {
    const files = Array.from(e.target.files);
    setHostelInfo(prev => ({
      ...prev,
      hostelImages: [...prev.hostelImages, ...files]
    }));
  };
  
  // Function to remove uploaded hostel image
  const removeHostelImage = (index) => {
    setHostelInfo(prev => ({
      ...prev,
      hostelImages: prev.hostelImages.filter((_, i) => i !== index)
    }));
  };
  
  // Function to validate personal info
  const validatePersonalInfo = () => {
    const newErrors = {};
    
    if (!personalInfo.name.trim()) newErrors.name = "Name is required";
    if (!personalInfo.email.trim()) newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(personalInfo.email)) newErrors.email = "Invalid email format";
    
    if (!personalInfo.password) newErrors.password = "Password is required";
    else if (personalInfo.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    
    if (personalInfo.password !== personalInfo.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    if (!personalInfo.phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required";
    if (!personalInfo.idNumber.trim()) newErrors.idNumber = "ID number is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Function to validate payment info
  const validatePaymentInfo = () => {
    const newErrors = {};
    
    if (!paymentInfo.momoNumber.trim()) newErrors.momoNumber = "Mobile money number is required";
    if (!paymentInfo.accountName.trim()) newErrors.accountName = "Account name is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Function to validate hostel info
  const validateHostelInfo = () => {
    const newErrors = {};
    
    if (!hostelInfo.hostelName.trim()) newErrors.hostelName = "Hostel name is required";
    if (!hostelInfo.hostelDescription.trim()) newErrors.hostelDescription = "Hostel description is required";
    if (!hostelInfo.hostelAddress.trim()) newErrors.hostelAddress = "Hostel address is required";
    if (hostelInfo.hostelImages.length === 0) newErrors.hostelImages = "At least one hostel image is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Function to handle next step
  const handleNextStep = () => {
    if (formStep === 1) {
      const isValid = validatePersonalInfo();
      if (isValid) setFormStep(2);
    } else if (formStep === 2) {
      const isValid = validatePaymentInfo();
      if (isValid) setFormStep(3);
    }
  };
  
  // Function to handle previous step
  const handlePrevStep = () => {
    setFormStep(formStep - 1);
  };
  
  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const isValid = validateHostelInfo();
    if (!isValid) return;
    
    setIsLoading(true);
    
    try {
      // Create FormData object to handle file uploads
      const formData = new FormData();
      
      // Add personal info
      Object.keys(personalInfo).forEach(key => {
        if (key !== 'profileImage') {
          formData.append(key, personalInfo[key]);
        }
      });
      
      // Add profile image if it exists
      if (personalInfo.profileImage) {
        formData.append('profileImage', personalInfo.profileImage);
      }
      
      // Add payment info
      Object.keys(paymentInfo).forEach(key => {
        formData.append(key, paymentInfo[key]);
      });
      
      // Add hostel info (except images)
      formData.append('hostelName', hostelInfo.hostelName);
      formData.append('hostelDescription', hostelInfo.hostelDescription);
      formData.append('hostelAddress', hostelInfo.hostelAddress);
      formData.append('hostelLocation', JSON.stringify(hostelInfo.hostelLocation));
      formData.append('amenities', JSON.stringify(hostelInfo.amenities));
      formData.append('policies', hostelInfo.policies);
      
      // Add hostel images
      hostelInfo.hostelImages.forEach((image, index) => {
        formData.append(`hostelImages`, image);
      });
      
      // Send data to the API
      const response = await fetch('/api/auth/register/hostel-owner', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      // Redirect to success page or login
      router.push('/registration-success?type=hostel-owner');
      
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">Hostel Owner Registration</h1>
          <p className="text-gray-600 mt-2">List your hostel on CUG Hostel Finder and connect with students</p>
        </div>
        
        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${formStep >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
              1
            </div>
            <div className={`h-1 w-16 ${formStep >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${formStep >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
              2
            </div>
            <div className={`h-1 w-16 ${formStep >= 3 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${formStep >= 3 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
              3
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Step 1: Personal Information */}
          {formStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Personal Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={personalInfo.name}
                    onChange={handlePersonalInfoChange}
                    className={`w-full p-3 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={personalInfo.email}
                    onChange={handlePersonalInfoChange}
                    className={`w-full p-3 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter your email address"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={personalInfo.password}
                    onChange={handlePersonalInfoChange}
                    className={`w-full p-3 border rounded-md ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Create a password"
                  />
                  {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={personalInfo.confirmPassword}
                    onChange={handlePersonalInfoChange}
                    className={`w-full p-3 border rounded-md ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Confirm your password"
                  />
                  {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
                </div>
                
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={personalInfo.phoneNumber}
                    onChange={handlePersonalInfoChange}
                    className={`w-full p-3 border rounded-md ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter your phone number"
                  />
                  {errors.phoneNumber && <p className="mt-1 text-sm text-red-500">{errors.phoneNumber}</p>}
                </div>
                
                <div>
                  <label htmlFor="idType" className="block text-sm font-medium text-gray-700 mb-1">ID Type</label>
                  <select
                    id="idType"
                    name="idType"
                    value={personalInfo.idType}
                    onChange={handlePersonalInfoChange}
                    className="w-full p-3 border border-gray-300 rounded-md"
                  >
                    <option value="nationalID">National ID</option>
                    <option value="passport">Passport</option>
                    <option value="driverLicense">Driver's License</option>
                    <option value="voterID">Voter's ID</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700 mb-1">ID Number</label>
                  <input
                    type="text"
                    id="idNumber"
                    name="idNumber"
                    value={personalInfo.idNumber}
                    onChange={handlePersonalInfoChange}
                    className={`w-full p-3 border rounded-md ${errors.idNumber ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter your ID number"
                  />
                  {errors.idNumber && <p className="mt-1 text-sm text-red-500">{errors.idNumber}</p>}
                </div>
                
                <div>
                  <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
                  <input
                    type="file"
                    id="profileImage"
                    name="profileImage"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                  <p className="mt-1 text-xs text-gray-500">Upload a clear photo of yourself (max 5MB)</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 2: Payment Information */}
          {formStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment Information</h2>
              <p className="text-gray-600 mb-4">Provide your mobile money details for receiving payments from students</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="momoProvider" className="block text-sm font-medium text-gray-700 mb-1">Mobile Money Provider</label>
                  <select
                    id="momoProvider"
                    name="momoProvider"
                    value={paymentInfo.momoProvider}
                    onChange={handlePaymentInfoChange}
                    className="w-full p-3 border border-gray-300 rounded-md"
                  >
                    <option value="mtn">MTN Mobile Money</option>
                    <option value="vodafone">Vodafone Cash</option>
                    <option value="airtel">AirtelTigo Money</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="momoNumber" className="block text-sm font-medium text-gray-700 mb-1">Mobile Money Number</label>
                  <input
                    type="text"
                    id="momoNumber"
                    name="momoNumber"
                    value={paymentInfo.momoNumber}
                    onChange={handlePaymentInfoChange}
                    className={`w-full p-3 border rounded-md ${errors.momoNumber ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter your mobile money number"
                  />
                  {errors.momoNumber && <p className="mt-1 text-sm text-red-500">{errors.momoNumber}</p>}
                </div>
                
                <div>
                  <label htmlFor="accountName" className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                  <input
                    type="text"
                    id="accountName"
                    name="accountName"
                    value={paymentInfo.accountName}
                    onChange={handlePaymentInfoChange}
                    className={`w-full p-3 border rounded-md ${errors.accountName ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter the name on your mobile money account"
                  />
                  {errors.accountName && <p className="mt-1 text-sm text-red-500">{errors.accountName}</p>}
                </div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                <h3 className="text-sm font-medium text-yellow-800">Important Information</h3>
                <ul className="mt-2 text-sm text-yellow-700 list-disc pl-5">
                  <li>Ensure the mobile money account is registered in your name</li>
                  <li>All payments will be processed through Paystack and transferred to this account</li>
                  <li>Standard transaction fees may apply</li>
                </ul>
              </div>
            </div>
          )}
          
          {/* Step 3: Hostel Information */}
          {formStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Hostel Information</h2>
              <p className="text-gray-600 mb-4">Provide details about your hostel to attract students</p>
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="hostelName" className="block text-sm font-medium text-gray-700 mb-1">Hostel Name</label>
                  <input
                    type="text"
                    id="hostelName"
                    name="hostelName"
                    value={hostelInfo.hostelName}
                    onChange={handleHostelInfoChange}
                    className={`w-full p-3 border rounded-md ${errors.hostelName ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter the name of your hostel"
                  />
                  {errors.hostelName && <p className="mt-1 text-sm text-red-500">{errors.hostelName}</p>}
                </div>
                
                <div>
                  <label htmlFor="hostelDescription" className="block text-sm font-medium text-gray-700 mb-1">Hostel Description</label>
                  <textarea
                    id="hostelDescription"
                    name="hostelDescription"
                    value={hostelInfo.hostelDescription}
                    onChange={handleHostelInfoChange}
                    rows="4"
                    className={`w-full p-3 border rounded-md ${errors.hostelDescription ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Provide a detailed description of your hostel"
                  ></textarea>
                  {errors.hostelDescription && <p className="mt-1 text-sm text-red-500">{errors.hostelDescription}</p>}
                </div>
                
                <div>
                  <label htmlFor="hostelAddress" className="block text-sm font-medium text-gray-700 mb-1">Hostel Address</label>
                  <input
                    type="text"
                    id="hostelAddress"
                    name="hostelAddress"
                    value={hostelInfo.hostelAddress}
                    onChange={handleHostelInfoChange}
                    className={`w-full p-3 border rounded-md ${errors.hostelAddress ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter the full address of your hostel"
                  />
                  {errors.hostelAddress && <p className="mt-1 text-sm text-red-500">{errors.hostelAddress}</p>}
                </div>
                
                <div>
                  <p className="block text-sm font-medium text-gray-700 mb-2">Amenities Available</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.keys(hostelInfo.amenities).map((amenity) => (
                      <div key={amenity} className="flex items-center">
                        <input
                          type="checkbox"
                          id={amenity}
                          checked={hostelInfo.amenities[amenity]}
                          onChange={() => handleAmenitiesToggle(amenity)}
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <label htmlFor={amenity} className="ml-2 text-sm text-gray-700 capitalize">
                          {amenity === 'wifi' ? 'WiFi' : amenity.replace(/([A-Z])/g, ' $1').trim()}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="policies" className="block text-sm font-medium text-gray-700 mb-1">Hostel Policies</label>
                  <textarea
                    id="policies"
                    name="policies"
                    value={hostelInfo.policies}
                    onChange={handleHostelInfoChange}
                    rows="3"
                    className="w-full p-3 border border-gray-300 rounded-md"
                    placeholder="Describe your hostel policies (e.g., visitation hours, quiet hours, etc.)"
                  ></textarea>
                </div>
                
                <div>
                  <label htmlFor="hostelImages" className="block text-sm font-medium text-gray-700 mb-1">Hostel Images</label>
                  <input
                    type="file"
                    id="hostelImages"
                    name="hostelImages"
                    accept="image/*"
                    multiple
                    onChange={handleHostelImagesUpload}
                    className={`w-full p-2 border rounded-md ${errors.hostelImages ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  <p className="mt-1 text-xs text-gray-500">Upload clear images of your hostel (max 10 images, 5MB each)</p>
                  {errors.hostelImages && <p className="mt-1 text-sm text-red-500">{errors.hostelImages}</p>}
                  
                  {/* Preview uploaded images */}
                  {hostelInfo.hostelImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {hostelInfo.hostelImages.map((image, index) => (
                        <div key={index} className="relative">
                          <div className="h-24 rounded-md bg-gray-100 overflow-hidden">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`Hostel image ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeHostelImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs flex items-center justify-center w-6 h-6"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between">
            {formStep > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
              >
                Back
              </button>
            ) : (
              <div></div>
            )}
            
            {formStep < 3 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className={`px-6 py-2 bg-indigo-600 text-white rounded-md ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-indigo-700'} transition`}
              >
                {isLoading ? 'Submitting...' : 'Complete Registration'}
              </button>
            )}
          </div>
          
          {errors.submit && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md border border-red-200">
              {errors.submit}
            </div>
          )}
        </form>
        
        <div className="mt-8 text-center text-gray-600 text-sm">
          Already have an account? <Link href="/owner/signin" className="text-indigo-600 hover:underline">Signin here</Link>
        </div>
      </div>
    </div>
  );
};

export default HostelOwnerRegistration;