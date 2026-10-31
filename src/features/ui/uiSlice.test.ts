import { beforeEach, describe, expect, it, vi } from 'vitest';

/** Imports a fresh copy of the slice so its initial state re-reads localStorage. */
const loadSlice = async () => {
  vi.resetModules();
  return import('./uiSlice');
};

beforeEach(() => {
  localStorage.clear();
});

describe('uiSlice', () => {
  it('starts from defaults with nothing saved', async () => {
    const { default: reducer } = await loadSlice();

    expect(reducer(undefined, { type: '@@init' })).toEqual({
      themeMode: 'light',
      themeColor: 'violet',
      sidebarOpen: true,
      selectedTenantId: null,
      selectedTenantName: null,
    });
  });

  it('restores saved theme and tenant', async () => {
    localStorage.setItem('themeMode', 'dark');
    localStorage.setItem('themeColor', 'teal');
    localStorage.setItem('selectedTenant', JSON.stringify({ id: 't1', name: 'Acme' }));
    const { default: reducer } = await loadSlice();

    expect(reducer(undefined, { type: '@@init' })).toMatchObject({
      themeMode: 'dark',
      themeColor: 'teal',
      selectedTenantId: 't1',
      selectedTenantName: 'Acme',
    });
  });

  it('ignores invalid saved values', async () => {
    localStorage.setItem('themeMode', 'sepia');
    localStorage.setItem('themeColor', 'neon');
    localStorage.setItem('selectedTenant', JSON.stringify({ id: 7, name: false }));
    const { default: reducer } = await loadSlice();

    expect(reducer(undefined, { type: '@@init' })).toMatchObject({
      themeMode: 'light',
      themeColor: 'violet',
      selectedTenantId: null,
      selectedTenantName: null,
    });
  });

  it('ignores a saved tenant without id and name', async () => {
    localStorage.setItem('selectedTenant', JSON.stringify({ other: 1 }));
    const { default: reducer } = await loadSlice();

    expect(reducer(undefined, { type: '@@init' }).selectedTenantId).toBeNull();
  });

  it('updates theme, sidebar and tenant', async () => {
    const slice = await loadSlice();
    const reduce = (actions: Parameters<typeof slice.default>[1][]) =>
      actions.reduce(slice.default, slice.default(undefined, { type: '@@init' }));

    const state = reduce([
      slice.toggleTheme(),
      slice.setThemeColor('rose'),
      slice.toggleSidebar(),
      slice.setSelectedTenant({ id: 't2', name: 'Globex' }),
    ]);
    expect(state).toEqual({
      themeMode: 'dark',
      themeColor: 'rose',
      sidebarOpen: false,
      selectedTenantId: 't2',
      selectedTenantName: 'Globex',
    });

    const next = [
      slice.toggleTheme(),
      slice.setThemeMode('dark'),
      slice.setSidebarOpen(true),
      slice.clearSelectedTenant(),
    ].reduce(slice.default, state);
    expect(next).toMatchObject({
      themeMode: 'dark',
      sidebarOpen: true,
      selectedTenantId: null,
      selectedTenantName: null,
    });

    const root = { ui: next } as Parameters<typeof slice.selectSidebarOpen>[0];
    expect(slice.selectSidebarOpen(root)).toBe(true);
    expect(slice.selectSelectedTenantName(root)).toBeNull();
  });
});
