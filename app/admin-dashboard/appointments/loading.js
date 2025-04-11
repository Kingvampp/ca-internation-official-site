export default function AppointmentsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header skeleton */}
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        <div className="flex space-x-2">
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
      </div>
      
      {/* Filter skeleton */}
      <div className="mb-4">
        <div className="flex items-center space-x-4">
          <div className="h-5 bg-gray-200 rounded w-24 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
      </div>
      
      {/* Calendar skeleton */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="flex justify-between items-center p-4 border-b">
          <div className="h-8 bg-gray-200 rounded-full w-8 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded-full w-8 animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((_, i) => (
            <div key={i} className="bg-gray-50 text-center py-2">
              <div className="h-4 bg-gray-200 rounded w-8 mx-auto animate-pulse"></div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {Array(35).fill().map((_, i) => (
            <div key={i} className="bg-white p-2 min-h-[100px]">
              <div className="h-5 bg-gray-200 rounded w-5 mb-2 animate-pulse"></div>
              {Math.random() > 0.7 && (
                <div className="h-4 bg-gray-200 rounded w-full mb-1 animate-pulse"></div>
              )}
              {Math.random() > 0.8 && (
                <div className="h-4 bg-gray-200 rounded w-full mb-1 animate-pulse"></div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Table skeleton (hidden by default) */}
      <div className="hidden">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {Array(5).fill().map((_, i) => (
                  <th key={i} className="px-6 py-3 text-left">
                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array(5).fill().map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4">
                    <div className="h-5 bg-gray-200 rounded w-32 mb-1 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-5 bg-gray-200 rounded w-24 animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-5 bg-gray-200 rounded w-24 mb-1 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <div className="h-4 bg-gray-200 rounded-full w-4 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded-full w-4 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded-full w-4 animate-pulse"></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 