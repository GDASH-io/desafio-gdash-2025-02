import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Label } from "./label";
import { cn } from "@/lib/utils";

export interface PasswordInputProps
  extends Omit<React.ComponentProps<"input">, "type"> {
  className?: string;
  label?: string;
  error?: string;
  labelIcon?: React.ReactNode;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, label, error, labelIcon, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
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
          <div className="relative">
            <input
              id={inputId}
              type={showPassword ? "text" : "password"}
              className={cn(
                "flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 pr-10 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                error && "border-destructive focus-visible:ring-destructive",
                className
              )}
              ref={ref}
              {...props}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
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

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
