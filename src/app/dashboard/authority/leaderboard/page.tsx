'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaCrown, FaMedal, FaTrophy, FaSpinner } from 'react-icons/fa';

interface Volunteer {
  _id: string;
  name: string;
  volunteer_points: number;
  resolved_issues: string[];
  created_at: string;
}

export default function Leaderboard() {
  const router = useRouter();
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const userData = localStorage.getItem('user');
        if (!userData) {
          router.push('/login');
          return;
        }
        const parsedUser = JSON.parse(userData);
        if (!['Authority', 'Admin'].includes(parsedUser.role)) {
            router.push('/login');
            return;
          }
          setCurrentUser(parsedUser);
        setCurrentUser(parsedUser);

        // Fetch all volunteers
        const response = await fetch('/api/users?role=Volunteer');
        if (!response.ok) throw new Error('Failed to fetch volunteers');
        
        const data = await response.json();
        
        // Sort volunteers by points (descending) and add rank
        const sortedVolunteers = data
          .sort((a: Volunteer, b: Volunteer) => b.volunteer_points - a.volunteer_points);
        
        setVolunteers(sortedVolunteers);
      } catch (err) {
        setError('Failed to fetch leaderboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <FaCrown className="text-yellow-400 text-2xl" title="1st Place" />;
      case 2:
        return <FaMedal className="text-gray-400 text-2xl" title="2nd Place" />;
      case 3:
        return <FaMedal className="text-amber-700 text-2xl" title="3rd Place" />;
      default:
        return <span className="text-gray-500 font-mono">{rank}</span>;
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Volunteer Leaderboard</h1>
            <p className="text-gray-600 mt-1">Top volunteers making a difference</p>
          </div>
          <button
            onClick={() => router.push('/dashboard/authority')}
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

        {/* Top 3 Podium */}
        {volunteers.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
              Top Volunteers
            </h2>
            <div className="flex justify-center items-end space-x-4 mb-8">
              {/* Second Place */}
              {volunteers[1] && (
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-2 relative">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-2xl font-bold">2</span>
                    </div>
                  </div>
                  <div className="h-32 bg-gray-100 rounded-t-lg px-4 pt-4">
                    <p className="font-semibold truncate">{volunteers[1].name}</p>
                    <p className="text-sm text-gray-900">{volunteers[1].volunteer_points} pts</p>
                  </div>
                </div>
              )}

              {/* First Place */}
              {volunteers[0] && (
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-2 relative">
                    <FaCrown className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-yellow-400 text-3xl" />
                    <div className="w-20 h-20 bg-yellow-200 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-3xl font-bold">1</span>
                    </div>
                  </div>
                  <div className="h-40 bg-yellow-50 rounded-t-lg px-4 pt-4">
                    <p className="font-semibold truncate">{volunteers[0].name}</p>
                    <p className="text-sm text-gray-900">{volunteers[0].volunteer_points} pts</p>
                  </div>
                </div>
              )}

              {/* Third Place */}
              {volunteers[2] && (
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-2">
                    <div className="w-16 h-16 bg-amber-200 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-2xl font-bold">3</span>
                    </div>
                  </div>
                  <div className="h-28 bg-amber-50 rounded-t-lg px-4 pt-4">
                    <p className="font-semibold truncate">{volunteers[2].name}</p>
                    <p className="text-sm text-gray-900">{volunteers[2].volunteer_points} pts</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Full Leaderboard Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Volunteer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Points
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issues Resolved
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {volunteers.map((volunteer, index) => (
                <tr 
                  key={volunteer._id}
                  className={`
                    ${volunteer._id === currentUser?.id ? 'bg-blue-50' : ''}
                    hover:bg-gray-50 transition-colors
                  `}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getRankIcon(index + 1)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">
                        {volunteer.name}
                        {volunteer._id === currentUser?.id && (
                          <span className="ml-2 text-xs text-blue-600">(You)</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {volunteer.volunteer_points} points
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {volunteer.resolved_issues?.length || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(volunteer.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {volunteers.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-900 text-lg">
              No volunteer data available
            </p>
          </div>
        )}
      </div>
    </div>
  );
}