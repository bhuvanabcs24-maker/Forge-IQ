'use client';

import React, { useState, useEffect } from 'react';
import {
  ProductionJobCard,
  WorkflowStage,
} from '@/types/production-planner';
import { globalWorkflowEngine } from '@/lib/production/workflow-engine';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  RefreshCw,
} from 'lucide-react';

export function KanbanBoard() {
  const activeTemplate = globalWorkflowEngine.getActiveTemplate();

  const [jobs, setJobs] = useState<ProductionJobCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeAiModalJob, setActiveAiModalJob] = useState<ProductionJobCard | null>(null);
  const [activeAuditModalJob, setActiveAuditModalJob] = useState<ProductionJobCard | null>(null);

  const fetchJobs = () => {
    setLoading(true);
    fetch('/api/production/jobs')
      .then((res) => res.json())
      .then((data) => {
        if (data.jobs && data.jobs.length > 0) {
          setJobs(data.jobs);
        }
      })
      .catch((err) => console.error('Failed to load production jobs:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleMoveStage = async (jobId: string, direction: 'forward' | 'backward') => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;

    const stages = activeTemplate.stages;
    const currentIndex = stages.findIndex((s) => s.id === job.currentStageId);
    const targetIndex = direction === 'forward' ? currentIndex + 1 : currentIndex - 1;

    if (targetIndex >= 0 && targetIndex < stages.length) {
      const targetStage = stages[targetIndex];
      const updatedJob = globalWorkflowEngine.transitionJobStage(job, targetStage.id);

      // Optimistic update
      setJobs((prev) => prev.map((j) => (j.id === jobId ? updatedJob : j)));

      // Persist to Neon DB and synchronize Order status
      try {
        await fetch('/api/production/jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: job.id,
            jobId: job.jobId,
            currentStageId: targetStage.id,
            progressPercent: updatedJob.progressPercent,
          }),
        });
      } catch (err) {
        console.error('Failed to sync job stage with database:', err);
      }
    }
  };

  const handleSaveSchedule = async (mId: string, wId: string, isOverridden: boolean) => {
    if (!activeAiModalJob) return;

    const mName = MOCK_MACHINES.find((m) => m.id === mId)?.name || activeAiModalJob.assignedMachineName;
    const wName = MOCK_WORKERS.find((w) => w.id === wId)?.fullName || activeAiModalJob.assignedWorkerName;

    setJobs((prev) =>
      prev.map((j) =>
        j.id === activeAiModalJob.id
          ? {
              ...j,
              assignedMachineId: mId,
              assignedMachineName: mName,
              assignedWorkerId: wId,
              assignedWorkerName: wName,
              isManagerOverridden: isOverridden,
            }
          : j
      )
    );

    // Persist to DB
    try {
      await fetch('/api/production/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: activeAiModalJob.id,
          jobId: activeAiModalJob.jobId,
          assignedMachineId: mId,
          assignedWorkerId: wId,
        }),
      });
    } catch (err) {
      console.error('Failed to save schedule to database:', err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-steel-200">
            Active Multi-Stage Shop Floor Workflow
          </h3>
          <p className="text-xs text-slate-500 dark:text-steel-400">
            {activeTemplate.name} — Real-time live synchronization with Neon PostgreSQL database
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchJobs} disabled={loading} className="text-xs">
            <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} /> Sync Shop Floor
          </Button>
          <Badge className="bg-brand-500/10 text-brand-600 border-brand-500/30">
            {jobs.length} Active Dispatch Jobs
          </Badge>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 dark:text-steel-400">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-brand-500" />
          <p className="text-sm">Connecting to shop floor dispatch in Neon database...</p>
        </div>
      ) : (
        /* Kanban Columns */
        <div className="flex gap-3 overflow-x-auto pb-4 pt-1">
          {activeTemplate.stages.map((stage) => {
            const stageJobs = jobs.filter((j) => j.currentStageId === stage.id);

            return (
              <div
                key={stage.id}
                className="flex flex-col w-72 shrink-0 rounded-xl border border-slate-200 dark:border-steel-800 bg-slate-50/50 dark:bg-steel-900/50 p-2.5 max-h-[78vh]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-steel-800">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        stage.id === 'material_ready'
                          ? 'bg-amber-500'
                          : stage.id === 'laser_cutting'
                          ? 'bg-blue-500'
                          : stage.id === 'bending'
                          ? 'bg-purple-500'
                          : stage.id === 'welding'
                          ? 'bg-orange-500'
                          : stage.id === 'finishing'
                          ? 'bg-pink-500'
                          : stage.id === 'quality_check'
                          ? 'bg-indigo-500'
                          : stage.id === 'dispatch'
                          ? 'bg-emerald-500'
                          : 'bg-slate-400'
                      }`}
                    />
                    <span className="font-semibold text-xs text-slate-800 dark:text-steel-200">
                      {stage.name}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-steel-800 text-slate-700 dark:text-steel-300">
                    {stageJobs.length}
                  </span>
                </div>

                {/* Job Cards */}
                <div className="space-y-2 overflow-y-auto flex-1 pr-1">
                  {stageJobs.length === 0 && (
                    <div className="p-4 text-center text-[11px] text-slate-400 dark:text-steel-600 border border-dashed border-slate-200 dark:border-steel-800 rounded-lg">
                      No jobs in stage
                    </div>
                  )}

                  {stageJobs.map((job) => (
                    <div
                      key={job.id}
                      className="p-3 rounded-lg border border-slate-200 dark:border-steel-800 bg-white dark:bg-steel-900 shadow-xs hover:border-brand-500/50 transition-all space-y-2.5"
                    >
                      {/* Top row: Priority badge + Job code */}
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-steel-400">
                          {job.orderNumber}
                        </span>
                        <Badge
                          className={
                            job.priority === 'Rush'
                              ? 'bg-rose-500/15 text-rose-600 border-rose-500/30 text-[10px]'
                              : job.priority === 'High'
                              ? 'bg-amber-500/15 text-amber-600 border-amber-500/30 text-[10px]'
                              : 'bg-slate-100 text-slate-700 dark:bg-steel-800 dark:text-steel-300 text-[10px]'
                          }
                        >
                          {job.priority}
                        </Badge>
                      </div>

                      {/* Part Title & Customer */}
                      <div>
                        <div className="font-semibold text-xs text-slate-800 dark:text-steel-100 line-clamp-1">
                          {job.partTitle}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-steel-400 truncate">
                          {job.customerName}
                        </div>
                      </div>

                      {/* Real-World Connected Material Reservation */}
                      {job.materialReservation && (
                        <div
                          className={`flex items-center justify-between text-[11px] p-1.5 rounded border ${
                            job.materialReservation.hasShortage
                              ? 'border-rose-500/30 bg-rose-500/10 text-rose-600'
                              : 'border-slate-200 dark:border-steel-800/80 bg-slate-50 dark:bg-steel-950/40 text-slate-600 dark:text-steel-400'
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            <Boxes className="h-3 w-3" />
                            <span className="truncate max-w-[120px]">
                              {job.materialReservation.requiredSku}
                            </span>
                          </div>
                          <span className="font-semibold text-[10px]">
                            {job.materialReservation.hasShortage ? (
                              <span className="flex items-center gap-0.5 text-rose-600 font-bold">
                                <AlertTriangle className="h-3 w-3" /> Shortage
                              </span>
                            ) : (
                              `${job.materialReservation.requiredQuantity} ${job.materialReservation.unit} Rsvd`
                            )}
                          </span>
                        </div>
                      )}

                      {/* Machine & Worker Assignment */}
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-steel-400 pt-1 border-t border-slate-100 dark:border-steel-800/60">
                        <div className="flex items-center gap-1 truncate max-w-[140px]">
                          <Cpu className="h-3 w-3 text-brand-500" />
                          <span className="truncate">{job.assignedMachineName || 'Unassigned'}</span>
                        </div>
                        <button
                          onClick={() => setActiveAiModalJob(job)}
                          className="flex items-center gap-1 text-[10px] text-purple-600 dark:text-purple-400 font-bold hover:underline"
                        >
                          <Sparkles className="h-3 w-3" /> Reassign
                        </button>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-semibold text-slate-500 dark:text-steel-400">
                          <span>Progress</span>
                          <span>{job.progressPercent}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-steel-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-500 rounded-full transition-all duration-300"
                            style={{ width: `${job.progressPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Footer Actions: Audit + Move Stage */}
                      <div className="flex items-center justify-between pt-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-1.5 text-[10px] text-slate-500 hover:text-slate-900"
                          onClick={() => setActiveAuditModalJob(job)}
                        >
                          <Eye className="h-3 w-3 mr-1" /> Details
                        </Button>

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
      )}

      {/* Modals */}
      {activeAiModalJob && (
        <AiScheduleModal
          isOpen={!!activeAiModalJob}
          onClose={() => setActiveAiModalJob(null)}
          job={activeAiModalJob}
          onSaveSchedule={handleSaveSchedule}
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
