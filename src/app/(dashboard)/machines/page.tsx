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
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 font-bold text-xs">
            <Cpu className="h-4 w-4" />
          </div>
          <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
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
          <div className="font-semibold text-slate-800 dark:text-steel-200">
            {row.original.name}
          </div>
          <div className="text-xs text-slate-500">Type: {row.original.type}</div>
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
          <Activity className="h-3.5 w-3.5 text-emerald-500" />
          <span className="font-extrabold text-slate-900 dark:text-slate-100">
            {row.original.efficiencyRate}%
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'hoursLoggedThisMonth',
      header: 'Hours Logged',
      cell: ({ row }) => (
        <span className="text-xs font-semibold">{row.original.hoursLoggedThisMonth} hrs</span>
      ),
    },
    {
      accessorKey: 'nextScheduledMaintenance',
      header: 'Next Maintenance',
      cell: ({ row }) => (
        <span className="text-xs text-slate-500">{row.original.nextScheduledMaintenance}</span>
      ),
    },
    {
      id: 'actions',
      header: 'Log Status',
      cell: ({ row }) => (
        <Button
          size="sm"
          variant="outline"
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
    <div className="space-y-6">
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
