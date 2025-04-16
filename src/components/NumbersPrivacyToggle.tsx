
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboardPrivacy } from "@/hooks/useDashboardPrivacy";

export function NumbersPrivacyToggle() {
  const { hideNumbers, toggleNumberVisibility } = useDashboardPrivacy();

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleNumberVisibility}
      title={hideNumbers ? 'Show numbers' : 'Hide numbers'}
    >
      {hideNumbers ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
    </Button>
  );
}
