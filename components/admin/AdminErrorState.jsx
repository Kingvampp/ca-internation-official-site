'use client';

/**
 * AdminErrorState component for displaying error states in admin dashboard
 * 
 * @param {Object} props - Component props
 * @param {Error|string} props.error - Error object or error message
 * @param {Function} props.onRetry - Optional retry function
 * @param {string} props.title - Optional custom title
 */
export default function AdminErrorState({ 
  error, 
  onRetry = null,
  title = 'Something went wrong'
}) {
  const errorMessage = error instanceof Error ? error.message : error;
  
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex flex-col items-center justify-center text-center">
      <svg 
        className="w-12 h-12 text-red-500 mb-4" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
        />
      </svg>
      
      <h3 className="text-lg font-medium text-red-800 mb-2">
        {title}
      </h3>
      
      <p className="text-sm text-red-600 mb-4">
        {errorMessage}
      </p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
} 