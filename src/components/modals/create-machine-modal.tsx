'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Machine, MachineStatus, MachineType } from '@/types';

const machineSchema = z.object({
  code: z.string().min(3, 'Machine Code is required (min 3 chars)'),
  name: z.string().min(3, 'Equipment Name is required'),
  type: z.enum(['Laser Cutter', 'CNC Press Brake', 'Robotic Welder', 'Powder Coat Line', 'Deburring Machine']),
  status: z.enum(['Operational', 'In Use', 'Maintenance', 'Offline']),
  efficiencyRate: z.coerce.number().min(50).max(100, 'Efficiency rate must be between 50% and 100%'),
});

type MachineFormValues = z.infer<typeof machineSchema>;

export function CreateMachineModal({
  isOpen,
  onClose,
  onAddMachine,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAddMachine: (newMachine: Machine) => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MachineFormValues>({
    resolver: zodResolver(machineSchema),
    defaultValues: {
      code: '',
      name: '',
      type: 'Laser Cutter',
      status: 'Operational',
      efficiencyRate: 95.0,
    },
  });

  const onSubmit = async (data: MachineFormValues) => {
    try {
      const res = await fetch('/api/machines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success && json.machine) {
        onAddMachine(json.machine);
        reset();
        onClose();
      } else {
        alert(json.message || 'Failed to register machine');
      }
    } catch (err: any) {
      alert('Error registering machine: ' + err?.message);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Register New Shop Floor Equipment" maxWidth="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-steel-300 mb-1">
              Machine Code
            </label>
            <Input placeholder="e.g. FIBER-LASER-02" {...register('code')} />
            {errors.code && (
              <span className="text-[11px] text-rose-500 mt-1 block">{errors.code.message}</span>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-steel-300 mb-1">
              Equipment Type
            </label>
            <Select
              options={[
                { label: 'Laser Cutter', value: 'Laser Cutter' },
                { label: 'CNC Press Brake', value: 'CNC Press Brake' },
                { label: 'Robotic Welder', value: 'Robotic Welder' },
                { label: 'Powder Coat Line', value: 'Powder Coat Line' },
                { label: 'Deburring Machine', value: 'Deburring Machine' },
              ]}
              {...register('type')}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-steel-300 mb-1">
            Equipment Brand & Model Description
          </label>
          <Input placeholder="e.g. Amada Ensis 3015 AJ 9kW Fiber Laser" {...register('name')} />
          {errors.name && (
            <span className="text-[11px] text-rose-500 mt-1 block">{errors.name.message}</span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-steel-300 mb-1">
              Initial Operational Status
            </label>
            <Select
              options={[
                { label: 'Operational', value: 'Operational' },
                { label: 'In Use', value: 'In Use' },
                { label: 'Maintenance', value: 'Maintenance' },
                { label: 'Offline', value: 'Offline' },
              ]}
              {...register('status')}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-steel-300 mb-1">
              Target OEE / Efficiency (%)
            </label>
            <Input type="number" step="0.1" {...register('efficiencyRate')} />
            {errors.efficiencyRate && (
              <span className="text-[11px] text-rose-500 mt-1 block">{errors.efficiencyRate.message}</span>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-steel-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Registering Equipment...' : 'Register Machine'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
