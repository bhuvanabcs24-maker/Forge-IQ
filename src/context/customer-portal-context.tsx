'use client';

import React, { createContext, useContext, useState } from 'react';
import { CustomerPortalUser } from '@/types/customer-portal';
import { MOCK_CUSTOMERS } from '@/lib/mock-data/manufacturing';

interface CustomerPortalContextType {
  currentCustomer: CustomerPortalUser;
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

  const switchCustomerAccount = (customerId: string) => {
    const cust = MOCK_CUSTOMERS.find((c) => c.id === customerId) || MOCK_CUSTOMERS[0];
    setCurrentCustomer({
      id: `usr-${cust.id}`,
      customerId: cust.id,
      companyName: cust.companyName,
      contactName: cust.contactName,
      email: cust.email,
      phone: cust.phone,
      role: 'CustomerAdmin',
    });
  };

  return (
    <CustomerPortalContext.Provider value={{ currentCustomer, switchCustomerAccount }}>
      {children}
    </CustomerPortalContext.Provider>
  );
}

export function useCustomerPortal() {
  const ctx = useContext(CustomerPortalContext);
  if (!ctx) throw new Error('useCustomerPortal must be used within CustomerPortalProvider');
  return ctx;
}
