
import { useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { addMember, filterMembers, recordCheckIn } from "@/store/slices/membersSlice";
import { useToast } from "@/hooks/use-toast";
import { MembersHeader } from "@/components/members/MembersHeader";
import { MemberList } from "@/components/members/MemberList";
import { AddMemberDialog } from "@/components/members/AddMemberDialog";

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
    membershipType: "قياسي",
    status: "active" as "active" | "inactive" | "pending" | "expired",
    paymentStatus: "paid" as "paid" | "overdue" | "pending",
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
        title: "خطأ في البيانات",
        description: "يرجى إدخال اسم وبريد إلكتروني صالحين",
        variant: "destructive",
      });
      return;
    }
    
    const today = new Date();
    const joinDateStr = `${today.getDate()} ${['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'][today.getMonth()]}، ${today.getFullYear()}`;
    
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
      lastCheckIn: "لم يسجل بعد",
      paymentStatus: newMember.paymentStatus,
      initials: initials,
    };
    
    dispatch(addMember(memberToAdd));
    
    toast({
      title: "تم إضافة العضو بنجاح",
      description: `تمت إضافة ${newMember.name} إلى قائمة الأعضاء`,
    });
    
    setNewMember({
      name: "",
      email: "",
      phone: "",
      membershipType: "قياسي",
      status: "active",
      paymentStatus: "paid",
    });
    
    setAddMemberOpen(false);
  };
  
  const handleCheckIn = (memberId: string) => {
    dispatch(recordCheckIn(memberId));
    toast({
      title: "تم تسجيل الحضور",
      description: "تم تسجيل حضور العضو بنجاح",
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
