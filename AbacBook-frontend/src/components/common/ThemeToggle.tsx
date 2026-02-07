import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { isDark, toggle } = useTheme();
  return (
    <Button variant="outline" size="icon" onClick={toggle} className="h-7 w-7 rounded-full" aria-label="Toggle theme">
      {isDark ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
    </Button>
  );
}
