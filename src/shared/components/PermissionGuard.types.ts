import type { ReactNode } from 'react';

interface PermissionGuardProps {
  permission: string;
  children: ReactNode;
}

export { type PermissionGuardProps };
