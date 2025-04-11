'use client';

import React from 'react';
import Link from 'next/link';

/**
 * Dashboard card component for the admin dashboard
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {string} props.count - Number to display (optional)
 * @param {string} props.icon - Icon component to display
 * @param {string} props.href - Link destination (optional)
 * @param {string} props.color - Background color class (default: 'bg-blue-500')
 */
const DashboardCard = ({ title, count, icon: Icon, href, color = 'bg-blue-500' }) => {
  const CardContent = () => (
    <div className={`rounded-lg shadow-md p-6 ${color} text-white transition-transform hover:scale-105`}>
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold mb-1">{title}</h3>
          {count !== undefined && (
            <p className="text-3xl font-bold">{count}</p>
          )}
        </div>
        <div className="text-white opacity-80">
          {Icon && <Icon size={36} />}
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        <CardContent />
      </Link>
    );
  }

  return <CardContent />;
};

export default DashboardCard;