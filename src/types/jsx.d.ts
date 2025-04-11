import React from 'react';

declare global {
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
      div: any;
      span: any;
      h1: any;
      h2: any;
      h3: any;
      h4: any;
      h5: any;
      h6: any;
      p: any;
      a: any;
      ul: any;
      ol: any;
      li: any;
      button: any;
      input: any;
      form: any;
      select: any;
      option: any;
      textarea: any;
      header: any;
      footer: any;
      nav: any;
      main: any;
      section: any;
      article: any;
      aside: any;
      img: any;
      time: any;
      html: any;
      body: any;
      head: any;
      link: any;
      meta: any;
      script: any;
      style: any;
    }
    
    // Support for React SVG types
    interface IntrinsicAttributes {
      children?: React.ReactNode;
    }
  }
}

export {}; 