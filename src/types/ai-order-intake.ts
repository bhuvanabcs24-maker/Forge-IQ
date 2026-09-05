import { OrderPriority } from './index';

export interface ExtractedField<T = string> {
  value: T;
  confidence: number; // 0 - 100
  isUserConfirmed?: boolean;
  originalExtractedValue?: T;
}

export interface ExtractedOrderData {
  customerName: ExtractedField<string>;
  companyName: ExtractedField<string>;
  phone: ExtractedField<string>;
  email: ExtractedField<string>;
  material: ExtractedField<string>;
  materialGrade: ExtractedField<string>;
  thickness: ExtractedField<string>;
  dimensions: ExtractedField<string>;
  quantity: ExtractedField<number>;
  deliveryDate: ExtractedField<string>;
  priority: ExtractedField<OrderPriority>;
  specialInstructions: ExtractedField<string>;
  drawingRefNumber: ExtractedField<string>;
}

export type DocumentProcessingStatus =
  | 'idle'
  | 'uploading'
  | 'ocr_processing'
  | 'ai_extracting'
  | 'review_required'
  | 'completed'
  | 'error';

export interface ProcessingTimelineStep {
  id: string;
  title: string;
  status: 'completed' | 'current' | 'pending' | 'error';
  timestamp?: string;
  details?: string;
}

export interface OrderIntakeRecord {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  filePreviewUrl?: string;
  rawOcrText: string;
  extractedData: ExtractedOrderData;
  status: DocumentProcessingStatus;
  processingTimeline: ProcessingTimelineStep[];
  createdOrderId?: string;
  createdCustomerId?: string;
  uploadedAt: string;
  ocrCompletedAt?: string;
  aiExtractedAt?: string;
  orderCreatedAt?: string;
}

export interface SampleDocumentPreset {
  id: string;
  title: string;
  type: 'WhatsApp Screenshot' | 'PDF Purchase Order' | 'Scanned Blueprint' | 'Email RFQ';
  description: string;
  fileName: string;
  mockExtractedData: ExtractedOrderData;
  mockOcrText: string;
}
