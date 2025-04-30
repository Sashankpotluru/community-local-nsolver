// app/admin/users/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaUserTag } from 'react-icons/fa';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = filter === 'all' 
    ? users 
    : users.filter(user => user.role.toLowerCase() === filter);

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Users Management</h1>
        <div className="flex gap-2">
          <select 
            className="border rounded-md px-3 py-2"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="citizen">Citizens</option>
            <option value="volunteer">Volunteers</option>
            <option value="authority">Authorities</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredUsers.map((user) => (
          <div key={user._id} className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center gap-2 mb-2">
              <FaUser className="text-gray-500" />
              <h3 className="font-semibold">{user.name}</h3>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <FaEnvelope className="text-gray-400" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaPhone className="text-gray-400" />
                <span>{user.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaUserTag className="text-gray-400" />
                <span className="capitalize">{user.role}</span>
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <select
                value={user.status}
                onChange={(e) => handleStatusChange(user._id, e.target.value)}
                className={`rounded px-2 py-1 text-sm ${
                  user.status === 'active' ? 'bg-green-100 text-green-800' :
                  user.status === 'suspended' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
              <span className="text-xs text-gray-500">
                Joined: {new Date(user.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}