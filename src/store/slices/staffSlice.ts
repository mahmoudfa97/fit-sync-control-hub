import { createSlice, type PayloadAction, createAsyncThunk } from "@reduxjs/toolkit"
import { StaffService } from "@/services/StaffService"

export interface StaffMember {
  id: string
  name: string
  email: string
  phone: string
  role: string
  department: string
  hireDate: string
  status: "active" | "inactive" | "on_leave"
  schedule: {
    days: string[]
    shift: string
  }
  initials: string
  avatar?: string
  speciality?: string
  workDays?: string[]
  workHours?: string
  salary?: number
  notes?: string
  joinDate?: string // For backward compatibility
}

interface StaffState {
  staff: StaffMember[]
  filteredStaff: StaffMember[]
  filterDepartment: string | null
  loading: "idle" | "pending" | "succeeded" | "failed"
  error: string | null
}

const initialState: StaffState = {
  staff: [],
  filteredStaff: [],
  filterDepartment: null,
  loading: "idle",
  error: null,
}

// Async thunks for database operations
export const fetchStaff = createAsyncThunk("staff/fetchStaff", async (_, { rejectWithValue }) => {
  try {
    return await StaffService.fetchStaff()
  } catch (error) {
    return rejectWithValue((error as Error).message)
  }
})

export const addStaffMember = createAsyncThunk(
  "staff/addStaffMember",
  async (staffData: Parameters<typeof StaffService.addStaff>[0], { rejectWithValue }) => {
    try {
      return await StaffService.addStaff(staffData)
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  },
)

export const updateStaffStatus = createAsyncThunk(
  "staff/updateStaffStatus",
  async (payload: { id: string; status: StaffMember["status"] }, { rejectWithValue }) => {
    try {
      return await StaffService.updateStaffStatus(payload.id, payload.status)
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  },
)

export const removeStaff = createAsyncThunk("staff/removeStaff", async (id: string, { rejectWithValue }) => {
  try {
    return await StaffService.removeStaff(id)
  } catch (error) {
    return rejectWithValue((error as Error).message)
  }
})

export const staffSlice = createSlice({
  name: "staff",
  initialState,
  reducers: {
    filterStaffByDepartment: (state, action: PayloadAction<string | null>) => {
      state.filterDepartment = action.payload
      if (action.payload) {
        state.filteredStaff = state.staff.filter((s) => s.department === action.payload)
      } else {
        state.filteredStaff = state.staff
      }
    },
    searchStaff: (state, action: PayloadAction<string>) => {
      const searchTerm = action.payload.toLowerCase()
      if (searchTerm) {
        state.filteredStaff = state.staff.filter(
          (s) =>
            s.name.toLowerCase().includes(searchTerm) ||
            s.email.toLowerCase().includes(searchTerm) ||
            s.role.toLowerCase().includes(searchTerm),
        )
      } else {
        state.filteredStaff = state.staff
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch staff
    builder.addCase(fetchStaff.pending, (state) => {
      state.loading = "pending"
    })
    builder.addCase(fetchStaff.fulfilled, (state, action) => {
      state.loading = "succeeded"
      state.staff = action.payload
      state.filteredStaff = action.payload
    })
    builder.addCase(fetchStaff.rejected, (state, action) => {
      state.loading = "failed"
      state.error = action.payload as string
    })

    // Add staff
    builder.addCase(addStaffMember.fulfilled, (state, action) => {
      state.staff.push(action.payload)
      // Update filtered staff if filter matches or no filter
      if (!state.filterDepartment || action.payload.department === state.filterDepartment) {
        state.filteredStaff.push(action.payload)
      }
    })

    // Update staff status
    builder.addCase(updateStaffStatus.fulfilled, (state, action) => {
      const index = state.staff.findIndex((s) => s.id === action.payload.id)
      if (index !== -1) {
        state.staff[index].status = action.payload.status
      }
      // Update filtered staff
      state.filteredStaff = state.staff.filter(
        (s) => !state.filterDepartment || s.department === state.filterDepartment,
      )
    })

    // Remove staff
    builder.addCase(removeStaff.fulfilled, (state, action) => {
      state.staff = state.staff.filter((s) => s.id !== action.payload)
      state.filteredStaff = state.filteredStaff.filter((s) => s.id !== action.payload)
    })
  },
})

export const { filterStaffByDepartment, searchStaff } = staffSlice.actions

export default staffSlice.reducer
