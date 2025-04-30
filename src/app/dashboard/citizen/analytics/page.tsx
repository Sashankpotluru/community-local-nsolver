'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { format, parseISO, subMonths, startOfMonth } from 'date-fns';

interface Issue {
    _id: string;
    title: string;
    status: 'Reported' | 'In Progress' | 'Resolved';
    category: {
      name: string;
    };
    created_at: string;
    updated_at: string;
    reported_by: {
      _id: string;
      name: string;
      email: string;
    } | string; // Can be either an object (when populated) or a string (when not populated)
  }
interface ChartData {
  statusDistribution: { name: string; value: number; }[];
  categoryDistribution: { name: string; count: number; }[];
  monthlyTrends: { date: string; count: number; }[];
  resolutionTimes: { category: string; avgDays: number; }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function CitizenAnalytics() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [issues, setIssues] = useState<Issue[]>([]);
  const [chartData, setChartData] = useState<ChartData>({
    statusDistribution: [],
    categoryDistribution: [],
    monthlyTrends: [],
    resolutionTimes: []
  });

  useEffect(() => {
    const fetchAndProcessData = async () => {
      try {
        const userData = localStorage.getItem('user');
        if (!userData) {
          router.push('/login');
          return;
        }

        const parsedUser = JSON.parse(userData);
        if (!parsedUser.role || parsedUser.role !== 'Citizen') {
          router.push('/login');
          return;
        }

        const response = await fetch(`/api/issues?userId=${parsedUser.id}&role=Citizen`);
        if (!response.ok) {
          throw new Error('Failed to fetch issues');
        }

        const data = await response.json();
        const userIssues = data.filter((issue: Issue) => {
            if (typeof issue.reported_by === 'object' && issue.reported_by !== null) {
              return issue.reported_by._id === parsedUser.id;
            }
            return issue.reported_by === parsedUser.id;
          });

        setIssues(userIssues);
        processChartData(userIssues);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAndProcessData();
  }, [router]);

  const processChartData = (issues: Issue[]) => {
    // Status Distribution
    const statusCount = issues.reduce((acc: any, issue) => {
      acc[issue.status] = (acc[issue.status] || 0) + 1;
      return acc;
    }, {});

    const statusDistribution = Object.entries(statusCount).map(([name, value]) => ({
      name,
      value: value as number
    }));

    // Category Distribution
    const categoryCount = issues.reduce((acc: any, issue) => {
      const category = issue.category?.name || 'Uncategorized';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    const categoryDistribution = Object.entries(categoryCount).map(([name, count]) => ({
      name,
      count: count as number
    }));

    // Monthly Trends
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), i);
      return format(startOfMonth(date), 'yyyy-MM');
    }).reverse();

    const monthlyTrends = last6Months.map(month => ({
      date: month,
      count: issues.filter(issue => 
        format(parseISO(issue.created_at), 'yyyy-MM') === month
      ).length
    }));

    // Average Resolution Times by Category
    const resolutionTimes = Object.entries(categoryCount).map(([category]) => {
      const categoryIssues = issues.filter(issue => 
        issue.category?.name === category && issue.status === 'Resolved'
      );

      const avgDays = categoryIssues.length > 0
        ? categoryIssues.reduce((sum, issue) => {
            const created = new Date(issue.created_at).getTime();
            const resolved = new Date(issue.updated_at).getTime();
            return sum + (resolved - created) / (1000 * 60 * 60 * 24);
          }, 0) / categoryIssues.length
        : 0;

      return {
        category,
        avgDays: Math.round(avgDays * 10) / 10
      };
    });

    setChartData({
      statusDistribution,
      categoryDistribution,
      monthlyTrends,
      resolutionTimes
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Issue Analytics</h1>
          <button 
            onClick={() => router.push('/dashboard/citizen')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md transition-colors"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Status Distribution */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Status Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.statusDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {chartData.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Category Distribution */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Issues by Category</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.categoryDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Trends */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Monthly Reporting Trends</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="count" fill="#8884d8" stroke="#8884d8" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Resolution Times */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Average Resolution Time by Category</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.resolutionTimes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="avgDays" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Resolution Rate</h3>
            <p className="text-3xl font-bold text-blue-600">
              {Math.round((chartData.statusDistribution.find(s => s.name === 'Resolved')?.value || 0) / 
                issues.length * 100)}%
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Average Resolution Time</h3>
            <p className="text-3xl font-bold text-green-600">
              {Math.round(chartData.resolutionTimes.reduce((sum, cat) => sum + cat.avgDays, 0) / 
                chartData.resolutionTimes.length)} days
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">Most Common Category</h3>
            <p className="text-3xl font-bold text-purple-600">
              {chartData.categoryDistribution.sort((a, b) => b.count - a.count)[0]?.name || 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}