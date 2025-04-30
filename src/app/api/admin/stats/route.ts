// src/app/api/admin/stats/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/dbConnect';
import User from '@/models/User';
import Issue from '@/models/Issues';
import Category from '@/models/Category';
import Comment from '@/models/Comments';

export async function GET() {
  try {
    await connectToDatabase();

    // Basic counts
    const [userCount, issueCount, categoryCount, commentCount] = await Promise.all([
      User.countDocuments(),
      Issue.countDocuments(),
      Category.countDocuments(),
      Comment.countDocuments()
    ]);

    // Users by role
    const usersByRole = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } }
    ]);

    // Issues by status
    const issuesByStatus = await Issue.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // Issues by category
    const issuesByCategory = await Issue.aggregate([
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      { $unwind: '$categoryInfo' },
      { $group: { _id: '$categoryInfo.name', count: { $sum: 1 } } }
    ]);

    // Issues over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const issuesOverTime = await Issue.aggregate([
      {
        $match: {
          created_at: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$created_at" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Top categories by issue count
    const topCategories = await Issue.aggregate([
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      { $unwind: '$categoryInfo' },
      { $group: { _id: '$categoryInfo.name', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Recent issues with details
    const recentIssues = await Issue.find()
      .populate('reported_by', 'name')
      .populate('category', 'name')
      .sort({ created_at: -1 })
      .limit(5)
      .select('title status created_at');

    // Resolution metrics
    const resolvedIssues = await Issue.countDocuments({ status: 'Resolved' });
    const resolvedRate = issueCount > 0 ? (resolvedIssues / issueCount) * 100 : 0;

    // Most active users (by reported issues)
    const mostActiveUsers = await Issue.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'reported_by',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      { $group: { _id: '$userInfo.name', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Issues by priority (if you have priority field)
    const issuesByPriority = await Issue.aggregate([
      { $group: { _id: "$priority", count: { $sum: 1 } } }
    ]);

    // Average response time (if you track this)
    const avgResponseTime = await Issue.aggregate([
      {
        $match: {
          status: "Resolved",
          created_at: { $exists: true },
          resolved_at: { $exists: true }
        }
      },
      {
        $project: {
          responseTime: {
            $divide: [
              { $subtract: ["$resolved_at", "$created_at"] },
              1000 * 60 * 60 // Convert to hours
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgTime: { $avg: "$responseTime" }
        }
      }
    ]);

    return NextResponse.json({
      // Basic stats
      totalCounts: {
        users: userCount,
        issues: issueCount,
        categories: categoryCount,
        comments: commentCount
      },

      // Detailed analytics
      usersByRole,
      issuesByStatus,
      issuesByCategory,
      issuesOverTime,
      topCategories,
      recentIssues,
      resolutionMetrics: {
        resolvedIssues,
        resolvedRate: Math.round(resolvedRate * 100) / 100, // Round to 2 decimal places
        avgResponseTime: avgResponseTime[0]?.avgTime || 0
      },
      mostActiveUsers,
      issuesByPriority
    });

  } catch (error) {
    console.error('Analytics Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}