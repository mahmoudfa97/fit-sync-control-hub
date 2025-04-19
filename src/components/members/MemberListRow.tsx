"use client"
import { Link } from "react-router-dom"
import { TableRow, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarClock, ChevronDown } from "lucide-react"
import {
  StatusBadge,
  paymentStatusStyles,
  paymentStatusLabels,
  type MemberStatus,
  type PaymentStatus,
} from "./StatusBadges"
import type { Member } from "@/store/slices/membersSlice"
import { useDashboardPrivacy } from "@/hooks/useDashboardPrivacy"

interface MemberListRowProps {
  member: Member
  onCheckIn: (id: string) => void
}

export const MemberListRow = ({ member, onCheckIn }: MemberListRowProps) => {
  const { hideNumbers } = useDashboardPrivacy()

  // Format dates and sensitive information based on privacy settings
  const formatPrivateDate = (date: string): string => {
    if (hideNumbers) {
      return "**/**/****"
    }
    return date
  }

  // Format email to hide part of it when privacy is enabled
  const formatPrivateEmail = (email: string): string => {
    if (!email || !hideNumbers) return email

    const parts = email.split("@")
    if (parts.length !== 2) return email

    const username = parts[0]
    const domain = parts[1]

    // Show first character and last character of username, hide the rest
    const maskedUsername =
      username.length <= 2
        ? "*".repeat(username.length)
        : `${username[0]}${"*".repeat(username.length - 2)}${username[username.length - 1]}`

    return `${maskedUsername}@${domain}`
  }

  return (
    <TableRow key={member.id} className="overflow-auto">
      <TableCell className="font-medium text-center">
        <div className="flex gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
            <AvatarFallback>{member.initials}</AvatarFallback>
          </Avatar>
          <div>
            <Link to={`/members/${member.id}`} className="font-medium hover:underline">
              {member.name}
            </Link>
            <p className="text-xs text-muted-foreground">{formatPrivateEmail(member.email)}</p>
            <p className="text-xs text-muted-foreground">{formatPrivateEmail(member.phone)}</p>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-center">
        <div className="flex flex-col">
          <span>{member.membershipType}</span>
          <span className="text-xs text-muted-foreground">מאז {formatPrivateDate(member.joinDate)}</span>
        </div>
      </TableCell>
      <TableCell className="text-center">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground"> {formatPrivateDate(member.age)}</span>
        </div>
      </TableCell>
      <TableCell>
        <StatusBadge status={member.status as MemberStatus} />
      </TableCell>
      <TableCell className="text-center">
        <div className="flex items-center gap-1">
          <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-sm">{hideNumbers ? "**:**" : member.lastCheckIn}</span>
        </div>
      </TableCell>
      <TableCell className="text-center">
        <span className={`font-medium ${paymentStatusStyles[member.paymentStatus as PaymentStatus]}`}>
          {paymentStatusLabels[member.paymentStatus as PaymentStatus]}
        </span>
      </TableCell>
      <TableCell className="text-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              נהלים <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={`/members/${member.id}`}>צפה בפרופיל</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>ערוך חבר</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCheckIn(member.id)}>רישום נוכחות</DropdownMenuItem>
            <DropdownMenuItem>ניהול תוכנית</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">השבתה</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}
