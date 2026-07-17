import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/app/store';

const SELECTED_TENANT_STORAGE_KEY = 'selectedTenant';
const THEME_STORAGE_KEY = 'themeMode';

interface UiState {
  themeMode: 'light' | 'dark';
  sidebarOpen: boolean;
  selectedTenantId: string | null;
  selectedTenantName: string | null;
}

const loadThemeFromStorage = (): 'light' | 'dark' => {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (raw === 'light' || raw === 'dark') return raw;
  } catch {
    // corrupted storage — ignore
  }
  return 'dark';
};

const loadTenantFromStorage = (): Pick<UiState, 'selectedTenantId' | 'selectedTenantName'> => {
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
};

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

const {
  toggleTheme,
  setThemeMode,
  toggleSidebar,
  setSidebarOpen,
  setSelectedTenant,
  clearSelectedTenant,
} = uiSlice.actions;

const selectThemeMode = (state: RootState) => state.ui.themeMode;
const selectSidebarOpen = (state: RootState) => state.ui.sidebarOpen;
const selectSelectedTenantId = (state: RootState) => state.ui.selectedTenantId;
const selectSelectedTenantName = (state: RootState) => state.ui.selectedTenantName;

export {
  SELECTED_TENANT_STORAGE_KEY,
  THEME_STORAGE_KEY,
  toggleTheme,
  setThemeMode,
  toggleSidebar,
  setSidebarOpen,
  setSelectedTenant,
  clearSelectedTenant,
  selectThemeMode,
  selectSidebarOpen,
  selectSelectedTenantId,
  selectSelectedTenantName,
};
export default uiSlice.reducer;
