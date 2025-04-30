// app/api/users/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/dbConnect';
import User from '@/models/User';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const roleQuery = searchParams.get('role');
    
    // Build the filter query
    const filter: any = {};
    
    if (roleQuery) {
      const roles = roleQuery.split(',').map(role => 
        role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
      );
      filter.role = { $in: roles };
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ created_at: -1 })
      .lean();

    return NextResponse.json(users);
  } catch (error) {
    console.error('Users API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}