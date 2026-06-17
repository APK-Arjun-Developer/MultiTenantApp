import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/app/store';

interface UiState {
  themeMode: 'light' | 'dark';
  sidebarOpen: boolean;
}

const initialState: UiState = {
  themeMode: 'light',
  sidebarOpen: true,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.themeMode = state.themeMode === 'light' ? 'dark' : 'light';
    },
    setThemeMode: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.themeMode = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
  },
});

export const { toggleTheme, setThemeMode, toggleSidebar, setSidebarOpen } = uiSlice.actions;
export default uiSlice.reducer;

export const selectThemeMode = (state: RootState) => state.ui.themeMode;
export const selectSidebarOpen = (state: RootState) => state.ui.sidebarOpen;
