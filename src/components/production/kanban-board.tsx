'use client';

import React, { useState } from 'react';
import {
  ProductionJobCard,
  WorkflowStage,
} from '@/types/production-planner';
import { globalWorkflowEngine } from '@/lib/production/workflow-engine';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { checkAndReserveMaterial } from '@/lib/production/inventory-reservation';
import { recommendScheduleForJob } from '@/lib/ai/production-scheduler';
import { AiScheduleModal } from './ai-schedule-modal';
import { JobDetailModal } from './job-detail-modal';
import { formatCurrency } from '@/lib/utils';
import { MOCK_MACHINES, MOCK_WORKERS } from '@/lib/mock-data/manufacturing';
import {
  Sparkles,
  Boxes,
  Cpu,
  UserCheck,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Eye,
  Play,
  CheckCircle2,
} from 'lucide-react';

export function KanbanBoard() {
  const activeTemplate = globalWorkflowEngine.getActiveTemplate();

  const [jobs, setJobs] = useState<ProductionJobCard[]>([
    {
      id: 'job-101',
      jobId: 'JOB-2026-0891',
      orderNumber: 'WO-2026-0891',
      customerName: 'Apex Aerospace Solutions',
      partTitle: 'Laser Cut Titanium Flanges',
      priority: 'Rush',
      currentStageId: 'laser_cutting',
      progressPercent: 35,
      dueDate: '2026-08-15',
      estimatedHours: 14,
      materialReservation: checkAndReserveMaterial('304 Stainless Steel', 85),
      aiRecommendation: recommendScheduleForJob('laser_cutting', 'Laser Cut Titanium Flanges'),
      assignedMachineId: 'mach-1',
      assignedMachineName: 'TRUMPF Fiber Laser 01',
      assignedWorkerId: 'wrk-1',
      assignedWorkerName: 'Marcus Vance',
      auditTrail: [
        {
          id: 'a-1',
          fromStage: 'Scheduled',
          toStage: 'Laser Cutting',
          timestamp: '2026-08-07T10:00:00Z',
          user: 'Marcus Vance',
          role: 'Supervisor',
        },
      ],
      createdAt: '2026-08-01',
    },
    {
      id: 'job-102',
      jobId: 'JOB-2026-0892',
      orderNumber: 'WO-2026-0892',
      customerName: 'Vanguard Enclosures Inc.',
      partTitle: 'NEMA 4X Stainless Cabinets',
      priority: 'High',
      currentStageId: 'bending',
      progressPercent: 45,
      dueDate: '2026-08-18',
      estimatedHours: 22,
      materialReservation: checkAndReserveMaterial('Aluminum 6061', 25), // Shortage trigger
      aiRecommendation: recommendScheduleForJob('bending', 'NEMA 4X Stainless Cabinets'),
      assignedMachineId: 'mach-2',
      assignedMachineName: 'Bystronic Press Brake 01',
      assignedWorkerId: 'wrk-2',
      assignedWorkerName: 'Alex Rivera',
      auditTrail: [],
      createdAt: '2026-07-28',
    },
    {
      id: 'job-103',
      jobId: 'JOB-2026-0893',
      orderNumber: 'WO-2026-0893',
      customerName: 'Titan Heavy Machinery',
      partTitle: 'Excavator Bucket Liners',
      priority: 'Normal',
      currentStageId: 'welding',
      progressPercent: 65,
      dueDate: '2026-08-22',
      estimatedHours: 18,
      materialReservation: checkAndReserveMaterial('A36 Carbon Steel', 40),
      aiRecommendation: recommendScheduleForJob('welding', 'Excavator Bucket Liners'),
      assignedMachineId: 'mach-3',
      assignedMachineName: 'Robotic Welder Cell',
      assignedWorkerId: 'wrk-3',
      assignedWorkerName: 'Dmitri Volkov',
      auditTrail: [],
      createdAt: '2026-08-03',
    },
    {
      id: 'job-104',
      jobId: 'JOB-2026-0894',
      orderNumber: 'WO-2026-0894',
      customerName: 'Precision HVAC Systems',
      partTitle: 'Air Handling Transition Boxes',
      priority: 'Normal',
      currentStageId: 'material_ready',
      progressPercent: 10,
      dueDate: '2026-08-28',
      estimatedHours: 8,
      materialReservation: checkAndReserveMaterial('304 Stainless Steel', 15),
      aiRecommendation: recommendScheduleForJob('material_ready', 'Air Handling Transition Boxes'),
      auditTrail: [],
      createdAt: '2026-08-05',
    },
  ]);

  const [activeAiModalJob, setActiveAiModalJob] = useState<ProductionJobCard | null>(null);
  const [activeAuditModalJob, setActiveAuditModalJob] = useState<ProductionJobCard | null>(null);

  const handleMoveStage = (jobId: string, direction: 'forward' | 'backward') => {
    setJobs((prev) =>
      prev.map((j) => {
        if (j.id === jobId) {
          const stages = activeTemplate.stages;
          const currentIndex = stages.findIndex((s) => s.id === j.currentStageId);
          const targetIndex = direction === 'forward' ? currentIndex + 1 : currentIndex - 1;

          if (targetIndex >= 0 && targetIndex < stages.length) {
            const targetStage = stages[targetIndex];
            return globalWorkflowEngine.transitionJobStage(j, targetStage.id);
          }
        }
        return j;
      })
    );
  };

  return (
    <div className="space-y-4">
      {/* Multi-Stage Columns Container */}
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1">
        {activeTemplate.stages.map((stage) => {
          const stageJobs = jobs.filter((j) => j.currentStageId === stage.id);

          return (
            <div
              key={stage.id}
              className="w-72 shrink-0 flex flex-col rounded-2xl border border-slate-200 dark:border-steel-800 bg-slate-100/70 dark:bg-steel-900/60 p-3 max-h-[680px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-steel-800 mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: stage.color }}
                  />
                  <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                    {stage.name}
                  </h3>
                </div>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 dark:bg-steel-800 text-[10px] font-bold text-slate-700 dark:text-steel-300">
                  {stageJobs.length}
                </span>
              </div>

              {/* Cards Stream */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {stageJobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-steel-800 bg-white dark:bg-steel-900 shadow-sm hover:shadow-md transition-all space-y-2.5"
                  >
                    {/* Header Badges */}
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-brand-600 dark:text-brand-400 text-xs">
                        {job.orderNumber}
                      </span>
                      <Badge
                        variant={
                          job.priority === 'Rush'
                            ? 'danger'
                            : job.priority === 'High'
                            ? 'warning'
                            : 'secondary'
                        }
                        className="text-[9px]"
                      >
                        {job.priority}
                      </Badge>
                    </div>

                    {/* Part Title & Customer */}
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs line-clamp-1">
                        {job.partTitle}
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-steel-400 truncate">
                        {job.customerName}
                      </p>
                    </div>

                    {/* Material Reservation Status Badge */}
                    {job.materialReservation.hasShortage ? (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                        <AlertTriangle className="h-3 w-3 shrink-0" /> Stock Shortage ({job.materialReservation.shortageAmount} {job.materialReservation.unit} missing)
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                        <Boxes className="h-3 w-3 shrink-0 text-emerald-500" /> Material Reserved ({job.materialReservation.requiredSku})
                      </div>
                    )}

                    {/* AI Assignment Badge */}
                    <div className="flex items-center justify-between text-[10px] text-slate-600 dark:text-steel-300 pt-1 border-t border-slate-100 dark:border-steel-800">
                      <span className="flex items-center gap-1 truncate">
                        <Cpu className="h-3 w-3 text-brand-500 shrink-0" />
                        {job.assignedMachineName || job.aiRecommendation.recommendedMachineName}
                      </span>
                      <button
                        onClick={() => setActiveAiModalJob(job)}
                        className="text-purple-500 font-bold hover:underline shrink-0"
                      >
                        AI Schedule
                      </button>
                    </div>

                    {/* Progress & Actions Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-steel-800">
                      <button
                        onClick={() => setActiveAuditModalJob(job)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        title="View audit trail"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleMoveStage(job.id, 'backward')}
                        >
                          <ChevronLeft className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleMoveStage(job.id, 'forward')}
                        >
                          <ChevronRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {activeAiModalJob && (
        <AiScheduleModal
          isOpen={!!activeAiModalJob}
          onClose={() => setActiveAiModalJob(null)}
          job={activeAiModalJob}
          onSaveSchedule={(mId, wId, isOverridden) => {
            setJobs((prev) =>
              prev.map((j) =>
                j.id === activeAiModalJob.id
                  ? {
                      ...j,
                      assignedMachineId: mId,
                      assignedMachineName:
                        MOCK_MACHINES.find((m) => m.id === mId)?.name || j.assignedMachineName,
                      assignedWorkerId: wId,
                      assignedWorkerName:
                        MOCK_WORKERS.find((w) => w.id === wId)?.fullName || j.assignedWorkerName,
                      isManagerOverridden: isOverridden,
                    }
                  : j
              )
            );
          }}
        />
      )}

      {activeAuditModalJob && (
        <JobDetailModal
          isOpen={!!activeAuditModalJob}
          onClose={() => setActiveAuditModalJob(null)}
          job={activeAuditModalJob}
        />
      )}
    </div>
  );
}
