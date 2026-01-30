import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// State structure: { [typeId]: { [order]: userId | null } }
// Example: { 1: { 1: 123, 2: 456 }, 2: { 1: 789 } }
interface ApplicationFormState {
  // State
  approvers: Record<number, Record<number, number | null>>;

  // Actions
  setApprover: (typeId: number, order: number, userId: number | null) => void;
  setApprovers: (typeId: number, approvers: Record<number, number | null>) => void;
  clearApprovers: (typeId?: number) => void;
}

export const useApplicationFormStore = create<ApplicationFormState>()(
  persist(
    (set) => ({
      // Initial state
      approvers: {},

      // Actions
      setApprover: (typeId, order, userId) =>
        set((state) => {
          const newApprovers = { ...state.approvers };
          
          if (!newApprovers[typeId]) {
            newApprovers[typeId] = {};
          }

          if (userId === null) {
            // Remove approver
            const typeApprovers = { ...newApprovers[typeId] };
            delete typeApprovers[order];
            
            // If no approvers left for this type, remove the type
            if (Object.keys(typeApprovers).length === 0) {
              delete newApprovers[typeId];
            } else {
              newApprovers[typeId] = typeApprovers;
            }
          } else {
            // Set approver
            newApprovers[typeId] = {
              ...newApprovers[typeId],
              [order]: userId,
            };
          }

          return { approvers: newApprovers };
        }),

      setApprovers: (typeId, approvers) =>
        set((state) => ({
          approvers: {
            ...state.approvers,
            [typeId]: approvers,
          },
        })),

      clearApprovers: (typeId) =>
        set((state) => {
          if (typeId !== undefined) {
            // Clear specific typeId
            const newApprovers = { ...state.approvers };
            delete newApprovers[typeId];
            return { approvers: newApprovers };
          } else {
            // Clear all
            return { approvers: {} };
          }
        }),
    }),
    {
      name: 'application-form-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
