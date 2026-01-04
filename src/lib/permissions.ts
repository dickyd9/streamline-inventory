export type AppRole = 'admin' | 'owner' | 'staff';

export type Permission = 
  | 'view:dashboard'
  | 'view:items'
  | 'create:items'
  | 'edit:items'
  | 'delete:items'
  | 'view:inventory'
  | 'view:stockMovements'
  | 'create:stockMovements'
  | 'view:stocktaking'
  | 'create:stocktaking'
  | 'approve:stocktaking'
  | 'view:purchaseOrders'
  | 'create:purchaseOrders'
  | 'edit:purchaseOrders'
  | 'delete:purchaseOrders'
  | 'approve:purchaseOrders'
  | 'view:salesOrders'
  | 'create:salesOrders'
  | 'edit:salesOrders'
  | 'delete:salesOrders'
  | 'view:invoices'
  | 'create:invoices'
  | 'edit:invoices'
  | 'delete:invoices'
  | 'view:payments'
  | 'create:payments'
  | 'view:suppliers'
  | 'create:suppliers'
  | 'edit:suppliers'
  | 'delete:suppliers'
  | 'view:customers'
  | 'create:customers'
  | 'edit:customers'
  | 'delete:customers'
  | 'view:reports'
  | 'export:reports'
  | 'view:settings'
  | 'edit:companySettings'
  | 'view:users'
  | 'manage:users'
  | 'manage:roles';

const rolePermissions: Record<AppRole, Permission[]> = {
  admin: [
    // All permissions
    'view:dashboard',
    'view:items', 'create:items', 'edit:items', 'delete:items',
    'view:inventory',
    'view:stockMovements', 'create:stockMovements',
    'view:stocktaking', 'create:stocktaking', 'approve:stocktaking',
    'view:purchaseOrders', 'create:purchaseOrders', 'edit:purchaseOrders', 'delete:purchaseOrders', 'approve:purchaseOrders',
    'view:salesOrders', 'create:salesOrders', 'edit:salesOrders', 'delete:salesOrders',
    'view:invoices', 'create:invoices', 'edit:invoices', 'delete:invoices',
    'view:payments', 'create:payments',
    'view:suppliers', 'create:suppliers', 'edit:suppliers', 'delete:suppliers',
    'view:customers', 'create:customers', 'edit:customers', 'delete:customers',
    'view:reports', 'export:reports',
    'view:settings', 'edit:companySettings',
    'view:users', 'manage:users', 'manage:roles',
  ],
  owner: [
    // Same as admin - full access
    'view:dashboard',
    'view:items', 'create:items', 'edit:items', 'delete:items',
    'view:inventory',
    'view:stockMovements', 'create:stockMovements',
    'view:stocktaking', 'create:stocktaking', 'approve:stocktaking',
    'view:purchaseOrders', 'create:purchaseOrders', 'edit:purchaseOrders', 'delete:purchaseOrders', 'approve:purchaseOrders',
    'view:salesOrders', 'create:salesOrders', 'edit:salesOrders', 'delete:salesOrders',
    'view:invoices', 'create:invoices', 'edit:invoices', 'delete:invoices',
    'view:payments', 'create:payments',
    'view:suppliers', 'create:suppliers', 'edit:suppliers', 'delete:suppliers',
    'view:customers', 'create:customers', 'edit:customers', 'delete:customers',
    'view:reports', 'export:reports',
    'view:settings', 'edit:companySettings',
    'view:users', 'manage:users', 'manage:roles',
  ],
  staff: [
    // Limited permissions - can view and create, but not delete or manage settings/users
    'view:dashboard',
    'view:items', 'create:items', 'edit:items',
    'view:inventory',
    'view:stockMovements', 'create:stockMovements',
    'view:stocktaking', 'create:stocktaking',
    'view:purchaseOrders', 'create:purchaseOrders', 'edit:purchaseOrders',
    'view:salesOrders', 'create:salesOrders', 'edit:salesOrders',
    'view:invoices', 'create:invoices',
    'view:payments', 'create:payments',
    'view:suppliers', 'create:suppliers', 'edit:suppliers',
    'view:customers', 'create:customers', 'edit:customers',
    'view:reports',
    'view:settings',
  ],
};

export function hasPermission(role: AppRole | null, permission: Permission): boolean {
  if (!role) return false;
  return rolePermissions[role]?.includes(permission) ?? false;
}

export function canManageUsers(role: AppRole | null): boolean {
  return hasPermission(role, 'manage:users');
}

export function canEditCompanySettings(role: AppRole | null): boolean {
  return hasPermission(role, 'edit:companySettings');
}

export function canDelete(role: AppRole | null): boolean {
  if (!role) return false;
  return role === 'admin' || role === 'owner';
}

export function canApprove(role: AppRole | null): boolean {
  if (!role) return false;
  return role === 'admin' || role === 'owner';
}

export function getRoleLabel(role: AppRole, language: 'en' | 'id' = 'id'): string {
  const labels: Record<AppRole, Record<'en' | 'id', string>> = {
    admin: { en: 'Admin', id: 'Admin' },
    owner: { en: 'Owner', id: 'Pemilik' },
    staff: { en: 'Staff', id: 'Staf' },
  };
  return labels[role][language];
}
