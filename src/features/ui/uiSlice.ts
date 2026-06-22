import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/app/store';

interface UiState {
  themeMode: 'light' | 'dark';
  sidebarOpen: boolean;
  selectedTenantId: string | null;
  selectedTenantName: string | null;
}

const initialState: UiState = {
  themeMode: 'light',
  sidebarOpen: true,
  selectedTenantId: null,
  selectedTenantName: null,
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
    setSelectedTenant: (state, action: PayloadAction<{ id: string; name: string }>) => {
      state.selectedTenantId = action.payload.id;
      state.selectedTenantName = action.payload.name;
    },
    clearSelectedTenant: (state) => {
      state.selectedTenantId = null;
      state.selectedTenantName = null;
    },
  },
});

export const {
  toggleTheme,
  setThemeMode,
  toggleSidebar,
  setSidebarOpen,
  setSelectedTenant,
  clearSelectedTenant,
} = uiSlice.actions;
export default uiSlice.reducer;

export const selectThemeMode = (state: RootState) => state.ui.themeMode;
export const selectSidebarOpen = (state: RootState) => state.ui.sidebarOpen;
export const selectSelectedTenantId = (state: RootState) => state.ui.selectedTenantId;
export const selectSelectedTenantName = (state: RootState) => state.ui.selectedTenantName;
