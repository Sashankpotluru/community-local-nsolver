// app/api/admin/stats/route.ts
import { NextResponse } from 'next/server';
import {connectToDatabase}  from '@/lib/dbConnect';
import User from '@/models/User';
import Issue from '@/models/Issues';
import Comment from '@/models/Comments';

export async function GET() {
  try {
    await connectToDatabase ();
    
    const [
      totalUsers,
      usersByRole,
      totalIssues,
      issuesByStatus,
      issuesByCategory,
      totalComments,
      recentIssues
    ] = await Promise.all([
      User.countDocuments(),
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]),
      Issue.countDocuments(),
      Issue.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Issue.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      Comment.countDocuments(),
      Issue.find()
        .sort({ created_at: -1 })
        .limit(5)
        .populate('reported_by', 'name')
        .populate('category', 'name')
    ]);

    return NextResponse.json({
      totalUsers,
      usersByRole,
      totalIssues,
      issuesByStatus,
      issuesByCategory,
      totalComments,
      recentIssues
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}