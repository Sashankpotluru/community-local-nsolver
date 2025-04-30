
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserCircleIcon } from '@heroicons/react/24/outline';
interface NavLinkProps {
  href: string;
  label: string;
}
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
 

  // Check if user is admin
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/check');
        const data = await res.json();
        
        if (!data.user || data.user.role !== 'Admin') {
          router.push('/login');
          return;
        }
        
        setUser(data.user);
      } catch (error) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Logout function
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      
      // Call logout API
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (data.success) {
        // Clear any client-side storage
        localStorage.clear();
        sessionStorage.clear();
        
        // Redirect to home page
        router.push('/');
      } else {
        throw new Error(data.message || 'Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      alert('Failed to logout. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Navigation */}
      <nav className="bg-gradient-to-r from-purple-700 to-blue-700 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/admin" className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-white">Admin Suite</span>
              </Link>
              <div className="hidden md:block ml-8">
                <div className="flex space-x-4">
                  <NavLink href="/admin" label="Overview" />
                  <NavLink href="/admin/users" label="Users" />
                  <NavLink href="/admin/issues" label="Issues" />
                  <NavLink href="/admin/categories" label="Categories" />
                  <NavLink href="/admin/analytics" label="Analytics" />
                </div>
              </div>
            </div>
            
            {/* User Profile & Logout */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-white">
                <UserCircleIcon className="h-7 w-7 text-purple-200" />
                <span className="font-medium">{user?.email}</span>
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors duration-200"
              >
                {isLoggingOut ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="text-white">Signing out...</span>
                  </>
                ) : (
                  <>
                    <span className="text-white">Logout</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

function NavLink({ href, label }: NavLinkProps) {
  return (
    <Link
      href={href}
      className="text-purple-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 relative group"
    >
      {label}
      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
    </Link>
  );
}
