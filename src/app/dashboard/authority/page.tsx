// app/dashboard/authority/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeftOnRectangleIcon as LogoutIcon,
  ChartBarIcon,
  UserIcon ,
  DocumentCheckIcon,
  ClipboardDocumentIcon as ClipboardListIcon,
  TrophyIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';
import { Skeleton } from '@/components/ui/skeleton'; 

export default function AuthorityDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<{
    pending: number;
    inProgress: number;
    resolved: number;
    total: number;
    avgResolution: number;
    satisfaction: number;
    totalVolunteers: number;
    totalCitizens: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/authority/stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Stats fetch failed:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleLogout = async () => {
    if (!window.confirm('Are you sure you want to log out of your authority account?')) return;
    
    try {
      setIsLoggingOut(true);
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Logout failed - please try again');
    } finally {
      setIsLoggingOut(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <Skeleton className="h-10 w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-lg min-h-screen p-4 flex flex-col">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <UserIcon className="h-6 w-6 mr-2 text-blue-600" />
              Authority Dashboard
            </h2>
          </div>

          <nav className="flex-1 space-y-2">
            <DashboardLink 
              href="/dashboard/authority/browse-issues" 
              icon={ClipboardListIcon}
              label="Reported Issues"
              count={stats?.pending}
            />
            <DashboardLink
              href="/dashboard/authority/assignedIssues"
              icon={CheckCircleIcon}
              label="Assigned Issues"
              count={stats?.inProgress}
            />
            <DashboardLink
              href="/dashboard/authority/leaderboard"
              icon={TrophyIcon}
              label="Leaderboard"
            />
            <DashboardLink
              href="/dashboard/authority/analytics"
              icon={ChartBarIcon}
              label="Analytics"
            />
            <DashboardLink
              href="/dashboard/authority/users"
              icon={UserIcon}
              label="User Management"
              count={(stats?.totalVolunteers || 0) + (stats?.totalCitizens || 0)}
            />
            <DashboardLink
              href="/dashboard/authority/solved-issues"
              icon={CheckCircleIcon}
              label="Solved Issues"
              count={stats?.resolved}
            />
          </nav>

          <div className="border-t pt-4 mt-4">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center justify-between p-3 text-white bg-gradient-to-r from-red-500 to-orange-500 rounded-lg 
                hover:from-red-600 hover:to-orange-600 transition-all shadow-md hover:shadow-lg
                disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              <div className="flex items-center">
                {isLoggingOut ? (
                  <div className="h-5 w-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <LogoutIcon className="h-5 w-5 mr-2 group-hover:animate-pulse" />
                )}
                <span className="font-medium">{isLoggingOut ? 'Logging Out...' : 'Authority Logout'}</span>
              </div>
              <span className="ml-2 bg-white/20 px-2 py-1 rounded-full text-xs">Authority</span>
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Secure session management
            </p>
          </div>
          </aside>
        {/* Main Content */}
        <main className="flex-1 p-8">
          <header className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Department Overview
            </h1>
            <p className="text-gray-600 mt-2">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              title="Pending Review"
              value={stats?.pending || 0}
              color="bg-red-100 text-red-800"
              icon={ClipboardListIcon}
            />
            <StatCard
              title="In Progress"
              value={stats?.inProgress || 0}
              color="bg-blue-100 text-blue-800"
              icon={CheckCircleIcon}
            />
            <StatCard
              title="Resolved Issues"
              value={stats?.resolved || 0}
              color="bg-green-100 text-green-800"
              icon={CheckCircleIcon}
            />
            <StatCard
              title="Avg Resolution Days"
              value={stats?.avgResolution || 0}
              color="bg-purple-100 text-purple-800"
              icon={ChartBarIcon}
              isDays={true}
            />
            <StatCard
              title="Total Volunteers"
              value={stats?.totalVolunteers || 0}
              color="bg-orange-100 text-orange-800"
              icon={UserIcon}
            />
            <StatCard
              title="Total Citizens"
              value={stats?.totalCitizens || 0}
              color="bg-cyan-100 text-cyan-800"
              icon={UserIcon}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

// Reusable components
function DashboardLink({ href, icon: Icon, label, count }: { 
  href: string;
  icon: any;
  label: string;
  count?: number;
}) {
  return (
    <Link
      href={href}
      className="flex items-center p-3 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors group"
    >
      <Icon className="h-5 w-5 mr-3 text-gray-500 group-hover:text-blue-600" />
      <span className="flex-1">{label}</span>
      {typeof count === 'number' && (
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
          {count}
        </span>
      )}
    </Link>
  );
}

function StatCard({ title, value, color, icon: Icon, isDays = false }: { 
  title: string;
  value: number;
  color: string;
  icon: any;
  isDays?: boolean;
}) {
  return (
    <div className={`${color} p-6 rounded-xl shadow-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2">
            {value}{isDays && 'd'}
          </p>
        </div>
        <Icon className="h-12 w-12 opacity-50" />
      </div>
    </div>
  );
}