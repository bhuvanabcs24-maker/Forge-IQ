'use client';

import React, { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Machine } from '@/types';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/data-table/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Cpu, Plus, Wrench, Activity, RefreshCw } from 'lucide-react';
import { CreateMachineModal } from '@/components/modals/create-machine-modal';

export default function MachinesPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddMachineOpen, setIsAddMachineOpen] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchMachines = () => {
    setLoading(true);
    fetch('/api/machines')
      .then((res) => res.json())
      .then((data) => {
        if (data.machines) {
          setMachines(data.machines);
        }
      })
      .catch((err) => console.error('Failed to fetch machines from database:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  const handleToggleMaintenance = async (m: Machine) => {
    setTogglingId(m.id);
    const newStatus = m.status === 'Maintenance' ? 'Operational' : 'Maintenance';
    try {
      const res = await fetch('/api/machines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: m.id, code: m.code, status: newStatus }),
      });
      const data = await res.json();
      if (data.success && data.machine) {
        setMachines((prev) =>
          prev.map((item) => (item.id === m.id ? data.machine : item))
        );
      } else {
        alert(data.message || 'Failed to update machine status');
      }
    } catch (err: any) {
      alert('Error updating machine: ' + err?.message);
    } finally {
      setTogglingId(null);
    }
  };

  const columns: ColumnDef<Machine>[] = [
    {
      accessorKey: 'code',
      header: 'Machine Code',
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EFF8FF] dark:bg-[#155EEF]/15 text-[#155EEF] font-bold text-xs border border-[#B2DDFF] dark:border-[#155EEF]/30">
            <Cpu className="h-4 w-4" />
          </div>
          <span className="font-mono font-semibold text-[#111827] dark:text-[#F2F4F7]">
            {row.original.code}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Equipment Name & Type',
      cell: ({ row }) => (
        <div>
          <div className="font-semibold text-[#111827] dark:text-[#F2F4F7]">
            {row.original.name}
          </div>
          <div className="text-xs text-[#667085] dark:text-[#98A2B3]">Type: {row.original.type}</div>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Operational State',
      cell: ({ row }) => <Badge status={row.original.status} />,
    },
    {
      accessorKey: 'efficiencyRate',
      header: 'OEE Efficiency Rate',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Activity className="h-3.5 w-3.5 text-[#067647] dark:text-[#32D583]" />
          <span className="font-bold text-[#111827] dark:text-[#F2F4F7] tabular-nums">
            {row.original.efficiencyRate}%
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'hoursLoggedThisMonth',
      header: 'Hours Logged',
      cell: ({ row }) => (
        <span className="text-xs font-medium text-[#344054] dark:text-[#D0D5DD] tabular-nums">{row.original.hoursLoggedThisMonth} hrs</span>
      ),
    },
    {
      accessorKey: 'nextScheduledMaintenance',
      header: 'Next Maintenance',
      cell: ({ row }) => (
        <span className="text-xs text-[#667085] dark:text-[#98A2B3]">{row.original.nextScheduledMaintenance}</span>
      ),
    },
    {
      id: 'actions',
      header: 'Log Status',
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="outline"
          className="h-8 px-2.5 text-xs"
          disabled={togglingId === row.original.id}
          onClick={() => handleToggleMaintenance(row.original)}
        >
          <Wrench className="h-3.5 w-3.5 mr-1" />
          {togglingId === row.original.id
            ? 'Updating...'
            : row.original.status === 'Maintenance'
            ? 'Set Operational'
            : 'Set Maintenance'}
        </Button>
      ),
    },
  ];

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-12 font-sans">
      <PageHeader
        title="Machines Fleet & Telemetry"
        description="Live synchronization with Neon PostgreSQL equipment records, OEE efficiency telemetry, and automated maintenance cycles."
        breadcrumbs={[{ label: 'Machines' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchMachines} disabled={loading} className="text-xs">
              <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} /> Sync DB
            </Button>
            <Button onClick={() => setIsAddMachineOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Register Machine
            </Button>
          </div>
        }
      />

      {loading ? (
        <div className="p-12 text-center text-slate-500 dark:text-steel-400">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-brand-500" />
          <p className="text-sm">Fetching machine telemetry from Neon database...</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={machines}
          searchKey="code"
          searchPlaceholder="Search machine code, name, or equipment type..."
        />
      )}

      {/* Register Machine Modal */}
      <CreateMachineModal
        isOpen={isAddMachineOpen}
        onClose={() => setIsAddMachineOpen(false)}
        onAddMachine={(newMachine) => {
          setMachines((prev) => [newMachine, ...prev.filter((m) => m.code !== newMachine.code && m.id !== newMachine.id)]);
        }}
      />
    </div>
  );
}
