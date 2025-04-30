export default function UnauthorizedPage() {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Unauthorized</h1>
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }