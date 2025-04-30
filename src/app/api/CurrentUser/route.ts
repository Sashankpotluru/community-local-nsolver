// app/api/CurrentUser/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import User, { IUser } from '@/models/User'; // Import IUser interface
import { connectToDatabase } from '@/lib/dbConnect';
import { Types } from 'mongoose';

// Define lean version of IUser to handle ObjectId conversion
type IUserLean = Omit<IUser, '_id' | 'createdAt' | 'updatedAt'> & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};

export async function GET() {
  try {
    // Get cookies and verify token
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'No authentication token found' },
        { status: 401 }
      );
    }

    // Verify JWT token
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET!)
    );

    // Validate payload structure
    if (!payload.userId || typeof payload.userId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid user ID in token' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Convert user ID to Mongoose ObjectId
    const userId = new Types.ObjectId(payload.userId);

    // Fetch user data with proper typing
    const user = await User.findById(userId)
      .select('-password')
      .lean<IUserLean>()
      .exec();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return sanitized user data
    return NextResponse.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        volunteer_points: user.volunteer_points,
        created_at: user.created_at.toISOString(),
        last_login: user.last_login?.toISOString(),
        profile_image: user.profile_image,
        preferences: user.preferences
      }
    });

  } catch (error) {
    console.error('CurrentUser API Error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
}