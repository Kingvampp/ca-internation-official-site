import React from 'react';

/**
 * Enhance the React namespace to properly handle synthetic events
 */
declare module 'react' {
  // Add proper SyntheticEvent type if it's missing
  export interface SyntheticEvent<T = Element, E = Event> extends BaseSyntheticEvent<E, EventTarget & T, EventTarget> {}
  
  // Add base synthetic event if needed
  export interface BaseSyntheticEvent<E = object, C = any, T = any> {
    nativeEvent: E;
    currentTarget: C;
    target: T;
    bubbles: boolean;
    cancelable: boolean;
    defaultPrevented: boolean;
    eventPhase: number;
    isTrusted: boolean;
    preventDefault(): void;
    isDefaultPrevented(): boolean;
    stopPropagation(): void;
    isPropagationStopped(): boolean;
    persist(): void;
    timeStamp: number;
    type: string;
  }
  
  // Add common image event handler
  export interface ImgHTMLAttributes<T> extends HTMLAttributes<T> {
    alt?: string;
    crossOrigin?: string;
    decoding?: 'async' | 'auto' | 'sync';
    height?: number | string;
    loading?: 'eager' | 'lazy';
    referrerPolicy?: string;
    sizes?: string;
    src?: string;
    srcSet?: string;
    useMap?: string;
    width?: number | string;
    onError?: (event: SyntheticEvent<HTMLImageElement, Event>) => void;
    onLoad?: (event: SyntheticEvent<HTMLImageElement, Event>) => void;
  }
} 