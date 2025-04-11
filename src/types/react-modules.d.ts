declare module 'react' {
  export interface FC<P = {}> {
    (props: P): JSX.Element | null;
  }
  
  export function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: readonly any[]): void;
  export function useContext<T>(context: React.Context<T>): T;
  export function createContext<T>(defaultValue: T): React.Context<T>;
  export function useRef<T>(initialValue: T | null): { current: T | null };
  
  export interface Context<T> {
    Provider: Provider<T>;
    Consumer: Consumer<T>;
    displayName?: string;
  }
  
  export interface Provider<T> {
    (props: { value: T; children: ReactNode }): JSX.Element | null;
  }
  
  export interface Consumer<T> {
    (props: { children: (value: T) => ReactNode }): JSX.Element | null;
  }
  
  export type ReactNode = React.ReactElement | string | number | boolean | null | undefined;
  export type ReactElement = any;
  export type ComponentType<P = {}> = (props: P) => ReactElement;
}

declare module 'react-i18next' {
  export interface UseTranslationResponse {
    t: (key: string, options?: any) => string;
    i18n: any;
    ready: boolean;
  }
  
  export function useTranslation(ns?: string | string[], options?: any): UseTranslationResponse;
  export const initReactI18next: any;
}

declare module 'js-cookie' {
  interface CookieAttributes {
    expires?: number | Date;
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
  }

  interface CookiesStatic {
    set(name: string, value: string | object, options?: CookieAttributes): void;
    get(name: string): string | undefined;
    remove(name: string, options?: CookieAttributes): void;
  }

  const Cookies: CookiesStatic;
  export default Cookies;
}

declare module 'next/script' {
  import React from 'react';

  export interface ScriptProps {
    src?: string;
    strategy?: 'beforeInteractive' | 'afterInteractive' | 'lazyOnload';
    onLoad?: () => void;
    onError?: () => void;
    onReady?: () => void;
    id?: string;
    children?: React.ReactNode;
  }

  const Script: React.FC<ScriptProps>;
  export default Script;
}

declare module 'next/font/google' {
  export interface FontOptions {
    weight?: string | string[];
    style?: string | string[];
    subsets?: string[];
    display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
    preload?: boolean;
    variable?: string;
    fallback?: string[];
  }

  export function Inter(options: FontOptions): {
    className: string;
    style: { fontFamily: string };
    variable: string;
  };
  
  export function Montserrat(options: FontOptions): {
    className: string;
    style: { fontFamily: string };
    variable: string;
  };
  
  export function Roboto(options: FontOptions): {
    className: string;
    style: { fontFamily: string };
    variable: string;
  };
}

declare module 'next' {
  export interface Metadata {
    title?: string;
    description?: string;
    [key: string]: any;
  }
}

declare module 'i18next' {
  export interface i18n {
    language: string;
    changeLanguage(lng: string): Promise<any>;
    t(key: string, options?: any): string;
    exists(key: string, options?: any): boolean;
    isInitialized: boolean;
  }
}

declare module 'i18next-http-backend' {
  const backend: any;
  export default backend;
}

declare module 'i18next-browser-languagedetector' {
  const languageDetector: any;
  export default languageDetector;
}

declare module '@/context/LanguageContext' {
  export type Language = 'en' | 'es';
  
  export interface LanguageContextType {
    language: Language;
    changeLanguage: (lang: Language) => void;
    isClient: boolean;
    isReady: boolean;
  }
  
  export const LanguageProvider: React.FC<{ children: React.ReactNode }>;
  export function useLanguage(): LanguageContextType;
}

declare module '@/components/ClientLanguageDetector' {
  const ClientLanguageDetector: React.FC;
  export default ClientLanguageDetector;
} 