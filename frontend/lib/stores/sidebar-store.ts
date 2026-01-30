import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SidebarState {
  // State
  isOpen: boolean;

  // Actions
  setOpen: (isOpen: boolean) => void;
  toggle: () => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      // Initial state
      isOpen: true, // Mặc định là mở

      // Actions
      setOpen: (isOpen) => set({ isOpen }),
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: 'sidebar-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
