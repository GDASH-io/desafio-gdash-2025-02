import { Moon, Sun } from "lucide-react";
import { Button } from "./components/ui/button";
import { useTheme } from "./lib/theme";

export default function ToogleThemeButton() {
  const { theme, toggleTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="absolute top-4 right-4 rounded-full"
      onClick={toggleTheme}>
      {theme === "dark" ? <Sun className="h-5 w-5 text-white" /> : <Moon className="h-5 w-5 text-black" />}
    </Button>
  )
}