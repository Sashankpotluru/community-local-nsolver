// app/dashboard/authority/solved-issues/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaSearch, FaFilter, FaCalendar, FaUser, FaComments } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface SolvedIssue {
  _id: string;
  title: string;
  description: string;
  category: {
    _id: string;
    name: string;
  };
  reported_by: {
    _id: string;
    name: string;
  };
  assigned_to: {
    _id: string;
    name: string;
  };
  created_at: string;
  resolved_at: string;
  comments: Array<{
    text: string;
    user: {
      name: string;
    };
    created_at: string;
  }>;
  status: 'Resolved';
}

export default function SolvedIssuesPage() {
  const router = useRouter();
  const [issues, setIssues] = useState<SolvedIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState<{
    keyword: string;
    startDate: Date | null;
    endDate: Date | null;
    category: string;
    assignedTo: string;
  }>({
    keyword: '',
    startDate: null,
    endDate: null,
    category: '',
    assignedTo: ''
  });
  const [categories, setCategories] = useState<Array<{ _id: string; name: string }>>([]);
  const [authorities, setAuthorities] = useState<Array<{ _id: string; name: string }>>([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [issuesRes, categoriesRes, authoritiesRes] = await Promise.all([
          fetch('/api/issues/solved'),
          fetch('/api/categories'),
          fetch('/api/users?role=Authority')
        ]);

        const [issuesData, categoriesData, authoritiesData] = await Promise.all([
          issuesRes.json(),
          categoriesRes.json(),
          authoritiesRes.json()
        ]);

        setIssues(issuesData);
        setCategories(categoriesData);
        setAuthorities(authoritiesData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);
  const handleClearFilters = async () => {
    setSearchParams({
      keyword: '',
      startDate: null,
      endDate: null,
      category: '',
      assignedTo: ''
    });
  
    // Fetch all issues without filters
    try {
      const res = await fetch('/api/issues/solved');
      const data = await res.json();
      setIssues(data);
    } catch (error) {
      console.error('Failed to clear filters:', error);
    }
  };
  const handleSearch = async () => {
    try {
      const params = new URLSearchParams();
      if (searchParams.keyword) params.append('keyword', searchParams.keyword);
      if (searchParams.startDate) params.append('startDate', searchParams.startDate.toISOString());
      if (searchParams.endDate) params.append('endDate', searchParams.endDate.toISOString());
      if (searchParams.category) params.append('category', searchParams.category);
      if (searchParams.assignedTo) params.append('assignedTo', searchParams.assignedTo);
  
      const res = await fetch(`/api/issues/solved?${params.toString()}`);
      const data = await res.json();
      setIssues(data);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Solved Issues</h1>
        <button
            onClick={() => router.push('/dashboard/authority')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md transition-colors"
          >
            Back to Dashboard
          </button>

        {/* Search Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Keyword Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search issues..."
                className="pl-10 pr-4 py-2 w-full border rounded-md"
                value={searchParams.keyword}
                onChange={(e) => setSearchParams({...searchParams, keyword: e.target.value})}
              />
            </div>

            {/* Date Range */}
            <div className="relative">
              <FaCalendar className="absolute left-3 top-3 text-gray-400" />
              
<DatePicker
  selectsRange
  startDate={searchParams.startDate}
  endDate={searchParams.endDate}
  onChange={update => {
    const [start, end] = update || [null, null];
    setSearchParams(prev => ({
      ...prev,
      startDate: start,
      endDate: end
    }));
  }}
  placeholderText="Select date range"
  className="pl-10 pr-4 py-2 w-full border rounded-md"
  isClearable
/>
            </div>

            {/* Category Filter */}
            <div className="relative">
              <FaFilter className="absolute left-3 top-3 text-gray-400" />
              <select
                className="pl-10 pr-4 py-2 w-full border rounded-md"
                value={searchParams.category}
                onChange={(e) => setSearchParams({...searchParams, category: e.target.value})}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Assigned Authority Filter */}
            <div className="relative">
              <FaUser className="absolute left-3 top-3 text-gray-400" />
              <select
                className="pl-10 pr-4 py-2 w-full border rounded-md"
                value={searchParams.assignedTo}
                onChange={(e) => setSearchParams({...searchParams, assignedTo: e.target.value})}
              >
                <option value="">All Authorities</option>
                {authorities.map(authority => (
                  <option key={authority._id} value={authority._id}>
                    {authority.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
          >
            Apply Filters
          </button>
          <button
    onClick={handleClearFilters}
    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-md transition-colors"
  >
    Clear Filters
  </button>
        </div>

        {/* Issues List */}
        <div className="space-y-4">
          {issues.map(issue => (
            <div key={issue._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{issue.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {issue.category.name} • Resolved on {new Date(issue.resolved_at).toLocaleDateString()}
                  </p>
                </div>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  Resolved
                </span>
              </div>

              <p className="text-gray-600 mb-4">{issue.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                <div>
                  <FaUser className="inline-block mr-2" />
                  <span className="font-medium">Reported by:</span> {issue.reported_by.name}
                </div>
                <div>
                  <FaUser className="inline-block mr-2" />
                  <span className="font-medium">Assigned to:</span> {issue.assigned_to?.name || 'N/A'}
                </div>
                <div>
                  <FaCalendar className="inline-block mr-2" />
                  <span className="font-medium">Reported on:</span> {new Date(issue.created_at).toLocaleDateString()}
                </div>
                <div>
                  <FaComments className="inline-block mr-2" />
                  <span className="font-medium">Comments:</span> {issue.comments.length}
                </div>
              </div>
            </div>
          ))}

          {issues.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">No solved issues found matching your criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}