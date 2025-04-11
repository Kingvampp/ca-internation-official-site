"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FaHome, FaImages, FaCalendarAlt, FaFileAlt, FaTools, FaSignOutAlt, FaBars, FaTimes, FaStar } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

export default function AdminSidebar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuthenticated');
    toast.success('Logged out successfully');
    window.location.href = '/admin-login';
  };

  const isActive = (path) => {
    return pathname.startsWith(path) ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100';
  };

  const navItems = [
    { path: '/admin-dashboard', label: 'Dashboard', icon: <FaHome className="mr-3" /> },
    { path: '/admin-dashboard/gallery', label: 'Gallery Management', icon: <FaImages className="mr-3" /> },
    { path: '/admin-dashboard/appointments', label: 'Appointments', icon: <FaCalendarAlt className="mr-3" /> },
    { path: '/admin-dashboard/testimonials', label: 'Testimonials', icon: <FaStar className="mr-3" /> },
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-0 left-0 z-20 m-4">
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-md bg-primary text-white focus:outline-none"
        >
          {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* Sidebar for desktop and mobile */}
      <div
        className={`${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } fixed inset-y-0 left-0 z-10 transform md:relative md:translate-x-0 transition duration-200 ease-in-out bg-white w-64 shadow-lg flex flex-col`}
      >
        <div className="p-5 border-b border-gray-200 flex justify-center">
          <Link href="/admin-dashboard">
            <span className="text-xl font-bold text-primary">CA Admin</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`flex items-center px-4 py-3 rounded-md ${isActive(item.path)}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-md w-full"
          >
            <FaSignOutAlt className="mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-0"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
} 