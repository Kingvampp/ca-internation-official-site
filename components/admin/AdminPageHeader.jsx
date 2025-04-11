'use client';

import React from 'react';
import { FiCalendar, FiImage, FiSettings, FiUsers, FiMessageSquare, FiHome, FiEdit } from 'react-icons/fi';

/**
 * Admin Page Header Component
 * 
 * A consistent header for admin dashboard pages with title, description, and icon
 */
export default function AdminPageHeader({ 
  title, 
  description,
  icon = 'default' 
}) {
  // Map of icon names to their components
  const icons = {
    default: <FiSettings className="text-gray-600 h-10 w-10" />,
    calendar: <FiCalendar className="text-gray-600 h-10 w-10" />,
    gallery: <FiImage className="text-gray-600 h-10 w-10" />,
    users: <FiUsers className="text-gray-600 h-10 w-10" />,
    messages: <FiMessageSquare className="text-gray-600 h-10 w-10" />,
    home: <FiHome className="text-gray-600 h-10 w-10" />,
    content: <FiEdit className="text-gray-600 h-10 w-10" />
  };

  // Get the icon component based on the icon name
  const IconComponent = icons[icon] || icons.default;

  return (
    <div className="admin-page-header bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center">
        <div className="rounded-full bg-gray-100 p-3 mr-4">
          {IconComponent}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          {description && (
            <p className="text-gray-500 mt-1">{description}</p>
          )}
        </div>
      </div>
      <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-500 mt-6"></div>
    </div>
  );
} 