import { cn } from "@/app/lib/utils";
import { type LucideIcon } from "lucide-react";
import { Card, CardContent } from "./ui/card";

interface WeatherCardProps {
  icon: LucideIcon;
  title: string;
  value: string;
  unit: string;
  description?: string;
  variant?: "default" | "highlight";
}

export const WeatherCard = ({ 
  icon: Icon, 
  title, 
  value, 
  unit, 
  description,
  variant = "default" 
}: WeatherCardProps) => {
  return (
    <Card className={cn(
      "overflow-hidden transition-all hover:shadow-md",
      variant === "highlight" && "bg-primary text-primary-foreground"
    )}>
      <CardContent className="px-6 py-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Icon className={cn(
                "h-5 w-5",
                variant === "highlight" ? "text-primary-foreground" : "text-muted-foreground"
              )} />
              <span className={cn(
                "text-sm font-medium",
                variant === "highlight" ? "text-primary-foreground/90" : "text-muted-foreground"
              )}>
                {title}
              </span>
            </div>
            <div className="space-y-1">
              <div className={cn(
                "text-3xl font-bold",
                variant === "highlight" ? "text-primary-foreground" : "text-foreground"
              )}>
                {value}
              </div>
              <div className={cn(
                "text-sm",
                variant === "highlight" ? "text-primary-foreground/70" : "text-muted-foreground"
              )}>
                {unit}
              </div>
              {description && (
                <p className={cn(
                  "text-xs mt-2",
                  variant === "highlight" ? "text-primary-foreground/60" : "text-muted-foreground/80"
                )}>
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
