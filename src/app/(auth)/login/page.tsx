'use client';


import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiMail, FiLock, FiAlertCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Changed from /api/auth/login to /api/auth/login to match your API route
      console.log('Submitting login form with email:', form.email);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      console.log('Response status:', res.status);
      
      // Log the raw response
      const text = await res.text();
      console.log('Raw response:', text);
      
      // Parse the response
      const data = JSON.parse(text);
      console.log('Parsed response:', data);

      if (!res.ok) {
        // Handle specific status-related errors
        if (res.status === 403) {
          throw new Error(data.message || 'Access denied');
        }
        throw new Error(data.message || 'Login failed');
      }
      // Check user status before redirecting
      if (data.user.status !== 'active') {
        throw new Error(`Your account is ${data.user.status}. Please contact support.`);
      }
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify({
        id: data.user._id,
        email: data.user.email,
        role: data.user.role,
        name: data.user.name
      }));
      console.log('Login successful, user role:', data.user.role);
      console.log(data)
      // Add Admin role handling
      switch (data.user.role) {
        case 'Admin':
          router.push('/admin'); // Redirect to admin dashboard
          break;
        case 'Citizen':
          router.push('/dashboard/citizen');
          break;
        case 'Volunteer':
          router.push('/dashboard/volunteer');
          break;
        case 'Authority':
          router.push('/dashboard/authority');
          break;
        default:
          router.push('/');
      }

      // Optional: Show success message
      console.log(`Logged in successfully as ${data.user.role}`);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

 
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="mt-2 text-gray-600">Sign in to continue to your account</p>
          </div>

          {error && (
            <div className="flex items-center p-4 bg-red-50 rounded-lg border border-red-200">
              <FiAlertCircle className="flex-shrink-0 w-5 h-5 text-red-600" />
              <span className="ml-3 text-sm text-red-600">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  name="password"
                  type="password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-6 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all transform hover:scale-[1.02] ${
                loading ? 'opacity-80 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white rounded-full animate-spin border-t-transparent" />
                  <span>Signing In...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Don't have an account?{' '}
                <Link 
                  href="/register" 
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Create account
                </Link>
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 text-center border-t border-gray-100">
          <p className="text-sm text-gray-600">
            By continuing, you agree to our{' '}
            <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
              Terms of Service
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
