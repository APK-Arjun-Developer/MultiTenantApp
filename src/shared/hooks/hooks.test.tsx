import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { signedInState, testUser } from '@/__tests__/utils/renderWithProviders';
import { type RootState, setupStore } from '@/app/store';

import { usePermission } from './usePermission';
import { useTableState } from './useTableState';

const withStore =
  (preloadedState: Partial<RootState>) =>
  ({ children }: { children: ReactNode }) => (
    <Provider store={setupStore(preloadedState)}>{children}</Provider>
  );

describe('usePermission', () => {
  it('checks loaded permissions', () => {
    const wrapper = withStore(signedInState(['Users.View']));

    expect(renderHook(() => usePermission('Users.View'), { wrapper }).result.current).toBe(true);
    expect(renderHook(() => usePermission('Users.Edit'), { wrapper }).result.current).toBe(false);
  });

  it('allows everything for a system admin', () => {
    const wrapper = withStore(signedInState([], { ...testUser, systemRole: 'SystemAdmin' }));

    expect(renderHook(() => usePermission('Tenants.Delete'), { wrapper }).result.current).toBe(
      true,
    );
  });

  it('is optimistic while permissions are still loading', () => {
    const state = signedInState([]) as Pick<RootState, 'auth'>;
    const wrapper = withStore({ auth: { ...state.auth, permissionsLoaded: false } });

    expect(renderHook(() => usePermission('Users.Edit'), { wrapper }).result.current).toBe(true);
  });
});

describe('useTableState', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter>{children}</MemoryRouter>
  );

  it('sorts ascending by default and clears sorting', () => {
    const { result } = renderHook(() => useTableState(), { wrapper });

    act(() => result.current.handleSortChange('name', undefined));
    expect(result.current.sortBy).toBe('name');
    expect(result.current.activeSortOrder).toBe('asc');

    act(() => result.current.handleSortChange(undefined, undefined));
    expect(result.current.sortBy).toBeUndefined();
  });

  it('resets to the first page when the page size changes', () => {
    const { result } = renderHook(() => useTableState({ initialPageSize: 10 }), { wrapper });

    act(() => result.current.setPage(3));
    act(() => result.current.handlePageSizeChange(50));

    expect(result.current.pageSize).toBe(50);
    expect(result.current.page).toBe(0);
  });
});
