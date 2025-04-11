import React from 'react';

// Add proper typings for Next.js App Router components
declare global {
  namespace React {
    // Ensure React.FC is properly typed
    interface FC<P = {}> {
      (props: P): React.ReactElement | null;
    }

    // Fix ReactNode types
    type ReactNode = 
      | ReactElement
      | string
      | number
      | boolean
      | null
      | undefined
      | Iterable<ReactNode>;

    // Ensure ReactElement is properly typed
    interface ReactElement<
      P = any,
      T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>
    > {
      type: T;
      props: P;
      key: Key | null;
    }

    // Fix ElementType
    type ElementType<P = any> =
      | {
          [K in keyof JSX.IntrinsicElements]: P extends JSX.IntrinsicElements[K] ? K : never;
        }[keyof JSX.IntrinsicElements]
      | ComponentType<P>;
  }

  // Ensure JSX namespace is properly defined
  namespace JSX {
    interface Element extends React.ReactElement<any, any> {}
    
    interface ElementAttributesProperty {
      props: {};
    }
    
    interface ElementChildrenAttribute {
      children: {};
    }
    
    interface IntrinsicElements {
      [elemName: string]: any;
    }
    
    interface IntrinsicAttributes {
      children?: React.ReactNode;
    }
  }
}

// Fix react-i18next typings
declare module 'react-i18next' {
  interface TFunction {
    (key: string, defaultValue: string): string;
    (key: string, options?: object): string;
    <T extends object>(key: string, options?: T): string;
  }

  export function useTranslation(ns?: string | string[], options?: any): {
    t: TFunction;
    i18n: any;
    ready: boolean;
  };
}

// Fix next/navigation typings
declare module 'next/navigation' {
  export function useSearchParams(): URLSearchParams;
  export function useParams<T = Record<string, string | string[]>>(): T;
  export function useRouter(): {
    push: (url: string) => void;
    replace: (url: string) => void;
    back: () => void;
    forward: () => void;
  };
}

// This enables TypeScript to properly recognize the file as a module
export {}; 