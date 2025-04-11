'use client';

import { ReactNode } from 'react';

/**
 * AdminInfoCard component for displaying admin dashboard statistics
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Card title
 * @param {string|number} props.value - Main value to display
 * @param {string} props.icon - Icon component
 * @param {string} props.description - Optional description text
 * @param {string} props.trend - Trend direction ('up', 'down', or null)
 * @param {string} props.trendValue - Trend value (e.g., '10%')
 * @param {string} props.bgColor - Background color class
 * @param {string} props.textColor - Text color class
 */
export default function AdminInfoCard({ 
  title,
  value,
  icon,
  description,
  trend = null,
  trendValue = '',
  bgColor = 'bg-blue-500',
  textColor = 'text-white'
}) {
  // Determine trend icon and color
  let trendIcon = null;
  let trendColor = '';
  
  if (trend === 'up') {
    trendIcon = (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
      </svg>
    );
    trendColor = 'text-green-300';
  } else if (trend === 'down') {
    trendIcon = (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
      </svg>
    );
    trendColor = 'text-red-300';
  }
  
  return (
    <div className={`rounded-lg shadow-lg overflow-hidden ${bgColor}`}>
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-medium ${textColor} opacity-80`}>{title}</p>
            <p className={`text-2xl font-bold mt-1 ${textColor}`}>{value}</p>
          </div>
          <div className={`text-2xl ${textColor}`}>
            {icon}
          </div>
        </div>
        
        {(description || trend) && (
          <div className="mt-4">
            {description && (
              <p className={`text-sm ${textColor} opacity-80`}>{description}</p>
            )}
            
            {trend && (
              <div className={`flex items-center mt-2 text-sm ${trendColor}`}>
                {trendIcon}
                <span className="ml-1">{trendValue}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 