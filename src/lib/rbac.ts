import { UserRole } from '@/types';

export interface RoutePermission {
  path: string;
  allowedRoles: UserRole[];
}

export const ROUTE_PERMISSIONS: RoutePermission[] = [
  { path: '/dashboard', allowedRoles: ['Owner', 'Manager', 'Supervisor', 'Worker'] },
  { path: '/customers', allowedRoles: ['Owner', 'Manager', 'Supervisor'] },
  { path: '/orders', allowedRoles: ['Owner', 'Manager', 'Supervisor', 'Worker'] },
  { path: '/quotations', allowedRoles: ['Owner', 'Manager'] },
  { path: '/inventory', allowedRoles: ['Owner', 'Manager', 'Supervisor', 'Worker'] },
  { path: '/production', allowedRoles: ['Owner', 'Manager', 'Supervisor', 'Worker'] },
  { path: '/production/planner', allowedRoles: ['Owner', 'Manager', 'Supervisor', 'Worker'] },
  { path: '/machines', allowedRoles: ['Owner', 'Manager', 'Supervisor', 'Worker'] },
  { path: '/workers', allowedRoles: ['Owner', 'Manager', 'Supervisor'] },
  { path: '/suppliers', allowedRoles: ['Owner', 'Manager'] },
  { path: '/purchase-orders', allowedRoles: ['Owner', 'Manager', 'Supervisor'] },
  { path: '/invoices', allowedRoles: ['Owner', 'Manager'] },
  { path: '/reports', allowedRoles: ['Owner', 'Manager'] },
  { path: '/ai-order-intake', allowedRoles: ['Owner', 'Manager', 'Supervisor', 'Worker'] },
  { path: '/cad-analysis', allowedRoles: ['Owner', 'Manager', 'Supervisor', 'Worker'] },
  { path: '/ai-assistant', allowedRoles: ['Owner', 'Manager', 'Supervisor', 'Worker'] },
  { path: '/settings', allowedRoles: ['Owner', 'Manager'] },
  { path: '/settings/workflow-templates', allowedRoles: ['Owner', 'Manager'] },
  { path: '/settings/whatsapp', allowedRoles: ['Owner', 'Manager'] },
  { path: '/settings/billing', allowedRoles: ['Owner', 'Manager'] },
  { path: '/settings/organization', allowedRoles: ['Owner', 'Manager'] },
  { path: '/portal', allowedRoles: ['Owner', 'Manager', 'Supervisor', 'Worker'] },
  { path: '/marketplace', allowedRoles: ['Owner', 'Manager', 'Supervisor', 'Worker'] },
  { path: '/help', allowedRoles: ['Owner', 'Manager', 'Supervisor', 'Worker'] },
];

export function hasPermission(role: UserRole, path: string): boolean {
  const perm = ROUTE_PERMISSIONS.find((p) => path.startsWith(p.path));
  if (!perm) return true;
  return perm.allowedRoles.includes(role);
}

export const ROLE_BADGE_COLORS: Record<UserRole, string> = {
  Owner: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
  Manager: 'bg-brand-500/15 text-brand-600 dark:text-brand-400 border-brand-500/30',
  Supervisor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  Worker: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30',
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  Owner: 'Full executive control over company financials, user management, and platform configuration.',
  Manager: 'Oversees operational workflows, customer relationships, quotations, inventory, and analytics.',
  Supervisor: 'Manages daily shop floor operations, machine schedules, quality assurance, and worker dispatch.',
  Worker: 'Views assigned work orders, records task completions, and logs machine telemetry updates.',
};
