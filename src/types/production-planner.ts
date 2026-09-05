import { OrderPriority, UserRole } from './index';
import { IndustryType } from './quotation-engine';

export type FabricationStageId =
  | 'material_ready'
  | 'scheduled'
  | 'laser_cutting'
  | 'bending'
  | 'welding'
  | 'finishing'
  | 'quality_check'
  | 'dispatch'
  | 'completed';

export interface WorkflowStage {
  id: string;
  name: string;
  description: string;
  color: string; // Tailwind color class or hex
  orderIndex: number;
}

export interface WorkflowTemplate {
  id: string;
  industry: IndustryType;
  name: string;
  description: string;
  stages: WorkflowStage[];
  isDefault?: boolean;
}

export interface InventoryReservationStatus {
  isReserved: boolean;
  requiredSku: string;
  requiredQuantity: number;
  availableQuantity: number;
  unit: string;
  hasShortage: boolean;
  shortageAmount?: number;
  recommendedPoNumber?: string;
}

export interface AiScheduleRecommendation {
  recommendedMachineId: string;
  recommendedMachineName: string;
  recommendedWorkerId: string;
  recommendedWorkerName: string;
  matchScore: number; // 0-100
  aiReasoning: string;
  estimatedCompletionDate: string;
  completionConfidence: number; // 0-100
}

export interface StageAuditEntry {
  id: string;
  fromStage: string;
  toStage: string;
  timestamp: string;
  user: string;
  role: UserRole;
  notes?: string;
}

export interface ProductionJobCard {
  id: string;
  jobId: string;
  orderNumber: string;
  customerName: string;
  partTitle: string;
  priority: OrderPriority;
  currentStageId: string;
  progressPercent: number;
  dueDate: string;
  estimatedHours: number;
  materialReservation: InventoryReservationStatus;
  aiRecommendation: AiScheduleRecommendation;
  assignedMachineId?: string;
  assignedMachineName?: string;
  assignedWorkerId?: string;
  assignedWorkerName?: string;
  isManagerOverridden?: boolean;
  auditTrail: StageAuditEntry[];
  createdAt: string;
}

export interface AiProductionInsight {
  id: string;
  type: 'bottleneck' | 'idle_machine' | 'delay_risk' | 'optimization';
  title: string;
  description: string;
  impactScore: 'High' | 'Medium' | 'Low';
  suggestedAction: string;
  affectedJobId?: string;
}
