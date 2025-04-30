// src/app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Create response with success message
    const response = NextResponse.json({ 
      success: true,
      message: 'Logged out successfully' 
    });

    // Clear the auth token with correct typing
    response.cookies.delete({
      name: 'token',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to logout' 
      },
      { status: 500 }
    );
  }
}