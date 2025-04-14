
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface FormSubmitButtonProps {
  isSubmitting: boolean;
  label: string;
  submitLabel?: string;
}

export function FormSubmitButton({ 
  isSubmitting, 
  label, 
  submitLabel = "שומר..." 
}: FormSubmitButtonProps) {
  return (
    <Button 
      type="submit" 
      className="w-full" 
      disabled={isSubmitting}
    >
      {isSubmitting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {submitLabel}
        </>
      ) : (
        label
      )}
    </Button>
  );
}
