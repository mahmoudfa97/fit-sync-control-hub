
import { useState, useEffect } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { addMember, updateMember, filterMembers, recordCheckIn, Member } from "@/store/slices/members/membersSlice";
import { useToast } from "@/hooks/use-toast";
import { MembersHeader } from "@/components/members/MembersHeader";
import { MemberList } from "@/components/members/MemberList";
import { AddMemberDialog } from "@/components/members/AddMemberDialog";
import { t } from "@/utils/translations";
import { MemberService, MemberFormData } from "@/services/MemberService";
import { useNavigate } from "react-router-dom";

export default function Members() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { members, filteredMembers } = useAppSelector(state => state.members);
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newMember, setNewMember] = useState<MemberFormData>({
    name: "",
    last_name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "" as "male" | "female" | "",
    membershipType: "רגיל",
    status: "active" as Member['status'],
    paymentStatus: "paid" as Member['paymentStatus'],
    hasInsurance: false,
    insurancePolicy: "",
    insuranceProvider: "",
  });
  
  useEffect(() => {
    fetchMembers();
  }, [dispatch]);

  const fetchMembers = async () => {
    try {
      // Use the MemberService to fetch members
      const transformedMembers = await MemberService.fetchMembers();

      // Update Redux store with the fetched members
      transformedMembers.forEach(member => {
        dispatch(addMember(member));
      });

      // Initialize filtered members
      dispatch(filterMembers({ status: null, searchTerm: "" }));
    } catch (error) {
      console.error('Error fetching members:', error);
      toast({
        title: "שגיאה בטעינת הנתונים",
        description: "לא ניתן לטעון את רשימת החברים",
        variant: "destructive",
      });
    }
  };
  
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    dispatch(filterMembers({ status: null, searchTerm: term }));
  };
  
  const handleFilterChange = (status: string | null) => {
    dispatch(filterMembers({ status, searchTerm }));
  };
  
  const handleAddMember = async () => {
    if (!newMember.name || !newMember.email) {
      toast({
        title: "שגיאת קלט",
        description: "אנא הזן שם ודוא״ל תקינים",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Use the MemberService to add a new member or update existing
      const memberResult = await MemberService.addMember(newMember);
      
      if (memberResult.isExisting) {
        // If member already exists, update their data in Redux
        const { isExisting, ...memberData } = memberResult;
        dispatch(updateMember(memberData));
        
        toast({
          title: "מנוי חדש נוסף למשתמש קיים",
          description: `מנוי חדש נוסף ל${memberResult.name}`,
        });
        
        // Navigate to member profile
        navigate(`/members/${memberResult.id}`);
      } else {
        // If new member, add to Redux
        const { isExisting, ...memberData } = memberResult;
        dispatch(addMember(memberData));
        
        toast({
          title: "לקוח נוסף בהצלחה",
          description: `${newMember.name} ${newMember.last_name || ''} נוסף לרשימת הלקוחות`,
        });
      }
      
      setNewMember({
        name: "",
        last_name: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        gender: "",
        membershipType: "רגיל",
        status: "active" as Member['status'],
        paymentStatus: "paid" as Member['paymentStatus'],
        hasInsurance: false,
        insurancePolicy: "",
        insuranceProvider: "",
      });
      
      setAddMemberOpen(false);
    } catch (error) {
      console.error('Error adding member:', error);
      toast({
        title: "שגיאה בהוספת חבר",
        description: "לא ניתן להוסיף את החבר החדש. נסה שנית.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCheckIn = async (memberId: string) => {
    try {
      // Use the MemberService to record a check-in
      await MemberService.recordCheckIn(memberId);

      // Update Redux store
      dispatch(recordCheckIn(memberId));
      
      toast({
        title: "כניסה נרשמה",
        description: "כניסת הלקוח נרשמה בהצלחה",
      });
    } catch (error) {
      console.error('Error recording check-in:', error);
      toast({
        title: "שגיאה ברישום כניסה",
        description: "לא ניתן לרשום את הכניסה. נסה שנית.",
        variant: "destructive",
      });
    }
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
        isSubmitting={isSubmitting}
      />
    </DashboardShell>
  );
}
