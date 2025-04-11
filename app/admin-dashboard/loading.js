export default function AdminDashboardLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header skeleton */}
      <div className="mb-6">
        <div className="h-8 bg-gray-200 rounded w-2/5 mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-3/5 animate-pulse"></div>
      </div>
      
      {/* Stats skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 mr-3"></div>
              <div className="h-5 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
      
      {/* Quick Actions skeleton */}
      <div className="mb-8">
        <div className="h-6 bg-gray-200 rounded w-1/6 mb-4 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-5 animate-pulse">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gray-200 mr-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Recent Activity skeleton */}
      <div>
        <div className="h-6 bg-gray-200 rounded w-1/6 mb-4 animate-pulse"></div>
        <div className="bg-white rounded-lg shadow overflow-hidden animate-pulse">
          <div className="h-8 bg-gray-100 w-full"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-200 mr-3"></div>
                <div className="space-y-2 flex-grow">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 