"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../utils/LanguageContext";
import { 
  FaFacebook, 
  FaInstagram, 
  FaTwitter, 
  FaYelp, 
  FaPhoneAlt, 
  FaEnvelope, 
  FaMapMarkerAlt,
  FaCar,
  FaTools,
  FaPaintBrush,
  FaLock
} from "react-icons/fa";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const router = useRouter();
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { t, language } = useLanguage();
  
  // Handle admin login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const response = await fetch('/api/admin-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: adminPassword }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store authentication in sessionStorage
        sessionStorage.setItem('adminAuthenticated', 'true');
        
        // Redirect to admin dashboard on successful login
        setShowAdminModal(false);
        router.push('/admin-dashboard');
      } else {
        setError(data.message || t('admin.invalidPassword') || 'Invalid password');
      }
    } catch (err) {
      setError(t('common.errorOccurred') || 'An error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <footer className="relative pt-16 pb-8 bg-bmw-dark-blue text-white">
      {/* BMW M Racing Stripe */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-racing-stripe"></div>
      
      {/* Footer Content */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              <div className="relative h-12 w-12 mr-3">
                <Image
                  src="/images/logo/ca-logo.png"
                  alt={t('site.name')}
                  fill
                  className="object-contain bg-white rounded-full p-1"
                />
              </div>
              <div>
                <h2 className="text-xl font-bold">{t('site.name')}</h2>
                <div className="flex space-x-1">
                  <span className="h-1 w-8 bg-bmw-blue rounded-sm"></span>
                  <span className="h-1 w-8 bg-bmw-red rounded-sm"></span>
                </div>
              </div>
            </div>
            
            <p className="text-white/80 mb-6">
              {t('footer.companyDescription')}
            </p>
            
            <div className="mt-6 flex">
              <a 
                href="https://www.facebook.com/oscarmrcht" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label={t('footer.facebook')}
                className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors"
              >
                <span className="text-white">
                  <FaFacebook size={20} />
                </span>
              </a>
            </div>
          </div>
          
          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <span className="mr-2 text-bmw-red">
                <FaTools size={18} />
              </span>
              {t('footer.ourServices')}
            </h3>
            <ul className="space-y-2">
              <li className="transition-transform hover:translate-x-1">
                <Link href="/services#collision" className="text-white/80 hover:text-white flex items-center">
                  <span className="w-1 h-1 bg-bmw-blue rounded-full mr-2"></span>
                  {t('services.collision')}
                </Link>
              </li>
              <li className="transition-transform hover:translate-x-1">
                <Link href="/services#paint" className="text-white/80 hover:text-white flex items-center">
                  <span className="w-1 h-1 bg-bmw-red rounded-full mr-2"></span>
                  {t('services.paint')}
                </Link>
              </li>
              <li className="transition-transform hover:translate-x-1">
                <Link href="/services#restoration" className="text-white/80 hover:text-white flex items-center">
                  <span className="w-1 h-1 bg-bmw-blue rounded-full mr-2"></span>
                  {t('services.restoration')}
                </Link>
              </li>
              <li className="transition-transform hover:translate-x-1">
                <Link href="/services#detailing" className="text-white/80 hover:text-white flex items-center">
                  <span className="w-1 h-1 bg-bmw-red rounded-full mr-2"></span>
                  {t('services.detailing')}
                </Link>
              </li>
              <li className="transition-transform hover:translate-x-1">
                <Link href="/services#pickup" className="text-white/80 hover:text-white flex items-center">
                  <span className="w-1 h-1 bg-bmw-blue rounded-full mr-2"></span>
                  {t('services.pickup')}
                </Link>
              </li>
              <li className="transition-transform hover:translate-x-1">
                <Link href="/services#towing" className="text-white/80 hover:text-white flex items-center">
                  <span className="w-1 h-1 bg-bmw-red rounded-full mr-2"></span>
                  {t('services.towing')}
                </Link>
              </li>
              <li className="transition-transform hover:translate-x-1">
                <Link href="/services#frame" className="text-white/80 hover:text-white flex items-center">
                  <span className="w-1 h-1 bg-bmw-blue rounded-full mr-2"></span>
                  {t('services.frame')}
                </Link>
              </li>
              <li className="transition-transform hover:translate-x-1">
                <Link href="/services#wheel" className="text-white/80 hover:text-white flex items-center">
                  <span className="w-1 h-1 bg-bmw-red rounded-full mr-2"></span>
                  {t('services.wheel')}
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <span className="mr-2 text-bmw-blue">
                <FaEnvelope size={18} />
              </span>
              {t('footer.contactUs')}
            </h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <span className="text-bmw-red mt-1 mr-3 flex-shrink-0">
                  <FaMapMarkerAlt size={16} />
                </span>
                <p className="text-white/80">1330 Egbert Avenue, San Francisco, CA 94124</p>
              </div>
              <div className="flex items-center">
                <span className="text-bmw-blue mr-3 flex-shrink-0">
                  <FaPhoneAlt size={16} />
                </span>
                <a href="tel:+14154474001" className="text-white/80 hover:text-white transition-colors">
                  (415) 447-4001
                </a>
              </div>
              <div className="flex items-center">
                <span className="text-bmw-red mr-3 flex-shrink-0">
                  <FaEnvelope size={16} />
                </span>
                <a href="mailto:international_auto@sbcglobal.net" className="text-white/80 hover:text-white transition-colors">
                  international_auto@sbcglobal.net
                </a>
              </div>
              <div>
                <h4 className="font-medium mb-1 text-white">{language === 'es' ? 'Horarios' : 'Hours'}</h4>
                <p className="text-white/80">{language === 'es' ? 'Lunes - Sábado: 9:00 AM - 5:00 PM' : 'Monday - Saturday: 9:00 AM - 5:00 PM'}</p>
                <p className="text-white/80">{language === 'es' ? 'Domingo: Cerrado' : 'Sunday: Closed'}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-white/10 text-center text-white/60 text-sm">
          <div className="flex justify-center mb-4">
            <div className="inline-flex h-1 space-x-1">
              <span className="w-8 bg-bmw-blue rounded-sm"></span>
              <span className="w-8 bg-white rounded-sm"></span>
              <span className="w-8 bg-bmw-red rounded-sm"></span>
            </div>
          </div>
          <p>© {currentYear} {t('site.name')}. {t('footer.copyright')}</p>
          <p className="mt-1">{t('footer.tagline')}</p>
          
          {/* Hidden Admin Access - almost invisible until hovered */}
          <button 
            className="mt-6 opacity-10 hover:opacity-80 transition-opacity duration-300 p-2"
            onClick={() => setShowAdminModal(true)}
            aria-label={t('admin.access') || 'Admin Access'}
          >
            <FaLock color="#ffffff" size={10} />
          </button>
        </div>
      </div>
      
      {/* Admin Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white text-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4 relative animate-fade-in">
            <button 
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowAdminModal(false)}
            >
              ×
            </button>
            
            <div className="text-center mb-4">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <FaLock color="#2563eb" size={20} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">{t('admin.access') || 'Admin Access'}</h3>
              <p className="text-gray-600 text-sm mt-1">{t('admin.enterPassword') || 'Enter password to continue'}</p>
            </div>
            
            <form onSubmit={handleAdminLogin}>
              {error && (
                <div className="mb-4 p-2 bg-red-50 text-red-500 text-sm rounded">
                  {error}
                </div>
              )}
              <div className="mb-4">
                <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('admin.password') || 'Password'}
                </label>
                <input
                  id="admin-password"
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                />
              </div>
              
              <button
                type="submit"
                className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
                disabled={loading}
              >
                {loading ? (t('common.loading') || 'Loading...') : (t('admin.login') || 'Login')}
              </button>
            </form>
          </div>
        </div>
      )}
    </footer>
  );
} 