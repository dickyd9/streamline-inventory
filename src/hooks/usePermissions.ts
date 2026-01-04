import { useAuth } from '@/contexts/AuthContext';
import { Permission, hasPermission, canManageUsers, canEditCompanySettings, canDelete, canApprove } from '@/lib/permissions';

export function usePermissions() {
  const { role } = useAuth();

  return {
    role,
    hasPermission: (permission: Permission) => hasPermission(role, permission),
    canManageUsers: () => canManageUsers(role),
    canEditCompanySettings: () => canEditCompanySettings(role),
    canDelete: () => canDelete(role),
    canApprove: () => canApprove(role),
    isAdmin: role === 'admin',
    isOwner: role === 'owner',
    isStaff: role === 'staff',
    isOwnerOrAdmin: role === 'admin' || role === 'owner',
  };
}
