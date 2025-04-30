

// src/app/api/issues/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/dbConnect';
import { registerModels } from '@/models';
import Issue from '@/models/Issues';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';
import User from '@/models/User';

import Category from '@/models/Category';
import Comment from '@/models/Comments';



// --- Types ---
type Coordinates = [number, number]; // [longitude, latitude]

// --- Geocoding with Nominatim ---
async function getCoordinatesFromAddress(address: string): Promise<Coordinates> {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      {
        headers: {
          'User-Agent': 'CrowdsourcedProblemSolver/1.0',
        },
      }
    );
    const data = await response.json();
    if (data && data.length > 0) {
      const lon = parseFloat(data[0].lon);
      const lat = parseFloat(data[0].lat);
      return [lon, lat];
    }
    throw new Error('Location not found');
  } catch (error) {
    console.error('Geocoding error:', error);
    throw new Error('Failed to geocode address');
  }
}

// --- Ensure uploads directory exists ---
async function ensureUploadsDirectory() {
  const uploadDir = path.join(process.cwd(), 'public/uploads');
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }
  return uploadDir;
}

// --- Handle file upload ---
async function handleFileUpload(file: File): Promise<string> {
  try {
    const uploadDir = await ensureUploadsDirectory();
    const timestamp = Date.now();
    const safeFileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filepath = path.join(uploadDir, safeFileName);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);
    return `/uploads/${safeFileName}`;
  } catch (error) {
    console.error('File upload error:', error);
    throw new Error('Failed to upload file');
  }
}

// --- GET: Fetch all issues ---
export async function GET(request: Request) {
  try {
    console.log('GET /api/issues - Started');
    
    // Connect to database and wait for it to complete
    const mongoose = await connectToDatabase();
    console.log('Database connection established');
    
    // Register models
    registerModels();
    console.log('Models registered');

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const assignedTo = searchParams.get('assignedTo');

    console.log('Query parameters:', { userId, role, status, category });

    let query: any = {};

    if (role === 'Citizen' && userId) {
      query.reported_by = userId;
    }
    
    if (status) query.status = status;
    if (category) query.category = category;
    if (assignedTo) {
      query.assigned_to = assignedTo;
    }

    console.log('MongoDB query:', query);

    // Execute the query
    const issues = await Issue.find(query)
      .populate('reported_by', 'name email')
      .populate('category', 'name')
      .populate('assigned_to', 'name')
      .sort({ created_at: -1 })
      .lean();

    console.log(`Found ${issues.length} issues`);
    return NextResponse.json(issues);

  } catch (error) {
    console.error('Error in GET /api/issues:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch issues',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
      },
      { status: 500 }
    );
  }
}

// --- POST: Create a new issue ---
export async function POST(request: Request) {
  try {
    console.log('POST /api/issues - Started');
    await connectToDatabase();
    const formData = await request.formData();

    // Get and log form fields
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const categoryId = formData.get('categoryId') as string;
    const address = formData.get('address') as string;
    const photo = formData.get('photo') as File | null;
    const latitude = formData.get('latitude') as string | null;
    const longitude = formData.get('longitude') as string | null;

    console.log('Received form data:', {
      title,
      description,
      categoryId,
      address,
      hasPhoto: !!photo,
      latitude,
      longitude
    });

    // Validate required fields
    if (!title || !description || !categoryId || !address) {
      console.log('Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get coordinates
    let coordinates: Coordinates;
    if (latitude && longitude) {
      coordinates = [parseFloat(longitude), parseFloat(latitude)];
      if (isNaN(coordinates[0]) || isNaN(coordinates[1])) {
        return NextResponse.json(
          { error: 'Invalid coordinates' },
          { status: 400 }
        );
      }
    } else {
      coordinates = await getCoordinatesFromAddress(address);
    }

    console.log('Coordinates:', coordinates);

    // Handle photo upload
    let photoUrl = '';
    if (photo && photo instanceof File) {
      photoUrl = await handleFileUpload(photo);
      console.log('Photo uploaded:', photoUrl);
    }

    // Get user ID from header
    const userId = request.headers.get('user-id');
    console.log('User ID from header:', userId);

    if (!userId) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    // Create issue
    const issueData = {
      title,
      description,
      photo: photoUrl,
      location: {
        type: 'Point',
        coordinates
      },
      category: categoryId,
      status: 'Reported',
      upvotes: 0,
      reported_by: userId,
      comments: [],
      created_at: new Date(),
      updated_at: new Date()
    };

    console.log('Creating issue with data:', issueData);

    const issue = await Issue.create(issueData);

    // Populate references
    const populatedIssue = await Issue.findById(issue._id)
      .populate('reported_by', 'name email')
      .populate('category', 'name')
      .populate('assigned_to', 'name');

    console.log('Issue created successfully:', populatedIssue._id);

    return NextResponse.json(populatedIssue, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/issues:', error);
    return NextResponse.json(
      { error: 'Failed to create issue' },
      { status: 500 }
    );
  }
}

// --- PATCH: Update issue status or assignment ---
export async function PATCH(request: Request) {
  try {
    console.log('PATCH /api/issues - Started');
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const issueId = searchParams.get('id');
    
    if (!issueId) {
      return NextResponse.json(
        { error: 'Issue ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, assigned_to, volunteerId } = body;
    console.log('Update data:', { issueId, status, assigned_to, volunteerId });

    const updateData: any = { 
      updated_at: new Date(),
      ...(status === 'Resolved' && { resolved_at: new Date() })
    };
    if (status) updateData.status = status;
    if (assigned_to) updateData.assigned_to = assigned_to;

    // Update the issue
    const updatedIssue = await Issue.findByIdAndUpdate(
      issueId,
      updateData,
      { new: true }
    )
      .populate('reported_by', 'name email')
      .populate('category', 'name')
      .populate('assigned_to', 'name');

    if (!updatedIssue) {
      return NextResponse.json(
        { error: 'Issue not found' },
        { status: 404 }
      );
    }

    // If status is changed to "Resolved", update volunteer points
    if (status === 'Resolved' && volunteerId) {
      console.log('Updating volunteer points for:', volunteerId);
      
      try {
        // Update volunteer points and add to resolved issues
        const updatedUser = await User.findByIdAndUpdate(
          volunteerId,
          {
            $inc: { volunteer_points: 1 },
            $addToSet: { resolved_issues: issueId }
          },
          { new: true }
        );

        console.log('Volunteer points updated:', {
          volunteerId,
          newPoints: updatedUser?.volunteer_points
        });

        // Return both updated issue and user points
        return NextResponse.json({
          issue: updatedIssue,
          volunteer_points: updatedUser?.volunteer_points,
          message: 'Issue resolved and point awarded'
        });
      } catch (pointsError) {
        console.error('Error updating volunteer points:', pointsError);
        // Still return the updated issue even if points update fails
        return NextResponse.json({
          issue: updatedIssue,
          error: 'Issue updated but failed to update points'
        });
      }
    }

    console.log('Issue updated successfully:', updatedIssue._id);
    return NextResponse.json({
      issue: updatedIssue,
      message: 'Issue updated successfully'
    });

  } catch (error) {
    console.error('Error in PATCH /api/issues:', error);
    return NextResponse.json(
      { error: 'Failed to update issue' },
      { status: 500 }
    );
  }
}

// --- PUT: Update upvotes ---
export async function PUT(request: Request) {
  try {
    console.log('PUT /api/issues - Started');
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const issueId = searchParams.get('id');
    
    if (!issueId) {
      return NextResponse.json(
        { error: 'Issue ID is required' },
        { status: 400 }
      );
    }

    const issue = await Issue.findByIdAndUpdate(
      issueId,
      { 
        $inc: { upvotes: 1 },
        updated_at: new Date()
      },
      { new: true }
    )
      .populate('reported_by', 'name email')
      .populate('category', 'name');

    if (!issue) {
      return NextResponse.json(
        { error: 'Issue not found' },
        { status: 404 }
      );
    }

    console.log('Issue upvoted successfully:', issue._id);
    return NextResponse.json(issue);
  } catch (error) {
    console.error('Error in PUT /api/issues:', error);
    return NextResponse.json(
      { error: 'Failed to update upvotes' },
      { status: 500 }
    );
  }
}