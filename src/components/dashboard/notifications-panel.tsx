'use client';

import React from 'react';
import { useAuth } from '@/context/auth-context';
import { X, Check, Bell, AlertTriangle, Info, CheckCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function NotificationsPanel({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { notifications, markNotificationRead, clearAllNotifications } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-sm border-l border-slate-200 dark:border-steel-800 bg-white dark:bg-steel-900 shadow-2xl flex flex-col z-10">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-steel-800">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-brand-500" />
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                Activity & Alerts
              </h3>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={clearAllNotifications}
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
                title="Clear all"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={onClose}
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length > 0 ? (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => markNotificationRead(item.id)}
                  className={cn(
                    'p-3 rounded-lg border text-xs transition-all cursor-pointer relative',
                    item.read
                      ? 'border-slate-200 dark:border-steel-800/80 bg-slate-50/50 dark:bg-steel-900/40 opacity-75'
                      : 'border-brand-500/30 bg-brand-500/5 dark:bg-brand-500/10'
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 shrink-0">
                      {item.type === 'warning' && (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      )}
                      {item.type === 'success' && (
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                      )}
                      {item.type === 'info' && <Info className="h-4 w-4 text-blue-500" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {item.title}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-steel-500">
                          {item.timestamp}
                        </span>
                      </div>
                      <p className="mt-1 text-slate-600 dark:text-steel-300 leading-relaxed">
                        {item.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-xs text-slate-400 dark:text-steel-500">
                No notifications right now.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
