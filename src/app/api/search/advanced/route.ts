import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/dbConnect';     // your helper
import Issue     from '@/models/Issues';                 // base collection
import Category  from '@/models/Category';               // joined via $lookup
import User      from '@/models/User';                   // joined via $lookup

// GET /api/search/advanced?kw=&status=&category=&from=&to=
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const url      = new URL(req.url);
    const kw       = url.searchParams.get('kw')?.trim();           // keyword
    const status   = url.searchParams.get('status');               // exact
    const catName  = url.searchParams.get('category');             // partial
    const fromStr  = url.searchParams.get('from');                 // ISO dates 
    const toStr    = url.searchParams.get('to');

    // build first-stage filter on Issues
    const match: any = {};
    if (status) match.status = status;
    if (fromStr || toStr) {
      match.created_at = {};
      if (fromStr) match.created_at.$gte = new Date(fromStr);
      if (toStr)   match.created_at.$lte = new Date(toStr);
    }

    const pipeline: any[] = [
      { $match: match },

      // Categories ↔ Issues
      { $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category'
        }},
      { $unwind: '$category' },

      // Users (reporter) ↔ Issues
      { $lookup: {
          from: 'users',
          localField: 'reported_by',
          foreignField: '_id',
          as: 'reporter'
        }},
      { $unwind: '$reporter' }
    ];

    /* dynamic filters after the joins ------------------------------------ */
    const postMatch: any = {};

    // keyword searches title / description / reporter.name (case-insensitive)
    if (kw) {
      const regex = new RegExp(kw, 'i');
      postMatch.$or = [
        { title:       regex },
        { description: regex },
        { 'reporter.name': regex }
      ];
    }

    // category substring filter
    if (catName) postMatch['category.name'] = new RegExp(catName, 'i');

    if (Object.keys(postMatch).length) pipeline.push({ $match: postMatch });

    /* shape the final fields --------------------------------------------- */
    pipeline.push({
      $project: {
        _id: 1,
        title: 1,
        status: 1,
        created_at: 1,
        'category.name': 1,
        'reporter.name': 1,
        'reporter.email': 1,
        shortDesc: { $substr: ['$description', 0, 120] }
      }
    });

    const results = await Issue.aggregate(pipeline).exec();
    return NextResponse.json({ count: results.length, results });

  } catch (err) {
    console.error('Advanced search error:', err);
    return NextResponse.json(
      { message: 'Search failed' },
      { status: 500 }
    );
  }
}