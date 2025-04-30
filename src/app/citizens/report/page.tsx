// 'use client';
// import { useState, useEffect } from 'react';
// import Image from 'next/image';
// import { FaUpload, FaSpinner } from 'react-icons/fa';

// import { useRouter } from 'next/navigation';

// // Interfaces
// interface Category {
//   _id: string;
//   name: string;
// }

// interface NominatimResponse {
//   place_id: number;
//   licence: string;
//   osm_type: string;
//   osm_id: number;
//   lat: string;
//   lon: string;
//   display_name: string;
//   boundingbox: string[];
// }

// interface FormState {
//   title: string;
//   description: string;
//   categoryId: string;
//   comments: string;
//   address: string;
//   photo: File | null;
//   coordinates: {
//     lat: number;
//     lng: number;
//   };
// }

// export default function ReportIssueForm() {
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [addressSuggestions, setAddressSuggestions] = useState<NominatimResponse[]>([]);
//   const [showSuggestions, setShowSuggestions] = useState(false);
//   const [userId, setUserId] = useState<string | null>(null);
//   const router = useRouter();
//   const [user, setUser] = useState<{ id: string; role: string } | null>(null);
  
//   const [form, setForm] = useState<FormState>({
//     title: '',
//     description: '',
//     categoryId: '',
//     comments: '',
//     address: '',
//     photo: null,
//     coordinates: {
//       lat: 0,
//       lng: 0
//     }
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [photoPreview, setPhotoPreview] = useState<string>('');
//   const [addressError, setAddressError] = useState('');

//   // Fetch categories from database
//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const res = await fetch('/api/categories');
//         const data = await res.json();
//         setCategories(data);
//       } catch (err) {
//         console.error('Failed to fetch categories:', err);
//         setError('Failed to load categories');
//       }
//     };

//     fetchCategories();
//   }, []);
//   useEffect(() => {
//     const userData = localStorage.getItem('user');
//     console.log('User data from localStorage:', userData); // Debug log
//     if (!userData) {
//       console.log('No user data found, redirecting to login');
//       router.push('/login?redirect=/citizens/report');
//       return;
//     }

//     try {
//         const parsedUser = JSON.parse(userData);
//         console.log('Parsed user data:', parsedUser); // Debug log
    
//         if (parsedUser.role !== 'Citizen') {
//           console.log('User is not a citizen, redirecting');
//           router.push('/dashboard/' + parsedUser.role.toLowerCase());
//           return;
//         }
    
//         setUser(parsedUser);
//         setUserId(parsedUser.id); // Set userId here
//       } catch (error) {
//         console.error('Error parsing user data:', error);
//         router.push('/login');
//       }
//     }, [router]);

//   // Handle address search
//   const searchAddress = async (query: string) => {
//     if (query.length < 3) {
//       setAddressSuggestions([]);
//       return;
//     }

//     try {
//       const response = await fetch(
//         `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
//           query
//         )}&limit=5`
//       );
//       const data: NominatimResponse[] = await response.json();
//       setAddressSuggestions(data);
//       setShowSuggestions(true);
//     } catch (error) {
//       console.error('Failed to fetch address suggestions:', error);
//       setAddressSuggestions([]);
//     }
//   };

//   // Handle click outside suggestions
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       const target = event.target as HTMLElement;
//       if (!target.closest('#address')) {
//         setShowSuggestions(false);
//       }
//     };

//     document.addEventListener('click', handleClickOutside);
//     return () => {
//       document.removeEventListener('click', handleClickOutside);
//     };
//   }, []);

//   // Handle form field changes
//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
//   ) => {
//     const { name, value } = e.target;
//     setForm(prev => ({ ...prev, [name]: value }));
    
//     // If the field is address, search for suggestions
//     if (name === 'address') {
//       searchAddress(value);
//     }
//   };

//   // Handle address selection
//   const handleAddressSelect = (suggestion: NominatimResponse) => {
//     setForm(prev => ({
//       ...prev,
//       address: suggestion.display_name,
//       coordinates: {
//         lat: parseFloat(suggestion.lat),
//         lng: parseFloat(suggestion.lon)
//       }
//     }));
//     setShowSuggestions(false);
//     setAddressError('');
//   };

//   // Handle photo upload
//   const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       if (file.size > 5 * 1024 * 1024) {
//         setError('Photo size should be less than 5MB');
//         return;
//       }

//       if (!file.type.startsWith('image/')) {
//         setError('Please upload an image file');
//         return;
//       }

//       setForm(prev => ({ ...prev, photo: file }));
      
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setPhotoPreview(reader.result as string);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   // Handle form submission
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     console.log('Form submission started'); // Debug log
//     setLoading(true);
//     setError('');
//     setSuccess('');

//     if (!user) {
//       console.log('No user found during submission'); // Debug log
//       setError('Please login to report an issue');
//       setLoading(false);
//       return;
//     }
//     if (form.coordinates.lat === 0 && form.coordinates.lng === 0) {
//         setAddressError('Please select a valid address from the dropdown');
//         setLoading(false);
//         return;
//       }

//       try {
//         const formData = new FormData();
//         formData.append('title', form.title);
//         formData.append('description', form.description);
//         formData.append('categoryId', form.categoryId);
//         formData.append('comments', form.comments);
//         formData.append('address', form.address);
//         formData.append('latitude', form.coordinates.lat.toString());
//         formData.append('longitude', form.coordinates.lng.toString());
        
//         if (form.photo) {
//           formData.append('photo', form.photo);
//         }
  
//         const response = await fetch('/api/issues', {
//           method: 'POST',
//           headers: {
//             'user-id': user.id, // Add user ID to headers
//           },
//           body: formData,
//         });

//         const data = await response.json();

//         if (!response.ok) {
//           throw new Error(data.error || 'Failed to submit issue');
//         }
  
//         setSuccess('Issue reported successfully!');
//         // Clear form
//         setForm({
//           title: '',
//           description: '',
//           categoryId: '',
//           comments: '',
//           address: '',
//           photo: null,
//           coordinates: { lat: 0, lng: 0 }
//         });
//         setPhotoPreview('');
        
//         if (response.ok) {
//             setSuccess('Issue reported successfully!');
//             // Clear form...
//             // Wait 2 seconds then redirect
//             setTimeout(() => {
//               router.push('/dashboard/citizen');  // Note: changed from citizens to citizen
//             }, 2000);
//           }
//         // Optionally redirect to issues list after success
//         // router.push('/citizens/issues');
//       } catch (err) {
//         console.error('Submit error:', err); // Debug log
//         const errorMessage = err instanceof Error ? err.message : 'Failed to submit issue';
//         setError(errorMessage);
//         console.error('Submit error:', err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     // Show loading state while checking authentication
//   if (!user) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <FaSpinner className="animate-spin h-8 w-8 text-blue-500" />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
//         {/* Card Container */}
//         <div className="bg-white rounded-xl shadow-lg overflow-hidden">
//           {/* Header Section */}
//           <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
//             <h1 className="text-2xl font-bold text-white">Report an Issue</h1>
//             <p className="text-blue-100 mt-1">
//               Help us improve our community by reporting issues
//             </p>
//           </div>

//           {/* Main Form Section */}
//           <div className="p-6">
//             {/* Alert Messages */}
//             {error && (
//               <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
//                 <div className="flex">
//                   <div className="flex-shrink-0">
//                     <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
//                       <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//                     </svg>
//                   </div>
//                   <div className="ml-3">
//                     <p className="text-sm text-red-700">{error}</p>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {success && (
//               <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded">
//                 <div className="flex">
//                   <div className="flex-shrink-0">
//                     <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
//                       <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                     </svg>
//                   </div>
//                   <div className="ml-3">
//                     <p className="text-sm text-green-700">{success}</p>
//                   </div>
//                 </div>
//               </div>
//             )}

//             <form onSubmit={handleSubmit} className="space-y-6">
//               {/* Title */}
//               <div>
//                 <label htmlFor="title" className="block text-sm font-medium text-gray-700">
//                   Issue Title *
//                 </label>
//                 <input
//                   type="text"
//                   id="title"
//                   name="title"
//                   required
//                   value={form.title}
//                   onChange={handleChange}
//                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
//                   placeholder="Brief title describing the issue"
//                 />
//               </div>

//               {/* Category Dropdown */}
//               <div>
//                 <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
//                   Category *
//                 </label>
//                 <select
//                   id="categoryId"
//                   name="categoryId"
//                   required
//                   value={form.categoryId}
//                   onChange={handleChange}
//                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
//                 >
//                   <option value="">Select issue category</option>
//                   {categories.map((category) => (
//                     <option key={category._id} value={category._id}>
//                       {category.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* Description */}
//               <div>
//                 <label htmlFor="description" className="block text-sm font-medium text-gray-700">
//                   Description *
//                 </label>
//                 <textarea
//                   id="description"
//                   name="description"
//                   required
//                   value={form.description}
//                   onChange={handleChange}
//                   rows={4}
//                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
//                   placeholder="Provide detailed description of the issue"
//                 />
//               </div>

//               {/* Location */}
//               <div className="relative">
//       <label htmlFor="address" className="block text-sm font-medium text-gray-700">
//         Location Address *
//       </label>
//       <div className="mt-1">
//         <input
//           type="text"
//           id="address"
//           name="address"
//           required
//           value={form.address}
//           onChange={handleChange}
//           onFocus={() => setShowSuggestions(true)}
//           className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
//                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
//                     text-gray-900"
//           placeholder="Enter full address (e.g., 123 Main St, City, State)"
//         />
//         {addressError && (
//           <p className="mt-1 text-sm text-red-600">
//             {addressError}
//           </p>
//         )}
//       </div>
//       {showSuggestions && addressSuggestions.length > 0 && (
//         <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg">
//           <ul className="max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
//             {addressSuggestions.map((suggestion, index) => (
//               <li
//                 key={index}
//                 className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50 text-gray-900"
//                 onClick={() => handleAddressSelect(suggestion)}
//               >
//                 {suggestion.display_name}
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}
      
//       <p className="mt-1 text-sm text-gray-500">
//         Please select an address from the suggestions for accurate location mapping
//       </p>
//     </div>

//               {/* Photo Upload */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">
//                   Photo Evidence
//                 </label>
//                 <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
//                   <div className="space-y-1 text-center">
//                     <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
//                     <div className="flex text-sm text-gray-600">
//                       <label
//                         htmlFor="photo-upload"
//                         className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 "
//                       >
//                         <span>Upload a file</span>
//                         <input
//                           id="photo-upload"
//                           name="photo"
//                           type="file"
//                           accept="image/*"
//                           onChange={handlePhotoChange}
//                           className="sr-only"
//                         />
//                       </label>
//                       <p className="pl-1">or drag and drop</p>
//                     </div>
//                     <p className="text-xs text-gray-500">
//                       PNG, JPG, GIF up to 5MB
//                     </p>
//                   </div>
//                 </div>
//                 {photoPreview && (
//                   <div className="mt-2">
//                     <Image
//                       src={photoPreview}
//                       alt="Preview"
//                       width={200}
//                       height={200}
//                       className="rounded-md"
//                     />
//                   </div>
//                 )}
//               </div>

//               {/* Comments */}
//               <div>
//                 <label htmlFor="comments" className="block text-sm font-medium text-gray-700">
//                   Additional Comments
//                 </label>
//                 <textarea
//                   id="comments"
//                   name="comments"
//                   value={form.comments}
//                   onChange={handleChange}
//                   rows={3}
//                   className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
//                   placeholder="Any additional information that might be helpful"
//                 />
//               </div>

//               {/* Submit Button */}
//               <div className="flex justify-end">
//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className={`
//                     inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm
//                     text-base font-medium text-white bg-blue-600 hover:bg-blue-700 
//                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
//                     ${loading ? 'opacity-50 cursor-not-allowed' : ''}
//                   `}
//                 >
//                   {loading ? (
//                     <>
//                       <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5" />
//                       Submitting...
//                     </>
//                   ) : (
//                     'Submit Report'
//                   )}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

'use client';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { FaUpload, FaSpinner } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import debounce from 'lodash/debounce';

// Interfaces
interface Category {
  _id: string;
  name: string;
}

interface NominatimResponse {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  display_name: string;
  boundingbox: string[];
}

interface FormState {
  title: string;
  description: string;
  categoryId: string;
  comments: string;
  address: string;
  photo: File | null;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export default function ReportIssueForm() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [addressSuggestions, setAddressSuggestions] = useState<NominatimResponse[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; role: string } | null>(null);

  const [form, setForm] = useState<FormState>({
    title: '',
    description: '',
    categoryId: '',
    comments: '',
    address: '',
    photo: null,
    coordinates: {
      lat: 0,
      lng: 0
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [addressError, setAddressError] = useState('');

  // Fetch categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        setError('Failed to load categories');
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login?redirect=/citizens/report');
      return;
    }
    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'Citizen') {
        router.push('/dashboard/' + parsedUser.role.toLowerCase());
        return;
      }
      setUser(parsedUser);
      setUserId(parsedUser.id);
    } catch (error) {
      router.push('/login');
    }
  }, [router]);

  // Debounced address search
  const debouncedSearchAddress = useCallback(
    debounce(async (query: string) => {
      if (query.length < 3) {
        setAddressSuggestions([]);
        setIsSearchingAddress(false);
        return;
      }
      setIsSearchingAddress(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
          {
            headers: {
              'User-Agent': 'CrowdsourcedProblemSolver/1.0',
              'Accept': 'application/json'
            },
            mode: 'cors',
            cache: 'no-cache'
          }
        );
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data: NominatimResponse[] = await response.json();
        setAddressSuggestions(data);
        setShowSuggestions(true);
      } catch (error) {
        setAddressSuggestions([]);
      } finally {
        setIsSearchingAddress(false);
      }
    }, 700),
    []
  );

  // Handle form field changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    if (name === 'address') {
      setAddressError('');
      setForm(prev => ({
        ...prev,
        coordinates: { lat: 0, lng: 0 }
      }));
      debouncedSearchAddress(value);
    }
  };

  // Handle address selection
  const handleAddressSelect = (suggestion: NominatimResponse) => {
    setForm(prev => ({
      ...prev,
      address: suggestion.display_name,
      coordinates: {
        lat: parseFloat(suggestion.lat),
        lng: parseFloat(suggestion.lon)
      }
    }));
    setShowSuggestions(false);
    setAddressSuggestions([]);
    setAddressError('');
  };

  // Handle click outside suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('#address-suggestion-box') && !target.closest('#address')) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Handle photo upload
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Photo size should be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      setForm(prev => ({ ...prev, photo: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    if (!user) {
      setError('Please login to report an issue');
      setLoading(false);
      return;
    }
    if (form.coordinates.lat === 0 && form.coordinates.lng === 0) {
      setAddressError('Please select a valid address from the dropdown');
      setLoading(false);
      return;
    }
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('categoryId', form.categoryId);
      formData.append('comments', form.comments);
      formData.append('address', form.address);
      formData.append('latitude', form.coordinates.lat.toString());
      formData.append('longitude', form.coordinates.lng.toString());
      if (form.photo) {
        formData.append('photo', form.photo);
      }
      const response = await fetch('/api/issues', {
        method: 'POST',
        headers: {
          'user-id': user.id,
        },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit issue');
      }
      setSuccess('Issue reported successfully!');
      setForm({
        title: '',
        description: '',
        categoryId: '',
        comments: '',
        address: '',
        photo: null,
        coordinates: { lat: 0, lng: 0 }
      });
      setPhotoPreview('');
      setTimeout(() => {
        router.push('/dashboard/citizen');
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit issue';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaSpinner className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">Report an Issue</h1>
            <p className="text-blue-100 mt-1">
              Help us improve our community by reporting issues
            </p>
          </div>
          <div className="p-6">
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
            {success && (
              <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">{success}</p>
                  </div>
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Issue Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={form.title}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Brief title describing the issue"
                />
              </div>
              {/* Category Dropdown */}
              <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
                  Category *
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  required
                  value={form.categoryId}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                >
                  <option value="">Select issue category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Provide detailed description of the issue"
                />
              </div>
              {/* Location */}
              <div className="relative">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Location Address *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="address"
                    name="address"
                    required
                    value={form.address}
                    onChange={handleChange}
                    onFocus={() => setShowSuggestions(true)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      text-gray-900"
                    placeholder="Enter full address (e.g., 123 Main St, City, State)"
                    autoComplete="off"
                  />
                  {isSearchingAddress && (
                    <div className="mt-1 text-sm text-gray-500 flex items-center">
                      <FaSpinner className="animate-spin mr-2" /> Searching address...
                    </div>
                  )}
                  {addressError && (
                    <p className="mt-1 text-sm text-red-600">
                      {addressError}
                    </p>
                  )}
                </div>
                {showSuggestions && addressSuggestions.length > 0 && (
                  <div
                    id="address-suggestion-box"
                    className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg"
                  >
                    <ul className="max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                      {addressSuggestions.map((suggestion, index) => (
                        <li
                          key={index}
                          className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50 text-gray-900"
                          onClick={() => handleAddressSelect(suggestion)}
                        >
                          {suggestion.display_name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Please select an address from the suggestions for accurate location mapping
                </p>
              </div>
              {/* Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Photo Evidence
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="photo-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 "
                      >
                        <span>Upload a file</span>
                        <input
                          id="photo-upload"
                          name="photo"
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                </div>
                {photoPreview && (
                  <div className="mt-2">
                    <Image
                      src={photoPreview}
                      alt="Preview"
                      width={200}
                      height={200}
                      className="rounded-md"
                    />
                  </div>
                )}
              </div>
              {/* Comments */}
              <div>
                <label htmlFor="comments" className="block text-sm font-medium text-gray-700">
                  Additional Comments
                </label>
                <textarea
                  id="comments"
                  name="comments"
                  value={form.comments}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Any additional information that might be helpful"
                />
              </div>
              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className={`
                    inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm
                    text-base font-medium text-white bg-blue-600 hover:bg-blue-700 
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                    ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Report'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}