'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart, Bar,
  LineChart, Line, Area, AreaChart,
  PieChart, Pie, Cell,
  Radar, RadarChart, PolarGrid, PolarAngleAxis,
  RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,ResponsiveContainer,
} from 'recharts';
import { Parser } from 'json2csv';
import { saveAs } from 'file-saver';
import { FaDownload } from 'react-icons/fa';
import clsx from 'clsx';

// Update the Issue interface to match your API response
interface Issue {
    _id: string;
    title: string;
    description: string;
    status: 'Reported' | 'In Progress' | 'Resolved';
    category: {
      _id: string;
      name: string;
    };
    assigned_to?: {
      _id: string;
      name: string;
    } | string;
    reported_by: {
      _id: string;
      name: string;
    } | string;
    created_at: string;
    updated_at: string;
    location?: {
      type: 'Point';
      coordinates: [number, number];
    };
  }

  // Update the Volunteer interface
  interface Volunteer {
    _id: string;
    name: string;
    email: string;
    role: 'Volunteer';
    status: 'active' | 'inactive' | 'suspended';
    volunteer_points: number;
  }

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#845EC2', '#4B4453'];

export default function VolunteerAnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [allIssues, setAllIssues] = useState<Issue[]>([]);
  const [volunteer, setVolunteer] = useState<Volunteer | null>(null);
  const [error, setError] = useState('');
  // Add this type for the CSV export
type CSVIssue = {
    title: string;
    status: string;
    category: string;
    created_at: string;
    updated_at: string;
  };
  /****************  DATA FETCH  ****************/
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. First get current user from cookie-based auth
        const userRes = await fetch('/api/CurrentUser');
        if (!userRes.ok) {
          throw new Error('Not authenticated');
        }
        
        const { user } = await userRes.json();
        console.log('Current user:', user);

        if (user.role !== 'Volunteer') {
          console.log('User is not a volunteer');
          return router.push('/login');
        }

        // 2. Fetch volunteer profile with points
        const volunteerRes = await fetch(`/api/users/${user._id}`);
        if (!volunteerRes.ok) {
          throw new Error('Failed to fetch volunteer profile');
        }
        const volunteerData = await volunteerRes.json();
        console.log('Volunteer data:', volunteerData);
        setVolunteer(volunteerData);

        // 3. Fetch ALL issues
        const issuesRes = await fetch('/api/issues');
        if (!issuesRes.ok) {
          throw new Error('Failed to fetch issues');
        }
        const issuesData: Issue[] = await issuesRes.json();
        console.log('All issues:', issuesData);
        setAllIssues(issuesData);

        // 4. Filter issues for this volunteer
        const myIssues = issuesData.filter((issue: Issue) => {
          const assignedId = typeof issue.assigned_to === 'object' 
            ? issue.assigned_to?._id 
            : issue.assigned_to;
          return assignedId === user._id;
        });
        console.log('Filtered volunteer issues:', myIssues);
        setIssues(myIssues);

      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load analytics');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  /****************  COMPUTED METRICS  ****************/
  const stats = useMemo(() => {
    const taken = issues.length;
    const resolved = issues.filter(i => i.status === 'Resolved').length;
    const inProgress = issues.filter(i => i.status === 'In Progress').length;
    const reported = issues.filter(i => i.status === 'Reported').length;

    // monthly trend of resolved
    const monthlyMap: Record<string, number> = {};
    issues
      .filter(i => i.status === 'Resolved')
      .forEach(i => {
        const m = new Date(i.updated_at).toLocaleString('default', {
          month: 'short',
          year: '2-digit',
        });
        monthlyMap[m] = (monthlyMap[m] || 0) + 1;
      });
    const monthlyTrend = Object.entries(monthlyMap)
      .sort(
        (a, b) =>
          new Date('1 ' + a[0]).getTime() - new Date('1 ' + b[0]).getTime()
      )
      .map(([month, count]) => ({ month, count }));

    // category breakdown (volunteer-specific)
    const catMap: Record<string, number> = {};
    issues.forEach(i => {
      const c = i.category?.name ?? 'Other';
      catMap[c] = (catMap[c] || 0) + 1;
    });
    const catBreakdown = Object.entries(catMap).map(([name, value]) => ({
      name,
      value,
    }));

    // status distribution for volunteer
    const statusBreakdown = [
      { name: 'Reported', value: reported },
      { name: 'In Progress', value: inProgress },
      { name: 'Resolved', value: resolved },
    ];

    /***** COMMUNITY-WIDE ******/
    const communityStatus = ['Reported', 'In Progress', 'Resolved'].map(s => ({
      name: s,
      value: allIssues.filter(i => i.status === s).length,
    }));

    const commCatMap: Record<string, number> = {};
    allIssues.forEach(i => {
      const c = i.category?.name ?? 'Other';
      commCatMap[c] = (commCatMap[c] || 0) + 1;
    });
    const communityCat = Object.entries(commCatMap).map(([name, value]) => ({
      name,
      value,
    }));

    const communityTrendMap: Record<string, number> = {};
    allIssues.forEach(i => {
      const m = new Date(i.created_at).toLocaleString('default', {
        month: 'short',
        year: '2-digit',
      });
      communityTrendMap[m] = (communityTrendMap[m] || 0) + 1;
    });
    const communityTrend = Object.entries(communityTrendMap)
      .sort(
        (a, b) =>
          new Date('1 ' + a[0]).getTime() - new Date('1 ' + b[0]).getTime()
      )
      .map(([month, count]) => ({ month, count }));

    return {
      taken,
      resolved,
      inProgress,
      reported,
      monthlyTrend,
      catBreakdown,
      statusBreakdown,
      communityStatus,
      communityCat,
      communityTrend,
    };
  }, [issues, allIssues]);

  /****************  CSV EXPORT  ****************/
  const exportCSV = () => {
    try {
      const csvData: CSVIssue[] = issues.map(issue => ({
        title: issue.title,
        status: issue.status,
        category: typeof issue.category === 'object' ? issue.category.name : 'Unknown',
        created_at: new Date(issue.created_at).toLocaleDateString(),
        updated_at: new Date(issue.updated_at).toLocaleDateString()
      }));

      const fields = ['title', 'status', 'category', 'created_at', 'updated_at'];
      const opts = { fields };
      const parser = new Parser(opts);
      
      const csv = parser.parse(csvData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, `volunteer_issues_${new Date().toISOString().split('T')[0]}.csv`);
    } catch (error) {
      console.error('Failed to export CSV:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  /****************  UI  ****************/
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Volunteer Analytics
        </h1>
        <button
          onClick={exportCSV}
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <FaDownload className="mr-2" /> Export CSV
        </button>
      </header>

      {/* KPI CARDS */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Taken Up', value: stats.taken },
          { label: 'Resolved', value: stats.resolved },
          { label: 'In Progress', value: stats.inProgress },
          { label: 'Points', value: volunteer?.volunteer_points ?? 0 },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-white shadow rounded p-4 flex flex-col items-center justify-center"
          >
            <span className="text-gray-500">{label}</span>
            <span className="text-3xl font-bold text-blue-600">{value}</span>
          </div>
        ))}
      </section>

      <section className="space-y-12">
        {/* 1. Bar: Taken vs Resolved */}
        <ChartCard title="Taken vs Resolved">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[{
              name: 'Issues',
              Taken: stats.taken,
              Resolved: stats.resolved,
            }]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false}/>
              <Tooltip />
              <Legend />
              <Bar dataKey="Taken" fill="#0088FE" />
              <Bar dataKey="Resolved" fill="#00C49F" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 2. Line: Resolved per Month */}
        <ChartCard title="Issues Resolved per Month">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#00C49F" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 3. Pie: Category Breakdown */}
        <ChartCard title="Category Breakdown (You)">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.catBreakdown}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {stats.catBreakdown.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 4. Radar: Status Distribution */}
        <ChartCard title="Status Distribution (You)">
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={stats.statusBreakdown}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" />
              <Radar 
                dataKey="value" 
                stroke="#845EC2" 
                fill="#845EC2" 
                fillOpacity={0.6} 
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 5. Points Display (replacing RadialBar) */}
        <ChartCard title="Points Progress">
          <div className="flex flex-col items-center justify-center h-[300px]">
            <div className="text-6xl font-bold text-blue-600">
              {volunteer?.volunteer_points ?? 0}
            </div>
            <div className="text-gray-500 mt-2">Total Points</div>
          </div>
        </ChartCard>

        {/* 6. Community Categories */}
        <ChartCard title="Community: Category Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.communityCat}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {stats.communityCat.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* 7. Community Trend */}
        <ChartCard title="Community: Issues Reported per Month">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={stats.communityTrend}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorComm" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFBB28" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#FFBB28" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false}/>
              <Tooltip />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#FFBB28"
                fillOpacity={1}
                fill="url(#colorComm)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>
    </div>
  );
}

/****************  HELPER COMPONENT  ****************/
function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white shadow rounded-md p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">{title}</h3>
      <div className="w-full flex justify-center">{children}</div>
    </div>
  );
}