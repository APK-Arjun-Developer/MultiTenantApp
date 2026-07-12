import type { SystemRole } from '@/types/api';

export interface NavItem {
  text: string;
  icon: React.ReactElement;
  path: string;
  allowedRoles?: SystemRole[];
  permission?: string;
}
