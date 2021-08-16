declare module "*.css";
declare module "*.less";
declare module "*.scss";
declare module "*.sass";
declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";
declare module "*.gif";
declare module "*.bmp";
declare module "*.tiff";
declare module "*.svg" {
  export function ReactComponent(
    props: React.SVGProps<SVGSVGElement>
  ): React.ReactElement;
  const url: string;
  export default url;
}

declare const window: Window & {
  ActiveXObject: any;
};

declare module "postcss-cssnext";
declare module "postcss-write-svg";
declare module "postcss-flexbugs-fixes";
declare module "postcss-viewport-units";
declare module "cssnano";

declare global {
  interface ChangeEvent<T = Element> extends Event<T> {
    target: T;
  }
  interface Window {
    ActiveXObject: any;
  }
}
