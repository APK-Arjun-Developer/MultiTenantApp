// Permission name strings must match the values returned by GET /api/v1/permissions.
// Update these constants once real permission names are confirmed from a live API response.
export const PERMISSIONS = {
  USERS_CREATE: 'Users.Create',
  USERS_UPDATE: 'Users.Update',
  USERS_DELETE: 'Users.Delete',
  ROLES_CREATE: 'Roles.Create',
  ROLES_UPDATE: 'Roles.Update',
  ROLES_DELETE: 'Roles.Delete',
  TENANTS_CREATE: 'Tenants.Create',
  TENANTS_UPDATE: 'Tenants.Update',
  TENANTS_DELETE: 'Tenants.Delete',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
