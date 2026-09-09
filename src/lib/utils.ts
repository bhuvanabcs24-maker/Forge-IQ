import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatDate(dateString: any): string {
  if (!dateString) return '';
  try {
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    if (isNaN(date.getTime()) || !isFinite(date.getTime())) {
      return typeof dateString === 'string' ? dateString : '';
    }
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  } catch {
    return typeof dateString === 'string' ? dateString : '';
  }
}

export function formatTimeAgo(dateString: any): string {
  if (!dateString) return '';
  try {
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    if (isNaN(date.getTime()) || !isFinite(date.getTime())) {
      return typeof dateString === 'string' ? dateString : '';
    }
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  } catch {
    return '';
  }
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
    case 'running':
      return 'bg-[#ECFDF3] text-[#067647] border-[#ABEFC6] dark:bg-[#067647]/20 dark:text-[#32D583] dark:border-[#067647]/40';
    
    case 'in production':
    case 'in use':
    case 'sent':
    case 'lead':
    case 'partial':
    case 'info':
      return 'bg-[#EFF8FF] text-[#175CD3] border-[#B2DDFF] dark:bg-[#175CD3]/20 dark:text-[#84ADFF] dark:border-[#175CD3]/40';
    
    case 'pending':
    case 'quality check':
    case 'draft':
    case 'under review':
    case 'idle':
    case 'warning':
      return 'bg-[#FFFAEB] text-[#B54708] border-[#FEDF89] dark:bg-[#B54708]/20 dark:text-[#FDB022] dark:border-[#B54708]/40';
    
    case 'critical':
    case 'cancelled':
    case 'offline':
    case 'overdue':
    case 'rejected':
    case 'expired':
    case 'at risk':
      return 'bg-[#FEF3F2] text-[#B42318] border-[#FECDCA] dark:bg-[#B42318]/20 dark:text-[#FDA29B] dark:border-[#B42318]/40';
      
    case 'maintenance':
    case 'on leave':
      return 'bg-[#F9F5FF] text-[#6941C6] border-[#E9D7FE] dark:bg-[#6941C6]/20 dark:text-[#D6BBFB] dark:border-[#6941C6]/40';

    default:
      return 'bg-[#F9FAFB] text-[#344054] border-[#E4E7EC] dark:bg-[#18202A] dark:text-[#98A2B3] dark:border-[#252B33]';
  }
}
