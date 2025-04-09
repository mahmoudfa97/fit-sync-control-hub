
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AccessRecord {
  id: string;
  memberId: string;
  memberName: string;
  memberInitials: string;
  type: 'entry' | 'exit';
  timestamp: string;
  date: string;
  time: string;
  location: string;
  method: 'card' | 'fingerprint' | 'app' | 'receptionist';
}

export interface AccessDevice {
  id: string;
  name: string;
  type: 'reader' | 'gate' | 'turnstile' | 'door';
  location: string;
  status: 'active' | 'inactive' | 'maintenance';
  lastMaintenance: string;
}

interface AccessControlState {
  accessRecords: AccessRecord[];
  filteredRecords: AccessRecord[];
  accessDevices: AccessDevice[];
  dateFilter: string | null;
}

const generateDummyAccessRecords = (): AccessRecord[] => {
  const members = [
    { id: "1", name: "سارة الحمدان", initials: "سح" },
    { id: "2", name: "خالد العمري", initials: "خع" },
    { id: "3", name: "منى الزهراني", initials: "مز" },
    { id: "5", name: "نورة الشمري", initials: "نش" },
    { id: "6", name: "محمد العتيبي", initials: "مع" }
  ];
  
  const locations = ['المدخل الرئيسي', 'مدخل الصالة الرياضية', 'مدخل المسبح', 'المدخل الخلفي'];
  const methods = ['card', 'fingerprint', 'app', 'receptionist'];
  
  const dayNames = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
  const today = new Date();
  
  const records: AccessRecord[] = [];
  
  // Generate access records for the past 3 days
  for (let i = 0; i < 3; i++) {
    const day = new Date();
    day.setDate(today.getDate() - i);
    const dayName = dayNames[day.getDay()];
    const dateStr = `${dayName}، ${day.getDate()} ${['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'][day.getMonth()]}`;
    
    // Each day will have 10-15 entry/exit pairs
    const numPairs = Math.floor(Math.random() * 6) + 10;
    
    for (let j = 0; j < numPairs; j++) {
      const member = members[Math.floor(Math.random() * members.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      const method = methods[Math.floor(Math.random() * methods.length)];
      
      // Entry record
      const entryHour = Math.floor(Math.random() * 8) + 6; // Between 6am and 2pm
      const entryMinute = Math.floor(Math.random() * 60);
      const entryTime = `${entryHour.toString().padStart(2, '0')}:${entryMinute.toString().padStart(2, '0')} ${entryHour >= 12 ? 'م' : 'ص'}`;
      const entryTimestamp = new Date(day);
      entryTimestamp.setHours(entryHour, entryMinute);
      
      records.push({
        id: `access-entry-${i}-${j}`,
        memberId: member.id,
        memberName: member.name,
        memberInitials: member.initials,
        type: 'entry',
        timestamp: entryTimestamp.toISOString(),
        date: dateStr,
        time: entryTime,
        location: location,
        method: method as 'card' | 'fingerprint' | 'app' | 'receptionist'
      });
      
      // Exit record
      const exitHour = Math.floor(Math.random() * 8) + Math.max(entryHour, 10); // At least after entry time
      const exitMinute = Math.floor(Math.random() * 60);
      const exitTime = `${exitHour.toString().padStart(2, '0')}:${exitMinute.toString().padStart(2, '0')} ${exitHour >= 12 ? 'م' : 'ص'}`;
      const exitTimestamp = new Date(day);
      exitTimestamp.setHours(exitHour, exitMinute);
      
      records.push({
        id: `access-exit-${i}-${j}`,
        memberId: member.id,
        memberName: member.name,
        memberInitials: member.initials,
        type: 'exit',
        timestamp: exitTimestamp.toISOString(),
        date: dateStr,
        time: exitTime,
        location: location,
        method: method as 'card' | 'fingerprint' | 'app' | 'receptionist'
      });
    }
  }
  
  return records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

const generateDummyAccessDevices = (): AccessDevice[] => {
  const deviceTypes = ['reader', 'gate', 'turnstile', 'door'];
  const locations = ['المدخل الرئيسي', 'مدخل الصالة الرياضية', 'مدخل المسبح', 'المدخل الخلفي', 'مدخل غرف تغيير الملابس'];
  const statuses = ['active', 'active', 'active', 'inactive', 'maintenance'];
  
  const devices: AccessDevice[] = [];
  
  for (let i = 0; i < 8; i++) {
    const deviceType = deviceTypes[i % deviceTypes.length];
    const location = locations[i % locations.length];
    
    const maintenanceDate = new Date();
    maintenanceDate.setDate(maintenanceDate.getDate() - Math.floor(Math.random() * 90));
    
    devices.push({
      id: `device-${i}`,
      name: `${deviceType === 'reader' ? 'قارئ بطاقات' : 
             deviceType === 'gate' ? 'بوابة' : 
             deviceType === 'turnstile' ? 'دوار' : 'باب'} ${i + 1}`,
      type: deviceType as 'reader' | 'gate' | 'turnstile' | 'door',
      location: location,
      status: statuses[Math.floor(Math.random() * statuses.length)] as 'active' | 'inactive' | 'maintenance',
      lastMaintenance: `${maintenanceDate.getDate()} ${['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'][maintenanceDate.getMonth()]}، ${maintenanceDate.getFullYear()}`
    });
  }
  
  return devices;
};

const initialAccessRecords = generateDummyAccessRecords();
const initialAccessDevices = generateDummyAccessDevices();

const initialState: AccessControlState = {
  accessRecords: initialAccessRecords,
  filteredRecords: initialAccessRecords,
  accessDevices: initialAccessDevices,
  dateFilter: null,
};

export const accessControlSlice = createSlice({
  name: 'accessControl',
  initialState,
  reducers: {
    addAccessRecord: (state, action: PayloadAction<AccessRecord>) => {
      state.accessRecords.unshift(action.payload);
      state.filteredRecords = state.dateFilter 
        ? state.accessRecords.filter(record => record.date === state.dateFilter)
        : [...state.accessRecords];
    },
    filterAccessRecordsByDate: (state, action: PayloadAction<string | null>) => {
      state.dateFilter = action.payload;
      state.filteredRecords = action.payload
        ? state.accessRecords.filter(record => record.date === action.payload)
        : [...state.accessRecords];
    },
    filterAccessRecordsByMember: (state, action: PayloadAction<string>) => {
      state.filteredRecords = state.accessRecords.filter(record => 
        record.memberName.toLowerCase().includes(action.payload.toLowerCase()) ||
        record.memberId === action.payload
      );
    },
    updateAccessDevice: (state, action: PayloadAction<AccessDevice>) => {
      const index = state.accessDevices.findIndex(d => d.id === action.payload.id);
      if (index !== -1) {
        state.accessDevices[index] = action.payload;
      }
    },
    addAccessDevice: (state, action: PayloadAction<AccessDevice>) => {
      state.accessDevices.push(action.payload);
    },
    removeAccessDevice: (state, action: PayloadAction<string>) => {
      state.accessDevices = state.accessDevices.filter(device => device.id !== action.payload);
    },
  },
});

export const { 
  addAccessRecord, 
  filterAccessRecordsByDate, 
  filterAccessRecordsByMember,
  updateAccessDevice,
  addAccessDevice,
  removeAccessDevice
} = accessControlSlice.actions;
export default accessControlSlice.reducer;
