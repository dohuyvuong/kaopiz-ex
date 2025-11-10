import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SidebarState {
  isOpen: boolean;
}

const initialState: SidebarState = {
  isOpen: true, // Mặc định là mở
};

const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    setOpen: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload;
    },
    toggle: (state) => {
      state.isOpen = !state.isOpen;
    },
  },
});

export const { setOpen, toggle } = sidebarSlice.actions;
export default sidebarSlice.reducer;
