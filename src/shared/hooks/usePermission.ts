import { useAppSelector } from '@/app/hooks';
import { selectPermissions } from '@/features/auth/slices/authSlice';

/**
 * Returns true if the current user holds the given permission.
 * When the permissions list is empty (not yet loaded or user has no role),
 * returns true so the UI is permissive and the API enforces access.
 */
export function usePermission(permission: string): boolean {
  const permissions = useAppSelector(selectPermissions);
  if (permissions.length === 0) return true;
  return permissions.includes(permission);
}
