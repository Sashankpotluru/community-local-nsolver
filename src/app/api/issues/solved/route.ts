import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/dbConnect';
import Issue from '@/models/Issues';
import type { PipelineStage } from 'mongoose';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);

    // Build the base query
    const pipeline: PipelineStage[] = [];
    const matchStage: Record<string, any> = { status: 'Resolved' };

    // Date Filter
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    if (startDate && endDate) {
      matchStage.resolved_at = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Category Filter
    const category = searchParams.get('category');
    if (category) matchStage.category = category;

    // Assigned Authority Filter
    const assignedTo = searchParams.get('assignedTo');
    if (assignedTo) matchStage.assigned_to = assignedTo;

    // Keyword Search
    const keyword = searchParams.get('keyword');
    if (keyword) {
      matchStage.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { 'comments.text': { $regex: keyword, $options: 'i' } },
        { 'reported_by.name': { $regex: keyword, $options: 'i' } }
      ];
    }

    pipeline.push({ $match: matchStage });

    // Join with Users collection (reported_by)
    pipeline.push({
      $lookup: {
        from: 'users',
        localField: 'reported_by',
        foreignField: '_id',
        as: 'reported_by'
      }
    });
    pipeline.push({ $unwind: '$reported_by' });

    // Join with Categories collection
    pipeline.push({
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'category'
      }
    });
    pipeline.push({ $unwind: '$category' });

    // Join with Users collection (assigned_to)
    pipeline.push({
      $lookup: {
        from: 'users',
        localField: 'assigned_to',
        foreignField: '_id',
        as: 'assigned_to'
      }
    });
    pipeline.push({ $unwind: { path: '$assigned_to', preserveNullAndEmptyArrays: true } });

    // Project final fields
    pipeline.push({
      $project: {
        title: 1,
        description: 1,
        category: { _id: 1, name: 1 },
        reported_by: { _id: 1, name: 1 },
        assigned_to: { _id: 1, name: 1 },
        created_at: 1,
        resolved_at: 1,
        comments: 1
      }
    });

    pipeline.push({ $sort: { resolved_at: -1 } });

    const issues = await Issue.aggregate(pipeline);
    return NextResponse.json(issues);

  } catch (error) {
    console.error('Solved Issues Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch solved issues' },
      { status: 500 }
    );
  }
}