import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/dbConnect';
import Category from '@/models/Category';

// GET: List all categories
export async function GET() {
  try {
    await connectToDatabase();
    const categories = await Category.find().select('name description icon');
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST: Create a new category
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { name, description, icon } = body;

    // Validation
    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    // Check for duplicate
    const exists = await Category.findOne({ name });
    if (exists) {
      return NextResponse.json(
        { error: 'Category already exists' },
        { status: 400 }
      );
    }

    const category = await Category.create({ name, description, icon });
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}