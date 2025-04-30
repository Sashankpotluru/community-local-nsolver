import { NextResponse } from 'next/server';
import { testConnection } from '@/lib/dbConnect';

export async function GET() {
  try {
    await testConnection();
    return NextResponse.json({ 
      message: 'Database connection successful' 
    });
  } catch (error) {
    console.error('Database connection failed:', error);
    return NextResponse.json(
      { error: 'Failed to connect to database' },
      { status: 500 }
    );
  }
}