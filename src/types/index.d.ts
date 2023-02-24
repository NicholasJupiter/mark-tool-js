import type { Element, Svg } from '@svgdotjs/svg.js';

declare module '*.svg';
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.bmp';
declare module '*.tiff';

declare module '@svgdotjs/svg.js' {
  interface Element {
    selectize(...args): this;
    resize(): this;
    get(...args): this;
    draggable(arg1?: boolean = true): this;
  }
}

declare global {
  interface Window {
    SVG: any;
  }
}
