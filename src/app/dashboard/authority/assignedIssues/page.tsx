// app/dashboard/authority/assigned-issues/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaSearch, FaSpinner, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
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

export default function AuthorityAssignedIssues() {
  const router = useRouter();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = localStorage.getItem('user');
        if (!userData || JSON.parse(userData).role !== 'Authority') {
          router.push('/login');
          return;
        }
        
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        const response = await fetch(`/api/issues?assignedTo=${parsedUser.id}`);
        if (!response.ok) throw new Error('Failed to fetch issues');
        
        const issuesData = await response.json();
        setIssues(issuesData);
        setFilteredIssues(issuesData);
      } catch (err) {
        setError('Failed to load assigned issues');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  useEffect(() => {
    const results = issues.filter(issue =>
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredIssues(results);
  }, [searchTerm, issues]);

  const handleResolve = async (issueId: string) => {
    setProcessing(prev => new Set([...prev, issueId]));

    try {
      const response = await fetch(`/api/issues?id=${issueId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Resolved',
          resolved_at: new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error('Failed to resolve issue');

      setIssues(prev => 
        prev.map(issue => 
          issue._id === issueId 
            ? { ...issue, status: 'Resolved', resolved_at: new Date().toISOString() }
            : issue
        )
      );
    } catch (err) {
      setError('Failed to update issue status');
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
          <h1 className="text-3xl font-bold text-gray-900">My Assigned Issues</h1>
          <button
            onClick={() => router.push('/dashboard/authority')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-900" />
            <input
              type="text"
              placeholder="Search your assigned issues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border rounded-md"
            />
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
                    issue.status === 'Resolved' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {issue.status}
                  </span>
                </div>

                <p className="text-gray-600 mb-4">{issue.description}</p>

                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-500">
                    Assigned since: {new Date(issue.created_at).toLocaleDateString()}
                  </p>
                  {issue.resolved_at && (
                    <p className="text-sm text-gray-500">
                      Resolved on: {new Date(issue.resolved_at).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {issue.status !== 'Resolved' ? (
                  <button
                    onClick={() => handleResolve(issue._id)}
                    disabled={processing.has(issue._id)}
                    className={`w-full py-2 px-4 rounded-md text-white font-medium flex items-center justify-center gap-2 ${
                      processing.has(issue._id)
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {processing.has(issue._id) ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <>
                        <FaCheckCircle />
                        Mark as Resolved
                      </>
                    )}
                  </button>
                ) : (
                  <div className="bg-green-50 text-green-700 p-3 rounded-md text-center">
                    <FaCheckCircle className="inline-block mr-2" />
                    Issue Resolved
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredIssues.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-lg">
              {searchTerm ? 'No matching issues found' : 'No issues currently assigned to you'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}