// app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import HostelOwner from '@/models/HostelOwner';
import { generateToken } from '@/lib/jwt';
import { connectToDB } from '@/app/utils/db/db';

export async function POST(request) {
  try {
    // Connect to database
    await connectToDB();
    
    // Parse request body
    const { email, password } = await request.json();
    
    // Validate inputs
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Find the hostel owner by email
    const hostelOwner = await HostelOwner.findOne({ email }).select('+password');
    
    if (!hostelOwner) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Check if password matches
    const isMatch = await hostelOwner.matchPassword(password);
    
    if (!isMatch) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Check if account is active
    if (!hostelOwner.isActive) {
      return NextResponse.json(
        { message: 'Account is inactive. Please contact support.' },
        { status: 403 }
      );
    }
    
    // Generate token
    const token = generateToken(hostelOwner._id);
    
    // Create response
    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: hostelOwner._id,
        name: hostelOwner.name,
        email: hostelOwner.email,
        isVerified: hostelOwner.isVerified
      },
      token
    });
    
    // Set cookie for client-side auth
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/'
    });
    
    return response;
    
  } catch (error) {
    console.error('Login error:', error);
    
    return NextResponse.json(
      { message: 'Login failed', error: error.message },
      { status: 500 }
    );
  }
}