import { useAppSelector } from '@/app/hooks';
import { selectPermissions, selectPermissionsLoaded } from '@/features/auth/slices/authSlice';

/**
 * Returns true if the current user holds the given permission.
 * Returns true while permissions are still loading (permissive until resolved).
 */
const usePermission = (permission: string): boolean => {
  const permissions = useAppSelector(selectPermissions);
  const loaded = useAppSelector(selectPermissionsLoaded);
  if (!loaded) return true;
  return permissions.includes(permission);
};

export { usePermission };
