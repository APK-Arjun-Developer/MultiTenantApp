import React from 'react';
import { usePermission } from '@/shared/hooks/usePermission';
import type { PermissionGuardProps } from './PermissionGuard.types';

export const PermissionGuard = React.memo(function PermissionGuard({
  permission,
  children,
}: PermissionGuardProps) {
  const allowed = usePermission(permission);
  if (!allowed) return null;
  return <>{children}</>;
});
