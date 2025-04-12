
import { useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { addMember, filterMembers, recordCheckIn, Member } from "@/store/slices/membersSlice";
import { useToast } from "@/hooks/use-toast";
import { MembersHeader } from "@/components/members/MembersHeader";
import { MemberList } from "@/components/members/MemberList";
import { AddMemberDialog } from "@/components/members/AddMemberDialog";
import { t } from "@/utils/translations";

export default function Members() {
  const dispatch = useAppDispatch();
  const { filteredMembers } = useAppSelector(state => state.members);
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    phone: "",
    membershipType: "רגיל",
    status: "active" as Member['status'],
    paymentStatus: "paid" as Member['paymentStatus'],
  });
  
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    dispatch(filterMembers({ status: null, searchTerm: term }));
  };
  
  const handleFilterChange = (status: string | null) => {
    dispatch(filterMembers({ status, searchTerm }));
  };
  
  const handleAddMember = () => {
    if (!newMember.name || !newMember.email) {
      toast({
        title: "שגיאת קלט",
        description: "אנא הזן שם ודוא״ל תקינים",
        variant: "destructive",
      });
      return;
    }
    
    const today = new Date();
    const hebrewMonths = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
    const joinDateStr = `${today.getDate()} ${hebrewMonths[today.getMonth()]}, ${today.getFullYear()}`;
    
    const nameParts = newMember.name.split(' ');
    const initials = nameParts.length > 1 
      ? `${nameParts[0][0]}${nameParts[1][0]}`
      : `${nameParts[0][0]}${nameParts[0][1] || ''}`;
    
    const memberToAdd = {
      id: `member-${Date.now()}`,
      name: newMember.name,
      email: newMember.email,
      phone: newMember.phone,
      membershipType: newMember.membershipType,
      status: newMember.status,
      joinDate: joinDateStr,
      lastCheckIn: "טרם נרשם",
      paymentStatus: newMember.paymentStatus,
      initials: initials,
    } as Member;
    
    dispatch(addMember(memberToAdd));
    
    toast({
      title: "לקוח נוסף בהצלחה",
      description: `${newMember.name} נוסף לרשימת הלקוחות`,
    });
    
    setNewMember({
      name: "",
      email: "",
      phone: "",
      membershipType: "רגיל",
      status: "active" as Member['status'],
      paymentStatus: "paid" as Member['paymentStatus'],
    });
    
    setAddMemberOpen(false);
  };
  
  const handleCheckIn = (memberId: string) => {
    dispatch(recordCheckIn(memberId));
    toast({
      title: "כניסה נרשמה",
      description: "כניסת הלקוח נרשמה בהצלחה",
    });
  };

  return (
    <DashboardShell>
      <MembersHeader
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
        onFilterChange={handleFilterChange}
        onAddMemberClick={() => setAddMemberOpen(true)}
      />

      <MemberList 
        members={filteredMembers}
        onFilterChange={handleFilterChange}
        onCheckIn={handleCheckIn}
      />
      
      <AddMemberDialog
        open={addMemberOpen}
        onOpenChange={setAddMemberOpen}
        newMember={newMember}
        setNewMember={setNewMember}
        onAddMember={handleAddMember}
      />
    </DashboardShell>
  );
}
