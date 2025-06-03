
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { MembersHeader } from "@/components/members/MembersHeader";
import { MemberList } from "@/components/members/MemberList";
import { AddMemberDialog } from "@/components/members/AddMemberDialog";
import { EnhancedAddSubscriptionDialog } from "@/components/members/EnhancedAddSubscriptionDialog";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { MemberService, MemberFormData } from "@/services/MemberService";
import { setMembers, setSearchQuery, setFilterStatus } from "@/store/slices/members";
import { toast } from "sonner";
import { convertServiceMembersToStoreMembers } from "@/utils/memberConverter";

export default function Members() {
  const dispatch = useDispatch();
  const { members, filteredMembers, searchQuery, filterStatus } = useSelector((state: RootState) => state.members);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const serviceMembers = await MemberService.fetchMembers();
      const storeMembers = convertServiceMembersToStoreMembers(serviceMembers);
      dispatch(setMembers(storeMembers));
    } catch (error) {
      console.error("Error loading members:", error);
      toast.error("שגיאה בטעינת החברים");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    dispatch(setSearchQuery(query));
  };

  const handleFilterChange = (status: string | null) => {
    dispatch(setFilterStatus(status));
  };

  const handleAddMember = async (memberData: MemberFormData) => {
    try {
      const result = await MemberService.addMember(memberData);
      
      if (result.isExisting) {
        toast.info("חבר עם האימייל הזה כבר קיים במערכת");
      } else {
        toast.success("החבר נוסף בהצלחה");
        await loadMembers();
      }
      
      setIsAddMemberOpen(false);
    } catch (error) {
      console.error("Error adding member:", error);
      toast.error("שגיאה בהוספת החבר");
    }
  };

  const handleAddSubscription = (memberId: string) => {
    setSelectedMemberId(memberId);
    setIsSubscriptionDialogOpen(true);
  };

  const handleCheckIn = async (memberId: string) => {
    try {
      await MemberService.recordCheckIn(memberId);
      toast.success("רישום נוכחות הושלם בהצלחה");
    } catch (error) {
      console.error("Error checking in member:", error);
      toast.error("שגיאה ברישום הנוכחות");
    }
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">חברים</h1>
            <p className="text-muted-foreground">נהל את רשימת החברים שלך</p>
          </div>
          <Button onClick={() => setIsAddMemberOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            הוסף חבר
          </Button>
        </div>

        <MembersHeader
          searchQuery={searchQuery}
          onSearchChange={handleSearch}
          filterStatus={filterStatus}
          onFilterChange={handleFilterChange}
          totalMembers={members.length}
          onAddMemberClick={() => setIsAddMemberOpen(true)}
        />

        <MemberList
          members={filteredMembers}
          loading={loading}
          onAddSubscription={handleAddSubscription}
          onCheckIn={handleCheckIn}
        />

        <AddMemberDialog
          open={isAddMemberOpen}
          onOpenChange={setIsAddMemberOpen}
          onSubmit={handleAddMember}
        />

        {selectedMemberId && (
          <EnhancedAddSubscriptionDialog
            open={isSubscriptionDialogOpen}
            onOpenChange={setIsSubscriptionDialogOpen}
            memberId={selectedMemberId}
            onSuccess={() => {
              setIsSubscriptionDialogOpen(false);
              setSelectedMemberId(null);
              loadMembers();
            }}
          />
        )}
      </div>
    </DashboardShell>
  );
}
