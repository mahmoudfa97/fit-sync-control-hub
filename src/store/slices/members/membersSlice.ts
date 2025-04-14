
import { createSlice } from '@reduxjs/toolkit';
import { initialState } from './initialState';
import { membersReducers } from './reducers';
import { Member } from './types';

export const membersSlice = createSlice({
  name: 'members',
  initialState,
  reducers: membersReducers,
});

export const { 
  addMember, 
  updateMember, 
  deleteMember, 
  filterMembers, 
  recordCheckIn 
} = membersSlice.actions;

export default membersSlice.reducer;
export type { Member };
