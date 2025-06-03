
import { LanguageToggle } from "@/components/LanguageToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NumbersPrivacyToggle } from "@/components/NumbersPrivacyToggle";
import { OrganizationSelector } from "@/components/organization/OrganizationSelector";
import { CreateOrganizationDialog } from "@/components/organization/CreateOrganizationDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";

export function TopBar() {
  const { session } = useAuth();
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <div className="flex flex-1 items-center justify-between">
        <div className="flex items-center gap-4">
          {session && <OrganizationSelector />}
          {session && <CreateOrganizationDialog />}
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
