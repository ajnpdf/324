import * as React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'amp-auto-ads': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        type?: string;
        'data-ad-client'?: string;
      }, HTMLElement>;
      'amp-ad': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        width?: string;
        height?: string;
        type?: string;
        'data-ad-client'?: string;
        'data-ad-slot'?: string;
        'data-auto-format'?: string;
        'data-full-width'?: string;
      }, HTMLElement>;
      'dotlottie-wc': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        src?: string;
        autoplay?: boolean;
        loop?: boolean;
        style?: React.CSSProperties;
      }, HTMLElement>;
    }
  }
}
