import "../globals.css";
import "../styles/typography.css";
import "../styles/animations.css";
import { Inter, Montserrat } from "next/font/google";
import BackgroundEffect from "../../components/layout/BackgroundEffect";
import dynamic from "next/dynamic";

// Dynamically import ClientProviders and LanguageProvider
const ClientProviders = dynamic(() => import("../../components/mobile/ClientProviders"), {
  ssr: false,
});

const LanguageProviderClient = dynamic(() => import("../../components/LanguageProviderClient"), {
  ssr: false,
});

// Dynamically import MicroInteractions
const MicroInteractions = dynamic(() => import("../../components/ui/MicroInteractions"), {
  ssr: false,
});

// Font configurations
const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter"
});

const montserrat = Montserrat({ 
  subsets: ["latin"],
  variable: "--font-montserrat"
});

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
          {/* Main Content - without navbar and footer */}
          <div className="relative z-30 min-h-screen flex flex-col bg-transparent">
            <main className="flex-grow pt-0">
              {/* PageTransition will be dynamically imported in each page */}
              {children}
            </main>
          </div>
        </LanguageProviderClient>
        
        {/* Mobile Optimizations */}
        <ClientProviders />
        
        {/* Add microinteractions */}
        <MicroInteractions />
      </body>
    </html>
  );
} 