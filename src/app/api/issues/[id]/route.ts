// src/app/api/issues/[id]/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/dbConnect';
import Issue from '@/models/Issues';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const { id } = params;
    const { status } = await req.json();

    // Validate status
    if (!['Reported', 'In Progress', 'Resolved'].includes(status)) {
      return NextResponse.json(
        { message: 'Invalid status value' }, 
        { status: 400 }
      );
    }

    const issue = await Issue.findByIdAndUpdate(
      id,
      { 
        status,
        updated_at: new Date()
      },
      { new: true }
    )
    .populate('reported_by', 'name email')
    .populate('assigned_to', 'name role')
    .populate('category', 'name icon');

    if (!issue) {
      return NextResponse.json(
        { message: 'Issue not found' }, 
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Issue status updated successfully',
      issue
    });

  } catch (error) {
    console.error('Error updating issue status:', error);
    return NextResponse.json(
      { message: 'Failed to update issue status' },
      { status: 500 }
    );
  }
}

// GET single issue
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const { id } = params;

    const issue = await Issue.findById(id)
      .populate('reported_by', 'name email')
      .populate('assigned_to', 'name role')
      .populate('category', 'name icon');

    if (!issue) {
      return NextResponse.json(
        { message: 'Issue not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(issue);

  } catch (error) {
    console.error('Error fetching issue:', error);
    return NextResponse.json(
      { message: 'Failed to fetch issue' },
      { status: 500 }
    );
  }
}

// Optional: DELETE method if you want to add delete functionality
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const { id } = params;

    const issue = await Issue.findByIdAndDelete(id);

    if (!issue) {
      return NextResponse.json(
        { message: 'Issue not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Issue deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting issue:', error);
    return NextResponse.json(
      { message: 'Failed to delete issue' },
      { status: 500 }
    );
  }
}