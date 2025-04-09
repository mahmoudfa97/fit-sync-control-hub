
import { Toggle } from "@/components/ui/toggle";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { updateSettings } from "@/store/slices/settingsSlice";
import { Globe } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export function LanguageToggle() {
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.settings.language);
  
  // Initialize language handling
  useLanguage();
  
  const toggleLanguage = () => {
    const newLang = language === "en" ? "ar" : "en";
    dispatch(updateSettings({ language: newLang }));
  };

  return (
    <Toggle 
      variant="outline" 
      aria-label="Toggle language"
      pressed={language === "en"}
      onPressedChange={toggleLanguage}
      className="flex items-center gap-2"
    >
      <Globe className="h-4 w-4" />
      <span className="hidden md:inline">{language === "en" ? "English" : "العربية"}</span>
    </Toggle>
  );
}
