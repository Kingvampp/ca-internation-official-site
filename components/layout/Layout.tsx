import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import TranslationDebuggingControls from './TranslationDebuggingControls';

type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
      
      {/* Only show translation debugging in development */}
      {process.env.NODE_ENV === 'development' && <TranslationDebuggingControls />}
    </div>
  );
} 