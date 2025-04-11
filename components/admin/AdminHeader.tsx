import Link from 'next/link';
import React from 'react';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="mt-2 text-gray-500">{subtitle}</p>}
        </div>
        <div className="flex space-x-4">
          <Link href="/admin-dashboard" className="text-sm text-gray-500 hover:text-gray-900">
            Dashboard
          </Link>
          <Link href="/admin-dashboard/gallery" className="text-sm text-gray-500 hover:text-gray-900">
            Gallery
          </Link>
          <Link href="/admin-dashboard/settings" className="text-sm text-gray-500 hover:text-gray-900">
            Settings
          </Link>
        </div>
      </div>
      <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-blue-700 mt-4"></div>
    </div>
  );
};

export default AdminHeader; 