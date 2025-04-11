'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { getAllGalleryItems, deleteGalleryItem } from '@/utils/galleryService';
import Link from 'next/link';
import Image from 'next/image';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { FaPlus, FaEdit, FaTrash, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

// Image component with error handling
const GalleryImage = ({ src, alt, fallback = '/images/placeholder-car.jpg' }) => {
  const [error, setError] = useState(false);
  
  if (!src || error) {
    return (
      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
        <img
          src={fallback}
          alt="Placeholder"
          className="object-cover w-full h-full"
          onError={() => console.log(`[Gallery] Fallback image failed to load for ${alt}`)}
        />
      </div>
    );
  }
  
  return (
    <img
      src={src}
      alt={alt}
      className="object-cover w-full h-full"
      onError={(e) => {
        console.error(`[Gallery] Image failed to load: ${src}`);
        setError(true);
      }}
    />
  );
};

export default function GalleryAdminPage() {
  const router = useRouter();
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);

  useEffect(() => {
    async function fetchGalleryItems() {
      setLoading(true);
      try {
        console.log('Fetching gallery items...');
        
        // First try API
        try {
          const response = await fetch('/api/gallery');
          if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
          }
          
          const data = await response.json();
          const items = data.items || [];
          console.log(`Successfully fetched ${items.length} gallery items from API`);
          if (items.length > 0) {
            console.log('First item:', items[0]);
          }
          
          setGalleryItems(items);
        } catch (apiError) {
          console.error('Error fetching from API:', apiError);
          console.log('Falling back to direct Firestore query...');
          
          // Try direct Firestore query as fallback
          try {
            const q = query(collection(db, 'galleryItems'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            
            const items = [];
            querySnapshot.forEach((doc) => {
              items.push({ id: doc.id, ...doc.data() });
            });
            
            console.log(`Successfully fetched ${items.length} gallery items from Firestore`);
            if (items.length > 0) {
              console.log('First item:', items[0]);
            }
            
            setGalleryItems(items);
          } catch (firestoreError) {
            console.error('Error fetching from Firestore:', firestoreError);
            
            // Fall back to client-side utility as last resort
            try {
              const items = await getAllGalleryItems();
              console.log(`Retrieved ${items.length} gallery items from galleryService`);
              setGalleryItems(items);
            } catch (clientError) {
              console.error('Error fetching from client service:', clientError);
              // Set empty array as last resort
              setGalleryItems([]);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching gallery items:', err);
        setError('Failed to load gallery items: ' + err.message);
        setGalleryItems([]); // Set empty array to prevent undefined errors
      } finally {
        setLoading(false);
      }
    }

    fetchGalleryItems();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this gallery item?')) {
      return;
    }
    
    setDeleteLoading(id);
    
    try {
      console.log(`Deleting gallery item with ID: ${id}`);
      
      // Try API endpoint first
      try {
        const response = await fetch(`/api/gallery?id=${id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error(`API delete failed with status ${response.status}`);
        }
        
        console.log('Successfully deleted gallery item via API');
        toast.success('Gallery item deleted successfully');
        
        // Update state
        setGalleryItems(galleryItems.filter(item => item.id !== id));
      } catch (apiError) {
        console.error('API delete error:', apiError);
        console.log('Falling back to direct Firestore delete...');
        
        // Try direct Firestore delete
        try {
          await deleteDoc(doc(db, 'galleryItems', id));
          console.log('Successfully deleted gallery item via Firestore');
          toast.success('Gallery item deleted successfully');
          
          // Update state
          setGalleryItems(galleryItems.filter(item => item.id !== id));
        } catch (firestoreError) {
          console.error('Firestore delete error:', firestoreError);
          console.log('Falling back to client-side delete...');
          
          // Fall back to client utility
          await deleteGalleryItem(id);
          console.log('Gallery item deleted via galleryService');
          toast.success('Gallery item deleted successfully');
          
          // Update state
          setGalleryItems(galleryItems.filter(item => item.id !== id));
        }
      }
    } catch (err) {
      console.error('Error deleting gallery item:', err);
      setError('Failed to delete gallery item: ' + err.message);
      toast.error('Failed to delete gallery item: ' + err.message);
    } finally {
      setDeleteLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gallery Management</h1>
        
        <button
          onClick={() => router.push('/admin-dashboard/gallery/new')}
          className="flex items-center bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark"
        >
          <FaPlus className="mr-2" />
          Add Gallery Item
        </button>
      </div>
      
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaExclamationTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {Array.isArray(galleryItems) && galleryItems.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categories
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Added
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {galleryItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-16 h-16 rounded overflow-hidden relative">
                        <GalleryImage
                          src={item.mainImage}
                          alt={item.title}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {item.title}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {item.description?.substring(0, 100)}
                        {item.description?.length > 100 ? '...' : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {item.categories?.map(cat => (
                          <span
                            key={cat}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          href={`/admin-dashboard/gallery/edit/${item.id}`}
                          className="text-primary hover:text-primary-dark"
                        >
                          <FaEdit className="inline-block" />
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deleteLoading === item.id}
                          className="text-red-600 hover:text-red-800 disabled:opacity-50"
                        >
                          {deleteLoading === item.id ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <FaTrash className="inline-block" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-8 text-center">
            <p className="text-gray-500 text-lg">No gallery items found</p>
            <button
              onClick={() => router.push('/admin-dashboard/gallery/new')}
              className="mt-4 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark"
            >
              Add Your First Gallery Item
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 