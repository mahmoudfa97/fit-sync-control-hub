
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { AddSubscriptionDialog } from "@/components/members/AddSubscriptionDialog";

interface MemberProfileActionsProps {
  memberId: string;
  memberName: string;
  onRefresh: () => void;
}

export function MemberProfileActions({ memberId, memberName, onRefresh }: MemberProfileActionsProps) {
  const [isAddSubscriptionOpen, setIsAddSubscriptionOpen] = useState(false);
  
  return (
    <>
      <Button
        onClick={() => setIsAddSubscriptionOpen(true)}
        className="flex items-center gap-1"
      >
        <PlusCircle className="w-4 h-4" />
        הוסף מנוי
      </Button>
      
      <AddSubscriptionDialog
        open={isAddSubscriptionOpen}
        onOpenChange={setIsAddSubscriptionOpen}
        memberId={memberId}
        memberName={memberName}
        onSubscriptionAdded={onRefresh}
      />
    </>
  );
}
