'use client';

import { useState } from 'react';
import { FaExclamationTriangle, FaCheckCircle, FaCopy, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

export default function FixTestimonialsIndexPage() {
  const [copySuccess, setCopySuccess] = useState(false);
  
  const indexUrl = "https://console.firebase.google.com/v1/r/project/ca-international-automotive/firestore/indexes?create_composite=CmBwcm9qZWN0cy9jYS1pbnRlcm5hdGlvbmFsLWF1dG9tb3RpdmUvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL3Rlc3RpbW9uaWFscy9pbmRleGVzL18QARoKCgZzdGF0dXMQARoICgRkYXRlEAIaDAoIX19uYW1lX18QAg";
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(indexUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (err) {
      console.error('Failed to copy URL: ', err);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto">
        <Link 
          href="/admin-dashboard/testimonials" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <FaArrowLeft className="mr-2" /> Back to Testimonials
        </Link>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-start mb-6">
            <FaExclamationTriangle className="text-yellow-500 text-2xl mr-4 mt-1" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Fix Testimonials Firestore Index</h1>
              <p className="mt-2 text-gray-600">
                The testimonials feature requires a composite index in Firestore to function properly. This is a one-time setup.
              </p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
            <h2 className="font-medium text-gray-900 mb-3">Error Details</h2>
            <pre className="text-sm bg-gray-100 p-3 rounded overflow-x-auto">
              {`FirebaseError: The query requires an index. You can create it here: [...]\n\nThis error occurs because the testimonials query uses a combination of filters and ordering that requires a composite index.`}
            </pre>
          </div>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-2">Option 1: Automatic Fix (Recommended)</h2>
              <p className="text-gray-600 mb-3">
                Click the button below to open the Firebase Console and automatically create the required index.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href={indexUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 inline-flex items-center justify-center"
                >
                  Create Index in Firebase Console
                </a>
                
                <button 
                  onClick={copyToClipboard}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 inline-flex items-center justify-center"
                >
                  <FaCopy className="mr-2" />
                  {copySuccess ? 'Copied!' : 'Copy URL'}
                </button>
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-2">Option 2: Manual Setup</h2>
              <p className="text-gray-600 mb-3">
                Alternatively, you can create the index manually in the Firebase Console:
              </p>
              
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Go to <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Firebase Console</a></li>
                <li>Select your project: <strong>ca-international-automotive</strong></li>
                <li>Navigate to <strong>Firestore Database</strong> in the left sidebar</li>
                <li>Click the <strong>Indexes</strong> tab</li>
                <li>Click <strong>Create index</strong></li>
                <li>For Collection, enter: <strong>testimonials</strong></li>
                <li>Add the following fields:
                  <ul className="list-disc list-inside ml-6 mt-1">
                    <li><strong>status</strong> - Ascending</li>
                    <li><strong>date</strong> - Descending</li>
                  </ul>
                </li>
                <li>Click <strong>Create</strong></li>
              </ol>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-start">
                <FaCheckCircle className="text-blue-500 mt-1 mr-3" />
                <div>
                  <h3 className="font-medium text-blue-800">What happens next?</h3>
                  <p className="mt-2 text-blue-700">
                    After creating the index, Firebase will begin building it. This process can take a few minutes to complete. 
                    Once the index is ready, the testimonials feature will work properly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 