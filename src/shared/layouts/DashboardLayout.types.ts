import type { SystemRole } from '@/types/api';

interface NavItem {
  text: string;
  icon: React.ReactElement;
  path: string;
  allowedRoles?: SystemRole[];
  permission?: string;
}

export { type NavItem };
