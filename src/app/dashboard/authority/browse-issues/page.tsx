// app/dashboard/authority/browse-issues/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaSearch, FaMapMarkerAlt, FaList, FaSpinner, FaComment, FaCheckCircle } from 'react-icons/fa';
import Image from 'next/image';

interface Issue {
  _id: string;
  title: string;
  description: string;
  readonly status: 'Reported' | 'In Progress' | 'Resolved';
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
  resolved_at?: string;
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

export default function AuthorityBrowseIssues() {
  const router = useRouter();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);

  // Search/filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Reported' | 'In Progress' | 'Resolved'>('All');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = localStorage.getItem('user');
        if (!userData) {
          router.push('/login');
          return;
        }
        const parsedUser = JSON.parse(userData);
        if (parsedUser.role !== 'Authority') {
          router.push('/login');
          return;
        }
        setUser(parsedUser);

        const [categoriesResponse, issuesResponse] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/issues')
        ]);

        const [categoriesData, issuesData] = await Promise.all([
          categoriesResponse.json(),
          issuesResponse.json()
        ]);

        setCategories(categoriesData);
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

    if (statusFilter !== 'All') {
      result = result.filter(issue => issue.status === statusFilter);
    }

    setFilteredIssues(result);
  }, [searchTerm, selectedCategory, locationSearch, statusFilter, issues]);

  const handleAction = async (issueId: string, action: 'assign' | 'resolve') => {
    if (!user) return;
    setProcessing(prev => new Set([...prev, issueId]));
  
    try {
      // API call body
      const apiBody = {
        ...(action === 'assign' && { 
          assigned_to: user.id, // Send only ID to API
          status: 'In Progress' as const
        }),
        ...(action === 'resolve' && {
          status: 'Resolved' as const,
          resolved_at: new Date().toISOString()
        })
      };
  
      const response = await fetch(`/api/issues?id=${issueId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiBody)
      });
  
      if (!response.ok) throw new Error(`Failed to ${action} issue`);
  
      // State update with proper typing
      setIssues(prev => prev.map(issue => {
        if (issue._id !== issueId) return issue;
        
        return {
          ...issue,
          status: action === 'assign' ? 'In Progress' : 'Resolved',
          ...(action === 'assign' && {
            assigned_to: { 
              _id: user.id, 
              name: user.name 
            }
          }),
          ...(action === 'resolve' && { 
            resolved_at: new Date().toISOString() 
          })
        };
      }));
    } catch (err) {
      setError(`Failed to ${action} issue`);
    } finally {
      setProcessing(prev => {
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Reported Issues</h1>
          <button
            onClick={() => router.push('/dashboard/authority')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-900" />
              <input
                type="text"
                placeholder="Search issues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border rounded-md"
              />
            </div>

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

            <div className="relative">
              <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-900" />
              <input
                type="text"
                placeholder="Location search..."
                value={locationSearch}
                onChange={(e) => setLocationSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border rounded-md"
              />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="pl-4 pr-4 py-2 w-full border rounded-md"
              >
                <option value="All">All Statuses</option>
                <option value="Reported">Reported</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

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
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    issue.status === 'Reported' ? 'bg-red-100 text-red-800' :
                    issue.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {issue.status}
                  </span>
                </div>

                <p className="text-gray-600 mb-4">{issue.description}</p>

                <div className="bg-gray-50 p-3 rounded-md mb-4">
                  <p className="text-sm text-gray-600 flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-gray-400" />
                    {issue.address || 'Location not specified'}
                  </p>
                </div>

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
                    Created: {new Date(issue.created_at).toLocaleDateString()}
                  </p>
                  {issue.resolved_at && (
                    <p className="text-sm text-gray-500">
                      Resolved: {new Date(issue.resolved_at).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  {issue.status === 'Reported' && (
                    <button
                      onClick={() => handleAction(issue._id, 'assign')}
                      disabled={processing.has(issue._id)}
                      className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                        processing.has(issue._id)
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {processing.has(issue._id) ? (
                        <span className="flex items-center justify-center">
                          <FaSpinner className="animate-spin mr-2" />
                          Assigning...
                        </span>
                      ) : (
                        'Take Responsibility'
                      )}
                    </button>
                  )}

                  {issue.status === 'In Progress' && (
                    <button
                      onClick={() => handleAction(issue._id, 'resolve')}
                      disabled={processing.has(issue._id)}
                      className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                        processing.has(issue._id)
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {processing.has(issue._id) ? (
                        <span className="flex items-center justify-center">
                          <FaSpinner className="animate-spin mr-2" />
                          Resolving...
                        </span>
                      ) : (
                        <>
                          <FaCheckCircle className="inline-block mr-2" />
                          Mark Resolved
                        </>
                      )}
                    </button>
                  )}

                  {issue.status === 'Resolved' && (
                    <div className="bg-green-50 text-green-700 p-3 rounded-md text-center">
                      <FaCheckCircle className="inline-block mr-2" />
                      Issue Resolved
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredIssues.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-lg">
              {searchTerm ? 'No matching issues found' : 'No issues to display'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}