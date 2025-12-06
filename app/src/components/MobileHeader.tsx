import { Button } from "@/components/ui/button";
import { Cloud, Menu } from "lucide-react";

interface MobileHeaderProps {
  onMenuClick: () => void;
}

export function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  return (
    <header className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <Button variant="ghost" size="icon" onClick={onMenuClick}>
        <Menu className="h-5 w-5" />
      </Button>
      <div className="flex items-center gap-2">
        <Cloud className="h-6 w-6 text-primary" />
        <span className="font-bold">Weather</span>
      </div>
      <div className="w-10" />
    </header>
  );
}
