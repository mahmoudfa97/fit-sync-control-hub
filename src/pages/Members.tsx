
import { useState, useEffect } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { addMember, filterMembers, recordCheckIn, Member } from "@/store/slices/membersSlice";
import { useToast } from "@/hooks/use-toast";
import { MembersHeader } from "@/components/members/MembersHeader";
import { MemberList } from "@/components/members/MemberList";
import { AddMemberDialog } from "@/components/members/AddMemberDialog";
import { t } from "@/utils/translations";
import { supabase } from "@/integrations/supabase/client";

export default function Members() {
  const dispatch = useAppDispatch();
  const { members, filteredMembers } = useAppSelector(state => state.members);
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    last_name: "",
    email: "",
    phone: "",
    age: "",
    gender: "" as "male" | "female" | "",
    membershipType: "רגיל",
    status: "active" as Member['status'],
    paymentStatus: "paid" as Member['paymentStatus'],
  });
  
  useEffect(() => {
    fetchMembers();
  }, [dispatch]);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          last_name,
          email,
          phone,
          age,
          gender,
          avatar_url,
          created_at,
          memberships(
            id,
            membership_type,
            start_date,
            end_date,
            status,
            payment_status
          ),
          checkins(
            check_in_time
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Transform the data to match the expected format in Redux store
      const transformedMembers = data.map(profile => {
        const membership = profile.memberships && profile.memberships.length > 0 
          ? profile.memberships[0] 
          : null;
        
        const lastCheckIn = profile.checkins && profile.checkins.length > 0
          ? new Date(Math.max(...profile.checkins.map(c => new Date(c.check_in_time).getTime())))
          : null;
          
        // Format the last check-in time
        let lastCheckInStr = "טרם נרשם";
        if (lastCheckIn) {
          const now = new Date();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          
          if (lastCheckIn >= today) {
            const hours = lastCheckIn.getHours();
            const minutes = lastCheckIn.getMinutes().toString().padStart(2, '0');
            lastCheckInStr = `היום ${hours}:${minutes}`;
          } else if (lastCheckIn >= yesterday) {
            const hours = lastCheckIn.getHours();
            const minutes = lastCheckIn.getMinutes().toString().padStart(2, '0');
            lastCheckInStr = `אתמול ${hours}:${minutes}`;
          } else {
            lastCheckInStr = lastCheckIn.toLocaleDateString('he-IL');
          }
        }

        // Format the join date
        const joinDate = new Date(profile.created_at);
        const monthNames = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 
                           'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
        const formattedJoinDate = `${joinDate.getDate()} ${monthNames[joinDate.getMonth()]}, ${joinDate.getFullYear()}`;

        // Create initials from name and last name
        const initials = `${profile.name.charAt(0)}${profile.last_name ? profile.last_name.charAt(0) : ''}`;

        return {
          id: profile.id,
          name: `${profile.name} ${profile.last_name || ''}`,
          email: profile.email,
          phone: profile.phone || '',
          avatar: profile.avatar_url,
          initials: initials,
          membershipType: membership ? membership.membership_type : 'בסיסי',
          joinDate: formattedJoinDate,
          membershipEndDate: membership?.end_date ? new Date(membership.end_date).toISOString().split('T')[0] : undefined,
          status: membership?.status as Member['status'] || 'active',
          paymentStatus: membership?.payment_status as Member['paymentStatus'] || 'paid',
          lastCheckIn: lastCheckInStr,
          gender: profile.gender as 'male' | 'female' | 'other' | undefined,
          age: profile.age ? profile.age.toString() : undefined,
        } as Member;
      });

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
      // Generate a UUID for the new member
      const memberId = crypto.randomUUID();
      
      // Insert into profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: memberId,
          name: newMember.name,
          last_name: newMember.last_name,
          email: newMember.email,
          phone: newMember.phone,
          age: newMember.age ? parseInt(newMember.age) : null,
          gender: newMember.gender || null
        });

      if (profileError) throw profileError;

      // Insert into memberships table
      const { error: membershipError } = await supabase
        .from('memberships')
        .insert({
          member_id: memberId,
          membership_type: newMember.membershipType,
          status: newMember.status,
          payment_status: newMember.paymentStatus,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
        });

      if (membershipError) throw membershipError;

      // Format data for Redux store
      const today = new Date();
      const hebrewMonths = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
      const joinDateStr = `${today.getDate()} ${hebrewMonths[today.getMonth()]}, ${today.getFullYear()}`;
      
      const initials = `${newMember.name[0]}${newMember.last_name ? newMember.last_name[0] : ''}`;
      
      const memberToAdd = {
        id: memberId,
        name: `${newMember.name} ${newMember.last_name || ''}`,
        email: newMember.email,
        phone: newMember.phone,
        membershipType: newMember.membershipType,
        status: newMember.status,
        joinDate: joinDateStr,
        lastCheckIn: "טרם נרשם",
        paymentStatus: newMember.paymentStatus,
        initials: initials,
        gender: newMember.gender as 'male' | 'female' | 'other' | undefined,
        age: newMember.age || undefined,
      } as Member;
      
      dispatch(addMember(memberToAdd));
      
      toast({
        title: "לקוח נוסף בהצלחה",
        description: `${newMember.name} ${newMember.last_name || ''} נוסף לרשימת הלקוחות`,
      });
      
      setNewMember({
        name: "",
        last_name: "",
        email: "",
        phone: "",
        age: "",
        gender: "",
        membershipType: "רגיל",
        status: "active" as Member['status'],
        paymentStatus: "paid" as Member['paymentStatus'],
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
      // Insert check-in record in Supabase
      const { error } = await supabase
        .from('checkins')
        .insert({
          member_id: memberId,
          check_in_time: new Date().toISOString(),
        });

      if (error) throw error;

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
