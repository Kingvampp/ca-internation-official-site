import React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
    
    // Add explicit typing for Element
    type Element = React.ReactElement<any, any> | null;
  }
}

export {}; 