export type UUID = string;

/** Every API response is wrapped in this envelope (confirmed against the live API). */
export interface ApiResponse<T> {
  data: T;
  message: string;
  errors: ApiErrorPayload | null;
  traceId: string;
}

export interface ApiErrorPayload {
  code: string;
  details?: Record<string, string[]>;
}

/** Normalized error shape surfaced to the UI by baseQueryWithReauth. */
export interface ApiError {
  status: number;
  code: string;
  message: string;
  details?: Record<string, string[]>;
  traceId?: string;
}

/**
 * The Swagger doc has no response schemas (Swashbuckle without ProducesResponseType
 * annotations) — only request DTOs are typed there. Everything below the request DTOs
 * is inferred from naming conventions and the confirmed envelope; verify against a live
 * authenticated response and adjust as needed once endpoints are exercised for real.
 */
export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ---------- Address (shared across Tenant/User/TenantAdmin) ----------

export interface AddressRequest {
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
}

export type AddressDto = AddressRequest;

// ---------- Auth ----------

export interface LoginRequest {
  email: string;
  password: string;
  tenantSlug?: string | null;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
  tenantSlug?: string | null;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface VerifyEmailOtpRequest {
  email: string;
  tenantSlug?: string | null;
  otp: string;
}

export interface ResendEmailOtpRequest {
  email: string;
  tenantSlug?: string | null;
}

export type SystemRole = 'SystemAdmin' | 'TenantAdmin' | 'TenantUser';

export interface AuthUser {
  id: UUID;
  email: string;
  fullName: string;
  roles: string[];
  systemRole?: SystemRole | null;
  tenantSlug?: string | null;
  permissions?: string[];
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  email: string;
  fullName: string;
  roles: string[];
  systemRole: SystemRole;
}

export interface ValidateResetTokenResponse {
  isValid: boolean;
  email?: string | null;
  tenantSlug?: string | null;
  errorMessage?: string | null;
}

// ---------- Account setup ----------

export interface SetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
  fullName?: string;
  address?: AddressRequest;
}

// ---------- Invitations (generic accept flow) ----------

export type InvitationType = 'TenantAdmin' | 'TenantUser' | 'NewTenant';

export interface ValidateInvitationResponse {
  isValid: boolean;
  email?: string | null;
  invitationType?: InvitationType | null;
  tenantName?: string | null;
  tenantSlug?: string | null;
  errorMessage?: string | null;
}

export interface AcceptInvitationResponse {
  userId: UUID;
  email: string;
  fullName: string;
  tenantId: UUID;
  tenantSlug?: string | null;
  roles: string[];
  invitationType: InvitationType;
  isActive: boolean;
}

export interface ValidateAccountSetupResponse {
  isValid: boolean;
  email?: string | null;
  fullName?: string | null;
  tenantSlug?: string | null;
  errorMessage?: string | null;
  hasAddress: boolean;
}

export interface SetPasswordResponse {
  userId: UUID;
  email: string;
  tenantSlug?: string | null;
  isActive: boolean;
}

export interface CompanyInfo {
  name?: string | null;
  website?: string | null;
  industry?: string | null;
}

export interface AcceptTenantAdminInvitationRequest {
  token: string;
  fullName: string;
  phone?: string | null;
  password: string;
  confirmPassword: string;
  company?: CompanyInfo;
  address?: AddressRequest;
}

export interface AcceptTenantCreationInvitationRequest {
  token: string;
  fullName: string;
  phone?: string | null;
  password: string;
  confirmPassword: string;
  tenantName: string;
  tenantSlug: string;
  tenantAddress?: AddressRequest;
  userAddress?: AddressRequest;
}

export interface AcceptTenantUserInvitationRequest {
  token: string;
  fullName: string;
  phone?: string | null;
  password: string;
  confirmPassword: string;
  address?: AddressRequest;
}

export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked';

export interface InvitationDto {
  id: UUID;
  email: string;
  status: InvitationStatus;
  roleNames: string[];
  invitedAt: string;
  expiresAt?: string;
}

// ---------- Files ----------

export interface FileDto {
  id: UUID;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  url?: string;
  uploadedAt: string;
}

// ---------- Permissions ----------

export interface PermissionDto {
  id: UUID;
  name: string;
  module: string;
  description: string;
  scope: string;
}

export interface PermissionModuleGroup {
  module: string;
  permissions: PermissionDto[];
}

export interface PermissionCatalogResponse {
  items: PermissionDto[];
  byModule?: PermissionModuleGroup[] | null;
}

// ---------- Tenants ----------

export interface TenantDto {
  id: UUID;
  slug: string;
  name: string;
  isActive: boolean;
  profileFileId?: UUID | null;
  profileUrl?: string | null;
  address?: AddressDto | null;
}

export interface CreatedRoleSummary {
  id: UUID;
  name: string;
}

export interface OnboardTenantResponse {
  tenantId: UUID;
  name: string;
  slug: string;
  adminUserId: UUID;
  adminEmail: string;
  roles: CreatedRoleSummary[];
}

export interface OnboardUserDetails {
  fullName: string;
  email: string;
  address?: AddressRequest;
}

export interface OnboardTenantDetails {
  name: string;
  slug: string;
  address?: AddressRequest;
}

export interface OnboardRoleDetails {
  name: string;
  description?: string | null;
  permissions?: UUID[];
}

export interface OnboardTenantRequest {
  user: OnboardUserDetails;
  tenant: OnboardTenantDetails;
  roles?: OnboardRoleDetails[];
}

export interface UpdateTenantRequest {
  slug: string;
  name?: string;
  newSlug?: string;
  isActive?: boolean;
  profileFileId?: UUID | null;
  clearProfileImage?: boolean;
  address?: AddressRequest;
  clearAddress?: boolean;
}

export interface UpdateCurrentTenantAddressRequest {
  address?: AddressRequest;
  clearAddress?: boolean;
}

export interface DeleteTenantRequest {
  slug: string;
}

export interface InviteResponse {
  invitationId: UUID;
  invitationType: InvitationType;
  expiresAt: string;
}

export interface InviteTenantRequest {
  email: string;
}

export interface TenantCreationInvitationDto {
  id: UUID;
  email: string;
  status: string;
  expiresAt: string;
  acceptedAt?: string | null;
  revokedAt?: string | null;
  isExpired: boolean;
  isAccepted: boolean;
  isRevoked: boolean;
  createdAt: string;
}

// ---------- Tenant admins (super-admin managing admins across tenants) ----------

export interface TenantAdminTenantDetails {
  id: UUID;
  name: string;
  slug: string;
  isActive: boolean;
}

export interface TenantAdminDto {
  id: UUID;
  fullName: string;
  email: string;
  tenantId: UUID;
  systemRole: SystemRole;
  isActive: boolean;
  roles: string[];
  profileFileId?: UUID | null;
  profileUrl?: string | null;
  address?: AddressDto | null;
  tenant?: TenantAdminTenantDetails | null;
  hasPendingSetup: boolean;
}

export interface CreateTenantAdminRequest {
  tenantSlug: string;
  fullName: string;
  email: string;
  address?: AddressRequest;
}

export interface CreateTenantAdminResponse {
  userId: UUID;
  fullName: string;
  email: string;
  tenantId: UUID;
  tenantSlug: string;
  roles: string[];
  isActive: boolean;
}

export interface UpdateTenantAdminRequest {
  userId: UUID;
  fullName: string;
  roleId?: UUID | null;
  profileFileId?: UUID | null;
  clearProfileImage?: boolean;
  address?: AddressRequest;
  clearAddress?: boolean;
}

export interface InviteTenantAdminRequest {
  tenantSlug: string;
  email: string;
}

export interface InviteTenantAdminResponse {
  id: UUID;
  email: string;
  tenantSlug: string;
}

export interface TenantAdminInvitationDto {
  id: UUID;
  email: string;
  tenantId: UUID;
  tenantName?: string | null;
  expiresAt: string;
  acceptedAt?: string | null;
  revokedAt?: string | null;
  isExpired: boolean;
  isAccepted: boolean;
  isRevoked: boolean;
  status: string;
  createdAt: string;
}

// ---------- Users (in-tenant users) ----------

export interface UserTenantDetails {
  id: UUID;
  name: string;
  slug: string;
  isActive: boolean;
  profileFileId?: UUID | null;
  profileUrl?: string | null;
  address?: AddressDto | null;
}

export interface UserDto {
  id: UUID;
  fullName: string;
  email: string;
  tenantId: UUID;
  systemRole: SystemRole;
  isActive: boolean;
  roles: string[];
  profileFileId?: UUID | null;
  profileUrl?: string | null;
  address?: AddressDto | null;
  tenant?: UserTenantDetails | null;
  hasPendingSetup: boolean;
}

export interface CreateTenantUserRequest {
  fullName: string;
  email: string;
  roleIds?: UUID[];
  address?: AddressRequest;
}

export interface CreateTenantUserResponse {
  userId: UUID;
  fullName: string;
  email: string;
  tenantId: UUID;
  roles: string[];
  isActive: boolean;
}

export interface InviteTenantUserRequest {
  email: string;
  roleIds?: UUID[];
}

export interface InviteUserResponse {
  invitationId: UUID;
  invitationType: InvitationType;
  expiresAt: string;
}

export interface UserInvitationDto {
  id: UUID;
  email: string;
  invitationType: InvitationType;
  tenantId: UUID;
  tenantName?: string | null;
  expiresAt: string;
  acceptedAt?: string | null;
  revokedAt?: string | null;
  isExpired: boolean;
  isAccepted: boolean;
  isRevoked: boolean;
  status: string;
  createdAt: string;
  invitedByUserId: UUID;
}

/** PUT /api/v1/users has no {id} segment — the user being updated is identified by email. */
export interface UpdateUserRequest {
  email: string;
  fullName: string;
  roleId?: UUID | null;
  password?: string;
  profileFileId?: UUID | null;
  clearProfileImage?: boolean;
  address?: AddressRequest;
  clearAddress?: boolean;
}

export interface DeleteUserRequest {
  email: string;
}

export interface UpdateCurrentUserRequest {
  fullName: string;
  profileFileId?: UUID | null;
  clearProfileImage?: boolean;
  address?: AddressRequest;
  clearAddress?: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// ---------- Roles ----------

export interface RoleDto {
  id: UUID;
  name: string;
  description?: string | null;
  tenantId: UUID;
  permissionIds: UUID[];
  permissionNames: string[];
}

export interface CreateRoleRequest {
  name: string;
  description?: string | null;
  permissions?: UUID[];
}

export interface UpdateRoleRequest {
  name: string;
  description?: string | null;
  permissions?: UUID[];
}
