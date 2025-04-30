import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/dbConnect';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    console.log('Register request body:', body);
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: body.email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 10);

    // Create user
    const user = await User.create({
      ...body,
      password: hashedPassword,
      status: 'active',
      created_at: new Date(),
    });

    await user.validate(); // Explicitly validate to catch errors before save

    await user.save();

    // Remove password from response
    const userResponse = user.toJSON();
    delete userResponse.password;

    return NextResponse.json(
      { message: 'User registered successfully', user: userResponse },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Registration failed', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}