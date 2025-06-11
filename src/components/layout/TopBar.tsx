
import { LanguageToggle } from "@/components/LanguageToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NumbersPrivacyToggle } from "@/components/NumbersPrivacyToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { useTranslation } from "react-i18next";

export function TopBar() {
  const { session } = useAuth();
  const { currentOrganization, loading } = useOrganization();
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
      <div className="flex flex-1 items-center justify-between">
        <div className="flex items-center gap-4">
          {currentOrganization && !loading && (
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">{currentOrganization.name}</h2>
              <span className="text-sm text-muted-foreground">({currentOrganization.subscription_tier})</span>
            </div>
          )}
          {loading && (
            <div className="animate-pulse text-muted-foreground">טוען ארגון...</div>
          )}
          {!currentOrganization && !loading && (
            <div className="text-red-500">לא נבחר ארגון</div>
          )}
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
