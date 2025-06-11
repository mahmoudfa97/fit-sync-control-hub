
import { ServiceMember } from '@/services/MemberService';
import { Member as StoreMember } from '@/store/slices/members/types';

export function convertServiceMemberToStoreMember(serviceMember: ServiceMember): StoreMember {
  return {
    id: serviceMember.id,
    name: serviceMember.name,
    email: serviceMember.email || '',
    phone: serviceMember.phone || '',
    initials: `${serviceMember.name[0]}${serviceMember.last_name?.[0] || ''}`,
    membershipType: 'basic', // Default value
    joinDate: serviceMember.created_at || new Date().toISOString(),
    membershipEndDate: undefined,
    status: 'active' as const,
    paymentStatus: 'paid' as const,
    notes: undefined,
    lastCheckIn: undefined,
    address: undefined,
    emergencyContact: undefined,
    dateOfBirth: serviceMember.date_of_birth,
    gender: serviceMember.gender as 'male' | 'female' | 'other' | undefined,
    hasInsurance: undefined,
    insuranceEndDate: undefined,
    insurancePolicy: undefined,
    insuranceProvider: undefined,
  };
}

export function convertServiceMembersToStoreMembers(serviceMembers: ServiceMember[]): StoreMember[] {
  return serviceMembers.map(convertServiceMemberToStoreMember);
}
