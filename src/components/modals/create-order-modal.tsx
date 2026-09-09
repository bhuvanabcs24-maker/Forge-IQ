'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Order, OrderPriority } from '@/types';

const orderSchema = z.object({
  title: z.string().min(3, 'Work Order Title / Part Description is required'),
  customerName: z.string().min(2, 'Customer is required'),
  priority: z.enum(['Low', 'Normal', 'High', 'Rush']),
  totalAmount: z.coerce.number().min(1, 'Amount must be greater than 0'),
  dueDate: z.string().min(1, 'Due date is required'),
  materialSku: z.string().optional(),
  assignedMachineId: z.string().optional(),
  quantityUnits: z.coerce.number().min(1).default(50),
});

type OrderFormValues = z.infer<typeof orderSchema>;

export function CreateOrderModal({
  isOpen,
  onClose,
  onAddOrder,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAddOrder: (newOrder: Order) => void;
}) {
  const [customers, setCustomers] = useState<{ label: string; value: string }[]>([]);
  const [materials, setMaterials] = useState<{ label: string; value: string }[]>([]);
  const [machines, setMachines] = useState<{ label: string; value: string }[]>([]);
  const [isSubmittingToDb, setIsSubmittingToDb] = useState(false);

  // Load real customers, materials, and machines from database
  useEffect(() => {
    if (!isOpen) return;

    fetch('/api/customers')
      .then((r) => r.json())
      .then((d) => {
        if (d.customers && d.customers.length > 0) {
          setCustomers(d.customers.map((c: any) => ({ label: `${c.companyName} (${c.industry})`, value: c.companyName })));
        } else {
          setCustomers([
            { label: 'Apex Aerospace Solutions', value: 'Apex Aerospace Solutions' },
            { label: 'Titan Heavy Machinery Ltd', value: 'Titan Heavy Machinery Ltd' },
            { label: 'Vanguard Enclosures Inc', value: 'Vanguard Enclosures Inc' },
            { label: 'Precision HVAC Systems', value: 'Precision HVAC Systems' },
            { label: 'Nexus Renewable Energy', value: 'Nexus Renewable Energy' },
            { label: 'Stallion Architectural Metals', value: 'Stallion Architectural Metals' },
          ]);
        }
      })
      .catch(() => {});

    fetch('/api/inventory')
      .then((r) => r.json())
      .then((d) => {
        if (d.inventory && d.inventory.length > 0) {
          setMaterials(d.inventory.map((i: any) => ({ label: `${i.sku} — ${i.name} (${i.quantity} ${i.unit} in stock)`, value: i.sku })));
        }
      })
      .catch(() => {});

    fetch('/api/machines')
      .then((r) => r.json())
      .then((d) => {
        if (d.machines && d.machines.length > 0) {
          setMachines(d.machines.map((m: any) => ({ label: `${m.code} — ${m.name} (${m.status})`, value: m.id })));
        }
      })
      .catch(() => {});
  }, [isOpen]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      title: '',
      customerName: 'Apex Aerospace Solutions',
      priority: 'Normal',
      totalAmount: 45000,
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      materialSku: 'RAW-SS304-18G',
      assignedMachineId: 'mach-1',
      quantityUnits: 50,
    },
  });

  const onSubmit = async (data: OrderFormValues) => {
    setIsSubmittingToDb(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success && json.order) {
        onAddOrder(json.order);
        reset();
        onClose();
      } else {
        alert(json.message || 'Failed to create work order');
      }
    } catch (err: any) {
      alert('Error creating work order: ' + err?.message);
    } finally {
      setIsSubmittingToDb(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Create New Work Order" maxWidth="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-steel-300 mb-1">
            Work Order Title / Part Description
          </label>
          <Input placeholder="e.g. 304 Stainless Laser Cut Mounting Bracket" {...register('title')} />
          {errors.title && (
            <span className="text-[11px] text-rose-500 mt-1 block">{errors.title.message}</span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-steel-300 mb-1">
              Customer / Client Account
            </label>
            <Select
              options={
                customers.length > 0
                  ? customers
                  : [{ label: 'Apex Aerospace Solutions', value: 'Apex Aerospace Solutions' }]
              }
              {...register('customerName')}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-steel-300 mb-1">
              Batch Quantity (Units)
            </label>
            <Input type="number" {...register('quantityUnits')} />
          </div>
        </div>

        {/* Real-World Connections: Goods/Material & Machine Selection */}
        <div className="p-3.5 rounded-xl border border-brand-500/20 bg-brand-500/5 space-y-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Real-World Manufacturing Routing
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-steel-300 mb-1">
                Required Raw Material (Inventory)
              </label>
              <Select
                options={
                  materials.length > 0
                    ? materials
                    : [
                        { label: 'RAW-SS304-18G — SS304 Sheet', value: 'RAW-SS304-18G' },
                        { label: 'RAW-AL6061-250 — Aluminum 6061 Plate', value: 'RAW-AL6061-250' },
                        { label: 'RAW-STEEL-IS2062 — Carbon Steel', value: 'RAW-STEEL-IS2062' },
                        { label: 'RAW-CRCA-D-16G — CRCA Steel Sheet', value: 'RAW-CRCA-D-16G' },
                      ]
                }
                {...register('materialSku')}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-steel-300 mb-1">
                Assigned Primary Machine
              </label>
              <Select
                options={
                  machines.length > 0
                    ? machines
                    : [
                        { label: 'mach-1 — TRUMPF TruLaser Fiber', value: 'mach-1' },
                        { label: 'mach-2 — Bystronic Press Brake', value: 'mach-2' },
                        { label: 'mach-3 — Panasonic Robotic Welder', value: 'mach-3' },
                        { label: 'mach-4 — Gema Powder Coat Line', value: 'mach-4' },
                        { label: 'mach-5 — Timesavers Deburring', value: 'mach-5' },
                      ]
                }
                {...register('assignedMachineId')}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-steel-300 mb-1">
              Priority Level
            </label>
            <Select
              options={[
                { label: 'Low', value: 'Low' },
                { label: 'Normal', value: 'Normal' },
                { label: 'High', value: 'High' },
                { label: 'Rush', value: 'Rush' },
              ]}
              {...register('priority')}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-steel-300 mb-1">
              Contract Value (₹)
            </label>
            <Input type="number" {...register('totalAmount')} />
            {errors.totalAmount && (
              <span className="text-[11px] text-rose-500 mt-1 block">
                {errors.totalAmount.message}
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-steel-300 mb-1">
              Target Due Date
            </label>
            <Input type="date" {...register('dueDate')} />
            {errors.dueDate && (
              <span className="text-[11px] text-rose-500 mt-1 block">{errors.dueDate.message}</span>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-steel-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmittingToDb}>
            {isSubmittingToDb ? 'Creating in Database...' : 'Create & Dispatch Order'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
