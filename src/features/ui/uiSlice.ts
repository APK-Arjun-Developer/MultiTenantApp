import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '@/app/store';
import { type ThemeColor, type ThemeMode } from '@/shared/theme';
import { storage } from '@/shared/utils/storage';

const SELECTED_TENANT_STORAGE_KEY = 'selectedTenant';
const THEME_STORAGE_KEY = 'themeMode';
const THEME_COLOR_STORAGE_KEY = 'themeColor';

const VALID_THEME_COLORS: ThemeColor[] = ['violet', 'blue', 'green', 'rose', 'amber', 'teal'];

interface UiState {
  themeMode: ThemeMode;
  themeColor: ThemeColor;
  sidebarOpen: boolean;
  selectedTenantId: string | null;
  selectedTenantName: string | null;
}

const loadThemeFromStorage = (): ThemeMode => {
  const raw = storage.getString(THEME_STORAGE_KEY);
  if (raw === 'light' || raw === 'dark') return raw;
  return 'light';
};

const loadThemeColorFromStorage = (): ThemeColor => {
  const raw = storage.getString(THEME_COLOR_STORAGE_KEY);
  if (raw && VALID_THEME_COLORS.includes(raw as ThemeColor)) return raw as ThemeColor;
  return 'violet';
};

const loadTenantFromStorage = (): Pick<UiState, 'selectedTenantId' | 'selectedTenantName'> => {
  const raw = storage.getJson<{ id: unknown; name: unknown }>(SELECTED_TENANT_STORAGE_KEY);
  if (raw && 'id' in raw && 'name' in raw) {
    return {
      selectedTenantId: typeof raw.id === 'string' ? raw.id : null,
      selectedTenantName: typeof raw.name === 'string' ? raw.name : null,
    };
  }
  return { selectedTenantId: null, selectedTenantName: null };
};

const initialState: UiState = {
  themeMode: loadThemeFromStorage(),
  themeColor: loadThemeColorFromStorage(),
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
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.themeMode = action.payload;
    },
    setThemeColor: (state, action: PayloadAction<ThemeColor>) => {
      state.themeColor = action.payload;
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
  setThemeColor,
  toggleSidebar,
  setSidebarOpen,
  setSelectedTenant,
  clearSelectedTenant,
} = uiSlice.actions;

const selectThemeMode = (state: RootState) => state.ui.themeMode;
const selectThemeColor = (state: RootState) => state.ui.themeColor;
const selectSidebarOpen = (state: RootState) => state.ui.sidebarOpen;
const selectSelectedTenantId = (state: RootState) => state.ui.selectedTenantId;
const selectSelectedTenantName = (state: RootState) => state.ui.selectedTenantName;

export {
  clearSelectedTenant,
  SELECTED_TENANT_STORAGE_KEY,
  selectSelectedTenantId,
  selectSelectedTenantName,
  selectSidebarOpen,
  selectThemeColor,
  selectThemeMode,
  setSelectedTenant,
  setSidebarOpen,
  setThemeColor,
  setThemeMode,
  THEME_COLOR_STORAGE_KEY,
  THEME_STORAGE_KEY,
  toggleSidebar,
  toggleTheme,
};
export default uiSlice.reducer;
