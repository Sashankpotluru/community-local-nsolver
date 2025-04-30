// // app/dashboard/citizen/page.tsx
// 'use client';

// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import Image from 'next/image';

// interface Issue {
//   _id: string;
//   title: string;
//   description: string;
//   status: 'Reported' | 'In Progress' | 'Resolved';
//   photo?: string;
//   category: {
//     name: string;
//   };
//   created_at: string;
//   location: {
//     coordinates: [number, number];
//   };
//   reported_by: string;
// }

// interface User {
//   id: string;
//   name: string;
//   email: string;
//   role: string;
// }

// export default function CitizenDashboard() {
//   const router = useRouter();
//   const [issues, setIssues] = useState<Issue[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [user, setUser] = useState<User | null>(null);

//   useEffect(() => {
//     const fetchIssues = async () => {
//       try {
//         // Get and validate user data from localStorage
//         const userData = localStorage.getItem('user');
//         console.log('Raw user data from localStorage:', userData);

//         if (!userData) {
//           console.log('No user data found, redirecting to login');
//           router.push('/login');
//           return;
//         }

//         const parsedUser = JSON.parse(userData);
//         console.log('Parsed user data:', parsedUser);

//         // Validate user role
//         if (!parsedUser.role || parsedUser.role !== 'Citizen') {
//           console.log('Invalid role, redirecting');
//           router.push('/login');
//           return;
//         }

//         setUser(parsedUser);

//         // Construct API URL with query parameters
//         const url = `/api/issues?userId=${parsedUser.id}&role=Citizen`;
//         console.log('Fetching issues from:', url);

//         // Fetch issues
//         const response = await fetch(url);
//         console.log('API Response:', {
//           status: response.status,
//           statusText: response.statusText
//         });

//         if (!response.ok) {
//           const errorData = await response.json();
//           throw new Error(errorData.error || 'Failed to fetch issues');
//         }

//         const data = await response.json();
//         console.log('Raw API response data:', data);

//         // Filter issues to ensure only user's issues are shown
//         const userIssues = data.filter((issue: Issue) => {
//           console.log('Comparing issue:', {
//             issueId: issue._id,
//             reportedBy: issue.reported_by,
//             userId: parsedUser.id
//           });
//           if (typeof issue.reported_by === 'object' && issue.reported_by !== null) {
//             // @ts-ignore
//             return issue.reported_by._id === parsedUser.id;
//           }
//           // If reported_by is just an ID string (not populated), compare directly
//           return issue.reported_by === parsedUser.id;
//         });
       

//         console.log('Filtered user issues:', userIssues);
//         setIssues(userIssues);

//       } catch (err) {
//         console.error('Error in fetchIssues:', err);
//         setError(err instanceof Error ? err.message : 'Failed to fetch issues');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchIssues();
//   }, [router]);

//   // Calculate statistics from filtered issues
//   const statistics = {
//     total: issues.length,
//     resolved: issues.filter(issue => issue.status === 'Resolved').length,
//     inProgress: issues.filter(issue => issue.status === 'In Progress').length,
//     reported: issues.filter(issue => issue.status === 'Reported').length,
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-8">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="flex justify-between items-center mb-8">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900">
//               Citizen Dashboard
//             </h1>
//             {user && (
//               <p className="text-gray-600 mt-1">
//                 Welcome, {user.name}
//               </p>
//             )}
//           </div>
//           <button 
//             onClick={() => router.push('/citizens/report')}
//             className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
//           >
//             Report New Issue
//           </button>
//         </div>

//         {/* Error Display */}
//         {error && (
//           <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-4">
//             <div className="flex">
//               <div className="flex-shrink-0">
//                 <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
//                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//                 </svg>
//               </div>
//               <div className="ml-3">
//                 <p className="text-sm text-red-700">{error}</p>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Statistics Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//           <div className="bg-white p-6 rounded-lg shadow">
//             <h3 className="text-lg font-medium text-gray-900">Total Issues</h3>
//             <p className="text-3xl font-bold text-blue-600">{statistics.total}</p>
//           </div>
//           <div className="bg-white p-6 rounded-lg shadow">
//             <h3 className="text-lg font-medium text-gray-900">Resolved</h3>
//             <p className="text-3xl font-bold text-green-600">{statistics.resolved}</p>
//           </div>
//           <div className="bg-white p-6 rounded-lg shadow">
//             <h3 className="text-lg font-medium text-gray-900">In Progress</h3>
//             <p className="text-3xl font-bold text-yellow-600">{statistics.inProgress}</p>
//           </div>
//           <div className="bg-white p-6 rounded-lg shadow">
//             <h3 className="text-lg font-medium text-gray-900">Reported</h3>
//             <p className="text-3xl font-bold text-red-600">{statistics.reported}</p>
//           </div>
//         </div>

//         {/* Issues List */}
//         <div className="bg-white shadow rounded-lg p-6">
//           <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Reported Issues</h2>
          
//           {issues.length === 0 ? (
//             <div className="text-center py-8 text-gray-500">
//               <p>No issues reported yet.</p>
//               <button
//                 onClick={() => router.push('/citizens/report')}
//                 className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
//               >
//                 Report your first issue
//               </button>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {issues.map((issue) => (
//                 <div key={issue._id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
//                   {issue.photo && (
//                     <div className="relative h-48">
//                       <Image
//                         src={issue.photo}
//                         alt={issue.title}
//                         fill
//                         className="object-cover"
//                       />
//                     </div>
//                   )}
//                   <div className="p-4">
//                     <div className="flex justify-between items-start mb-2">
//                       <h3 className="text-lg font-medium text-gray-900">{issue.title}</h3>
//                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                         issue.status === 'Resolved' ? 'bg-green-100 text-green-800' :
//                         issue.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
//                         'bg-red-100 text-red-800'
//                       }`}>
//                         {issue.status}
//                       </span>
//                     </div>
//                     <p className="text-gray-600 text-sm mb-2">{issue.description}</p>
//                     <div className="text-sm text-gray-500">
//                       <p>Category: {issue.category?.name}</p>
//                       <p>Reported: {new Date(issue.created_at).toLocaleDateString()}</p>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// 'use client';

// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { FaClipboardList, FaChartBar, FaSignOutAlt, FaUser, FaCaretDown } from 'react-icons/fa';

// interface User {
//   id: string;
//   name: string;
//   email: string;
//   role: string;
// }

// interface Statistics {
//   total: number;
//   resolved: number;
//   inProgress: number;
//   reported: number;
// }

// export default function CitizenDashboard() {
//   const router = useRouter();
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [user, setUser] = useState<User | null>(null);
//   const [showDropdown, setShowDropdown] = useState(false);
//   const dropdownRef = useRef<HTMLDivElement>(null);
//   const [statistics, setStatistics] = useState<Statistics>({
//     total: 0,
//     resolved: 0,
//     inProgress: 0,
//     reported: 0
//   });

//   // Handle click outside dropdown
//   useEffect(() => {
//     function handleClickOutside(event: MouseEvent) {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//         setShowDropdown(false);
//       }
//     }

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, []);

//   useEffect(() => {
//     const fetchDashboardData = async () => {
//       try {
//         const userData = localStorage.getItem('user');
//         if (!userData) {
//           router.push('/login');
//           return;
//         }

//         const parsedUser = JSON.parse(userData);
//         if (!parsedUser.role || parsedUser.role !== 'Citizen') {
//           router.push('/login');
//           return;
//         }

//         setUser(parsedUser);

//         const response = await fetch(`/api/issues?userId=${parsedUser.id}&role=Citizen`);
//         if (!response.ok) {
//           throw new Error('Failed to fetch dashboard data');
//         }

//         const data = await response.json();
//         const userIssues = data.filter((issue: any) => {
//           if (typeof issue.reported_by === 'object' && issue.reported_by !== null) {
//             return issue.reported_by._id === parsedUser.id;
//           }
//           return issue.reported_by === parsedUser.id;
//         });

//         setStatistics({
//           total: userIssues.length,
//           resolved: userIssues.filter((issue: any) => issue.status === 'Resolved').length,
//           inProgress: userIssues.filter((issue: any) => issue.status === 'In Progress').length,
//           reported: userIssues.filter((issue: any) => issue.status === 'Reported').length,
//         });

//       } catch (err) {
//         setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDashboardData();
//   }, [router]);

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-8">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="flex justify-between items-center mb-8">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900">
//               Citizen Dashboard
//             </h1>
//             {user && (
//               <p className="text-gray-600 mt-1">
//                 Welcome, {user.name}
//               </p>
//             )}
//           </div>
//           <button 
//             onClick={() => router.push('/citizens/report')}
//             className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
//           >
//             Report New Issue
//           </button>
//         </div>

//         {/* Error Display */}
//         {error && (
//           <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-4">
//             <div className="flex">
//               <div className="flex-shrink-0">
//                 <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
//                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//                 </svg>
//               </div>
//               <div className="ml-3">
//                 <p className="text-sm text-red-700">{error}</p>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Statistics Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//           <div className="bg-white p-6 rounded-lg shadow">
//             <h3 className="text-lg font-medium text-gray-900">Total Issues</h3>
//             <p className="text-3xl font-bold text-blue-600">{statistics.total}</p>
//           </div>
//           <div className="bg-white p-6 rounded-lg shadow">
//             <h3 className="text-lg font-medium text-gray-900">Resolved</h3>
//             <p className="text-3xl font-bold text-green-600">{statistics.resolved}</p>
//           </div>
//           <div className="bg-white p-6 rounded-lg shadow">
//             <h3 className="text-lg font-medium text-gray-900">In Progress</h3>
//             <p className="text-3xl font-bold text-yellow-600">{statistics.inProgress}</p>
//           </div>
//           <div className="bg-white p-6 rounded-lg shadow">
//             <h3 className="text-lg font-medium text-gray-900">Reported</h3>
//             <p className="text-3xl font-bold text-red-600">{statistics.reported}</p>
//           </div>
//         </div>

//         {/* Navigation Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {/* Issues Card */}
//           <div 
//             onClick={() => router.push('/dashboard/citizen/issues')}
//             className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
//           >
//             <div className="flex items-center">
//               <FaClipboardList className="text-4xl text-blue-600 mr-4" />
//               <div>
//                 <h3 className="text-xl font-medium text-gray-900">View All Issues</h3>
//                 <p className="text-gray-600">Manage and track all your reported issues</p>
//               </div>
//             </div>
//           </div>

//           {/* Analytics Card */}
//           <div 
//             onClick={() => router.push('/dashboard/citizen/analytics')}
//             className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
//           >
//             <div className="flex items-center">
//               <FaChartBar className="text-4xl text-green-600 mr-4" />
//               <div>
//                 <h3 className="text-xl font-medium text-gray-900">Analytics</h3>
//                 <p className="text-gray-600">View detailed analytics of your reported issues</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaClipboardList, 
  FaChartBar, 
  FaSignOutAlt, 
  FaUser, 
  FaCaretDown,
  FaCheckCircle,
  FaSync,
  FaExclamationTriangle 
} from 'react-icons/fa';
import type { IconType } from 'react-icons/lib'; 

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Statistics {
  total: number;
  resolved: number;
  inProgress: number;
  reported: number;
}

export default function CitizenDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [statistics, setStatistics] = useState<Statistics>({
    total: 0,
    resolved: 0,
    inProgress: 0,
    reported: 0
  });

  // Handle click outside dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const userData = localStorage.getItem('user');
        if (!userData) {
          router.push('/login');
          return;
        }

        const parsedUser = JSON.parse(userData);
        if (!parsedUser.role || parsedUser.role !== 'Citizen') {
          router.push('/login');
          return;
        }

        setUser(parsedUser);

        const response = await fetch(`/api/issues?userId=${parsedUser.id}&role=Citizen`);
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const data = await response.json();
        const userIssues = data.filter((issue: any) => {
          if (typeof issue.reported_by === 'object' && issue.reported_by !== null) {
            return issue.reported_by._id === parsedUser.id;
          }
          return issue.reported_by === parsedUser.id;
        });

        setStatistics({
          total: userIssues.length,
          resolved: userIssues.filter((issue: any) => issue.status === 'Resolved').length,
          inProgress: userIssues.filter((issue: any) => issue.status === 'In Progress').length,
          reported: userIssues.filter((issue: any) => issue.status === 'Reported').length,
        });

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  const handleLogout = async () => {
    try {
      // Show loading state
      setLoading(true);
      
      // Clear all stored data
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      
      // Optional: Call logout API endpoint if you have one
      // await fetch('/api/auth/logout', { method: 'POST' });
      
      // Redirect to login page
      router.push('/login');
    } catch (error) {
      setError('Failed to logout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

//   return (
//     <div className="min-h-screen bg-gray-50 p-8">
//       <div className="max-w-7xl mx-auto">
//         {/* Header with User Dropdown */}
//         <div className="flex justify-between items-center mb-8">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900">
//               Citizen Dashboard
//             </h1>
//           </div>
//           <div className="flex items-center space-x-4">
//             <button 
//               onClick={() => router.push('/citizens/report')}
//               className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
//             >
//               Report New Issue
//             </button>
            
//             {/* User Dropdown */}
//             <div className="relative" ref={dropdownRef}>
//               <button
//                 onClick={() => setShowDropdown(!showDropdown)}
//                 className="flex items-center space-x-3 bg-white px-4 py-2 rounded-md border hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <div className="bg-gray-100 rounded-full p-2">
//                   <FaUser className="text-gray-600" />
//                 </div>
//                 <span className="text-gray-700 font-medium">{user?.name}</span>
//                 <FaCaretDown className={`text-gray-600 transition-transform duration-200 ${showDropdown ? 'transform rotate-180' : ''}`} />
//               </button>

//               {/* Dropdown Menu */}
//               {showDropdown && (
//                 <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10 transform opacity-100 scale-100 transition-all duration-200">
//                   <div className="px-4 py-3 border-b">
//                     <p className="text-sm text-gray-500">Signed in as</p>
//                     <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
//                   </div>
//                   <button
//                     onClick={handleLogout}
//                     className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
//                   >
//                     <FaSignOutAlt className="mr-2" />
//                     Sign Out
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Error Display */}
//         {error && (
//           <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
//             <div className="flex">
//               <div className="flex-shrink-0">
//                 <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
//                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//                 </svg>
//               </div>
//               <div className="ml-3">
//                 <p className="text-sm text-red-700">{error}</p>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Statistics Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//           <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
//             <h3 className="text-lg font-medium text-gray-900">Total Issues</h3>
//             <p className="text-3xl font-bold text-blue-600">{statistics.total}</p>
//           </div>
//           <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
//             <h3 className="text-lg font-medium text-gray-900">Resolved</h3>
//             <p className="text-3xl font-bold text-green-600">{statistics.resolved}</p>
//           </div>
//           <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
//             <h3 className="text-lg font-medium text-gray-900">In Progress</h3>
//             <p className="text-3xl font-bold text-yellow-600">{statistics.inProgress}</p>
//           </div>
//           <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
//             <h3 className="text-lg font-medium text-gray-900">Reported</h3>
//             <p className="text-3xl font-bold text-red-600">{statistics.reported}</p>
//           </div>
//         </div>

//         {/* Navigation Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {/* Issues Card */}
//           <div 
//             onClick={() => router.push('/dashboard/citizen/issues')}
//             className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 cursor-pointer"
//           >
//             <div className="flex items-center">
//               <FaClipboardList className="text-4xl text-blue-600 mr-4" />
//               <div>
//                 <h3 className="text-xl font-medium text-gray-900">View All Issues</h3>
//                 <p className="text-gray-600">Manage and track all your reported issues</p>
//               </div>
//             </div>
//           </div>

//           {/* Analytics Card */}
//           <div 
//             onClick={() => router.push('/dashboard/citizen/analytics')}
//             className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 cursor-pointer"
//           >
//             <div className="flex items-center">
//               <FaChartBar className="text-4xl text-green-600 mr-4" />
//               <div>
//                 <h3 className="text-xl font-medium text-gray-900">Analytics</h3>
//                 <p className="text-gray-600">View detailed analytics of your reported issues</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
return (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8">
    <div className="max-w-7xl mx-auto">
      {/* Enhanced Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Citizen Dashboard
          </h1>
          <p className="text-gray-600">Welcome back, {user?.name}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          <button 
            onClick={() => router.push('/citizens/report')}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 shadow-lg"
          >
            Report New Issue
          </button>
          
          {/* Enhanced User Dropdown */}
          <div className="relative w-full sm:w-auto" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full sm:w-auto flex items-center space-x-3 bg-white px-4 py-3 rounded-xl border border-gray-200 hover:border-gray-300 transition-all shadow-sm hover:shadow-md"
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
                  <p className="text-xs font-semibold text-gray-500">CITIZEN PROFILE</p>
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
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-start shadow-md">
          <svg className="h-5 w-5 text-red-500 flex-shrink-0 mt-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="ml-3 text-sm text-red-700 flex-1">{error}</p>
        </div>
      )}

      {/* Enhanced Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Issues"
          value={statistics.total}
          icon={FaClipboardList}
          color="from-blue-500 to-blue-600"
        />
        <StatCard 
          title="Resolved"
          value={statistics.resolved}
          icon={FaCheckCircle}
          color="from-green-500 to-green-600"
        />
        <StatCard 
          title="In Progress"
          value={statistics.inProgress}
          icon={FaSync}
          color="from-yellow-500 to-yellow-600"
        />
        <StatCard 
          title="Reported"
          value={statistics.reported}
          icon={FaExclamationTriangle}
          color="from-red-500 to-red-600"
        />
      </div>

      {/* Enhanced Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <NavigationCard
          title="Issue Tracker"
          description="Manage and track all your reported issues"
          icon={FaClipboardList}
          color="bg-blue-100"
          onClick={() => router.push('/dashboard/citizen/issues')}
        />
        <NavigationCard
          title="Analytics Hub"
          description="Detailed insights about your reports"
          icon={FaChartBar}
          color="bg-purple-100"
          onClick={() => router.push('/dashboard/citizen/analytics')}
        />
      </div>
    </div>
  </div>
);
}

// New Stat Card Component
function StatCard({ title, value, icon: Icon, color }: { 
title: string;
value: number;
icon: IconType;
color: string;
}) {
return (
  <div className={`bg-gradient-to-br ${color} p-6 rounded-2xl text-white shadow-lg hover:shadow-xl transition-shadow`}>
    <div className="flex justify-between items-center">
      <div>
        <p className="text-sm font-medium mb-2 opacity-90">{title}</p>
        <p className="text-4xl font-bold">{value}</p>
      </div>
      <div className="bg-white/20 p-3 rounded-xl">
        <Icon className="h-8 w-8" />
      </div>
    </div>
  </div>
);
}

// New Navigation Card Component
function NavigationCard({ title, description, icon: Icon, color, onClick }: { 
title: string;
description: string;
icon: IconType;
color: string;
onClick: () => void;
}) {
return (
  <div 
    onClick={onClick}
    className={`${color} p-6 rounded-2xl cursor-pointer transform transition-all hover:-translate-y-1 hover:shadow-xl group`}
  >
    <div className="flex items-start space-x-4">
      <div className="bg-white p-3 rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
        <Icon className="h-8 w-8 text-gray-700" />
      </div>
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  </div>
);
}