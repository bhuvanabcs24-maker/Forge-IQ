import { Customer } from '@/types';
import { MOCK_CUSTOMERS } from '@/lib/mock-data/manufacturing';

export interface CustomerMatchResult {
  matchedCustomer: Customer;
  isExisting: boolean;
  matchScore: number; // 0-100
}

export function matchOrCreateCustomer(
  companyName: string,
  contactName: string,
  email: string,
  phone: string,
  existingCustomers: Customer[] = MOCK_CUSTOMERS
): CustomerMatchResult {
  const normCompany = companyName.trim().toLowerCase();
  const normEmail = email.trim().toLowerCase();

  // Search exact or fuzzy match
  const exactMatch = existingCustomers.find(
    (c) =>
      c.companyName.toLowerCase() === normCompany ||
      (normEmail && c.email.toLowerCase() === normEmail)
  );

  if (exactMatch) {
    return {
      matchedCustomer: exactMatch,
      isExisting: true,
      matchScore: 98,
    };
  }

  // Partial match search
  const partialMatch = existingCustomers.find((c) =>
    c.companyName.toLowerCase().includes(normCompany) || normCompany.includes(c.companyName.toLowerCase())
  );

  if (partialMatch) {
    return {
      matchedCustomer: partialMatch,
      isExisting: true,
      matchScore: 84,
    };
  }

  // Create new Customer record
  const newCustomer: Customer = {
    id: `cust-${Date.now()}`,
    companyName: companyName || 'New Client Account',
    contactName: contactName || 'Primary Contact',
    email: email || 'contact@client.com',
    phone: phone || '+1 (555) 000-0000',
    industry: 'Fabrication Client (Auto-Created via AI Intake)',
    address: 'Address pending verification',
    status: 'Active',
    totalOrders: 1,
    lifetimeValue: 0,
    createdAt: new Date().toISOString().split('T')[0],
  };

  return {
    matchedCustomer: newCustomer,
    isExisting: false,
    matchScore: 100,
  };
}
