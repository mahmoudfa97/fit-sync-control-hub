
import { PayloadAction } from '@reduxjs/toolkit';
import { Member, MembersState } from './types';

export const membersReducers = {
  addMember: (state: MembersState, action: PayloadAction<Member>) => {
    // Check if member with this ID already exists
    const existingMemberIndex = state.members.findIndex(m => m.id === action.payload.id);
    
    if (existingMemberIndex !== -1) {
      // If member exists, update it
      state.members[existingMemberIndex] = action.payload;
    } else {
      // If new member, add it
      state.members.push(action.payload);
    }
    
    state.filteredMembers = state.members.filter(member => 
      !state.filterStatus || member.status === state.filterStatus
    );
  },
  
  updateMember: (state: MembersState, action: PayloadAction<Member>) => {
    const index = state.members.findIndex(m => m.id === action.payload.id);
    if (index !== -1) {
      state.members[index] = action.payload;
    }
    state.filteredMembers = state.members.filter(member => 
      !state.filterStatus || member.status === state.filterStatus
    );
  },
  
  deleteMember: (state: MembersState, action: PayloadAction<string>) => {
    state.members = state.members.filter(m => m.id !== action.payload);
    state.filteredMembers = state.members.filter(member => 
      !state.filterStatus || member.status === state.filterStatus
    );
  },
  
  filterMembers: (state: MembersState, action: PayloadAction<{ status: string | null, searchTerm: string }>) => {
    state.filterStatus = action.payload.status;
    state.searchQuery = action.payload.searchTerm;
    
    state.filteredMembers = state.members.filter(member => {
      const matchesStatus = !action.payload.status || member.status === action.payload.status;
      const matchesSearch = !action.payload.searchTerm || 
                          member.name.toLowerCase().includes(action.payload.searchTerm.toLowerCase()) ||
                          member.email.toLowerCase().includes(action.payload.searchTerm.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });
  },
  
  recordCheckIn: (state: MembersState, action: PayloadAction<string>) => {
    const index = state.members.findIndex(m => m.id === action.payload);
    if (index !== -1) {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      state.members[index].lastCheckIn = `היום ${hours}:${minutes}`;
    }
    
    const status = state.filterStatus;
    const searchTerm = state.searchQuery;
    
    state.filteredMembers = state.members.filter(member => {
      const matchesStatus = !status || member.status === status;
      const matchesSearch = !searchTerm || 
                        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        member.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });
  },
};
