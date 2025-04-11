/// <reference types="react" />

// Global JSX namespace
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

// Augment react-i18next
declare module 'react-i18next' {
  interface TFunction {
    (key: string, defaultValue: string): string;
    (key: string, options?: object): string;
  }

  export function useTranslation(ns?: string | string[]): {
    t: TFunction;
    i18n: any;
    ready: boolean;
  };
}

// Augment LanguageContext
declare module '../context/LanguageContext' {
  interface LanguageContextType {
    language: string;
    setLanguage?: (lang: string) => void;
    isClient: boolean;
  }
}

// Enables TypeScript support for the useI18n hook
declare module 'next-i18next' {
  export function useTranslation(ns?: string | string[]): {
    t: (key: string, options?: any) => string;
    i18n: any;
    ready: boolean;
  }
}

export { }; 