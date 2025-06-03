
import { CheckCircle, CreditCard, UserPlus, Calendar, FileText, MessageSquare, AlertCircle, Clock, LogIn, RefreshCw } from "lucide-react"

export type ActivityType =
  | "checkin"
  | "payment"
  | "membership"
  | "newMember"
  | "appointment"
  | "document"
  | "message"
  | "alert"
  | "reminder"
  | "access"
  | "renewal"

interface ActivityIconProps {
  type: ActivityType
  className?: string
}

export function ActivityIcon({ type, className = "h-4 w-4" }: ActivityIconProps) {
  switch (type) {
    case "checkin":
      return <CheckCircle className={`${className} text-blue-500`} />
    case "payment":
      return <CreditCard className={`${className} text-green-500`} />
    case "membership":
    case "newMember":
      return <UserPlus className={`${className} text-purple-500`} />
    case "appointment":
      return <Calendar className={`${className} text-orange-500`} />
    case "document":
      return <FileText className={`${className} text-gray-500`} />
    case "message":
      return <MessageSquare className={`${className} text-indigo-500`} />
    case "alert":
      return <AlertCircle className={`${className} text-red-500`} />
    case "reminder":
      return <Clock className={`${className} text-amber-500`} />
    case "access":
      return <LogIn className={`${className} text-cyan-500`} />
    case "renewal":
      return <RefreshCw className={`${className} text-emerald-500`} />
    default:
      return null
  }
}
