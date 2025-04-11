"use client";

import React, { useState, useEffect } from 'react';
import { FaEdit, FaSave, FaTimes, FaExclamationTriangle, FaSpinner, FaSync } from 'react-icons/fa';
import AdminHeader from '@/components/admin/AdminHeader';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, setDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

// Mock data for website content when Firebase is unavailable
const MOCK_CONTENT = {
  homepage: {
    title: "CA International Autobody",
    subtitle: "Excellence in Automotive Care",
    heroText: "Premier auto body repair, custom paint, and restoration services",
    heroImage: "https://images.unsplash.com/photo-1606577924006-27d39b132ae2?w=1920&auto=format&fit=crop",
    services: [
      {
        id: "service-1",
        title: "Auto Body Repair",
        description: "Comprehensive auto body repair services for all makes and models",
        icon: "wrench"
      },
      {
        id: "service-2",
        title: "Custom Paint",
        description: "Premium custom paint services with attention to detail",
        icon: "paint-brush"
      },
      {
        id: "service-3",
        title: "Restoration",
        description: "Full vehicle restoration for classic and modern vehicles",
        icon: "car"
      }
    ],
    testimonials: [
      {
        id: "testimonial-1",
        name: "John Smith",
        text: "Exceptional service and quality. My car looks better than new!",
        rating: 5
      },
      {
        id: "testimonial-2",
        name: "Sarah Johnson",
        text: "Professional team that delivered exactly what they promised.",
        rating: 5
      }
    ]
  },
  about: {
    title: "About CA International Autobody",
    mission: "Our mission is to provide the highest quality auto body repair and restoration services with exceptional customer care.",
    story: "Founded in 2005, CA International Autobody has grown from a small family workshop to a premier automotive care center. We combine traditional craftsmanship with the latest technology.",
    team: [
      {
        id: "team-1",
        name: "Michael Rodriguez",
        position: "Founder & Master Technician",
        bio: "With over 25 years of experience in auto body repair and restoration",
        image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop"
      },
      {
        id: "team-2",
        name: "David Chen",
        position: "Lead Paint Specialist",
        bio: "Certified master painter with expertise in custom finishes",
        image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop"
      }
    ],
    values: [
      "Quality craftsmanship",
      "Attention to detail",
      "Customer satisfaction",
      "Integrity",
      "Innovation"
    ]
  },
  services: {
    title: "Our Services",
    description: "Comprehensive automotive care for all your needs",
    servicesList: [
      {
        id: "service-detail-1",
        title: "Collision Repair",
        description: "Expert collision repair to restore your vehicle to pre-accident condition. We work with all insurance companies and use factory-approved repair methods.",
        image: "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=800&auto=format&fit=crop",
        features: [
          "Frame and structural repair",
          "Panel replacement",
          "Dent removal",
          "Insurance claim assistance"
        ]
      },
      {
        id: "service-detail-2",
        title: "Custom Paint",
        description: "Premium custom paint services with attention to detail. From factory color matching to custom designs, our paint department delivers flawless results.",
        image: "https://images.unsplash.com/photo-1589642380614-4a8c2147b857?w=800&auto=format&fit=crop",
        features: [
          "Color matching",
          "Custom designs",
          "Metallic and pearl finishes",
          "Clear coat protection"
        ]
      },
      {
        id: "service-detail-3",
        title: "Restoration",
        description: "Complete vehicle restoration services for classic and vintage cars. We bring your cherished vehicle back to its original glory with expert craftsmanship.",
        image: "https://images.unsplash.com/photo-1541443131876-44b03de101c5?w=800&auto=format&fit=crop",
        features: [
          "Full frame-off restoration",
          "Mechanical rebuilding",
          "Interior restoration",
          "Authentic parts sourcing"
        ]
      }
    ]
  },
  contact: {
    title: "Contact Us",
    address: "123 Automotive Way, Los Angeles, CA 90001",
    phone: "(555) 123-4567",
    email: "info@cainternationalautobody.com",
    hours: "Monday-Friday: 8am-6pm | Saturday: 9am-2pm | Sunday: Closed",
    mapLocation: {
      lat: 34.0522,
      lng: -118.2437
    }
  }
};

export default function ContentPage() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingMockData, setUsingMockData] = useState(false);
  const [selectedSection, setSelectedSection] = useState('homepage');
  const [selectedSubsection, setSelectedSubsection] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [editingValue, setEditingValue] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ loading: false, success: false });

  useEffect(() => {
    fetchContent();
  }, []);

  async function fetchContent() {
    setLoading(true);
    setError(null);
    console.log('Fetching website content...');
    
    try {
      // Try to get data from Firebase
      const contentCollection = collection(db, 'content');
      const snapshot = await getDocs(contentCollection);
      
      // Always use Firebase data, even if empty
      console.log(`Loaded content from Firestore with ${snapshot.docs.length} documents`);
      setUsingMockData(false);
      
      // Transform the documents into a structured content object
      const contentData = {};
      snapshot.docs.forEach(doc => {
        contentData[doc.id] = doc.data();
      });
      
      // If no content found in Firebase, use mock data as a fallback
      if (Object.keys(contentData).length === 0) {
        setUsingMockData(true);
        console.log("No content documents found in Firestore, using mock data");
        setContent(MOCK_CONTENT);
      } else {
        setContent(contentData);
      }
    } catch (err) {
      console.error("Error fetching content:", err);
      setError("Failed to fetch website content. Using mock data instead.");
      setUsingMockData(true);
      setContent(MOCK_CONTENT);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }
  
  async function handleRefresh() {
    setRefreshing(true);
    await fetchContent();
  }

  function handleEditField(field, value) {
    setEditingField(field);
    setEditingValue(value);
  }
  
  function handleCancelEdit() {
    setEditingField(null);
    setEditingValue('');
  }
  
  async function handleSaveField() {
    if (!editingField) return;
    
    setSaveStatus({ loading: true, success: false });
    
    try {
      const [section, subsection, field, index] = editingField.split('.');
      
      // Create a deep copy of the content
      const updatedContent = JSON.parse(JSON.stringify(content));
      
      // Update the specific field
      if (subsection && field && index !== undefined) {
        // Handle array items (like services[0].title)
        updatedContent[section][subsection][parseInt(index)][field] = editingValue;
      } else if (subsection && field) {
        // Handle nested objects (like about.mission)
        updatedContent[section][subsection][field] = editingValue;
      } else if (subsection) {
        // Handle direct properties (like homepage.title)
        updatedContent[section][subsection] = editingValue;
      }
      
      // Update the state
      setContent(updatedContent);
      
      // Save to Firebase if not using mock data
      if (!usingMockData) {
        const contentDocRef = doc(db, 'content', section);
        await setDoc(contentDocRef, updatedContent[section], { merge: true });
        console.log(`Updated content in Firebase: ${section}`);
      } else {
        // Simulate delay for mock data
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      setSaveStatus({ loading: false, success: true });
      toast.success('Content updated successfully');
      
      // Reset the success message after a delay
      setTimeout(() => {
        setSaveStatus({ loading: false, success: false });
      }, 3000);
      
      // Clear the editing state
      setEditingField(null);
      setEditingValue('');
    } catch (err) {
      console.error("Error updating content:", err);
      setSaveStatus({ loading: false, success: false });
      toast.error("Failed to update content");
    }
  }
  
  function renderField(section, subsection, field, value, index) {
    const fieldId = index !== undefined 
      ? `${section}.${subsection}.${field}.${index}` 
      : subsection 
        ? `${section}.${subsection}` 
        : `${section}`;
    
    const isEditing = editingField === fieldId;
    
    return (
      <div key={fieldId} className="mb-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-start">
          <div className="w-full">
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              {field ? field.charAt(0).toUpperCase() + field.slice(1) : subsection.charAt(0).toUpperCase() + subsection.slice(1)}
            </h3>
            
            {isEditing ? (
              <div className="mt-2">
                {typeof value === 'string' && (
                  value.length > 100 ? (
                    <textarea
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      rows={6}
                    />
                  ) : (
                    <input
                      type="text"
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  )
                )}
                
                <div className="flex justify-end mt-2 space-x-2">
                  <button
                    onClick={handleCancelEdit}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    <FaTimes className="mr-1" /> Cancel
                  </button>
                  <button
                    onClick={handleSaveField}
                    className="inline-flex items-center px-3 py-1 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    {saveStatus.loading ? (
                      <>
                        <FaSpinner className="animate-spin mr-1" /> Saving...
                      </>
                    ) : (
                      <>
                        <FaSave className="mr-1" /> Save
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-start">
                <div className="flex-grow">
                  {typeof value === 'string' ? (
                    <p className="text-gray-800">{value}</p>
                  ) : (
                    <p className="text-gray-500 italic">Complex data - select a subsection to edit</p>
                  )}
                </div>
                
                {typeof value === 'string' && (
                  <button
                    onClick={() => handleEditField(fieldId, value)}
                    className="ml-2 text-primary hover:text-primary-dark"
                  >
                    <FaEdit />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  function renderObjectFields(section, sectionData, subsection = null) {
    if (!sectionData) return null;
    
    return Object.entries(sectionData).map(([key, value]) => {
      // If value is an array of objects (like services, team members)
      if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
        return (
          <div key={key} className="mb-6">
            <h3 className="text-md font-semibold text-gray-700 mb-2">
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </h3>
            <div className="pl-4 border-l-2 border-gray-200">
              {value.map((item, index) => (
                <div key={index} className="mb-4">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">
                    Item {index + 1}: {item.title || item.name || ''}
                  </h4>
                  <div className="pl-4 border-l-2 border-gray-100">
                    {Object.entries(item).map(([itemKey, itemValue]) => {
                      if (typeof itemValue === 'string') {
                        return renderField(section, key, itemKey, itemValue, index);
                      }
                      return null;
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }
      
      // If value is a simple array (like values)
      if (Array.isArray(value) && typeof value[0] === 'string') {
        return (
          <div key={key} className="mb-6">
            <h3 className="text-md font-semibold text-gray-700 mb-2">
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </h3>
            <div className="pl-4 border-l-2 border-gray-200">
              <ul className="list-disc pl-4">
                {value.map((item, index) => (
                  <li key={index} className="mb-1">
                    {renderField(section, key, 'item', item, index)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      }
      
      // If value is an object (like mapLocation)
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        return (
          <div key={key} className="mb-6">
            <h3 className="text-md font-semibold text-gray-700 mb-2">
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </h3>
            <div className="pl-4 border-l-2 border-gray-200">
              {Object.entries(value).map(([subKey, subValue]) => {
                if (typeof subValue === 'string' || typeof subValue === 'number') {
                  return renderField(section, key, subKey, subValue);
                }
                return null;
              })}
            </div>
          </div>
        );
      }
      
      // For string values
      if (typeof value === 'string') {
        return renderField(section, key, null, value);
      }
      
      return null;
    });
  }

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
      <AdminHeader 
        title="Content Management"
        description="Edit your website content"
        rightContent={
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <FaSync className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Content
          </button>
        }
      />

      {usingMockData && (
        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaExclamationTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Using mock data:</strong> We couldn't connect to Firebase or no content was found. Showing sample website content instead.
              </p>
            </div>
          </div>
        </div>
      )}

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

      {saveStatus.success && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaSave className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                Content updated successfully!
              </p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : content ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Sections</h2>
            <nav className="space-y-1">
              {Object.keys(content).map(section => (
                <button
                  key={section}
                  onClick={() => {
                    setSelectedSection(section);
                    setSelectedSubsection(null);
                    setEditingField(null);
                  }}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    selectedSection === section
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </button>
              ))}
            </nav>
            
            {selectedSection && content[selectedSection] && (
              <div className="mt-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Subsections</h2>
                <nav className="space-y-1">
                  <button
                    onClick={() => setSelectedSubsection(null)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      selectedSubsection === null
                        ? 'bg-gray-200 text-gray-800'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    All
                  </button>
                  {Object.keys(content[selectedSection]).map(subsection => (
                    <button
                      key={subsection}
                      onClick={() => setSelectedSubsection(subsection)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                        selectedSubsection === subsection
                          ? 'bg-gray-200 text-gray-800'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {subsection.charAt(0).toUpperCase() + subsection.slice(1)}
                    </button>
                  ))}
                </nav>
              </div>
            )}
          </div>
          
          <div className="md:col-span-3">
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {selectedSection.charAt(0).toUpperCase() + selectedSection.slice(1)} Content
                {selectedSubsection ? ` > ${selectedSubsection.charAt(0).toUpperCase() + selectedSubsection.slice(1)}` : ''}
              </h2>
              
              {selectedSection && content[selectedSection] && (
                selectedSubsection ? (
                  <div>
                    {typeof content[selectedSection][selectedSubsection] === 'string' ? (
                      renderField(selectedSection, selectedSubsection, null, content[selectedSection][selectedSubsection])
                    ) : Array.isArray(content[selectedSection][selectedSubsection]) ? (
                      <div>
                        {Array.isArray(content[selectedSection][selectedSubsection]) && 
                         typeof content[selectedSection][selectedSubsection][0] === 'object' ? (
                          content[selectedSection][selectedSubsection].map((item, index) => (
                            <div key={index} className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                              <h3 className="text-md font-semibold text-gray-700 mb-4">
                                Item {index + 1}: {item.title || item.name || ''}
                              </h3>
                              {Object.entries(item).map(([key, value]) => 
                                typeof value === 'string' && renderField(selectedSection, selectedSubsection, key, value, index)
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                            <h3 className="text-md font-semibold text-gray-700 mb-4">
                              Items List
                            </h3>
                            <ul className="list-disc pl-4">
                              {content[selectedSection][selectedSubsection].map((item, index) => (
                                <li key={index} className="mb-2">
                                  {renderField(selectedSection, selectedSubsection, 'value', item, index)}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        {Object.entries(content[selectedSection][selectedSubsection]).map(([key, value]) => 
                          typeof value === 'string' && renderField(selectedSection, selectedSubsection, key, value)
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    {renderObjectFields(selectedSection, content[selectedSection])}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900">No content available</h3>
          <p className="mt-2 text-sm text-gray-500">
            There was a problem loading the website content.
          </p>
        </div>
      )}
    </div>
  );
} 