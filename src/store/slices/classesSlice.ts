import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { ClassesService, type Class } from "@/services/ClassesService"

interface ClassesState {
  classes: Class[]
  loading: "idle" | "pending" | "succeeded" | "failed"
  error: string | null
}

const initialState: ClassesState = {
  classes: [],
  loading: "idle",
  error: null,
}

// Async thunks for database operations
export const fetchClasses = createAsyncThunk("classes/fetchClasses", async (_, { rejectWithValue }) => {
  try {
    return await ClassesService.fetchClasses()
  } catch (error) {
    return rejectWithValue((error as Error).message)
  }
})

export const addClass = createAsyncThunk(
  "classes/addClass",
  async (classData: Parameters<typeof ClassesService.addClass>[0], { rejectWithValue }) => {
    try {
      return await ClassesService.addClass(classData)
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  },
)

export const cancelClass = createAsyncThunk("classes/cancelClass", async (classId: string, { rejectWithValue }) => {
  try {
    return await ClassesService.updateClassStatus(classId, "canceled")
  } catch (error) {
    return rejectWithValue((error as Error).message)
  }
})

export const reactivateClass = createAsyncThunk(
  "classes/reactivateClass",
  async (classId: string, { rejectWithValue }) => {
    try {
      return await ClassesService.updateClassStatus(classId, "active")
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  },
)

export const registerMemberForClass = createAsyncThunk(
  "classes/registerMemberForClass",
  async ({ classId, memberId }: { classId: string; memberId: string }, { rejectWithValue }) => {
    try {
      return await ClassesService.registerMemberForClass(classId, memberId)
    } catch (error) {
      return rejectWithValue((error as Error).message)
    }
  },
)

export const classesSlice = createSlice({
  name: "classes",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Fetch classes
    builder.addCase(fetchClasses.pending, (state) => {
      state.loading = "pending"
    })
    builder.addCase(fetchClasses.fulfilled, (state, action) => {
      state.loading = "succeeded"
      state.classes = action.payload
    })
    builder.addCase(fetchClasses.rejected, (state, action) => {
      state.loading = "failed"
      state.error = action.payload as string
    })

    // Add class
    builder.addCase(addClass.fulfilled, (state, action) => {
      state.classes.unshift(action.payload)
    })

    // Cancel class
    builder.addCase(cancelClass.fulfilled, (state, action) => {
      const index = state.classes.findIndex((c) => c.id === action.payload.id)
      if (index !== -1) {
        state.classes[index].status = "canceled"
      }
    })

    // Reactivate class
    builder.addCase(reactivateClass.fulfilled, (state, action) => {
      const index = state.classes.findIndex((c) => c.id === action.payload.id)
      if (index !== -1) {
        state.classes[index].status = "active"
      }
    })
  },
})

export default classesSlice.reducer
