
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { initialState } from './initialState';
import { membersReducers } from './reducers';
import { Member, MembersState } from './types';

export const membersSlice = createSlice({
  name: 'members',
  initialState,
  reducers: {
    ...membersReducers,
    setMembers: (state, action: PayloadAction<Member[]>) => {
      state.members = action.payload;
      state.filteredMembers = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      // Apply filtering based on search query and filter status
      state.filteredMembers = state.members.filter(member => {
        const matchesSearch = !action.payload || 
          member.name.toLowerCase().includes(action.payload.toLowerCase()) ||
          member.email.toLowerCase().includes(action.payload.toLowerCase());
        const matchesStatus = !state.filterStatus || member.status === state.filterStatus;
        return matchesSearch && matchesStatus;
      });
    },
    setFilterStatus: (state, action: PayloadAction<string | null>) => {
      state.filterStatus = action.payload;
      // Apply filtering based on search query and filter status
      state.filteredMembers = state.members.filter(member => {
        const matchesSearch = !state.searchQuery || 
          member.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
          member.email.toLowerCase().includes(state.searchQuery.toLowerCase());
        const matchesStatus = !action.payload || member.status === action.payload;
        return matchesSearch && matchesStatus;
      });
    }
  },
});

export const { 
  addMember, 
  updateMember, 
  deleteMember, 
  filterMembers, 
  recordCheckIn,
  setMembers,
  setSearchQuery,
  setFilterStatus
} = membersSlice.actions;

export default membersSlice.reducer;
export type { Member };
