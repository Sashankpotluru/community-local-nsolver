'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaSearch, FaMapMarkerAlt, FaList, FaSpinner, FaComment } from 'react-icons/fa';
import Image from 'next/image';

interface Issue {
  _id: string;
  title: string;
  description: string;
  status: 'Reported' | 'In Progress' | 'Resolved';
  photo?: string;
  category: {
    _id: string;
    name: string;
  };
  address: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  reported_by: {
    _id: string;
    name: string;
  };
  assigned_to?: {
    _id: string;
    name: string;
  };
  created_at: string;
  comments: Array<{
    text: string;
    user: {
      name: string;
    };
    created_at: string;
  }>;
}

interface Category {
  _id: string;
  name: string;
}

export default function BrowseIssues() {
  const router = useRouter();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigningIssues, setAssigningIssues] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);

  // Search/filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [assignmentFilter, setAssignmentFilter] = useState<'All' | 'Assigned' | 'Unassigned'>('All');

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = localStorage.getItem('user');
        if (!userData) {
          router.push('/login');
          return;
        }
        const parsedUser = JSON.parse(userData);
        if (parsedUser.role !== 'Volunteer') {
          router.push('/login');
          return;
        }
        setUser(parsedUser);

        const categoriesResponse = await fetch('/api/categories');
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData);

        const issuesResponse = await fetch('/api/issues');
        if (!issuesResponse.ok) {
          throw new Error('Failed to fetch issues');
        }
        const issuesData = await issuesResponse.json();
        setIssues(issuesData);
        setFilteredIssues(issuesData);
      } catch (err) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // Handle search and filtering
  useEffect(() => {
    let result = [...issues];

    if (searchTerm) {
      result = result.filter(issue => 
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      result = result.filter(issue => 
        issue.category._id === selectedCategory
      );
    }

    if (locationSearch) {
      result = result.filter(issue => 
        issue.address?.toLowerCase().includes(locationSearch.toLowerCase())
      );
    }

    // Assignment filter
    if (assignmentFilter === 'Assigned') {
      result = result.filter(issue => !!issue.assigned_to);
    } else if (assignmentFilter === 'Unassigned') {
      result = result.filter(issue => !issue.assigned_to);
    }

    setFilteredIssues(result);
  }, [searchTerm, selectedCategory, locationSearch, assignmentFilter, issues]);

  // Handle issue assignment
  const handleAssign = async (issueId: string) => {
    if (!user) return;
    setAssigningIssues(prev => new Set(prev).add(issueId));
    try {
      const response = await fetch(`/api/issues?id=${issueId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assigned_to: user.id,
          status: 'In Progress'
        })
      });

      if (!response.ok) throw new Error('Failed to assign issue');

      setIssues(prev => prev.map(issue => 
        issue._id === issueId 
          ? { ...issue, assigned_to: { _id: user.id, name: user.name }, status: 'In Progress' }
          : issue
      ));
      setFilteredIssues(prev => prev.map(issue => 
        issue._id === issueId 
          ? { ...issue, assigned_to: { _id: user.id, name: user.name }, status: 'In Progress' }
          : issue
      ));

    } catch (err) {
      setError('Failed to assign issue');
    } finally {
      setAssigningIssues(prev => {
        const newSet = new Set(prev);
        newSet.delete(issueId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Browse Issues</h1>
          <button
            onClick={() => router.push('/dashboard/volunteer')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md transition-colors "
          >
            Back to Dashboard
          </button>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Problem Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-900 " />
              <input
                type="text"
                placeholder="Search by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border rounded-md"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <FaList className="absolute left-3 top-3 text-gray-900" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border rounded-md"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Search */}
            <div className="relative">
              <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-900" />
              <input
                type="text"
                placeholder="Search by location..."
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border rounded-md"
              />
            </div>

            {/* Assignment Filter */}
            <div className="relative">
              <select
                value={assignmentFilter}
                onChange={e => setAssignmentFilter(e.target.value as any)}
                className="pl-4 pr-4 py-2 w-full border rounded-md"
              >
                <option value="All">All Issues</option>
                <option value="Unassigned">Unassigned</option>
                <option value="Assigned">Assigned</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Issues Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIssues.map(issue => (
            <div key={issue._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
              {issue.photo && (
                <div className="relative h-48">
                  <Image
                    src={issue.photo}
                    alt={issue.title}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{issue.title}</h3>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    {issue.category.name}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4">{issue.description}</p>
                
                {/* Address Section */}
                <div className="bg-gray-50 p-3 rounded-md mb-4">
                  <p className="text-sm text-gray-600 flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-gray-400" />
                    {issue.address || 'Address not provided'}
                  </p>
                </div>

                {/* Comments Section */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <FaComment className="mr-2" />
                    Comments ({issue.comments?.length || 0})
                  </h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {issue.comments?.map((comment, index) => (
                      <div key={index} className="bg-gray-50 p-2 rounded-md">
                        <p className="text-sm text-gray-600">{comment.text}</p>
                        <p className="text-xs text-gray-500">
                          By {comment.user.name} • {new Date(comment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-500">
                    Reported by: {issue.reported_by.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Posted: {new Date(issue.created_at).toLocaleDateString()}
                  </p>
                </div>

                {issue.assigned_to ? (
                  <div className="bg-red-100 text-red-800 px-4 py-2 rounded-md text-center font-semibold">
                    Assigned to: {issue.assigned_to.name}
                  </div>
                ) : (
                  <button
                    onClick={() => handleAssign(issue._id)}
                    disabled={assigningIssues.has(issue._id)}
                    className={`w-full py-2 px-4 rounded-md text-white font-medium
                      ${assigningIssues.has(issue._id)
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700'
                      } transition-colors`}
                  >
                    {assigningIssues.has(issue._id) ? (
                      <span className="flex items-center justify-center">
                        <FaSpinner className="animate-spin mr-2" />
                        Assigning...
                      </span>
                    ) : (
                      'Take Assignment'
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredIssues.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-lg">
              No issues found matching your criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
}