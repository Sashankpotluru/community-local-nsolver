// import Link from 'next/link';
// import Image from 'next/image';

// export default function Home() {
//   return (
//     <div className="flex flex-col">
//       {/* Hero Section */}
//       <section className="bg-blue-50 py-20">
//         <div className="container mx-auto px-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
//             <div>
//               <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
//                 Make Your Community Better Together
//               </h1>
//               <p className="text-xl text-gray-600 mb-8">
//                 Report local issues, connect with volunteers, and track solutions in real-time. Join us in making our community a better place to live.
//               </p>
//               <div className="space-x-4">
//                 <Link 
//                   href="/register" 
//                   className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 inline-block"
//                 >
//                   Get Started
//                 </Link>
//                 <Link 
//                   href="/how-it-works" 
//                   className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-50 inline-block"
//                 >
//                   Learn More
//                 </Link>
//               </div>
//             </div>
//             <div className="hidden md:block">
//               {/* Add your hero image here */}
//               <Image
//                 src="/community.png" // You'll need to add this image to your public folder
//                 alt="Community"
//                 width={600}
//                 height={400}
//                 priority
//               />
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Features Section */}
//       <section className="py-20">
//         <div className="container mx-auto px-6">
//           <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//             {/* Feature 1 */}
//             <div className="text-center p-6">
//               <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
//                 </svg>
//               </div>
//               <h3 className="text-xl font-semibold mb-2">Report an Issue</h3>
//               <p className="text-gray-600">
//                 Easily report local issues with photos and location details.
//               </p>
//             </div>

//             {/* Feature 2 */}
//             <div className="text-center p-6">
//               <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
//                 </svg>
//               </div>
//               <h3 className="text-xl font-semibold mb-2">Connect with Volunteers</h3>
//               <p className="text-gray-600">
//                 Local volunteers and authorities work together to solve issues.
//               </p>
//             </div>

//             {/* Feature 3 */}
//             <div className="text-center p-6">
//               <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//               </div>
//               <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
//               <p className="text-gray-600">
//                 Get real-time updates as your reported issues get resolved.
//               </p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Stats Section */}
//       <section className="bg-blue-600 text-white py-20">
//         <div className="container mx-auto px-6">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
//             <div>
//               <div className="text-4xl font-bold mb-2">1,234+</div>
//               <div>Issues Resolved</div>
//             </div>
//             <div>
//               <div className="text-4xl font-bold mb-2">567+</div>
//               <div>Active Volunteers</div>
//             </div>
//             <div>
//               <div className="text-4xl font-bold mb-2">89%</div>
//               <div>Satisfaction Rate</div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* CTA Section */}
//       <section className="py-20">
//         <div className="container mx-auto px-6 text-center">
//           <h2 className="text-3xl font-bold mb-8">Ready to Make a Difference?</h2>
//           <Link 
//             href="/register" 
//             className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 inline-block"
//           >
//             Join Your Community Today
//           </Link>
//         </div>
//       </section>
//     </div>
//   );
// }

// app/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { FaRegFlag, FaUsers, FaChartLine, FaRegCheckCircle } from 'react-icons/fa';

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-600 text-white py-24 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Empower Your Community,<br/>
                <span className="bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
                  Solve Local Issues
                </span>
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl">
                Collaborate with neighbors and local authorities to identify, track, 
                and resolve community challenges in real-time.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/register" 
                  className="bg-amber-400 text-blue-900 px-8 py-4 rounded-xl hover:bg-amber-300 transition-all 
                            font-semibold text-lg shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  Join Now - It's Free
                </Link>
                <Link 
                  href="/how-it-works" 
                  className="bg-white/10 text-white px-8 py-4 rounded-xl hover:bg-white/20 transition-all 
                            font-semibold text-lg shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  How It Works →
                </Link>
              </div>
            </div>
            <div className="hidden md:block relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl 
                            transform rotate-6 scale-105"></div>
              <Image
                src="/community.png"
                alt="Community collaboration"
                width={600}
                height={400}
                priority
                className="relative rounded-3xl transform hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Transform Your Neighborhood
            </h2>
            <p className="text-gray-600 text-lg">
              Our platform brings together citizens, volunteers, and local authorities 
              to create sustainable solutions for community challenges.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={FaRegFlag}
              title="Report Issues"
              description="Easily document local problems with photos, location, and details"
              color="text-blue-600"
            />
            <FeatureCard 
              icon={FaUsers}
              title="Collaborate"
              description="Connect with volunteers and officials working on solutions"
              color="text-purple-600"
            />
            <FeatureCard 
              icon={FaRegCheckCircle}
              title="Track Progress"
              description="Real-time updates and transparent resolution tracking"
              color="text-amber-600"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-br from-gray-100 to-white py-24">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <StatItem 
              value="1,234+"
              label="Issues Resolved"
              icon={FaRegCheckCircle}
              color="text-green-500"
            />
            <StatItem 
              value="567+"
              label="Active Volunteers"
              icon={FaUsers}
              color="text-blue-500"
            />
            <StatItem 
              value="89%"
              label="Satisfaction Rate"
              icon={FaChartLine}
              color="text-amber-500"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-900 to-purple-900 text-white">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-2xl mx-auto space-y-8">
            <h2 className="text-4xl font-bold">
              Ready to Make an Impact?
            </h2>
            <p className="text-xl text-blue-200">
              Join thousands of community members already creating positive change
            </p>
            <Link 
              href="/register" 
              className="inline-block bg-amber-400 text-blue-900 px-12 py-5 rounded-2xl hover:bg-amber-300 
                        transition-all font-bold text-xl shadow-2xl hover:shadow-3xl"
            >
              Start Now - Free Forever
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, color }: { 
  icon: any;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
      <div className={`${color} mb-6`}>
        <Icon className="h-12 w-12" />
      </div>
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function StatItem({ value, label, icon: Icon, color }: { 
  value: string;
  label: string;
  icon: any;
  color: string;
}) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
      <div className={`${color} mb-4`}>
        <Icon className="h-10 w-10 mx-auto" />
      </div>
      <div className="text-4xl font-bold mb-2">{value}</div>
      <div className="text-gray-600 font-medium">{label}</div>
    </div>
  );
}