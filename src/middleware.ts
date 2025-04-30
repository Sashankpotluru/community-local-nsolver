
// // middleware.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { jwtVerify } from 'jose';

// const ADMIN_PATH = '/admin';
// const LOGOUT_PATH = '/api/auth/logout';



// export async function middleware(request: NextRequest) {
//   // Handle logout separately
//   if (request.nextUrl.pathname === LOGOUT_PATH) {
//     const response = NextResponse.json({ 
//       success: true,
//       message: 'Logged out successfully' 
//     });
    
//     // Clear the auth token
//     response.cookies.delete('token');
    
//     return response;
//   }

//   // Handle admin routes
//   if (request.nextUrl.pathname.startsWith(ADMIN_PATH)) {
//     const token = request.cookies.get('token')?.value;

//     if (!token) {
//       // Not logged in, redirect to login
//       return NextResponse.redirect(new URL('/login', request.url));
//     }

//     try {
//       // Verify JWT_SECRET exists
//       const jwtSecret = process.env.JWT_SECRET;
//       if (!jwtSecret) {
//         console.error('JWT_SECRET is not defined');
//         return NextResponse.redirect(new URL('/login', request.url));
//       }

//       // Verify token
//       const { payload } = await jwtVerify(
//         token,
//         new TextEncoder().encode(jwtSecret)
//       );

//       // Type safety for payload
//       interface UserPayload {
//         role?: string;
//         email?: string;
//         id?: string;
//         exp?: number;
//       }

//       const userPayload = payload as UserPayload;

//       // Check token expiration
//       if (userPayload.exp && Date.now() >= userPayload.exp * 1000) {
//         const response = NextResponse.redirect(new URL('/login', request.url));
//         response.cookies.delete('token');
//         return response;
//       }

//       // Check if user is admin
//       if (userPayload.role !== 'Admin') {
//         // Not an admin, redirect to unauthorized
//         return NextResponse.redirect(new URL('/unauthorized', request.url));
//       }

//       // Clone the request headers and add user info
//       const requestHeaders = new Headers(request.headers);
//       requestHeaders.set('user-role', userPayload.role);
//       requestHeaders.set('user-email', userPayload.email || '');
//       requestHeaders.set('user-id', userPayload.id || '');

//       // User is admin, allow access with modified headers
//       const response = NextResponse.next({
//         request: {
//           headers: requestHeaders,
//         },
//       });

//       return response;

//     } catch (err) {
//       console.error('Token verification failed:', err);
//       // Invalid token, clear it and redirect to login
//       const response = NextResponse.redirect(new URL('/login', request.url));
//       response.cookies.delete('token');
//       return response;
//     }
//   }

//   // For all other routes, continue as normal
//   return NextResponse.next();
// }

// // Update matcher to include both admin routes and logout
// export const config = {
//   matcher: ['/admin/:path*', '/api/auth/logout'],
// };

// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const ADMIN_PATH = '/admin';
const LOGOUT_PATH = '/api/auth/logout';
const PUBLIC_PATHS = [
  '/login',
  '/register',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/_next',
  '/favicon.ico',
];

// Helper function to verify token
async function verifyToken(token: string) {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined');
  }
  return await jwtVerify(token, new TextEncoder().encode(jwtSecret));
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Handle logout separately
  if (path === LOGOUT_PATH) {
    const response = NextResponse.json({ 
      success: true,
      message: 'Logged out successfully' 
    });
    response.cookies.delete('token');
    return response;
  }

  // Allow public paths
  if (PUBLIC_PATHS.some(publicPath => path.startsWith(publicPath))) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value;

  // If no token, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Handle admin routes (keeping existing admin logic)
    if (path.startsWith(ADMIN_PATH)) {
      const { payload } = await verifyToken(token);
      
      interface UserPayload {
        role?: string;
        email?: string;
        id?: string;
        exp?: number;
      }

      const userPayload = payload as UserPayload;

      if (userPayload.exp && Date.now() >= userPayload.exp * 1000) {
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('token');
        return response;
      }

      if (userPayload.role !== 'Admin') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('user-role', userPayload.role);
      requestHeaders.set('user-email', userPayload.email || '');
      requestHeaders.set('user-id', userPayload.id || '');

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    // Handle citizen and volunteer routes
    if (path.startsWith('/dashboard')) {
      const { payload } = await verifyToken(token);
      
      interface UserPayload {
        role?: string;
        email?: string;
        userId?: string;
        exp?: number;
      }

      const userPayload = payload as UserPayload;

      // Check token expiration
      if (userPayload.exp && Date.now() >= userPayload.exp * 1000) {
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('token');
        return response;
      }

      // Verify correct role for each dashboard
      if (path.startsWith('/dashboard/citizen') && userPayload.role !== 'Citizen') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      if (path.startsWith('/dashboard/volunteer') && userPayload.role !== 'Volunteer') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      // Add user info to headers
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('user-role', userPayload.role || '');
      requestHeaders.set('user-email', userPayload.email || '');
      requestHeaders.set('user-id', userPayload.userId || '');

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    // For all other authenticated routes
    return NextResponse.next();

  } catch (err) {
    console.error('Token verification failed:', err);
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    return response;
  }
}

// Update matcher to include admin, dashboard, and logout routes
export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/api/auth/logout'
  ],
};