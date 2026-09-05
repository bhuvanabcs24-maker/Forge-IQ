import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

export function getStatusBadgeVariant(status: string): string {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'approved':
    case 'operational':
    case 'active':
    case 'paid':
    case 'preferred':
    case 'received':
      return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30';
    
    case 'in production':
    case 'in use':
    case 'sent':
    case 'lead':
    case 'partial':
      return 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30';
    
    case 'pending':
    case 'quality check':
    case 'draft':
    case 'under review':
      return 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30';
    
    case 'critical':
    case 'cancelled':
    case 'offline':
    case 'overdue':
    case 'rejected':
    case 'expired':
      return 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30';
      
    case 'maintenance':
    case 'on leave':
      return 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30';

    default:
      return 'bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/30';
  }
}
