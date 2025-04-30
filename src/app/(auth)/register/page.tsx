'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  FiUser, FiMail, FiLock, FiAlertCircle, 
  FiSmartphone, FiMapPin, FiBriefcase, FiBell 
} from 'react-icons/fi';

interface FormData {
  name: string;
  email: string;
  password: string;
  role: 'Citizen' | 'Volunteer' | 'Authority';
  age: number;
  phone: string;
  location?: string;
  department?: string;
  employeeNumber?: string;
  preferences: {
    notification_email: boolean;
    notification_sms: boolean;
    notification_push: boolean;
  };
}

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    role: 'Citizen',
    age: 18,
    phone: '',
    location: '',
    department: '',
    employeeNumber: '',
    preferences: {
      notification_email: true,
      notification_sms: false,
      notification_push: true,
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name.startsWith('preferences.')) {
      const preferenceKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [preferenceKey]: (e.target as HTMLInputElement).checked,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? Number(value) : value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Redirect to login page on success
      router.push('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="p-8 space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Join Our Community
            </h1>
            <p className="mt-2 text-gray-600">Create your account in just a few steps</p>
          </div>

          {error && (
            <div className="flex items-center p-4 bg-red-50 rounded-lg border border-red-200">
              <FiAlertCircle className="flex-shrink-0 w-5 h-5 text-red-600" />
              <span className="ml-3 text-sm text-red-600">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      name="name"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                </div>

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
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                      value={formData.email}
                      onChange={handleChange}
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
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    name="role"
                    required
                    className="w-full py-3 px-4 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none appearance-none bg-white"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="Citizen">Citizen</option>
                    <option value="Volunteer">Volunteer</option>
                    <option value="Authority">Authority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <FiSmartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      name="phone"
                      type="tel"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age
                  </label>
                  <input
                    name="age"
                    type="number"
                    min="18"
                    required
                    className="w-full py-3 px-4 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                    value={formData.age}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Conditional Fields */}
            <motion.div layout className="space-y-6">
              {formData.role === 'Volunteer' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-blue-50 p-6 rounded-xl"
                >
                  <div className="flex items-center mb-4">
                    <FiMapPin className="w-5 h-5 text-blue-600 mr-2" />
                    <h3 className="font-medium text-blue-800">Volunteer Information</h3>
                  </div>
                  <input
                    name="location"
                    required
                    placeholder="Location"
                    className="w-full py-3 px-4 rounded-lg border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none bg-white"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </motion.div>
              )}

              {formData.role === 'Authority' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-purple-50 p-6 rounded-xl space-y-4"
                >
                  <div className="flex items-center">
                    <FiBriefcase className="w-5 h-5 text-purple-600 mr-2" />
                    <h3 className="font-medium text-purple-800">Authority Information</h3>
                  </div>
                  <input
                    name="department"
                    required
                    placeholder="Department"
                    className="w-full py-3 px-4 rounded-lg border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none bg-white"
                    value={formData.department}
                    onChange={handleChange}
                  />
                  <input
                    name="employeeNumber"
                    required
                    placeholder="Employee Number"
                    className="w-full py-3 px-4 rounded-lg border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none bg-white"
                    value={formData.employeeNumber}
                    onChange={handleChange}
                  />
                </motion.div>
              )}
            </motion.div>

            {/* Notifications */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <FiBell className="w-5 h-5 text-gray-600 mr-2" />
                <h3 className="font-medium text-gray-800">Notification Preferences</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="flex items-center space-x-2 bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-200 cursor-pointer">
                  <input
                    type="checkbox"
                    name="preferences.notification_email"
                    checked={formData.preferences.notification_email}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm">Email</span>
                </label>
                <label className="flex items-center space-x-2 bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-200 cursor-pointer">
                  <input
                    type="checkbox"
                    name="preferences.notification_sms"
                    checked={formData.preferences.notification_sms}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm">SMS</span>
                </label>
                <label className="flex items-center space-x-2 bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-200 cursor-pointer">
                  <input
                    type="checkbox"
                    name="preferences.notification_push"
                    checked={formData.preferences.notification_push}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm">Push</span>
                </label>
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
                  <span>Creating Account...</span>
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in here
            </Link>
          </div>
        </div>

        <div className="bg-gray-50 p-6 text-center border-t border-gray-100">
          <p className="text-xs text-gray-500">
            By registering, you agree to our{' '}
            <a href="#" className="font-medium text-gray-700 hover:text-gray-900">
              Terms of Service
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}