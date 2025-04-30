// app/api/authority/stats/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/dbConnect';
import Issue from '@/models/Issues';
import User from '@/models/User';

export async function GET() {
  try {
    await connectToDatabase();

    // Authority-specific stats
    const [pending, inProgress, resolved] = await Promise.all([
      Issue.countDocuments({ status: 'Reported' }),
      Issue.countDocuments({ status: 'In Progress' }),
      Issue.countDocuments({ status: 'Resolved' })
    ]);

    // Resolution metrics (using your existing aggregation)
    const resolutionMetrics = await Issue.aggregate([
      {
        $match: { status: "Resolved" }
      },
      {
        $group: {
          _id: null,
          totalResolved: { $sum: 1 },
          avgResolution: { 
            $avg: {
              $divide: [
                { $subtract: ["$resolved_at", "$created_at"] },
                1000 * 60 * 60 * 24 // Convert to days
              ]
            }
          }
        }
      }
    ]);
    const satisfactionMetrics = await Issue.aggregate([
        {
          $match: { status: "Resolved" }
        },
        {
          $group: {
            _id: null,
            avgSatisfaction: { $avg: "$satisfactionScore" }
          }
        }
      ]);
      
      

    // User statistics
    const userStats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalVolunteers: { 
            $sum: { $cond: [{ $eq: ["$role", "Volunteer"] }, 1, 0] } 
          },
          totalCitizens: { 
            $sum: { $cond: [{ $eq: ["$role", "Citizen"] }, 1, 0] } 
          }
        }
      }
    ]);

    return NextResponse.json({
      pending,
      inProgress,
      resolved,
      total: pending + inProgress + resolved,
      avgResolution: resolutionMetrics[0]?.avgResolution?.toFixed(1) || 0,
     
      satisfaction: satisfactionMetrics[0]?.avgSatisfaction?.toFixed(1) || 0, 
      ...userStats[0]
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch authority stats' },
      { status: 500 }
    );
  }
}