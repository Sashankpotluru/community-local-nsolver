
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaTasks, 
  FaClipboardList, 
  FaTrophy, 
  FaChartBar, 
  FaSignOutAlt,
  FaUser,
  FaCaretDown
} from 'react-icons/fa';

export default function VolunteerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string  } | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.name && parsedUser.email) {
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // New: Logout function
  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.replace('/'); // Redirect to landing page (adjust path as needed)
  };
    // Handle click outside dropdown
    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setShowDropdown(false);
        }
      }
  
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Volunteer Hub
              </h1>
              {user && (
                <p className="text-gray-600">Welcome back, {user.name}</p>
              )}
            </div>
            
            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-3 bg-white px-4 py-3 rounded-xl border border-gray-200 hover:border-gray-300 transition-all shadow-sm hover:shadow-md"
              >
                <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-full p-2">
                  <FaUser className="text-blue-600 w-5 h-5" />
                </div>
                <span className="text-gray-700 font-medium truncate">{user?.name}</span>
                <FaCaretDown className={`text-gray-500 transition-transform duration-200 ${showDropdown ? 'transform rotate-180' : ''}`} />
              </button>
  
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl overflow-hidden z-50 animate-dropdown">
                  <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                    <p className="text-xs font-semibold text-gray-500">VOLUNTEER PROFILE</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <FaSignOutAlt className="mr-2 text-red-500" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
  
          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard
              title="Browse Issues"
              description="Find and take up issues reported by citizens"
              icon={FaClipboardList}
              color="from-yellow-400 to-orange-400"
              onClick={() => router.push('/dashboard/volunteer/browser-issues')}
            />
            <DashboardCard
              title="Assigned Issues"
              description="View and manage your active tasks"
              icon={FaTasks}
              color="from-blue-400 to-cyan-400"
              onClick={() => router.push('/dashboard/volunteer/assigned-issues')}
            />
            <DashboardCard
              title="Leaderboard"
              description="See top volunteers and your rank"
              icon={FaTrophy}
              color="from-green-400 to-emerald-400"
              onClick={() => router.push('/dashboard/volunteer/leaderboard')}
            />
            <DashboardCard
              title="Analytics"
              description="Track your volunteering impact"
              icon={FaChartBar}
              color="from-purple-400 to-fuchsia-400"
              onClick={() => router.push('/dashboard/volunteer/analytics')}
            />
          </div>
        </div>
      </div>
    );
  }
  
  function DashboardCard({ 
    title, 
    description, 
    icon: Icon, 
    color, 
    onClick 
  }: { 
    title: string;
    description: string;
    icon: any;
    color: string;
    onClick: () => void;
  }) {
    return (
      <div 
        onClick={onClick}
        className={`bg-gradient-to-br ${color} p-6 rounded-2xl cursor-pointer transform transition-all hover:-translate-y-1 hover:shadow-xl text-white`}
      >
        <div className="flex flex-col h-full">
          <div className="mb-4">
            <Icon className="h-12 w-12 mb-4 opacity-90" />
            <h3 className="text-xl font-bold mb-2">{title}</h3>
          </div>
          <p className="text-sm opacity-90 mt-auto">{description}</p>
        </div>
      </div>
    );
  }