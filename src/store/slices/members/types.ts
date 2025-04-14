
export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  initials: string;
  membershipType: string;
  joinDate: string;
  membershipEndDate?: string;
  status: 'active' | 'inactive' | 'pending' | 'expired';
  paymentStatus: 'paid' | 'pending' | 'overdue' | 'canceled';
  notes?: string;
  lastCheckIn?: string;
  address?: string;
  emergencyContact?: string;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
}

export interface MembersState {
  members: Member[];
  filteredMembers: Member[];
  searchQuery: string;
  filterStatus: string | null;
}
