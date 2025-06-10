
import { LanguageToggle } from "@/components/LanguageToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NumbersPrivacyToggle } from "@/components/NumbersPrivacyToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";

export function TopBar() {
  const { session } = useAuth();
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <div className="flex flex-1 items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Organization info can be displayed here if needed */}
        </div>
        
        <div className="flex items-center gap-2">
          <NumbersPrivacyToggle />
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}
