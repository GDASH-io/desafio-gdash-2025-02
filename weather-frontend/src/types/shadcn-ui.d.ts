/* eslint-disable @typescript-eslint/no-explicit-any */
declare module "shadcn/ui" {
  import * as React from "react";

  export const Button: React.ForwardRefExoticComponent<
    React.ButtonHTMLAttributes<HTMLButtonElement> &
      React.RefAttributes<HTMLButtonElement> & { variant?: string; size?: string }
  >;

  export const Input: React.ForwardRefExoticComponent<
    React.InputHTMLAttributes<HTMLInputElement> & React.RefAttributes<HTMLInputElement>
  >;

  export const Card: React.FC<{ className?: string; children?: React.ReactNode }>;
  export const CardHeader: React.FC<{ className?: string; children?: React.ReactNode }>;
  export const CardTitle: React.FC<{ className?: string; children?: React.ReactNode }>;
  export const CardContent: React.FC<{ className?: string; children?: React.ReactNode }>;

  export const Alert: React.FC<any>;
  export const AlertTitle: React.FC<any>;
  export const AlertDescription: React.FC<any>;

  const _default: any;
  export default _default;
}
