import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/dbConnect';
import Category from '@/models/Category';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectToDatabase();
  const category = await Category.findById(params.id);
  if (!category) {
    return NextResponse.json({ message: 'Category not found' }, { status: 404 });
  }
  return NextResponse.json(category);
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectToDatabase();
  const body = await req.json();
  const category = await Category.findByIdAndUpdate(params.id, body, { new: true });
  if (!category) {
    return NextResponse.json({ message: 'Category not found' }, { status: 404 });
  }
  return NextResponse.json(category);
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectToDatabase();
  const category = await Category.findByIdAndDelete(params.id);
  if (!category) {
    return NextResponse.json({ message: 'Category not found' }, { status: 404 });
  }
  return NextResponse.json({ message: 'Category deleted' });
}



// import { NextResponse } from 'next/server';
// import { connectToDatabase } from '@/lib/dbConnect';
// import Category from '@/models/Category';

// // Correct type for [id] dynamic route
// export async function GET(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   await connectToDatabase();
//   const category = await Category.findById(params.id);
//   if (!category) {
//     return NextResponse.json({ message: 'Category not found' }, { status: 404 });
//   }
//   return NextResponse.json(category);
// }

// export async function PUT(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   await connectToDatabase();
//   const body = await req.json();
//   const category = await Category.findByIdAndUpdate(params.id, body, { new: true });
//   if (!category) {
//     return NextResponse.json({ message: 'Category not found' }, { status: 404 });
//   }
//   return NextResponse.json(category);
// }

// export async function DELETE(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   await connectToDatabase();
//   const category = await Category.findByIdAndDelete(params.id);
//   if (!category) {
//     return NextResponse.json({ message: 'Category not found' }, { status: 404 });
//   }
//   return NextResponse.json({ message: 'Category deleted' });
// }