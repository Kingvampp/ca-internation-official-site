'use client';

import { ReactNode } from 'react';

/**
 * AdminCard component for displaying admin dashboard card items
 * 
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Card content
 * @param {string} props.title - Card title
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onClick - Optional click handler
 */
export default function AdminCard({ 
  children, 
  title, 
  className = '', 
  onClick = null 
}) {
  const baseClasses = "bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden";
  const hoverClasses = onClick ? "cursor-pointer hover:shadow-xl transition-shadow duration-300" : "";
  
  return (
    <div 
      className={`${baseClasses} ${hoverClasses} ${className}`}
      onClick={onClick}
    >
      {title && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
} 