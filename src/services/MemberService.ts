
import { supabase } from "@/integrations/supabase/client";
import { Member } from "@/store/slices/membersSlice";

export interface MemberFormData {
  name: string;
  last_name: string;
  email: string;
  phone: string;
  age: string;
  gender: "male" | "female" | "";
  membershipType: string;
  status: Member['status'];
  paymentStatus: Member['paymentStatus'];
}

export class MemberService {
  static async fetchMembers() {
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

      return transformedMembers;
    } catch (error) {
      console.error('Error fetching members:', error);
      throw error;
    }
  }

  static async findMemberByEmail(email: string) {
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
          )
        `)
        .eq('email', email)
        .maybeSingle();

      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error finding member by email:', error);
      throw error;
    }
  }

  static async addMember(memberData: MemberFormData) {
    try {
      // Check if member with this email already exists
      const existingMember = await this.findMemberByEmail(memberData.email);
      
      if (existingMember) {
        // If member exists, create a new membership for them
        const { error: membershipError } = await supabase
          .from('memberships')
          .insert({
            member_id: existingMember.id,
            membership_type: memberData.membershipType,
            status: memberData.status,
            payment_status: memberData.paymentStatus,
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
          });

        if (membershipError) throw membershipError;
        
        // Format data for Redux store using the existing member's info
        const today = new Date();
        const hebrewMonths = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
        
        const initials = `${existingMember.name[0]}${existingMember.last_name ? existingMember.last_name[0] : ''}`;
        
        return {
          id: existingMember.id,
          name: `${existingMember.name} ${existingMember.last_name || ''}`,
          email: existingMember.email,
          phone: existingMember.phone || '',
          membershipType: memberData.membershipType,
          status: memberData.status,
          joinDate: new Date(existingMember.created_at).toLocaleDateString('he-IL'),
          lastCheckIn: "טרם נרשם",
          paymentStatus: memberData.paymentStatus,
          initials: initials,
          gender: existingMember.gender as 'male' | 'female' | 'other' | undefined,
          age: existingMember.age ? existingMember.age.toString() : undefined,
          isExisting: true // Flag to indicate this is an existing member
        } as Member & { isExisting: boolean };
      }
      
      // If member doesn't exist, create a new one
      // Generate a UUID for the new member
      const memberId = crypto.randomUUID();
      
      // Insert into profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: memberId,
          name: memberData.name,
          last_name: memberData.last_name,
          email: memberData.email,
          phone: memberData.phone,
          age: memberData.age ? parseInt(memberData.age) : null,
          gender: memberData.gender || null
        });

      if (profileError) throw profileError;

      // Insert into memberships table
      const { error: membershipError } = await supabase
        .from('memberships')
        .insert({
          member_id: memberId,
          membership_type: memberData.membershipType,
          status: memberData.status,
          payment_status: memberData.paymentStatus,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
        });

      if (membershipError) throw membershipError;

      // Format data for Redux store
      const today = new Date();
      const hebrewMonths = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
      const joinDateStr = `${today.getDate()} ${hebrewMonths[today.getMonth()]}, ${today.getFullYear()}`;
      
      const initials = `${memberData.name[0]}${memberData.last_name ? memberData.last_name[0] : ''}`;
      
      return {
        id: memberId,
        name: `${memberData.name} ${memberData.last_name || ''}`,
        email: memberData.email,
        phone: memberData.phone,
        membershipType: memberData.membershipType,
        status: memberData.status,
        joinDate: joinDateStr,
        lastCheckIn: "טרם נרשם",
        paymentStatus: memberData.paymentStatus,
        initials: initials,
        gender: memberData.gender as 'male' | 'female' | 'other' | undefined,
        age: memberData.age || undefined,
        isExisting: false // Flag to indicate this is a new member
      } as Member & { isExisting: boolean };
    } catch (error) {
      console.error('Error adding member:', error);
      throw error;
    }
  }

  static async recordCheckIn(memberId: string) {
    try {
      // Insert check-in record in Supabase
      const { error } = await supabase
        .from('checkins')
        .insert({
          member_id: memberId,
          check_in_time: new Date().toISOString(),
        });

      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error recording check-in:', error);
      throw error;
    }
  }
}
