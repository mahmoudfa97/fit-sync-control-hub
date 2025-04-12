
import { Toggle } from "@/components/ui/toggle";
import { Globe } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { t } from "@/utils/translations";

export function LanguageToggle() {
  // Initialize language handling
  useLanguage();
  
  return (
    <Toggle 
      variant="outline" 
      aria-label="מחוון שפה עברית"
      pressed={true}
      className="flex items-center gap-2"
    >
      <Globe className="h-4 w-4" />
      <span className="hidden md:inline">שפה</span>
    </Toggle>
  );
}
