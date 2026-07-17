type UUID = string;

type SortOrder = 'asc' | 'desc';

/** Shape of values emitted by FilterForm's `onChange` and used as `defaultValues`. */
type FilterValues = Record<string, unknown>;

/** Every API response is wrapped in this envelope (confirmed against the live API). */
interface ApiResponse<T> {
  data: T;
  message: string;
  errors: ApiErrorPayload | null;
  traceId: string;
}

interface ApiErrorPayload {
  code: string;
  details?: Record<string, string[]>;
}

/** Normalized error shape surfaced to the UI by baseQueryWithReauth. */
interface ApiError {
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
interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

interface PaginationParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: SortOrder;
}

// ---------- Address (shared across Tenant/User/TenantAdmin) ----------

interface AddressRequest {
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
}

type AddressDto = AddressRequest;

// ---------- Auth ----------

interface LoginRequest {
  email: string;
  password: string;
}

interface RefreshTokenRequest {
  refreshToken: string;
}

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

interface LogoutRequest {
  refreshToken: string;
}

interface ForgotPasswordRequest {
  email: string;
}

interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

interface VerifyEmailOtpRequest {
  email: string;
  otp: string;
}

interface ResendEmailOtpRequest {
  email: string;
}

type SystemRole = 'SystemAdmin' | 'TenantAdmin' | 'TenantUser';

type UserCreatedVia = 'Direct' | 'Invitation';

interface AuthUser {
  id: UUID;
  email: string;
  fullName: string;
  roles: string[];
  systemRole?: SystemRole | null;
  permissions?: string[];
  impersonatedBy?: ImpersonatedByInfo | null;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  email: string;
  fullName: string;
  roles: string[];
  systemRole: SystemRole;
}

interface ValidateResetTokenResponse {
  isValid: boolean;
  email?: string | null;
  errorMessage?: string | null;
}

// ---------- Account setup ----------

interface SetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
  fullName?: string;
  address?: AddressRequest;
}

// ---------- Invitations (generic accept flow) ----------

type InvitationType = 'TenantAdmin' | 'TenantUser' | 'NewTenant';

interface ValidateInvitationResponse {
  isValid: boolean;
  email?: string | null;
  invitationType?: InvitationType | null;
  tenantName?: string | null;
  errorMessage?: string | null;
}

interface AcceptInvitationResponse {
  userId: UUID;
  email: string;
  fullName: string;
  tenantId: UUID;
  roles: string[];
  invitationType: InvitationType;
  isActive: boolean;
}

interface ValidateAccountSetupResponse {
  isValid: boolean;
  email?: string | null;
  fullName?: string | null;
  errorMessage?: string | null;
  hasAddress: boolean;
}

interface SetPasswordResponse {
  userId: UUID;
  email: string;
  isActive: boolean;
}

interface CompanyInfo {
  name?: string | null;
  website?: string | null;
  industry?: string | null;
}

interface AcceptTenantAdminInvitationRequest {
  token: string;
  fullName: string;
  phone?: string | null;
  password: string;
  confirmPassword: string;
  company?: CompanyInfo;
  address?: AddressRequest;
}

interface AcceptTenantCreationInvitationRequest {
  token: string;
  fullName: string;
  phone?: string | null;
  password: string;
  confirmPassword: string;
  tenantName: string;
  tenantAddress?: AddressRequest;
  userAddress?: AddressRequest;
}

interface AcceptTenantUserInvitationRequest {
  token: string;
  fullName: string;
  phone?: string | null;
  password: string;
  confirmPassword: string;
  address?: AddressRequest;
}

type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked';

interface InvitationDto {
  id: UUID;
  email: string;
  status: InvitationStatus;
  roleNames: string[];
  invitedAt: string;
  expiresAt?: string;
}

// ---------- Files ----------

interface FileDto {
  id: UUID;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  url?: string;
  uploadedAt: string;
}

// ---------- Dashboard ----------

interface DashboardStatsDto {
  /** SystemAdmin only — null for tenant callers. */
  totalTenants: number | null;
  /** SystemAdmin only — null for tenant callers. */
  totalTenantAdmins: number | null;
  /** Platform-wide for SystemAdmin; own tenant only for TenantAdmin. */
  totalTenantUsers: number;
  /** TenantAdmin only — null for other callers. */
  totalRoles: number | null;
  /** TenantAdmin only — null for other callers. */
  totalPendingInvitations: number | null;
  // SystemAdmin chart data
  freePlanTenants: number | null;
  proPlanTenants: number | null;
  // TenantAdmin chart data
  acceptedInvitations: number | null;
  expiredInvitations: number | null;
  revokedInvitations: number | null;
}

// ---------- Permissions ----------

interface PermissionDto {
  id: UUID;
  name: string;
  module: string;
  description: string;
  scope: string;
}

interface PermissionModuleGroup {
  module: string;
  permissions: PermissionDto[];
}

interface PermissionCatalogResponse {
  items: PermissionDto[];
  byModule?: PermissionModuleGroup[] | null;
}

// ---------- Tenants ----------

interface TenantDto {
  id: UUID;
  name: string;
  isActive: boolean;
  createdVia: UserCreatedVia;
  profileFileId?: UUID | null;
  address?: AddressDto | null;
  adminEmail?: string | null;
  planType?: PlanType;
  planName?: string;
  planFeatures?: PlanFeaturesDto;
}

interface CreatedRoleSummary {
  id: UUID;
  name: string;
}

interface OnboardTenantResponse {
  tenantId: UUID;
  name: string;
  adminUserId: UUID;
  adminEmail: string;
  roles: CreatedRoleSummary[];
}

interface OnboardUserDetails {
  fullName: string;
  email: string;
  address?: AddressRequest;
}

interface OnboardTenantDetails {
  name: string;
  address?: AddressRequest;
}

interface OnboardRoleDetails {
  name: string;
  description?: string | null;
  permissions?: UUID[];
}

interface OnboardTenantRequest {
  user: OnboardUserDetails;
  tenant: OnboardTenantDetails;
  roles?: OnboardRoleDetails[];
}

interface UpdateTenantRequest {
  id: UUID;
  name?: string;
  isActive?: boolean;
  profileFileId?: UUID | null;
  clearProfileImage?: boolean;
  address?: AddressRequest;
  clearAddress?: boolean;
}

interface UpdateCurrentTenantAddressRequest {
  address?: AddressRequest;
  clearAddress?: boolean;
}

interface DeleteTenantRequest {
  id: UUID;
}

interface InviteResponse {
  invitationId: UUID;
  invitationType: InvitationType;
  expiresAt: string;
}

interface InviteTenantRequest {
  email: string;
}

interface TenantCreationInvitationDto {
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

interface TenantAdminTenantDetails {
  id: UUID;
  name: string;
  isActive: boolean;
}

interface TenantAdminDto {
  id: UUID;
  fullName: string;
  email: string;
  tenantId: UUID;
  systemRole: SystemRole;
  isActive: boolean;
  roles: string[];
  profileFileId?: UUID | null;
  address?: AddressDto | null;
  tenant?: TenantAdminTenantDetails | null;
  createdVia: UserCreatedVia;
  hasPendingSetup: boolean;
}

interface CreateTenantAdminRequest {
  tenantId: UUID;
  fullName: string;
  email: string;
  address?: AddressRequest;
}

interface CreateTenantAdminResponse {
  userId: UUID;
  fullName: string;
  email: string;
  tenantId: UUID;
  roles: string[];
  isActive: boolean;
}

interface UpdateTenantAdminRequest {
  userId: UUID;
  fullName: string;
  roleId?: UUID | null;
  profileFileId?: UUID | null;
  clearProfileImage?: boolean;
  address?: AddressRequest;
  clearAddress?: boolean;
}

interface InviteTenantAdminRequest {
  tenantId: UUID;
  email: string;
}

interface InviteTenantAdminResponse {
  id: UUID;
  email: string;
}

interface TenantAdminInvitationDto {
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

interface UserTenantDetails {
  id: UUID;
  name: string;
  isActive: boolean;
  profileFileId?: UUID | null;
  address?: AddressDto | null;
}

interface UserDto {
  id: UUID;
  fullName: string;
  email: string;
  tenantId: UUID;
  systemRole: SystemRole;
  isActive: boolean;
  roles: string[];
  profileFileId?: UUID | null;
  address?: AddressDto | null;
  tenant?: UserTenantDetails | null;
  createdVia: UserCreatedVia;
  lastLoginAt?: string | null;
  hasPendingSetup: boolean;
}

interface CreateTenantUserRequest {
  fullName: string;
  email: string;
  roleIds?: UUID[];
  address?: AddressRequest;
}

interface CreateTenantUserResponse {
  userId: UUID;
  fullName: string;
  email: string;
  tenantId: UUID;
  roles: string[];
  isActive: boolean;
}

interface InviteTenantUserRequest {
  email: string;
  roleIds?: UUID[];
}

interface InviteUserResponse {
  invitationId: UUID;
  invitationType: InvitationType;
  expiresAt: string;
}

interface UserInvitationDto {
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
interface UpdateUserRequest {
  email: string;
  fullName: string;
  roleId?: UUID | null;
  password?: string;
  profileFileId?: UUID | null;
  clearProfileImage?: boolean;
  address?: AddressRequest;
  clearAddress?: boolean;
}

interface DeleteUserRequest {
  email: string;
}

interface UpdateCurrentUserRequest {
  fullName: string;
  profileFileId?: UUID | null;
  clearProfileImage?: boolean;
  address?: AddressRequest;
  clearAddress?: boolean;
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// ---------- Subscriptions ----------

type PlanType = 'Free' | 'Pro';

interface PlanFeaturesDto {
  maxUsers: number;
  maxStorageMb: number;
  canAccessReports: boolean;
  canAccessAdvancedRoles: boolean;
}

interface SubscriptionPlanDto {
  planType: PlanType;
  name: string;
  features: PlanFeaturesDto;
}

interface UpdateTenantPlanRequest {
  tenantId: UUID;
  planType: PlanType;
}

interface TenantPlanResponse {
  tenantId: UUID;
  tenantName: string;
  planType: PlanType;
  planName: string;
  features: PlanFeaturesDto;
}

// ---------- Activity Logs ----------

interface ActivityLogDto {
  id: UUID;
  tenantId: UUID;
  tenantName?: string | null;
  userId: UUID;
  userDisplayName: string;
  userEmail: string;
  action: string;
  module: string;
  description: string;
  ipAddress?: string | null;
  createdAt: string;
}

interface ActivityLogQueryParams extends PaginationParams {
  userId?: UUID;
  module?: string;
  action?: string;
  dateFrom?: string;
  dateTo?: string;
}

// ---------- Tenant Settings ----------

interface UpdateTenantSettingsRequest {
  name: string;
  profileFileId?: UUID | null;
  clearProfileImage?: boolean;
  address?: AddressRequest;
  clearAddress?: boolean;
}

// ---------- Impersonation ----------

interface StartImpersonationRequest {
  targetUserId: UUID;
}

interface StartImpersonationResponse {
  userId: UUID;
  email: string;
  fullName: string;
  systemRole: SystemRole;
  roles: string[];
  expiresAt: string;
}

interface StopImpersonationResponse {
  userId: UUID;
  email: string;
  fullName: string;
  systemRole: SystemRole;
  expiresAt: string;
}

interface ImpersonatedByInfo {
  id: UUID;
  email: string;
  fullName: string;
}

// ---------- Roles ----------

interface RoleDto {
  id: UUID;
  name: string;
  description?: string | null;
  tenantId: UUID;
  permissionIds: UUID[];
  permissionNames: string[];
}

interface CreateRoleRequest {
  name: string;
  description?: string | null;
  permissions?: UUID[];
}

interface UpdateRoleRequest {
  name: string;
  newName?: string | null;
  description?: string | null;
  permissions?: UUID[];
}

export type {
  AcceptInvitationResponse,
  AcceptTenantAdminInvitationRequest,
  AcceptTenantCreationInvitationRequest,
  AcceptTenantUserInvitationRequest,
  ActivityLogDto,
  ActivityLogQueryParams,
  AddressDto,
  AddressRequest,
  ApiError,
  ApiErrorPayload,
  ApiResponse,
  AuthUser,
  ChangePasswordRequest,
  CompanyInfo,
  CreatedRoleSummary,
  CreateRoleRequest,
  CreateTenantAdminRequest,
  CreateTenantAdminResponse,
  CreateTenantUserRequest,
  CreateTenantUserResponse,
  DashboardStatsDto,
  DeleteTenantRequest,
  DeleteUserRequest,
  FileDto,
  FilterValues,
  ForgotPasswordRequest,
  ImpersonatedByInfo,
  InvitationDto,
  InvitationStatus,
  InvitationType,
  InviteResponse,
  InviteTenantAdminRequest,
  InviteTenantAdminResponse,
  InviteTenantRequest,
  InviteTenantUserRequest,
  InviteUserResponse,
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  OnboardRoleDetails,
  OnboardTenantDetails,
  OnboardTenantRequest,
  OnboardTenantResponse,
  OnboardUserDetails,
  PaginatedResponse,
  PaginationParams,
  PermissionCatalogResponse,
  PermissionDto,
  PermissionModuleGroup,
  PlanFeaturesDto,
  PlanType,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ResendEmailOtpRequest,
  ResetPasswordRequest,
  RoleDto,
  SetPasswordRequest,
  SetPasswordResponse,
  SortOrder,
  StartImpersonationRequest,
  StartImpersonationResponse,
  StopImpersonationResponse,
  SubscriptionPlanDto,
  SystemRole,
  TenantAdminDto,
  TenantAdminInvitationDto,
  TenantAdminTenantDetails,
  TenantCreationInvitationDto,
  TenantDto,
  TenantPlanResponse,
  UpdateCurrentTenantAddressRequest,
  UpdateCurrentUserRequest,
  UpdateRoleRequest,
  UpdateTenantAdminRequest,
  UpdateTenantPlanRequest,
  UpdateTenantRequest,
  UpdateTenantSettingsRequest,
  UpdateUserRequest,
  UserCreatedVia,
  UserDto,
  UserInvitationDto,
  UserTenantDetails,
  UUID,
  ValidateAccountSetupResponse,
  ValidateInvitationResponse,
  ValidateResetTokenResponse,
  VerifyEmailOtpRequest,
};
