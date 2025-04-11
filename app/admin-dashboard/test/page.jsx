'use client';

import { useState } from 'react';
import AdminDashboardClient from '../AdminDashboardClient';
import { runAllTests } from '@/utils/test-firebase';
import { FaPlay, FaCheck, FaTimes, FaSpinner, FaImage, FaEdit, FaTrash, FaSave, FaUserShield, FaPlus } from 'react-icons/fa';
import Link from 'next/link';

export default function AdminTestPage() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedTests, setSelectedTests] = useState({
    firebase: true,
    gallery: true
  });
  
  // Mock gallery items for testing when Firebase is unavailable
  const [mockGalleryItems, setMockGalleryItems] = useState([
    {
      id: 'mock1',
      title: 'BMW 3 Series Complete Restoration',
      description: 'Full restoration of a classic BMW 3 Series including bodywork, paint, and interior',
      categories: ['restoration'],
      tags: ['BMW', 'Classic', 'Restoration', 'European'],
      mainImage: 'https://images.unsplash.com/photo-1596636478939-59fed7a083f2?w=800&auto=format&fit=crop',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    },
    {
      id: 'mock2',
      title: 'Mercedes S-Class Paint Correction',
      description: 'Premium paint correction and ceramic coating for a Mercedes S-Class',
      categories: ['detailing'],
      tags: ['Mercedes', 'Detailing', 'European', 'Luxury'],
      mainImage: 'https://images.unsplash.com/photo-1532581140115-3e355d1ed1de?w=800&auto=format&fit=crop',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
    }
  ]);
  
  const [mockItemBeingEdited, setMockItemBeingEdited] = useState(null);
  const [adminSessionValid, setAdminSessionValid] = useState(null);
  const [mockImageEditorOpen, setMockImageEditorOpen] = useState(false);
  const [mockImageBeingEdited, setMockImageBeingEdited] = useState(null);
  const [mockBlurAreas, setMockBlurAreas] = useState([]);

  const runTests = async () => {
    setLoading(true);
    setResults(null);
    
    try {
      const testResults = await runAllTests();
      setResults(testResults);
    } catch (error) {
      console.error('Error running tests:', error);
      setResults({
        error: error.message || 'An unknown error occurred'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (test) => {
    setSelectedTests(prev => ({
      ...prev,
      [test]: !prev[test]
    }));
  };

  const renderStatusBadge = (status) => {
    if (!status) return null;
    
    switch (status) {
      case 'pass':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
            <FaCheck className="inline mr-1" /> PASS
          </span>
        );
      case 'fail':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
            <FaTimes className="inline mr-1" /> FAIL
          </span>
        );
      case 'warn':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
            ⚠️ WARNING
          </span>
        );
      case 'skip':
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
            SKIPPED
          </span>
        );
      default:
        return null;
    }
  };
  
  // Check if admin session is valid
  const checkAdminSession = () => {
    const isAdminAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
    setAdminSessionValid(isAdminAuthenticated);
    return isAdminAuthenticated;
  };
  
  // Mock deleting an item
  const handleDeleteMockItem = (id) => {
    if (window.confirm('Are you sure you want to delete this mock item?')) {
      setMockGalleryItems(prev => prev.filter(item => item.id !== id));
    }
  };
  
  // Start editing a mock item
  const handleEditMockItem = (item) => {
    setMockItemBeingEdited({...item});
  };
  
  // Save mock item changes
  const handleSaveMockItem = () => {
    setMockGalleryItems(prev => 
      prev.map(item => 
        item.id === mockItemBeingEdited.id ? mockItemBeingEdited : item
      )
    );
    setMockItemBeingEdited(null);
  };
  
  // Cancel mock item edit
  const handleCancelEdit = () => {
    setMockItemBeingEdited(null);
  };
  
  // Handle input change for mock item
  const handleMockItemChange = (e) => {
    const { name, value } = e.target;
    setMockItemBeingEdited(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Mock adding a new item
  const handleAddMockItem = () => {
    const newItem = {
      id: `mock${Date.now()}`,
      title: 'New Gallery Item',
      description: 'Description for the new gallery item',
      categories: ['new'],
      tags: ['New', 'Test'],
      mainImage: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop',
      createdAt: new Date()
    };
    
    setMockGalleryItems(prev => [...prev, newItem]);
  };
  
  // Open mock image editor
  const handleOpenMockImageEditor = (image) => {
    setMockImageBeingEdited(image);
    setMockImageEditorOpen(true);
    // Set some mock blur areas
    setMockBlurAreas([
      { x: 100, y: 50, width: 150, height: 30, blurAmount: 8 }
    ]);
  };
  
  // Add a mock blur area
  const handleAddMockBlurArea = () => {
    setMockBlurAreas(prev => [
      ...prev,
      { 
        x: Math.floor(Math.random() * 200) + 50, 
        y: Math.floor(Math.random() * 100) + 50, 
        width: Math.floor(Math.random() * 100) + 50, 
        height: Math.floor(Math.random() * 50) + 20, 
        blurAmount: Math.floor(Math.random() * 10) + 5 
      }
    ]);
  };
  
  // Close mock image editor
  const handleCloseMockImageEditor = () => {
    setMockImageEditorOpen(false);
    setMockImageBeingEdited(null);
  };

  return (
    <AdminDashboardClient>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard Tests</h1>
        
        {/* Authentication Test */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            <FaUserShield className="inline-block mr-2" /> Authentication Test
          </h2>
          
          <button
            onClick={checkAdminSession}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mb-4"
          >
            Check Admin Session
          </button>
          
          {adminSessionValid !== null && (
            <div className={`p-4 rounded-lg ${adminSessionValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {adminSessionValid ? (
                <>
                  <FaCheck className="inline mr-2" /> 
                  Admin session is valid. You are properly authenticated.
                </>
              ) : (
                <>
                  <FaTimes className="inline mr-2" /> 
                  Admin session is not valid. Please <Link href="/admin/login" className="underline">log in</Link> again.
                </>
              )}
            </div>
          )}
        </div>
        
        {/* Firebase Tests */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Firebase Tests</h2>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              Select the tests you want to run to verify Firebase connectivity:
            </p>
            
            <div className="flex flex-wrap gap-4 mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedTests.firebase}
                  onChange={() => handleCheckboxChange('firebase')}
                  className="mr-2"
                />
                Firebase Connectivity
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedTests.gallery}
                  onChange={() => handleCheckboxChange('gallery')}
                  className="mr-2"
                />
                Gallery Operations
              </label>
            </div>
            
            <button
              onClick={runTests}
              disabled={loading || !Object.values(selectedTests).some(Boolean)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center disabled:bg-blue-300"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" /> Running Tests...
                </>
              ) : (
                <>
                  <FaPlay className="mr-2" /> Run Tests
                </>
              )}
            </button>
          </div>
          
          {results && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Test Results</h3>
              
              {results.error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                  Error: {results.error}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Firebase Connectivity Test Results */}
                  {results.connectivity && (
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
                        <h4 className="font-medium">Firebase Connectivity</h4>
                        {renderStatusBadge(results.connectivity.status)}
                      </div>
                      <div className="p-4">
                        <p className="mb-2">{results.connectivity.message}</p>
                        {results.connectivity.details && (
                          <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                            {JSON.stringify(results.connectivity.details, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Gallery Operations Test Results */}
                  {results.gallery && (
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
                        <h4 className="font-medium">Gallery Operations</h4>
                        {renderStatusBadge(results.gallery.status)}
                      </div>
                      <div className="p-4">
                        <p className="mb-2">{results.gallery.message}</p>
                        {results.gallery.details && (
                          <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                            {JSON.stringify(results.gallery.details, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Mock Gallery Management */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            <FaImage className="inline-block mr-2" /> Mock Gallery Management
          </h2>
          
          <p className="text-gray-600 mb-4">
            This is a mock gallery management interface to test the admin functionality without requiring Firebase.
          </p>
          
          <div className="mb-4">
            <button
              onClick={handleAddMockItem}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
            >
              <FaPlus className="mr-2" /> Add Mock Item
            </button>
          </div>
          
          {mockItemBeingEdited ? (
            <div className="border rounded-lg p-4 mb-4">
              <h3 className="text-lg font-medium mb-4">Edit Gallery Item</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={mockItemBeingEdited.title}
                    onChange={handleMockItemChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={mockItemBeingEdited.description}
                    onChange={handleMockItemChange}
                    rows="3"
                    className="w-full p-2 border border-gray-300 rounded"
                  ></textarea>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveMockItem}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                  >
                    <FaSave className="mr-2" /> Save Changes
                  </button>
                </div>
              </div>
            </div>
          ) : null}
          
          {/* Mock Gallery Items List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockGalleryItems.map(item => (
              <div key={item.id} className="border rounded-lg overflow-hidden">
                <div className="aspect-w-16 aspect-h-9 relative">
                  <img 
                    src={item.mainImage} 
                    alt={item.title}
                    className="object-cover w-full h-48"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-lg">{item.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                  
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      onClick={() => handleOpenMockImageEditor(item.mainImage)}
                      className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 flex items-center"
                    >
                      <FaImage className="mr-1" /> Edit Image
                    </button>
                    <button
                      onClick={() => handleEditMockItem(item)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center"
                    >
                      <FaEdit className="mr-1" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteMockItem(item.id)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 flex items-center"
                    >
                      <FaTrash className="mr-1" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Mock Image Editor */}
        {mockImageEditorOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-medium">Image Editor</h3>
                <button
                  onClick={handleCloseMockImageEditor}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              <div className="p-4">
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Add blur areas to hide license plates or sensitive information.
                  </p>
                  <button
                    onClick={handleAddMockBlurArea}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Add Blur Area
                  </button>
                </div>
                
                <div className="relative border border-gray-300 rounded-lg">
                  <img 
                    src={mockImageBeingEdited} 
                    alt="Editing" 
                    className="max-w-full rounded-lg"
                  />
                  
                  {/* Blur areas */}
                  {mockBlurAreas.map((area, index) => (
                    <div
                      key={index}
                      className="absolute border-2 border-blue-500 bg-blue-200 bg-opacity-50"
                      style={{
                        left: `${area.x}px`,
                        top: `${area.y}px`,
                        width: `${area.width}px`,
                        height: `${area.height}px`,
                        backdropFilter: `blur(${area.blurAmount}px)`
                      }}
                    ></div>
                  ))}
                </div>
                
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleCloseMockImageEditor}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Manual Tests */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Manual Tests</h2>
          
          <p className="text-gray-600 mb-4">
            You can also manually test the following functionality:
          </p>
          
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Admin Authentication</h3>
              <p className="text-sm text-gray-600 mb-2">
                Verify that the admin authentication is working properly by logging out and logging back in.
              </p>
              <a 
                href="/admin/login" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline inline-flex items-center"
              >
                Go to Login Page →
              </a>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Gallery Management</h3>
              <p className="text-sm text-gray-600 mb-2">
                Verify that you can view, add, edit, and delete gallery items.
              </p>
              <a 
                href="/admin-dashboard/gallery" 
                className="text-blue-600 hover:underline inline-flex items-center"
              >
                Go to Gallery Management →
              </a>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Image Editor</h3>
              <p className="text-sm text-gray-600 mb-2">
                Test the image editor functionality by editing an existing gallery item.
              </p>
              <a 
                href="/admin-dashboard/gallery" 
                className="text-blue-600 hover:underline inline-flex items-center"
              >
                Go to Gallery Items →
              </a>
            </div>
          </div>
        </div>
      </div>
    </AdminDashboardClient>
  );
} 