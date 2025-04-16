
import { useDashboardPrivacy } from "@/hooks/useDashboardPrivacy";

interface StatCardValueProps {
  value: string | number;
}

export function StatCardValue({ value }: StatCardValueProps) {
  const { hideNumbers } = useDashboardPrivacy();
  
  if (hideNumbers) {
    // Check if the value is a number or contains numbers
    if (typeof value === 'number' || /\d/.test(value.toString())) {
      return <span className="text-2xl font-bold">•••••</span>;
    }
  }
  
  return <span className="text-2xl font-bold">{value}</span>;
}
