
import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarClock, ChevronDown } from "lucide-react";
import { StatusBadge, paymentStatusStyles, paymentStatusLabels } from "./StatusBadges";
import { Member } from "@/store/slices/membersSlice";

interface MemberListRowProps {
  member: Member;
  onCheckIn: (id: string) => void;
}

export const MemberListRow = ({ member, onCheckIn }: MemberListRowProps) => {
  return (
    <TableRow key={member.id}>
      <TableCell className="font-medium">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={member.avatar} alt={member.name} />
            <AvatarFallback>{member.initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{member.name}</p>
            <p className="text-xs text-muted-foreground">{member.email}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span>{member.membershipType}</span>
          <span className="text-xs text-muted-foreground">מאז {member.joinDate}</span>
        </div>
      </TableCell>
      <TableCell>
        <StatusBadge status={member.status} />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-sm">{member.lastCheckIn}</span>
        </div>
      </TableCell>
      <TableCell>
        <span className={`font-medium ${paymentStatusStyles[member.paymentStatus]}`}>
          {paymentStatusLabels[member.paymentStatus]}
        </span>
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
            נהלים <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>צפה בפרופיל</DropdownMenuItem>
            <DropdownMenuItem>ערוך חבר</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCheckIn(member.id)}>
            רישום נוכחות
                        </DropdownMenuItem>
            <DropdownMenuItem>ניהול תוכנית</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
            השבתה            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};
