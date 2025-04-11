// Type declarations for modules without type definitions

declare module 'i18next-http-backend';
declare module 'i18next-browser-languagedetector';

// Declare module augmentations for path aliases
declare module '@/context/LanguageContext' {
  export type Language = 'en' | 'es';
  
  export interface LanguageContextType {
    language: Language;
    changeLanguage: (lang: Language) => void;
    isClient: boolean;
    isReady: boolean;
    t: (key: string, fallback?: string) => string;
  }
  
  export const LanguageProvider: React.FC<{ children: React.ReactNode }>;
  export function useLanguage(): LanguageContextType;
}

declare module '@/components/ClientLanguageDetector' {
  const ClientLanguageDetector: React.FC;
  export default ClientLanguageDetector;
}

// Ensure React is properly typed
declare namespace React {
  interface FC<P = {}> {
    (props: P): ReactElement | null;
  }
  
  type ReactNode = ReactElement | string | number | boolean | null | undefined;
  type ReactElement = any;
}

import React from 'react';
import i18next from 'i18next';

// Enhance React typings
declare module 'react' {
  interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
    type?: T;
    props?: P;
    key?: Key | null;
  }

  // Properly type createElement
  interface React {
    createElement: any;
  }
}

// Enhance i18next typings
declare module 'i18next' {
  interface i18n {
    isInitialized: boolean;
    use: any;
    changeLanguage: (language: string) => Promise<any>;
    language: string;
  }
}

// Enhance react-i18next
declare module 'react-i18next' {
  export function useTranslation(ns?: string | string[], options?: any): {
    t: (key: string, options?: object) => string;
    i18n: i18next.i18n;
    ready: boolean;
  };
}

// Enhance LanguageContext
declare module '../context/LanguageContext' {
  export interface LanguageContextType {
    language: string;
    setLanguage: (lang: string) => void;
    isClient: boolean;
  }
}

// Declare global types for SVG and other elements
declare global {
  // Properly type error handlers
  interface HTMLProps<T> {
    onError?: (event: any) => void;
  }

  // Enhance JSX namespace
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

export {}; 