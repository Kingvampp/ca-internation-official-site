import "./globals.css";
import "./styles/typography.css";
import "./styles/animations.css";
import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import BackgroundEffect from "../components/layout/BackgroundEffect";
import ChatWidgetLoader from "../components/chat/ChatWidgetLoader";
import Script from "next/script";
import dynamic from "next/dynamic";
import { headers } from "next/headers";

// Dynamically import ClientProviders and LanguageProvider
const ClientProviders = dynamic(() => import("../components/mobile/ClientProviders"), {
  ssr: false,
});

const LanguageProviderClient = dynamic(() => import("../components/LanguageProviderClient"), {
  ssr: false,
});

// Dynamically import MicroInteractions
const MicroInteractions = dynamic(() => import("../components/ui/MicroInteractions"), {
  ssr: false,
});

// Only import TranslationDebuggingControls in development mode
const TranslationDebuggingControls = process.env.NODE_ENV === 'development' 
  ? dynamic(() => import("../components/layout/TranslationDebuggingControls"), { ssr: false })
  : () => null;

// Font configurations
const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter"
});

const montserrat = Montserrat({ 
  subsets: ["latin"],
  variable: "--font-montserrat"
});

export const metadata: Metadata = {
  title: "CA International Automotive | Premium Automotive Services",
  description:
    "Expert automotive services specializing in luxury and performance vehicle repair, custom paint, and restoration. Serving the San Francisco Bay Area.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if the current URL path is for admin routes
  const headersList = headers();
  const pathname = headersList.get("x-pathname") || "";
  const isAdminRoute = pathname.includes('/admin-dashboard') || pathname.includes('/admin-login');

  return (
    <html 
      lang="en" 
      className={`${inter.variable} ${montserrat.variable} scroll-smooth`}
    >
      <body className="font-sans antialiased text-gray-900 overflow-x-hidden">
        {/* Global Site Background with continuous patterns */}
        <BackgroundEffect />

        {/* Wrap everything in LanguageProvider */}
        <LanguageProviderClient>
          {/* Main Content */}
          <div className="relative z-30 min-h-screen flex flex-col bg-transparent">
            {/* Only show Navbar if not on admin routes */}
            {!isAdminRoute && <Navbar />}
            
            <main className="flex-grow">
              {/* PageTransition will be dynamically imported in each page */}
              {children}
            </main>
            
            {/* Only show Footer if not on admin routes */}
            {!isAdminRoute && <Footer />}
          </div>

          {/* Chat Widget - don't show on admin routes */}
          {!isAdminRoute && <ChatWidgetLoader />}
          
          {/* Only show translation debugging in development */}
          {process.env.NODE_ENV === 'development' && !isAdminRoute && <TranslationDebuggingControls />}
        </LanguageProviderClient>
        
        {/* Mobile Optimizations */}
        <ClientProviders />
        
        {/* Add microinteractions */}
        <MicroInteractions />

        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX');
          `}
        </Script>
      </body>
    </html>
  );
} 