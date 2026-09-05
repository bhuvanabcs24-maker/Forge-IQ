'use client';

import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { InventoryItem } from '@/types';
import { MOCK_INVENTORY } from '@/lib/mock-data/manufacturing';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/data-table/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Boxes, Plus, AlertTriangle, Layers } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>(MOCK_INVENTORY);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [addQty, setAddQty] = useState(10);

  const columns: ColumnDef<InventoryItem>[] = [
    {
      accessorKey: 'sku',
      header: 'SKU & Category',
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 font-bold text-xs">
            <Boxes className="h-4 w-4" />
          </div>
          <div>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-xs">
              {row.original.sku}
            </span>
            <div className="text-[11px] text-slate-500 dark:text-steel-400">
              Category: {row.original.category}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Material / Item Description',
      cell: ({ row }) => (
        <div>
          <div className="font-semibold text-slate-800 dark:text-steel-200">
            {row.original.name}
          </div>
          <div className="text-xs text-slate-500 dark:text-steel-400">
            Grade: {row.original.materialGrade}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'quantity',
      header: 'Stock Quantity',
      cell: ({ row }) => {
        const isLow = row.original.quantity <= row.original.reorderPoint;
        return (
          <div className="flex items-center gap-2">
            <span
              className={`font-extrabold text-sm ${
                isLow ? 'text-rose-500' : 'text-slate-900 dark:text-slate-100'
              }`}
            >
              {row.original.quantity} {row.original.unit}
            </span>
            {isLow && (
              <Badge variant="danger" className="text-[10px] gap-1">
                <AlertTriangle className="h-3 w-3" /> Reorder Alert
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'location',
      header: 'Bay Location',
      cell: ({ row }) => (
        <span className="text-xs font-mono bg-slate-100 dark:bg-steel-800 px-2 py-1 rounded">
          {row.original.location}
        </span>
      ),
    },
    {
      accessorKey: 'unitCost',
      header: 'Unit Cost',
      cell: ({ row }) => (
        <span className="font-medium text-slate-800 dark:text-steel-200">
          {formatCurrency(row.original.unitCost)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Adjust',
      cell: ({ row }) => (
        <Button variant="outline" size="sm" onClick={() => setSelectedItem(row.original)}>
          Restock / Adjust
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Raw Material & Sheet Inventory"
        description="Track sheet metal gauges, tube stock, PEM hardware fasteners, and automated stock alerts."
        breadcrumbs={[{ label: 'Inventory' }]}
        actions={
          <Button>
            <Plus className="h-4 w-4 mr-1" /> Add Stock SKU
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={inventory}
        searchKey="sku"
        searchPlaceholder="Search SKU, material grade, or location..."
      />

      {/* Adjust Stock Modal */}
      {selectedItem && (
        <Dialog
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          title={`Restock Material - ${selectedItem.sku}`}
          maxWidth="sm"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-steel-300">
              Current stock for <strong>{selectedItem.name}</strong> is{' '}
              <strong className="text-brand-500">{selectedItem.quantity} {selectedItem.unit}</strong>.
            </p>

            <div>
              <label className="block text-xs font-semibold mb-1">Quantity to Add</label>
              <Input
                type="number"
                value={addQty}
                onChange={(e) => setAddQty(Number(e.target.value))}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setSelectedItem(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setInventory((prev) =>
                    prev.map((i) =>
                      i.id === selectedItem.id
                        ? { ...i, quantity: i.quantity + addQty, lastRestocked: new Date().toISOString().split('T')[0] }
                        : i
                    )
                  );
                  setSelectedItem(null);
                }}
              >
                Save Adjustment
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
