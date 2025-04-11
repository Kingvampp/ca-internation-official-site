// Type definitions for i18next to fix TypeScript errors
import i18n from 'i18next';
import { useTranslation as useTranslationOriginal, initReactI18next } from 'react-i18next';

// Extend i18next with missing types
declare module 'i18next' {
  interface i18n {
    isInitialized: boolean;
    use: any;
    changeLanguage: (language: string) => Promise<any>;
    language: string;
  }
}

// Export a typed version of useTranslation
export const useTranslation = () => {
  return useTranslationOriginal();
};

// Helper function to get the i18n instance with proper types
export const getI18nInstance = (): typeof i18n & {
  isInitialized: boolean;
  use: any;
  changeLanguage: (language: string) => Promise<any>;
  language: string;
} => {
  return i18n as any;
};

export default i18n; 