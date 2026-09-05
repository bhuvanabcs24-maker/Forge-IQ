import { OrderStatus } from './index';

export type QuotationStatus = 'Draft' | 'Sent' | 'Approved' | 'Rejected' | 'Expired';

export interface CustomerPortalUser {
  id: string;
  customerId: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  role: 'CustomerAdmin' | 'CustomerViewer';
  avatarUrl?: string;
}

export interface StageMediaPhoto {
  id: string;
  stageId: string;
  stageName: string;
  photoUrl: string;
  caption: string;
  uploadedAt: string;
  operatorName: string;
}

export interface CustomerFeedbackRating {
  qualityScore: number; // 1 - 5
  communicationScore: number; // 1 - 5
  deliveryScore: number; // 1 - 5
  overallScore: number; // 1 - 5
  comments: string;
  submittedAt: string;
}

export interface ProductionMilestone {
  id: string;
  stageId: string;
  stageName: string;
  status: 'completed' | 'in_progress' | 'pending';
  completionDate?: string;
  startTime?: string;
  estimatedFinishTime?: string;
  machineName?: string;
  operatorName?: string;
  notes?: string;
  photo?: StageMediaPhoto;
}

export interface CustomerOrderView {
  id: string;
  orderNumber: string;
  title: string;
  status: OrderStatus;
  currentStageId: string;
  currentStageName: string;
  progressPercent: number;
  dueDate: string;
  estimatedDeliveryDate: string;
  aiCompletionConfidence: number;
  operatorName?: string;
  machineName?: string;
  trackingNumber?: string;
  courierName?: string;
  delayReasoning?: string;
  revisedEta?: string;
  milestones: ProductionMilestone[];
  stagePhotos?: StageMediaPhoto[];
  feedbackRating?: CustomerFeedbackRating;
}

export interface CustomerQuoteView {
  id: string;
  quotationNumber: string;
  title: string;
  status: QuotationStatus;
  totalAmount: number;
  validUntil: string;
  pdfUrl: string;
  lineItemsCount: number;
}

export interface CustomerInvoiceView {
  id: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  pdfUrl: string;
}
