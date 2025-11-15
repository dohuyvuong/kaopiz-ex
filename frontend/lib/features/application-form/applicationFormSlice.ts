import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// State structure: { [typeId]: { [order]: userId | null } }
// Example: { 1: { 1: 123, 2: 456 }, 2: { 1: 789 } }
interface ApplicationFormApproversState {
  approvers: Record<number, Record<number, number | null>>;
}

const initialState: ApplicationFormApproversState = {
  approvers: {},
};

const applicationFormSlice = createSlice({
  name: 'applicationForm',
  initialState,
  reducers: {
    setApprover: (
      state,
      action: PayloadAction<{
        typeId: number;
        order: number;
        userId: number | null;
      }>,
    ) => {
      const { typeId, order, userId } = action.payload;
      if (!state.approvers[typeId]) {
        state.approvers[typeId] = {};
      }
      if (userId === null) {
        delete state.approvers[typeId][order];
        // Nếu không còn approver nào cho typeId này, xóa luôn typeId
        if (Object.keys(state.approvers[typeId]).length === 0) {
          delete state.approvers[typeId];
        }
      } else {
        state.approvers[typeId][order] = userId;
      }
    },
    setApprovers: (
      state,
      action: PayloadAction<{
        typeId: number;
        approvers: Record<number, number | null>;
      }>,
    ) => {
      const { typeId, approvers } = action.payload;
      state.approvers[typeId] = approvers;
    },
    clearApprovers: (state, action: PayloadAction<number | undefined>) => {
      if (action.payload) {
        // Xóa approvers của typeId cụ thể
        delete state.approvers[action.payload];
      } else {
        // Xóa tất cả approvers
        state.approvers = {};
      }
    },
  },
});

export const { setApprover, setApprovers, clearApprovers } =
  applicationFormSlice.actions;

export default applicationFormSlice.reducer;
