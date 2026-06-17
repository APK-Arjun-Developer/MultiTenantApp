import type { ReactNode } from 'react';
import { usePermission } from '@/shared/hooks/usePermission';

interface PermissionGuardProps {
  permission: string;
  children: ReactNode;
}

export function PermissionGuard({ permission, children }: PermissionGuardProps) {
  const allowed = usePermission(permission);
  if (!allowed) return null;
  return <>{children}</>;
}
