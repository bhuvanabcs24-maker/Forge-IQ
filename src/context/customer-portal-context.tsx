'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CustomerPortalUser } from '@/types/customer-portal';
import { MOCK_CUSTOMERS } from '@/lib/mock-data/manufacturing';

interface CustomerPortalContextType {
  currentCustomer: CustomerPortalUser;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, customerId?: string) => void;
  logout: () => void;
  switchCustomerAccount: (customerId: string) => void;
}

const DEFAULT_PORTAL_USER: CustomerPortalUser = {
  id: 'usr-cust-1',
  customerId: 'cust-1',
  companyName: 'Apex Aerospace Solutions',
  contactName: 'Robert Vance',
  email: 'rvance@apexaero.com',
  phone: '+1 (555) 234-5678',
  role: 'CustomerAdmin',
};

const CustomerPortalContext = createContext<CustomerPortalContextType | undefined>(undefined);

export function CustomerPortalProvider({ children }: { children: React.ReactNode }) {
  const [currentCustomer, setCurrentCustomer] = useState<CustomerPortalUser>(DEFAULT_PORTAL_USER);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check saved customer session on client mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('FORGEIQ_CUSTOMER_USER');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.email) {
            setCurrentCustomer(parsed);
            setIsAuthenticated(true);
          }
        }
      } catch (e) {
        console.warn('Error reading customer session:', e);
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = (email: string, customerId?: string) => {
    const cust =
      MOCK_CUSTOMERS.find((c) => c.id === customerId || c.email.toLowerCase() === email.toLowerCase()) ||
      MOCK_CUSTOMERS[0];

    const newUser: CustomerPortalUser = {
      id: `usr-${cust.id}`,
      customerId: cust.id,
      companyName: cust.companyName,
      contactName: cust.contactName,
      email: email || cust.email,
      phone: cust.phone,
      role: 'CustomerAdmin',
    };

    setCurrentCustomer(newUser);
    setIsAuthenticated(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('FORGEIQ_CUSTOMER_USER', JSON.stringify(newUser));
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('FORGEIQ_CUSTOMER_USER');
    }
  };

  const switchCustomerAccount = (customerId: string) => {
    const cust = MOCK_CUSTOMERS.find((c) => c.id === customerId) || MOCK_CUSTOMERS[0];
    const updated: CustomerPortalUser = {
      id: `usr-${cust.id}`,
      customerId: cust.id,
      companyName: cust.companyName,
      contactName: cust.contactName,
      email: cust.email,
      phone: cust.phone,
      role: 'CustomerAdmin',
    };
    setCurrentCustomer(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('FORGEIQ_CUSTOMER_USER', JSON.stringify(updated));
    }
  };

  return (
    <CustomerPortalContext.Provider
      value={{
        currentCustomer,
        isAuthenticated,
        isLoading,
        login,
        logout,
        switchCustomerAccount,
      }}
    >
      {children}
    </CustomerPortalContext.Provider>
  );
}

export function useCustomerPortal() {
  const ctx = useContext(CustomerPortalContext);
  if (!ctx) throw new Error('useCustomerPortal must be used within CustomerPortalProvider');
  return ctx;
}
