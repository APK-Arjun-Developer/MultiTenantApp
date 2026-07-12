import type { ReactNode } from 'react';

export interface PermissionGuardProps {
  permission: string;
  children: ReactNode;
}
