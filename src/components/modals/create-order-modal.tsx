'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Order, OrderPriority } from '@/types';

const orderSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  customerName: z.string().min(2, 'Customer is required'),
  priority: z.enum(['Low', 'Normal', 'High', 'Rush']),
  totalAmount: z.coerce.number().min(1, 'Amount must be greater than 0'),
  dueDate: z.string().min(1, 'Due date is required'),
});

type OrderFormValues = z.infer<typeof orderSchema>;

export function CreateOrderModal({
  isOpen,
  onClose,
  onAddOrder,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAddOrder: (newOrder: Partial<Order>) => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      title: '',
      customerName: 'Apex Aerospace Solutions',
      priority: 'Normal',
      totalAmount: 15000,
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    },
  });

  const onSubmit = (data: OrderFormValues) => {
    onAddOrder({
      id: `ord-${Date.now()}`,
      orderNumber: `WO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: 'cust-1',
      customerName: data.customerName,
      title: data.title,
      priority: data.priority as OrderPriority,
      status: 'Pending',
      progressPercent: 0,
      totalAmount: data.totalAmount,
      dueDate: data.dueDate,
      createdAt: new Date().toISOString().split('T')[0],
    });
    reset();
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Create New Work Order" maxWidth="md">
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

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-steel-300 mb-1">
            Customer Name
          </label>
          <Select
            options={[
              { label: 'Apex Aerospace Solutions', value: 'Apex Aerospace Solutions' },
              { label: 'Titan Heavy Machinery', value: 'Titan Heavy Machinery' },
              { label: 'Vanguard Enclosures Inc.', value: 'Vanguard Enclosures Inc.' },
              { label: 'Precision HVAC Systems', value: 'Precision HVAC Systems' },
              { label: 'Nexus Renewable Energy', value: 'Nexus Renewable Energy' },
            ]}
            {...register('customerName')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-steel-300 mb-1">
              Priority Level
            </label>
            <Select
              options={[
                { label: 'Normal', value: 'Normal' },
                { label: 'Low', value: 'Low' },
                { label: 'High', value: 'High' },
                { label: 'Rush (Expedited)', value: 'Rush' },
              ]}
              {...register('priority')}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-steel-300 mb-1">
              Total Order Value ($)
            </label>
            <Input type="number" step="100" {...register('totalAmount')} />
            {errors.totalAmount && (
              <span className="text-[11px] text-rose-500 mt-1 block">
                {errors.totalAmount.message}
              </span>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-steel-300 mb-1">
            Required Delivery Date
          </label>
          <Input type="date" {...register('dueDate')} />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-steel-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Work Order'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
