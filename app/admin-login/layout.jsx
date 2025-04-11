"use client";

import { Toaster } from 'react-hot-toast';
import "@/app/globals.css";

export default function AdminLoginLayout({ children }) {
  return (
    <>
      <Toaster position="top-right" />
      {children}
    </>
  );
} 