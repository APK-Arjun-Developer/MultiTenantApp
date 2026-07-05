// Permission name strings must match server PermissionNames.cs constants.
export const PERMISSIONS = {
  USERS_CREATE: 'Users.Create',
  USERS_UPDATE: 'Users.Edit',
  USERS_DELETE: 'Users.Delete',
  ROLES_CREATE: 'Roles.Create',
  ROLES_UPDATE: 'Roles.Edit',
  ROLES_DELETE: 'Roles.Delete',
  TENANTS_CREATE: 'Tenants.Create',
  TENANTS_UPDATE: 'Tenants.Edit',
  TENANTS_DELETE: 'Tenants.Delete',
  SUBSCRIPTIONS_VIEW: 'Subscriptions.View',
  SUBSCRIPTIONS_EDIT: 'Subscriptions.Edit',
  AUDIT_LOGS_VIEW: 'AuditLogs.View',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
