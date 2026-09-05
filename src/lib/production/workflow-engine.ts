import {
  WorkflowTemplate,
  WorkflowStage,
  ProductionJobCard,
  StageAuditEntry,
} from '@/types/production-planner';
import { FABRICATION_WORKFLOW_TEMPLATE, ALL_WORKFLOW_TEMPLATES } from './default-templates';

export class WorkflowEngine {
  private templates: WorkflowTemplate[] = ALL_WORKFLOW_TEMPLATES;

  getActiveTemplate(industry: string = 'Fabrication'): WorkflowTemplate {
    return (
      this.templates.find((t) => t.industry === industry) ||
      FABRICATION_WORKFLOW_TEMPLATE
    );
  }

  getStageById(stageId: string, industry: string = 'Fabrication'): WorkflowStage | undefined {
    const tmpl = this.getActiveTemplate(industry);
    return tmpl.stages.find((s) => s.id === stageId);
  }

  transitionJobStage(
    job: ProductionJobCard,
    targetStageId: string,
    user: string = 'Sarah Jenkins',
    role: any = 'Manager',
    notes?: string
  ): ProductionJobCard {
    const activeTmpl = this.getActiveTemplate();
    const currentStage = activeTmpl.stages.find((s) => s.id === job.currentStageId);
    const targetStage = activeTmpl.stages.find((s) => s.id === targetStageId);

    if (!targetStage) return job;

    const auditEntry: StageAuditEntry = {
      id: `audit-${Date.now()}`,
      fromStage: currentStage?.name || job.currentStageId,
      toStage: targetStage.name,
      timestamp: new Date().toISOString(),
      user,
      role,
      notes: notes || `Moved job from ${currentStage?.name} to ${targetStage.name}`,
    };

    const progressPct = Math.round(
      ((targetStage.orderIndex + 1) / activeTmpl.stages.length) * 100
    );

    return {
      ...job,
      currentStageId: targetStage.id,
      progressPercent: Math.min(100, progressPct),
      auditTrail: [auditEntry, ...job.auditTrail],
    };
  }
}

export const globalWorkflowEngine = new WorkflowEngine();
