declare module "*.html" {
  const content: string;
  export default content;
}

declare namespace JSX {
  interface IntrinsicElements {
    [elementName: string]: any;
  }
}
