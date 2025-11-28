import * as React from "react";
import { Label } from "./label";
import { cn } from "@/lib/utils";

export interface InputProps extends React.ComponentProps<"input"> {
  label?: string;
  error?: string;
  labelIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, labelIcon, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="space-y-2.5">
        {label && (
          <Label
            htmlFor={inputId}
            className="text-sm font-semibold text-foreground flex items-center gap-2"
          >
            {labelIcon}
            {label}
          </Label>
        )}
        <div className="space-y-1.5">
          <input
            id={inputId}
            type={type}
            className={cn(
              "flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
              error && "border-destructive focus-visible:ring-destructive",
              className
            )}
            ref={ref}
            {...props}
          />
          {error && (
            <p className="text-sm text-destructive flex items-center gap-1">
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
