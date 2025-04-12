
import { Toggle } from "@/components/ui/toggle";
import { Globe } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { t } from "@/utils/translations";
import { useAppDispatch } from "@/hooks/redux";
import { updateSettings } from "@/store/slices/settingsSlice";

export function LanguageToggle() {
  const currentLanguage = useLanguage();
  const dispatch = useAppDispatch();
  
  const toggleLanguage = () => {
    // Toggle between Hebrew and English
    const newLanguage = currentLanguage === "he" ? "en" : "he";
    dispatch(updateSettings({ language: newLanguage }));
  };
  
  return (
    <Toggle 
      variant="outline" 
      aria-label="Toggle language"
      pressed={currentLanguage === "he"}
      onPressedChange={toggleLanguage}
      className="flex items-center gap-2"
    >
      <Globe className="h-4 w-4" />
      <span className="hidden md:inline">{t("language")}</span>
    </Toggle>
  );
}
