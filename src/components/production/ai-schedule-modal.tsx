'use client';

import React, { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ProductionJobCard } from '@/types/production-planner';
import { MOCK_MACHINES, MOCK_WORKERS } from '@/lib/mock-data/manufacturing';
import { Sparkles, Cpu, UserCheck, Check, AlertCircle } from 'lucide-react';

interface AiScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: ProductionJobCard;
  onSaveSchedule: (machineId: string, workerId: string, isOverridden: boolean) => void;
}

export function AiScheduleModal({
  isOpen,
  onClose,
  job,
  onSaveSchedule,
}: AiScheduleModalProps) {
  const [selectedMachine, setSelectedMachine] = useState(
    job.assignedMachineId || job.aiRecommendation.recommendedMachineId
  );
  const [selectedWorker, setSelectedWorker] = useState(
    job.assignedWorkerId || job.aiRecommendation.recommendedWorkerId
  );
  const [isOverride, setIsOverride] = useState(job.isManagerOverridden || false);

  const handleSave = () => {
    onSaveSchedule(selectedMachine, selectedWorker, isOverride);
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`AI Schedule Recommendation - ${job.orderNumber}`} maxWidth="md">
      <div className="space-y-4 text-xs">
        {/* AI Recommendation Banner */}
        <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-500/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 text-sm">
              <Sparkles className="h-4 w-4 text-purple-500" /> Optimal Pairing Match
            </span>
            <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
              {job.aiRecommendation.matchScore}% AI Match
            </Badge>
          </div>
          <p className="text-slate-700 dark:text-steel-200 leading-relaxed">
            {job.aiRecommendation.aiReasoning}
          </p>
          <div className="text-[11px] text-slate-500 dark:text-steel-400">
            Est Completion: <strong>{job.aiRecommendation.estimatedCompletionDate}</strong> ({job.aiRecommendation.completionConfidence}% Confidence)
          </div>
        </div>

        {/* Assignment Controls */}
        <div className="space-y-3">
          <div>
            <label className="block font-semibold mb-1 flex items-center gap-1">
              <Cpu className="h-3.5 w-3.5 text-brand-500" /> Machine Assignment
            </label>
            <Select
              options={MOCK_MACHINES.map((m) => ({ label: `${m.name} (${m.status})`, value: m.id }))}
              value={selectedMachine}
              onChange={(e) => {
                setSelectedMachine(e.target.value);
                setIsOverride(true);
              }}
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 flex items-center gap-1">
              <UserCheck className="h-3.5 w-3.5 text-emerald-500" /> Operator / Specialist
            </label>
            <Select
              options={MOCK_WORKERS.map((w) => ({ label: `${w.fullName} (${w.specialization})`, value: w.id }))}
              value={selectedWorker}
              onChange={(e) => {
                setSelectedWorker(e.target.value);
                setIsOverride(true);
              }}
            />
          </div>
        </div>

        {isOverride && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Manager Override active. Custom machine & worker assignment will take priority over AI recommendation.</span>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-steel-800">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Confirm Schedule Assignment
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
