
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  UserGroupIcon,
  DocumentTextIcon,
  TagIcon,
  ChartBarIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
  link: string;
}

interface DashboardButtonProps {
  title: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  link: string;
  color: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalIssues: 0,
    totalCategories: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      setStats(data);
    };
    fetchStats();
  }, []);

  

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-8">
      <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">Welcome to your administrative control panel</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Total Users"
          value={stats.totalUsers}
          icon={UserGroupIcon}
          color="from-purple-500 to-indigo-500"
          link="/admin/users"
        />
        <StatCard 
          title="Total Issues"
          value={stats.totalIssues}
          icon={DocumentTextIcon}
          color="from-blue-500 to-cyan-500"
          link="/admin/issues"
        />
        <StatCard 
          title="Categories"
          value={stats.totalCategories}
          icon={TagIcon}
          color="from-green-500 to-emerald-500"
          link="/admin/categories"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardButton
          title="Analytics"
          icon={ChartBarIcon}
          link="/admin/analytics"
          color="bg-purple-100 text-purple-700"
        />
        <DashboardButton
          title="User Management"
          icon={UserGroupIcon}
          link="/admin/users"
          color="bg-blue-100 text-blue-700"
        />
        <DashboardButton
          title="Content Moderation"
          icon={DocumentTextIcon}
          link="/admin/issues"
          color="bg-green-100 text-green-700"
        />
        <DashboardButton
          title="System Settings"
          icon={TagIcon}
          link="/admin/settings"
          color="bg-orange-100 text-orange-700"
        />
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, link }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={`bg-gradient-to-br ${color} p-3 rounded-lg`}>
            <Icon className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>
      <div className="border-t p-3 bg-gray-50 rounded-b-xl">
        <Link href={link} className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center">
          View Details
          <ArrowLeftOnRectangleIcon className="h-4 w-4 ml-2 transform rotate-180" />
        </Link>
      </div>
    </div>
  );
}

function DashboardButton({ title, icon: Icon, link, color }: DashboardButtonProps) {
  return (
    <Link href={link} className={`${color} p-6 rounded-xl hover:transform hover:scale-[1.02] transition-all duration-200`}>
      <div className="flex items-center">
        <Icon className="h-6 w-6 mr-3" />
        <span className="font-medium">{title}</span>
      </div>
    </Link>
  );
}