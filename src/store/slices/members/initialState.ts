
import { Member, MembersState } from './types';

export const initialMembers: Member[] = [];

export const initialState: MembersState = {
  members: initialMembers,
  filteredMembers: initialMembers,
  searchQuery: '',
  filterStatus: null,
};
