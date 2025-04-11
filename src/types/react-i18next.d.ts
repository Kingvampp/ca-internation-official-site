import 'react-i18next';

/**
 * Augment the react-i18next module to support string fallbacks
 */
declare module 'react-i18next' {
  interface TFunction {
    // Add overload for string fallback
    (key: string, fallback: string): string;
    (key: string, options?: object): string;
    <T extends object>(key: string, options?: T): string;
  }

  export interface UseTranslationResponse {
    t: TFunction;
    i18n: {
      language: string;
      changeLanguage: (lng: string) => Promise<any>;
    };
    ready: boolean;
  }

  // Enhance the useTranslation hook
  export function useTranslation(
    ns?: string | string[],
    options?: { useSuspense?: boolean }
  ): UseTranslationResponse;
} 