// app/api/auth/signup/route.js
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  try {
    const { name, email, studentId, phoneNumber, password, role } = await req.json();
    
    await connectDB();
    
    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [
        { email },
        { studentId }
      ]
    });
    
    if (existingUser) {
      if (existingUser.email === email) {
        return Response.json(
          { message: 'Email already in use' },
          { status: 400 }
        );
      }
      
      if (existingUser.studentId === studentId) {
        return Response.json(
          { message: 'Student ID already registered' },
          { status: 400 }
        );
      }
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const user = new User({
      name,
      email,
      studentId,
      phoneNumber,
      password: hashedPassword,
      role: role || 'student'
    });
    
    await user.save();
    
    return Response.json(
      { message: 'User registered successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return Response.json(
      { message: 'Failed to register user' },
      { status: 500 }
    );
  }
}

// app/api/auth/login/route.js
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(req) {
  try {
    const { email, password, rememberMe } = await req.json();
    
    await connectDB();
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return Response.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return Response.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: rememberMe ? '7d' : '24h' }
    );
    
    // Set cookie
    const cookieStore = cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: rememberMe ? 7 * 24 * 60 * 60 : 24 * 60 * 60, // 7 days or 24 hours
      path: '/'
    });
    
    return Response.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return Response.json(
      { message: 'Failed to authenticate' },
      { status: 500 }
    );
  }
}

// app/api/auth/logout/route.js
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = cookies();
  
  // Clear the auth cookie
  cookieStore.set('auth_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(0),
    path: '/'
  });
  
  return Response.json({ message: 'Logged out successfully' });
}