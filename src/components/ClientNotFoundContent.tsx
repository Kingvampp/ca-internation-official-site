'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from 'react-i18next';

// This component will only be rendered on the client
export default function ClientNotFoundContent() {
  const [mounted, setMounted] = useState(false);
  
  // Only try to use the hook after mounting on client
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Don't render anything on the server
  if (!mounted) return null;
  
  // Now it's safe to use the hook
  const { t, isClient } = useLanguage();
  
  // This will only run on the client
  if (!isClient) return null;
  
  // This content will replace the server-rendered content
  return (
    <div className="hidden">
      {/* Hidden content that just ensures translations are loaded */}
      <span id="not-found-title">{t('notFound.title', 'Page Not Found')}</span>
      <span id="not-found-message">{t('notFound.message', 'Sorry, the page you are looking for does not exist.')}</span>
      <span id="not-found-link">{t('notFound.backLink', 'Return to Home')}</span>
      
      {/* Script to replace content with translated versions */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener('DOMContentLoaded', () => {
              const title = document.getElementById('not-found-title');
              const message = document.getElementById('not-found-message');
              const link = document.getElementById('not-found-link');
              
              if (title && title.textContent) {
                document.querySelector('h2').textContent = title.textContent;
              }
              
              if (message && message.textContent) {
                document.querySelector('p').textContent = message.textContent;
              }
              
              if (link && link.textContent) {
                document.querySelector('a').textContent = link.textContent;
              }
            });
          `
        }}
      />
    </div>
  );
} 