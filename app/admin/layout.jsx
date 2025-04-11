import { Inter } from 'next/font/google';
import '../globals.css';

const inter = Inter({ subsets: ['latin'] });

// This ensures this layout acts as a completely separate layout, not inheriting from parent layouts
export const metadata = {
  title: 'Admin Login - CA Automotive',
  description: 'Admin login page for CA Automotive',
};

// This marks this layout as a root layout, completely overriding the main site layout
export const dynamic = 'force-dynamic';

export default function AdminLoginLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
} 