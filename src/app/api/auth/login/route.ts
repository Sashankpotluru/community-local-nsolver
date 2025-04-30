// app/api/login/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { connectToDatabase } from '@/lib/dbConnect';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    console.log('Login attempt started');
    await connectToDatabase();
    const { email, password } = await request.json();

    const user = await User.findOne({ email });
    console.log('User found:', user ? 'Yes' : 'No');
    if (!user) {
      console.log('User not found in database');
      return NextResponse.json(
        { message: 'User not found. Please create an account.' },
        { status: 404 }
      );
    }
    // Check user status
    if (user.status === 'suspended') {
      console.log('User account is suspended');
      return NextResponse.json(
        { message: 'Your account has been suspended. Please contact support for assistance.' },
        { status: 403 }
      );
    }

    if (user.status === 'inactive') {
      console.log('User account is inactive');
      return NextResponse.json(
        { message: 'Your account is currently inactive. Please contact support to reactivate your account.' },
        { status: 403 }
      );
    }
    console.log('Comparing passwords');
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch ? 'Yes' : 'No');
    if (!isMatch) {
      console.log('Password does not match');
      return NextResponse.json(
        { message: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Remove password from response
    const userResponse = user.toJSON();
    delete userResponse.password;

    // Generate JWT token
    if (!process.env.JWT_SECRET) {
      console.log('JWT_SECRET is missing');
      throw new Error('JWT_SECRET is not defined');
    }
    console.log('Generating JWT token');
    const token = await new SignJWT({ 
      userId: user._id.toString(),
      email: user.email,
      role: user.role 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(new TextEncoder().encode(process.env.JWT_SECRET));
      console.log('Token generated successfully');
    // Create the response
    const response = NextResponse.json(
      { message: 'Login successful', user: {
        ...userResponse,
        status: user.status // Explicitly include status in response
      }},
      { status: 200 }
    );

    // Set the token as an HTTP-only cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 24 hours
    });
    console.log('Login successful, returning response');
    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Login failed', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}