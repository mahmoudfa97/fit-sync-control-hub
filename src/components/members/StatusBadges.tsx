
import { Badge } from "@/components/ui/badge";

export const statusStyles = {
  active: "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-500",
  inactive: "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-500",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-500",
  expired: "bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-500",
};

export const paymentStatusStyles = {
  paid: "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-500",
  overdue: "bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-500",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-500",
  canceled: "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-500",
};

export const statusLabels = {
  active: "פעיל",
  inactive: "לא פעיל",
  pending: "בהמתנה",
  expired: "פג תוקף"
};

export const paymentStatusLabels = {
  paid: "שולם",
  overdue: "איחור",
  pending: "בהמתנה",
  canceled: "מבוטל"
};

export const StatusBadge = ({ status }: { status: keyof typeof statusStyles }) => (
  <Badge variant="outline" className={statusStyles[status]}>
    {statusLabels[status]}
  </Badge>
);
