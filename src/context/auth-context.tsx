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
  login: (email: string, role?: UserRole, profile?: Partial<UserProfile>) => void;
  logout: () => void;
}

const DEFAULT_USER: UserProfile = {
  id: 'usr-admin',
  email: 'admin@forgeiq.com',
  fullName: 'Plant Administrator',
  role: 'Owner',
  department: 'Executive Operations',
  createdAt: '2024-01-01',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(DEFAULT_USER);
  const [role, setRoleState] = useState<UserRole>('Owner');
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Restore authenticated session from localStorage if present
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('FORGEIQ_AUTH_USER');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.email) {
            setUser(parsed);
            if (parsed.role) setRoleState(parsed.role);
          }
        }
      } catch (err) {
        console.warn('Failed to parse cached user', err);
      }
    }
  }, []);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (user) {
      const updated = { ...user, role: newRole };
      setUser(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem('FORGEIQ_AUTH_USER', JSON.stringify(updated));
      }
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

  const login = (email: string, targetRole: UserRole = 'Owner', profile?: Partial<UserProfile>) => {
    const updatedUser: UserProfile = {
      id: profile?.id || 'usr-' + Date.now().toString(36),
      email,
      fullName: profile?.fullName || email.split('@')[0].replace(/[._-]/g, ' ').toUpperCase(),
      role: targetRole,
      department: profile?.department || 'Executive Operations',
      phone: profile?.phone,
      createdAt: profile?.createdAt || new Date().toISOString().split('T')[0],
    };
    setUser(updatedUser);
    setRoleState(targetRole);
    if (typeof window !== 'undefined') {
      localStorage.setItem('FORGEIQ_AUTH_USER', JSON.stringify(updatedUser));
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('FORGEIQ_AUTH_USER');
      window.location.href = '/login';
    }
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
