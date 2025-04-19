"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle, UserCog, Printer, MoreHorizontal } from "lucide-react"
import { AddSubscriptionDialog } from "@/components/members/AddSubscriptionDialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface MemberProfileActionsProps {
  memberId: string
  memberName: string
  onRefresh: () => void
}

export function MemberProfileActions({ memberId, memberName, onRefresh }: MemberProfileActionsProps) {
  const [isAddSubscriptionOpen, setIsAddSubscriptionOpen] = useState(false)

  return (
    <div className="flex items-center gap-2">
      <Button onClick={() => setIsAddSubscriptionOpen(true)} className="flex items-center gap-1">
        <PlusCircle className="w-4 h-4" />
        הוסף מנוי
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <UserCog className="mr-2 h-4 w-4" />
            ערוך פרטי חבר
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Printer className="mr-2 h-4 w-4" />
            הדפס כרטיס חבר
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AddSubscriptionDialog
        open={isAddSubscriptionOpen}
        onOpenChange={setIsAddSubscriptionOpen}
        memberId={memberId}
        memberName={memberName}
        onSubscriptionAdded={onRefresh}
      />
    </div>
  )
}
