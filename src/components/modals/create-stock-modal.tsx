'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { InventoryCategory, InventoryItem } from '@/types';

const stockSchema = z.object({
  sku: z.string().min(3, 'SKU is required (min 3 chars)'),
  name: z.string().min(3, 'Item Name / Description is required'),
  category: z.enum(['Sheet Metal', 'Tube & Pipe', 'Hardware & Fasteners', 'Consumable', 'Finished Part']),
  materialGrade: z.string().min(2, 'Material Grade / Spec is required'),
  quantity: z.coerce.number().min(0, 'Quantity must be 0 or more'),
  unit: z.string().min(1, 'Unit of measurement is required'),
  reorderPoint: z.coerce.number().min(1, 'Reorder point is required'),
  unitCost: z.coerce.number().min(0, 'Unit cost is required'),
  location: z.string().min(2, 'Storage Bay / Location is required'),
});

type StockFormValues = z.infer<typeof stockSchema>;

export function CreateStockModal({
  isOpen,
  onClose,
  onAddStock,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAddStock: (newItem: InventoryItem) => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StockFormValues>({
    resolver: zodResolver(stockSchema),
    defaultValues: {
      sku: '',
      name: '',
      category: 'Sheet Metal',
      materialGrade: 'SS304 (1.5mm / 16 Ga)',
      quantity: 50,
      unit: 'Sheets',
      reorderPoint: 15,
      unitCost: 3200,
      location: 'Bay A, Rack 2',
    },
  });

  const onSubmit = async (data: StockFormValues) => {
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success && json.item) {
        onAddStock(json.item);
        reset();
        onClose();
      } else {
        alert(json.message || 'Failed to save inventory item');
      }
    } catch (err: any) {
      alert('Error creating stock item: ' + err?.message);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Register New Inventory / Raw Material SKU" maxWidth="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-steel-300 mb-1">
              SKU Code
            </label>
            <Input placeholder="e.g. RAW-SS316L-12G" {...register('sku')} />
            {errors.sku && (
              <span className="text-[11px] text-rose-500 mt-1 block">{errors.sku.message}</span>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-steel-300 mb-1">
              Category
            </label>
            <Select
              options={[
                { label: 'Sheet Metal', value: 'Sheet Metal' },
                { label: 'Tube & Pipe', value: 'Tube & Pipe' },
                { label: 'Hardware & Fasteners', value: 'Hardware & Fasteners' },
                { label: 'Consumable', value: 'Consumable' },
                { label: 'Finished Part', value: 'Finished Part' },
              ]}
              {...register('category')}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-steel-300 mb-1">
            Material / Goods Description
          </label>
          <Input placeholder="e.g. Stainless Steel 316L Mirror Finish Sheet (2500x1250mm)" {...register('name')} />
          {errors.name && (
            <span className="text-[11px] text-rose-500 mt-1 block">{errors.name.message}</span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-steel-300 mb-1">
              Material Grade & Spec
            </label>
            <Input placeholder="e.g. SS316L 2.0mm / ASTM A240" {...register('materialGrade')} />
            {errors.materialGrade && (
              <span className="text-[11px] text-rose-500 mt-1 block">{errors.materialGrade.message}</span>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-steel-300 mb-1">
              Storage Bay / Location
            </label>
            <Input placeholder="e.g. Bay B, Rack B-03" {...register('location')} />
            {errors.location && (
              <span className="text-[11px] text-rose-500 mt-1 block">{errors.location.message}</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-steel-300 mb-1">
              Stock Qty
            </label>
            <Input type="number" {...register('quantity')} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-steel-300 mb-1">
              Unit
            </label>
            <Input placeholder="Sheets/Pcs" {...register('unit')} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-steel-300 mb-1">
              Reorder Alert
            </label>
            <Input type="number" {...register('reorderPoint')} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-steel-300 mb-1">
              Unit Cost (₹)
            </label>
            <Input type="number" {...register('unitCost')} />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-steel-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving to Database...' : 'Save Stock Item'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
