import { AiScheduleRecommendation } from '@/types/production-planner';
import { MOCK_MACHINES, MOCK_WORKERS } from '@/lib/mock-data/manufacturing';

export function recommendScheduleForJob(
  stageId: string,
  partTitle: string
): AiScheduleRecommendation {
  let matchedMachine = MOCK_MACHINES[0];
  let matchedWorker = MOCK_WORKERS[0];
  let matchScore = 96;

  if (stageId.includes('bending')) {
    matchedMachine = MOCK_MACHINES.find((m) => m.type.includes('Press Brake')) || MOCK_MACHINES[1];
    matchedWorker = MOCK_WORKERS.find((w) => w.specialization.includes('CNC Bending')) || MOCK_WORKERS[1];
    matchScore = 94;
  } else if (stageId.includes('welding')) {
    matchedMachine = MOCK_MACHINES.find((m) => m.type.includes('Welder')) || MOCK_MACHINES[2];
    matchedWorker = MOCK_WORKERS.find((w) => w.specialization.includes('Welding')) || MOCK_WORKERS[2];
    matchScore = 98;
  }

  const estCompletionDays = Math.floor(Math.random() * 4) + 3;
  const dueDate = new Date(Date.now() + estCompletionDays * 86400000).toISOString().split('T')[0];

  return {
    recommendedMachineId: matchedMachine.id,
    recommendedMachineName: matchedMachine.name,
    recommendedWorkerId: matchedWorker.id,
    recommendedWorkerName: matchedWorker.fullName,
    matchScore,
    aiReasoning: `Matched based on ${matchedMachine.name} (${matchedMachine.efficiencyRate}% OEE) and ${matchedWorker.fullName} (${matchedWorker.certifications.join(', ')}).`,
    estimatedCompletionDate: dueDate,
    completionConfidence: matchScore - 2,
  };
}
