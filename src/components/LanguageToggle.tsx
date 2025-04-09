
import { useState, useEffect } from "react";
import { Toggle } from "@/components/ui/toggle";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { updateSettings } from "@/store/slices/settingsSlice";
import { Globe } from "lucide-react";

export function LanguageToggle() {
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.settings.language);
  const [isEnglish, setIsEnglish] = useState(language === "en");

  useEffect(() => {
    setIsEnglish(language === "en");
  }, [language]);

  const toggleLanguage = () => {
    const newLang = isEnglish ? "ar" : "en";
    dispatch(updateSettings({ language: newLang }));
    
    // Update html lang and dir attributes
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
  };

  return (
    <Toggle 
      variant="outline" 
      aria-label="Toggle language"
      pressed={isEnglish}
      onPressedChange={toggleLanguage}
      className="flex items-center gap-2"
    >
      <Globe className="h-4 w-4" />
      <span className="hidden md:inline">{isEnglish ? "English" : "العربية"}</span>
    </Toggle>
  );
}
