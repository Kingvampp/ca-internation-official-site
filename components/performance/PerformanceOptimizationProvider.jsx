"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the performance optimizer to prevent SSR issues
const PerformanceOptimizer = dynamic(() => import('../../utils/performanceOptimizer'), {
  ssr: false,
});

// Dynamically import the code split optimizer to prevent SSR issues
import { useLanguage } from "../../utils/LanguageContext";
const CodeSplitOptimizer = dynamic(() => import('../../utils/codeSplitOptimizer'), {
  ssr: false,
});

/**
 * Performance Optimization Provider
 * 
 * This component initializes performance optimizations for mobile devices
 * without affecting existing functionality.
 */
export default function PerformanceOptimizationProvider() {
  const { t } = useLanguage();
  const [isEnabled, setIsEnabled] = useState(false);
  
  useEffect(() => {
    // Only enable on client side
    if (typeof window !== 'undefined') {
      // Only initialize after page has loaded
      if (document.readyState === 'complete') {
        initializeOptimizer();
      } else {
        window.addEventListener('load', initializeOptimizer);
      }
      
      return () => {
        window.removeEventListener('load', initializeOptimizer);
      };
    }
  }, []);
  
  const initializeOptimizer = () => {
    setIsEnabled(true);
    
    // Initialize performance optimizer after a short delay
    // to allow the page to render completely
    setTimeout(() => {
      if (typeof PerformanceOptimizer?.init === 'function') {
        PerformanceOptimizer.init();
      }
      
      // Initialize code split optimizer
      if (typeof CodeSplitOptimizer?.init === 'function') {
        CodeSplitOptimizer.init();
      }
    }, 2000);
  };
  
  // Add some development-only indicators
  useEffect(() => {
    if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development' || !isEnabled) return;
    
    // Add performance monitoring dashboard in development mode
    const dashboardId = 'perf-dashboard';
    if (!document.getElementById(dashboardId)) {
      const dashboard = document.createElement('div');
      dashboard.id = dashboardId;
      dashboard.style.cssText = `
        position: fixed;
        bottom: 0;
        right: 0;
        background: rgba(0,0,0,0.8);
        color: white;
        font-family: monospace;
        font-size: 12px;
        padding: 8px;
        border-top-left-radius: 8px;
        z-index: 10000;
        max-width: 300px;
        pointer-events: none;
      `;
      
      // Add content
      dashboard.innerHTML = `
        <div>{t('common.mobile.performance.m')}</div>
        <div id="perf-lcp">{t('common.lcp.measuring')}</div>
        <div id="perf-fid">{t('common.fid.waiting')}</div>
        <div id="perf-cls">{t('common.cls.measuring')}</div>
      `;
      
      document.body.appendChild(dashboard);
      
      // Update the dashboard periodically
      const updateInterval = setInterval(() => {
        const perfData = window.__CA_PERFORMANCE__ || {};
        
        if (perfData.lcp) {
          const lcpEl = document.getElementById('perf-lcp');
          const lcpValue = Math.round(perfData.lcp);
          const isGood = lcpValue < 2500;
          lcpEl.innerHTML = `LCP: ${lcpValue}ms ${isGood ? '✅' : '⚠️'}`;
          lcpEl.style.color = isGood ? '#4ade80' : '#f87171';
        }
        
        if (perfData.fid) {
          const fidEl = document.getElementById('perf-fid');
          const fidValue = Math.round(perfData.fid);
          const isGood = fidValue < 100;
          fidEl.innerHTML = `FID: ${fidValue}ms ${isGood ? '✅' : '⚠️'}`;
          fidEl.style.color = isGood ? '#4ade80' : '#f87171';
        }
        
        if (perfData.cls !== undefined) {
          const clsEl = document.getElementById('perf-cls');
          const clsValue = perfData.cls.toFixed(3);
          const isGood = perfData.cls < 0.1;
          clsEl.innerHTML = `CLS: ${clsValue} ${isGood ? '✅' : '⚠️'}`;
          clsEl.style.color = isGood ? '#4ade80' : '#f87171';
        }
      }, 1000);
      
      return () => {
        clearInterval(updateInterval);
        const dashboardEl = document.getElementById(dashboardId);
        if (dashboardEl) {
          dashboardEl.remove();
        }
      };
    }
  }, [isEnabled]);
  
  // This component doesn't render anything visible
  return null;
} 