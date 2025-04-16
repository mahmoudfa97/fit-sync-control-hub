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
  hasInsurance?: boolean;
  insuranceStartDate?: string;
  insuranceEndDate?: string;
  insurancePolicy?: string;
  insuranceProvider?: string;
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

      const transformedMembers = data.map(profile => {
        const membership = profile.memberships && profile.memberships.length > 0 
          ? profile.memberships[0] 
          : null;
        
        const lastCheckIn = profile.checkins && profile.checkins.length > 0
          ? new Date(Math.max(...profile.checkins.map(c => new Date(c.check_in_time).getTime())))
          : null;
          
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

        const joinDate = new Date(profile.created_at);
        const monthNames = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 
                           'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
        const formattedJoinDate = `${joinDate.getDate()} ${monthNames[joinDate.getMonth()]}, ${joinDate.getFullYear()}`;

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
      const existingMember = await this.findMemberByEmail(memberData.email);
      
      if (existingMember) {
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
        
        if (memberData.hasInsurance) {
          const today = new Date();
          const insuranceEndDate = new Date(today);
          insuranceEndDate.setFullYear(insuranceEndDate.getFullYear() + 1);
          
          const { error: insuranceError } = await supabase
            .from('member_insurance')
            .insert({
              member_id: existingMember.id,
              start_date: today.toISOString(),
              end_date: insuranceEndDate.toISOString(),
              policy_number: memberData.insurancePolicy,
              provider: memberData.insuranceProvider
            });
            
          if (insuranceError) console.error('Error adding insurance:', insuranceError);
        }
        
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
          hasInsurance: memberData.hasInsurance,
          insuranceEndDate: memberData.hasInsurance ? insuranceEndDate.toISOString().split('T')[0] : undefined,
          isExisting: true
        } as Member & { isExisting: boolean };
      }
      
      const memberId = crypto.randomUUID();
      
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
      
      if (memberData.hasInsurance) {
        const today = new Date();
        const insuranceEndDate = new Date(today);
        insuranceEndDate.setFullYear(insuranceEndDate.getFullYear() + 1);
        
        const { error: insuranceError } = await supabase
          .from('member_insurance')
          .insert({
            member_id: memberId,
            start_date: today.toISOString(),
            end_date: insuranceEndDate.toISOString(),
            policy_number: memberData.insurancePolicy,
            provider: memberData.insuranceProvider
          });
          
        if (insuranceError) console.error('Error adding insurance:', insuranceError);
        
        const { error: reminderError } = await supabase
          .from('notifications')
          .insert({
            member_id: memberId,
            title: 'ביטוח עומד לפוג',
            content: `ביטוח של ${memberData.name} ${memberData.last_name || ''} יפוג בתאריך ${insuranceEndDate.toLocaleDateString('he-IL')}`,
            type: 'insurance',
            scheduled_date: new Date(insuranceEndDate.getTime() - (30 * 24 * 60 * 60 * 1000)).toISOString(), // 30 days before expiry
            status: 'pending'
          });
          
        if (reminderError) console.error('Error adding reminder:', reminderError);
      }

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
        hasInsurance: memberData.hasInsurance,
        insuranceEndDate: memberData.hasInsurance ? new Date(today.getFullYear() + 1, today.getMonth(), today.getDate()).toISOString().split('T')[0] : undefined,
        isExisting: false
      } as Member & { isExisting: boolean };
    } catch (error) {
      console.error('Error adding member:', error);
      throw error;
    }
  }

  static async recordCheckIn(memberId: string) {
    try {
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

  static async addSubscription(memberId: string, subscriptionData: {
    membershipType: string,
    status: Member['status'],
    paymentStatus: Member['paymentStatus'],
    durationMonths: number,
    paymentMethod: 'card' | 'cash' | 'bank' | 'check',
    amount: number,
    paymentDetails?: any
  }) {
    try {
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + subscriptionData.durationMonths);
      
      const { data: membershipData, error: membershipError } = await supabase
        .from('memberships')
        .insert({
          member_id: memberId,
          membership_type: subscriptionData.membershipType,
          status: subscriptionData.status,
          payment_status: subscriptionData.paymentStatus,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString()
        })
        .select()
        .single();

      if (membershipError) throw membershipError;
      
      const { data: paymentData, error: paymentError } = await supabase
        .from('payments')
        .insert({
          member_id: memberId,
          amount: subscriptionData.amount,
          payment_method: subscriptionData.paymentMethod,
          status: 'paid',
          description: `מנוי ${subscriptionData.membershipType} ל-${subscriptionData.durationMonths} חודשים`,
          receipt_number: `REC-${Date.now().toString().slice(-6)}`,
          payment_details: subscriptionData.paymentDetails
        })
        .select()
        .single();

      if (paymentError) throw paymentError;
      
      return {
        membershipId: membershipData.id,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        paymentId: paymentData.id
      };
    } catch (error) {
      console.error('Error adding subscription:', error);
      throw error;
    }
  }
}
