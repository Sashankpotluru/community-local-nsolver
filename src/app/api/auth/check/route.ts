import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import User from '@/models/User';
import { connectToDatabase } from '@/lib/dbConnect';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET)
    );

    // Find the user in the database
    const user = await User.findOne({ email: payload.email }).lean();
    if (!user) {
      return NextResponse.json({ user: null }, { status: 404 });
    }

    // Remove password before sending
    const { password, ...userWithoutPassword } = user as any;

    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    return NextResponse.json(
      { user: null, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}