"use client";

import { Toaster } from 'react-hot-toast';
import "@/app/globals.css";
import AdminDashboardClient from './AdminDashboardClient';

export default function AdminDashboardLayout({ children }) {
  return (
    <>
      <Toaster position="top-right" />
      <AdminDashboardClient>{children}</AdminDashboardClient>
    </>
  );
} 