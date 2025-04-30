'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaSpinner, FaMapMarkerAlt, FaList, FaComment } from 'react-icons/fa';
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
interface UpdateResponse {
    success: boolean;
    updatedIssue?: Issue;
    updatedPoints?: number;
  }
export default function AssignedIssues() {
  const router = useRouter();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [successMessage, setSuccessMessage] = useState('');

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

        const userResponse = await fetch(`/api/users/${parsedUser.id}`);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUserPoints(userData.volunteer_points || 0);
        }

        // Fetch all issues assigned to this volunteer
        const issuesResponse = await fetch('/api/issues');
        if (!issuesResponse.ok) {
          throw new Error('Failed to fetch issues');
        }
        const issuesData = await issuesResponse.json();
        // Only issues assigned to this volunteer
        const assigned = issuesData.filter(
          (issue: Issue) => issue.assigned_to && issue.assigned_to._id === parsedUser.id
        );
        setIssues(assigned);
      } catch (err) {
        setError('Failed to fetch assigned issues');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  // Handle status update
  const handleStatusChange = async (issueId: string, newStatus: 'In Progress' | 'Resolved') => {
    if (!user) return;
    
    setUpdating(issueId);
    try {
      const response = await fetch(`/api/issues?id=${issueId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: newStatus,
          volunteerId: user.id  // Send the volunteer's ID to track who resolved it
        }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      const data = await response.json();

      // Update the issue in the UI
      setIssues(prev =>
        prev.map(issue =>
          issue._id === issueId ? { ...issue, status: newStatus } : issue
        )
      );

      // If issue was marked as resolved, show success message
      if (newStatus === 'Resolved') {
        setError(''); // Clear any existing errors
        setSuccessMessage('Issue resolved successfully! You earned 1 point! 🎉');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      }

    } catch (err) {
      setError('Failed to update status');
    } finally {
      setUpdating(null);
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
          <h1 className="text-3xl font-bold text-gray-900">Assigned Issues</h1>
          <button
            onClick={() => router.push('/dashboard/volunteer')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md transition-colors"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Issues Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {issues.map(issue => (
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
                {/* Status Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleStatusChange(issue._id, 'In Progress')}
                    disabled={updating === issue._id || issue.status === 'In Progress'}
                    className={`flex-1 py-2 px-4 rounded-md text-white font-medium
                      ${issue.status === 'In Progress'
                        ? 'bg-yellow-500 cursor-not-allowed'
                        : 'bg-yellow-600 hover:bg-yellow-700'}
                      transition-colors`}
                  >
                    {updating === issue._id && issue.status !== 'In Progress' ? (
                      <span className="flex items-center justify-center">
                        <FaSpinner className="animate-spin mr-2" />
                        Updating...
                      </span>
                    ) : (
                      'In Progress'
                    )}
                  </button>
                  <button
                    onClick={() => handleStatusChange(issue._id, 'Resolved')}
                    disabled={updating === issue._id || issue.status === 'Resolved'}
                    className={`flex-1 py-2 px-4 rounded-md text-white font-medium
                      ${issue.status === 'Resolved'
                        ? 'bg-green-500 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700'}
                      transition-colors`}
                  >
                    {updating === issue._id && issue.status !== 'Resolved' ? (
                      <span className="flex items-center justify-center">
                        <FaSpinner className="animate-spin mr-2" />
                        Updating...
                      </span>
                    ) : (
                      'Resolved'
                    )}
                  </button>
                </div>
                {/* Current Status */}
                <div className="mt-4 text-center">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold
                    ${issue.status === 'Resolved'
                      ? 'bg-green-100 text-green-800'
                      : issue.status === 'In Progress'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                    {issue.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {issues.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-lg">
              You have no assigned issues.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}