'use client';

import React, { createContext, useContext, useState } from 'react';
import { UserProfile, UserRole, NotificationItem } from '@/types';
import { MOCK_NOTIFICATIONS } from '@/lib/mock-data/manufacturing';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  setRole: (role: UserRole) => void;
  notifications: NotificationItem[];
  unreadCount: number;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (open: boolean) => void;
  login: (email: string, role?: UserRole) => void;
  logout: () => void;
}

const DEFAULT_USER: UserProfile = {
  id: 'usr-001',
  email: 'owner@forgeiq.com',
  fullName: 'Sarah Jenkins',
  role: 'Owner',
  department: 'Executive Operations',
  phone: '+1 (555) 019-2831',
  createdAt: '2024-01-01',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(DEFAULT_USER);
  const [role, setRoleState] = useState<UserRole>('Owner');
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (user) {
      setUser({ ...user, role: newRole });
    }
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const login = (email: string, targetRole: UserRole = 'Owner') => {
    setUser({
      id: 'usr-002',
      email,
      fullName: email.split('@')[0].replace('.', ' ').toUpperCase(),
      role: targetRole,
      department: 'Manufacturing Ops',
      createdAt: new Date().toISOString().split('T')[0],
    });
    setRoleState(targetRole);
  };

  const logout = () => {
    setUser(null);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        setRole,
        notifications,
        unreadCount,
        markNotificationRead,
        clearAllNotifications,
        isNotificationsOpen,
        setIsNotificationsOpen,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
