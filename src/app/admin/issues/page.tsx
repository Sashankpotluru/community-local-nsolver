'use client';
import { useEffect, useState } from 'react';
import { FaMapMarkerAlt, FaUser, FaCalendar, FaThumbsUp, FaSearch, FaTimes } from 'react-icons/fa';

interface Issue {
    _id: string;
    title: string;
    description: string;
    status: 'Reported' | 'In Progress' | 'Resolved';
    category: {
      name: string;
      icon?: string;
    };
    location: {
      address: string;
      coordinates: [number, number];
    };
    reported_by: {
      name: string;
      email: string;
    };
    assigned_to?: {
      name: string;
      role: string;
    };
    upvotes: number;
    created_at: string;
    updated_at: string;
}

export default function IssuesPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState({
    title: '',
    category: '',
    reporter: '',
    dateFrom: '',
    dateTo: ''
  });
  const fetchIssues = async () => {
    try {
      const res = await fetch('/api/issues');
      const data = await res.json();
      setIssues(data);
    } catch (error) {
      setError('Failed to fetch issues');
      console.error('Failed to fetch issues:', error);
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleStatusChange = async (issueId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/issues/${issueId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to update status');
      }
      
      await fetchIssues(); // Refresh the issues list
    } catch (error) {
      console.error('Failed to update issue status:', error);
      setError('Failed to update status');
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'Resolved':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

// Add search filtering logic
const filteredIssues = issues.filter(issue => {
    if (filter !== 'all' && issue.status !== filter) return false;

    const matchesTitle = searchQuery.title.toLowerCase() === '' || 
      issue.title.toLowerCase().includes(searchQuery.title.toLowerCase());

    const matchesCategory = searchQuery.category.toLowerCase() === '' || 
      issue.category?.name.toLowerCase().includes(searchQuery.category.toLowerCase());

    const matchesReporter = searchQuery.reporter.toLowerCase() === '' || 
      issue.reported_by?.name.toLowerCase().includes(searchQuery.reporter.toLowerCase()) ||
      issue.reported_by?.email.toLowerCase().includes(searchQuery.reporter.toLowerCase());

    const issueDate = new Date(issue.created_at);
    const matchesDateFrom = !searchQuery.dateFrom || 
      issueDate >= new Date(searchQuery.dateFrom);
    const matchesDateTo = !searchQuery.dateTo || 
      issueDate <= new Date(searchQuery.dateTo);

    return matchesTitle && matchesCategory && matchesReporter && 
           matchesDateFrom && matchesDateTo;
  });

  // Add search reset function
  const resetSearch = () => {
    setSearchQuery({
      title: '',
      category: '',
      reporter: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Issues Management</h1>
        <div className="flex gap-2">
        <button
            onClick={() => setShowSearch(!showSearch)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <FaSearch />
            {showSearch ? 'Hide Search' : 'Advanced Search'}
          </button>
          <select 
            className="border rounded-md px-3 py-2"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="Reported">Reported</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>
      {/* Advanced Search Panel */}
      {showSearch && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={searchQuery.title}
                onChange={(e) => setSearchQuery({...searchQuery, title: e.target.value})}
                placeholder="Search by title..."
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                type="text"
                value={searchQuery.category}
                onChange={(e) => setSearchQuery({...searchQuery, category: e.target.value})}
                placeholder="Search by category..."
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reporter
              </label>
              <input
                type="text"
                value={searchQuery.reporter}
                onChange={(e) => setSearchQuery({...searchQuery, reporter: e.target.value})}
                placeholder="Search by reporter..."
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date From
              </label>
              <input
                type="date"
                value={searchQuery.dateFrom}
                onChange={(e) => setSearchQuery({...searchQuery, dateFrom: e.target.value})}
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date To
              </label>
              <input
                type="date"
                value={searchQuery.dateTo}
                onChange={(e) => setSearchQuery({...searchQuery, dateTo: e.target.value})}
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={resetSearch}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <FaTimes />
                Clear Search
              </button>
            </div>
          </div>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 text-left">Title</th>
              <th className="py-2 px-4 text-left">Status</th>
              <th className="py-2 px-4 text-left">Category</th>
              <th className="py-2 px-4 text-left">Upvotes</th>
              <th className="py-2 px-4 text-left">Reporter</th>
              <th className="py-2 px-4 text-left">Assignee</th>
              <th className="py-2 px-4 text-left">Created</th>
              <th className="py-2 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredIssues.map(issue => (
              <tr key={issue._id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-4 font-medium">{issue.title}</td>
                <td className="py-2 px-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColor(issue.status)}`}>
                    {issue.status}
                  </span>
                </td>
                <td className="py-2 px-4 flex items-center gap-2">
                  {issue.category?.icon && (
                    <span className="text-xl">{issue.category.icon}</span>
                  )}
                  <span>{issue.category?.name}</span>
                </td>
                <td className="py-2 px-4">{issue.upvotes}</td>
                <td className="py-2 px-4">
                  {issue.reported_by?.name}
                  <span className="block text-xs text-gray-400">{issue.reported_by?.email}</span>
                </td>
                <td className="py-2 px-4">
                  {issue.assigned_to?.name || <span className="text-gray-400">Unassigned</span>}
                </td>
                <td className="py-2 px-4">{new Date(issue.created_at).toLocaleDateString()}</td>
                <td className="py-2 px-4">
                  <select
                    value={issue.status}
                    onChange={(e) => handleStatusChange(issue._id, e.target.value)}
                    className={`rounded px-2 py-1 text-sm border ${statusColor(issue.status)}`}
                  >
                    <option value="Reported">Reported</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {filteredIssues.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          No issues found with the selected status.
        </div>
      )}
    </div>
  );
}
