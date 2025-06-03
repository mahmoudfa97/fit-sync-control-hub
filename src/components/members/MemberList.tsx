
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, UserCheck } from "lucide-react";
import { Member } from "@/store/slices/members/types";

interface MemberListProps {
  members: Member[];
  loading?: boolean;
  onAddSubscription: (memberId: string) => void;
  onCheckIn: (memberId: string) => Promise<void>;
}

export function MemberList({ members, loading = false, onAddSubscription, onCheckIn }: MemberListProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">לא נמצאו חברים</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {members.map((member) => (
        <Card key={member.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback>{member.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                      {member.status === 'active' ? 'פעיל' : 'לא פעיל'}
                    </Badge>
                    <Badge variant={member.paymentStatus === 'paid' ? 'success' : 'destructive'}>
                      {member.paymentStatus === 'paid' ? 'שולם' : 'חוב'}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onAddSubscription(member.id)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  מנוי
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onCheckIn(member.id)}
                >
                  <UserCheck className="w-4 h-4 mr-1" />
                  נוכחות
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
