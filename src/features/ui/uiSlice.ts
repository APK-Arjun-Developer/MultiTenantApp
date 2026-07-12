import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/app/store';

export const SELECTED_TENANT_STORAGE_KEY = 'selectedTenant';
export const THEME_STORAGE_KEY = 'themeMode';

interface UiState {
  themeMode: 'light' | 'dark';
  sidebarOpen: boolean;
  selectedTenantId: string | null;
  selectedTenantName: string | null;
}

function loadThemeFromStorage(): 'light' | 'dark' {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (raw === 'light' || raw === 'dark') return raw;
  } catch {
    // corrupted storage — ignore
  }
  return 'dark';
}

function loadTenantFromStorage(): Pick<UiState, 'selectedTenantId' | 'selectedTenantName'> {
  try {
    const raw = localStorage.getItem(SELECTED_TENANT_STORAGE_KEY);
    if (!raw) return { selectedTenantId: null, selectedTenantName: null };
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && 'id' in parsed && 'name' in parsed) {
      return {
        selectedTenantId: typeof parsed.id === 'string' ? parsed.id : null,
        selectedTenantName: typeof parsed.name === 'string' ? parsed.name : null,
      };
    }
  } catch {
    // corrupted storage — ignore
  }
  return { selectedTenantId: null, selectedTenantName: null };
}

const initialState: UiState = {
  themeMode: loadThemeFromStorage(),
  sidebarOpen: true,
  ...loadTenantFromStorage(),
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
