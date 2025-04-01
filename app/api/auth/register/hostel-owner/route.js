// app/api/auth/register/hostel-owner/route.js
import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { connectToDB } from '@/app/utils/db/db';
import HostelOwner from '@/app/utils/models/HostelOwners';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Helper function to save uploaded files
async function saveFile(file, folder) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  // Create a unique filename
  const fileName = `${uuidv4()}-${file.name.replace(/\s+/g, '-')}`;
  const filePath = path.join(process.cwd(), 'public', folder, fileName);
  
  // Create directory if it doesn't exist
  const directory = path.join(process.cwd(), 'public', folder);
  try {
    await writeFile(filePath, buffer);
    return `/${folder}/${fileName}`;
  } catch (error) {
    console.error('Error saving file:', error);
    throw new Error('Failed to save file');
  }
}

// Generate JWT token for authentication
function generateToken(userId) {
  // Typically you'd store this secret in an environment variable
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  
  // Create token with user ID and set expiration
  return jwt.sign(
    { id: userId },
    JWT_SECRET,
    { expiresIn: '7d' } // Token expires in 7 days
  );
}

export async function POST(request) {
  try {
    // Connect to database
    await connectToDB();
    
    // Parse form data
    const formData = await request.formData();
    
    // Extract user data from form
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');
    const phoneNumber = formData.get('phoneNumber');
    const idType = formData.get('idType');
    const idNumber = formData.get('idNumber');
    const profileImage = formData.get('profileImage');
    
    // Extract payment info
    const momoProvider = formData.get('momoProvider');
    const momoNumber = formData.get('momoNumber');
    const accountName = formData.get('accountName');
    
    // Extract hostel info
    const hostelName = formData.get('hostelName');
    const hostelDescription = formData.get('hostelDescription');
    const hostelAddress = formData.get('hostelAddress');
    const hostelLocation = JSON.parse(formData.get('hostelLocation') || '{"lat":"","lng":""}');
    const amenities = JSON.parse(formData.get('amenities') || '{}');
    const policies = formData.get('policies');
    
    // Basic validation
    if (!name || !email || !password || !phoneNumber || !idNumber || 
        !momoNumber || !accountName || !hostelName || !hostelDescription || !hostelAddress) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if email already exists
    const existingOwner = await HostelOwner.findOne({ email });
    if (existingOwner) {
      return NextResponse.json(
        { message: 'Email already registered' },
        { status: 400 }
      );
    }
    
    // Handle file uploads
    let profileImageUrl = null;
    if (profileImage) {
      profileImageUrl = await saveFile(profileImage, 'profile-images');
    }
    
    // Handle hostel images
    const hostelImagesArray = formData.getAll('hostelImages');
    if (!hostelImagesArray || hostelImagesArray.length === 0) {
      return NextResponse.json(
        { message: 'At least one hostel image is required' },
        { status: 400 }
      );
    }
    
    const hostelImageUrls = [];
    for (const image of hostelImagesArray) {
      const imageUrl = await saveFile(image, 'hostel-images');
      hostelImageUrls.push(imageUrl);
    }
    
    // Hash the password before storing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new hostel owner
    const newHostelOwner = new HostelOwner({
      name,
      email,
      password: hashedPassword, // Store hashed password instead of plain text
      phoneNumber,
      idType,
      idNumber,
      profileImage: profileImageUrl,
      
      paymentInfo: {
        momoProvider,
        momoNumber,
        accountName
      },
      
      hostel: {
        hostelName,
        hostelDescription,
        hostelAddress,
        hostelLocation,
        hostelImages: hostelImageUrls,
        amenities,
        policies
      }
    });
    
    // Save to database
    await newHostelOwner.save();
    
    // Generate JWT token for authentication
    const token = generateToken(newHostelOwner._id);
    
    // Return success response
    return NextResponse.json(
      { 
        message: 'Hostel owner registered successfully',
        token, // Include the JWT token in the response
        ownerId: newHostelOwner._id
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Registration error:', error);
    
    return NextResponse.json(
      { message: 'Registration failed', error: error.message },
      { status: 500 }
    );
  }
}