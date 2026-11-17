import { Role } from '@prisma/client';
import { Permission } from './permissions.enum';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.ADMIN]: [
    Permission.PROFILE_READ,
    Permission.PROFILE_UPDATE,
    Permission.ADMIN_DASHBOARD_ACCESS,
    Permission.ADMIN_USERS_MANAGE,
    Permission.ADMIN_USERS_STATUS_UPDATE,
    Permission.ADMIN_PROFESSIONALS_VERIFY,
    Permission.ADMIN_RESOURCES_MANAGE,
    Permission.ADMIN_AUDIT_LOGS_VIEW,
    Permission.ADMIN_REPORTS_MANAGE,
    Permission.EMERGENCY_RESOURCES_VIEW,
  ],

  [Role.USER]: [
    Permission.PROFILE_READ,
    Permission.PROFILE_UPDATE,
    Permission.CONSENT_MANAGE,
    Permission.EVIDENCE_VAULT_CREATE,
    Permission.EVIDENCE_VAULT_READ,
    Permission.EVIDENCE_VAULT_SHARE,
    Permission.EVIDENCE_VAULT_DELETE,
    Permission.AI_ASSISTANT_CHAT,
    Permission.AI_SITUATION_ANALYZE,
    Permission.ASSISTANCE_REQUEST_CREATE,
    Permission.ASSISTANCE_REQUEST_VIEW_OWN,
    Permission.APPOINTMENT_BOOK,
    Permission.APPOINTMENT_VIEW_OWN,
    Permission.EMERGENCY_RESOURCES_VIEW,
  ],

  [Role.LAWYER]: [
    Permission.PROFILE_READ,
    Permission.PROFILE_UPDATE,
    Permission.PROFESSIONAL_PROFILE_MANAGE,
    Permission.PROFESSIONAL_SERVICES_MANAGE,
    Permission.PROFESSIONAL_VERIFICATION_SUBMIT,
    Permission.PROFESSIONAL_REQUESTS_VIEW,
    Permission.PROFESSIONAL_REQUESTS_HANDLE,
    Permission.SHARED_EVIDENCE_READ,
    Permission.APPOINTMENT_MANAGE_SCHEDULE,
    Permission.EMERGENCY_RESOURCES_VIEW,
  ],

  [Role.PSYCHOLOGIST]: [
    Permission.PROFILE_READ,
    Permission.PROFILE_UPDATE,
    Permission.PROFESSIONAL_PROFILE_MANAGE,
    Permission.PROFESSIONAL_SERVICES_MANAGE,
    Permission.PROFESSIONAL_VERIFICATION_SUBMIT,
    Permission.PROFESSIONAL_REQUESTS_VIEW,
    Permission.PROFESSIONAL_REQUESTS_HANDLE,
    Permission.SHARED_EVIDENCE_READ,
    Permission.APPOINTMENT_MANAGE_SCHEDULE,
    Permission.EMERGENCY_RESOURCES_VIEW,
  ],

  [Role.ASSOCIATION]: [
    Permission.PROFILE_READ,
    Permission.PROFILE_UPDATE,
    Permission.ORGANIZATION_PROFILE_MANAGE,
    Permission.ORGANIZATION_SERVICES_MANAGE,
    Permission.ORGANIZATION_REQUESTS_VIEW,
    Permission.ORGANIZATION_REQUESTS_HANDLE,
    Permission.EMERGENCY_RESOURCES_VIEW,
  ],

  [Role.HELP_CENTER]: [
    Permission.PROFILE_READ,
    Permission.PROFILE_UPDATE,
    Permission.ORGANIZATION_PROFILE_MANAGE,
    Permission.ORGANIZATION_SERVICES_MANAGE,
    Permission.ORGANIZATION_REQUESTS_VIEW,
    Permission.ORGANIZATION_REQUESTS_HANDLE,
    Permission.EMERGENCY_RESOURCES_VIEW,
  ],

  // Aliases for compatibility
  [Role.COUNSELOR]: [
    Permission.PROFILE_READ,
    Permission.PROFILE_UPDATE,
    Permission.PROFESSIONAL_PROFILE_MANAGE,
    Permission.PROFESSIONAL_REQUESTS_VIEW,
    Permission.PROFESSIONAL_REQUESTS_HANDLE,
    Permission.SHARED_EVIDENCE_READ,
    Permission.EMERGENCY_RESOURCES_VIEW,
  ],

  [Role.ASSOCIATION_REP]: [
    Permission.PROFILE_READ,
    Permission.PROFILE_UPDATE,
    Permission.ORGANIZATION_PROFILE_MANAGE,
    Permission.ORGANIZATION_SERVICES_MANAGE,
    Permission.ORGANIZATION_REQUESTS_VIEW,
    Permission.ORGANIZATION_REQUESTS_HANDLE,
    Permission.EMERGENCY_RESOURCES_VIEW,
  ],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return !!permissions && permissions.includes(permission);
}

export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  const rolePerms = ROLE_PERMISSIONS[role] || [];
  return permissions.every((p) => rolePerms.includes(p));
}

export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  const rolePerms = ROLE_PERMISSIONS[role] || [];
  return permissions.some((p) => rolePerms.includes(p));
}
