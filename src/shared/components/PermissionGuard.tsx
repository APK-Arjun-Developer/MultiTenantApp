import React from 'react';

import { usePermission } from '@/shared/hooks/usePermission';

import type { PermissionGuardProps } from './PermissionGuard.types';

const PermissionGuard = React.memo(({ permission, children }: PermissionGuardProps) => {
  const allowed = usePermission(permission);
  if (!allowed) return null;
  return <>{children}</>;
});
export default PermissionGuard;
