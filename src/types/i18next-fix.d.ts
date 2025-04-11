// Fix i18next typings
import 'i18next';
import 'react-i18next';

// Extend i18next module with additional properties
declare module 'i18next' {
  interface i18n {
    isInitialized: boolean;
    use: (plugin: any) => i18n;
    changeLanguage: (language: string) => Promise<TFunction>;
    language: string;
    t: TFunction;
  }

  // Core types from i18next
  export interface TFunction {
    (key: string, defaultValue: string): string;
    (key: string, options?: object): string;
    <T extends Record<string, any>>(key: string, options?: T): string;
  }

  export type InitOptions = any;
  
  export default i18n;
}

// Extend react-i18next module
declare module 'react-i18next' {
  export interface TFunction {
    (key: string, defaultValue: string): string;
    (key: string, options?: object): string;
    <T extends Record<string, any>>(key: string, options?: T): string;
  }

  export function useTranslation(ns?: string | string[], options?: any): {
    t: TFunction;
    i18n: any;
    ready: boolean;
  };

  export const initReactI18next: any;
}

// Define custom language types
declare global {
  export type Language = 'en' | 'es';

  export interface LanguageContextType {
    language: Language;
    changeLanguage: (lang: Language) => void;
    setLanguage?: (lang: Language) => void;
    isClient: boolean;
    isReady: boolean;
    t?: (key: string, fallback?: string | object) => string;
  }

  export function useLanguage(): LanguageContextType;
} 