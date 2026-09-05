export type UserRole = 'Owner' | 'Manager' | 'Supervisor' | 'Worker';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  department?: string;
  phone?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  industry: string;
  address: string;
  status: 'Active' | 'Lead' | 'Inactive';
  totalOrders: number;
  lifetimeValue: number;
  createdAt: string;
}

export interface QuotationLineItem {
  id: string;
  partName: string;
  material: string;
  thickness: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerId: string;
  customerName: string;
  title: string;
  status: 'Draft' | 'Sent' | 'Approved' | 'Rejected' | 'Expired';
  totalAmount: number;
  lineItems: QuotationLineItem[];
  validUntil: string;
  createdAt: string;
}

export type OrderPriority = 'Low' | 'Normal' | 'High' | 'Rush';
export type OrderStatus = 'Pending' | 'In Production' | 'Quality Check' | 'Ready for Shipping' | 'Completed' | 'Cancelled';

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  title: string;
  priority: OrderPriority;
  status: OrderStatus;
  progressPercent: number;
  totalAmount: number;
  dueDate: string;
  assignedSupervisor?: string;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: 'Sheet Metal' | 'Tube & Pipe' | 'Hardware & Fasteners' | 'Consumable' | 'Finished Part';
  materialGrade: string; // e.g. 304 Stainless, 6061 Aluminum, A36 Steel
  quantity: number;
  unit: 'Sheets' | 'Pcs' | 'Kg' | 'Meters' | 'Boxes';
  reorderPoint: number;
  unitCost: number;
  location: string;
  lastRestocked: string;
}

export interface Machine {
  id: string;
  code: string;
  name: string;
  type: 'Laser Cutter' | 'CNC Press Brake' | 'Robotic Welder' | 'Powder Coat Line' | 'Deburring Machine';
  status: 'Operational' | 'In Use' | 'Maintenance' | 'Offline';
  efficiencyRate: number; // percentage e.g. 94.5
  hoursLoggedThisMonth: number;
  lastMaintenance: string;
  nextScheduledMaintenance: string;
  assignedOperator?: string;
}

export interface Worker {
  id: string;
  employeeCode: string;
  fullName: string;
  role: UserRole;
  specialization: string; // e.g. Laser Operator, TIG Welder, Brake Press Specialist
  shift: 'Morning' | 'Afternoon' | 'Night';
  status: 'Active' | 'On Leave' | 'Off Shift';
  certifications: string[];
  hourlyRate: number;
  assignedMachine?: string;
}

export interface Supplier {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  materialsSupplied: string[];
  averageLeadTimeDays: number;
  rating: number; // 1-5
  status: 'Preferred' | 'Active' | 'Under Review';
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  status: 'Draft' | 'Sent' | 'Partial' | 'Received' | 'Cancelled';
  totalCost: number;
  itemCount: number;
  expectedDelivery: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  customerName: string;
  amount: number;
  taxAmount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  dueDate: string;
  issuedDate: string;
}

export interface ActivityLog {
  id: string;
  user: string;
  role: UserRole;
  action: string;
  target: string;
  timestamp: string;
  type: 'order' | 'quotation' | 'inventory' | 'machine' | 'worker' | 'system';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'warning' | 'alert' | 'success';
}

export interface DashboardMetrics {
  totalOrders: number;
  ordersTrendPercent: number;
  pendingQuotations: number;
  quotationsTrendPercent: number;
  activeProductionJobs: number;
  jobsTrendPercent: number;
  lowInventoryAlerts: number;
  revenue: number;
  revenueTrendPercent: number;
  pendingPayments: number;
  overduePaymentsCount: number;
}
