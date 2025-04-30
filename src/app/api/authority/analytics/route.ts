// app/api/authority/analytics/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/dbConnect';
import Issue from '@/models/Issues';
import User from '@/models/User';

export async function GET() {
  try {
    await connectToDatabase();

    const [monthlyTrends, categoryDistribution, resolutionTimes, statusDistribution, topVolunteers] = await Promise.all([
      // Monthly trends
      Issue.aggregate([
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m", date: "$created_at" }
            },
            reported: { $sum: 1 },
            inProgress: { $sum: { $cond: [{ $eq: ["$status", "In Progress"] }, 1, 0] } },
            resolved: { $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] } }
          }
        },
        { $sort: { "_id": 1 } },
        { $limit: 6 }
      ]),

      // Category distribution
      Issue.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $lookup: { from: "categories", localField: "_id", foreignField: "_id", as: "category" } },
        { $unwind: "$category" },
        { $project: { name: "$category.name", value: "$count" } }
      ]),

      // Resolution times
      Issue.aggregate([
        { $match: { status: "Resolved" } },
        { 
          $project: { 
            category: 1,
            resolutionTime: {
              $divide: [
                { $subtract: ["$resolved_at", "$created_at"] },
                1000 * 60 * 60 * 24 // Convert to days
              ]
            }
          } 
        },
        { $group: { _id: "$category", avgDays: { $avg: "$resolutionTime" } } },
        { $lookup: { from: "categories", localField: "_id", foreignField: "_id", as: "category" } },
        { $unwind: "$category" },
        { $project: { category: "$category.name", avgDays: 1 } }
      ]),

      // Status distribution
      Issue.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $project: { name: "$_id", value: "$count" } }
      ]),

      // Top volunteers
      User.aggregate([
        { $match: { role: "Volunteer" } },
        { $sort: { volunteer_points: -1 } },
        { $limit: 5 },
        { $project: { 
          name: 1,
          resolvedIssues: { $size: "$resolved_issues" },
          points: "$volunteer_points"
        }}
      ])
    ]);

    return NextResponse.json({
      monthlyTrends,
      categoryDistribution,
      resolutionTimes,
      statusDistribution,
      topVolunteers,
      geoDistribution: [] // Add geospatial aggregation if you have coordinates
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}