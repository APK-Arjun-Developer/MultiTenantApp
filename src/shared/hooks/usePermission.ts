import { useAppSelector } from '@/app/hooks';
import {
  selectCurrentUser,
  selectPermissions,
  selectPermissionsLoaded,
} from '@/features/auth/slices/authSlice';

/**
 * Returns true if the current user holds the given permission.
 * SystemAdmin holds every permission by definition (enforced server-side), so
 * always resolves true for them regardless of the loaded permissions list.
 * Returns true while permissions are still loading (permissive until resolved).
 */
const usePermission = (permission: string): boolean => {
  const user = useAppSelector(selectCurrentUser);
  const permissions = useAppSelector(selectPermissions);
  const loaded = useAppSelector(selectPermissionsLoaded);
  if (user?.systemRole === 'SystemAdmin') return true;
  if (!loaded) return true;
  return permissions.includes(permission);
};

export { usePermission };
