'use client';

import React, { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { InventoryItem } from '@/types';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable } from '@/components/data-table/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Boxes, Plus, AlertTriangle, RefreshCw } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { CreateStockModal } from '@/components/modals/create-stock-modal';

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [addQty, setAddQty] = useState(10);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [isAddStockOpen, setIsAddStockOpen] = useState(false);

  const fetchInventory = () => {
    setLoading(true);
    fetch('/api/inventory')
      .then((res) => res.json())
      .then((data) => {
        if (data.inventory) {
          setInventory(data.inventory);
        }
      })
      .catch((err) => console.error('Failed to fetch inventory from database:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAdjustStock = async () => {
    if (!selectedItem) return;
    setIsAdjusting(true);
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedItem.id,
          sku: selectedItem.sku,
          adjustQty: Number(addQty),
        }),
      });
      const data = await res.json();
      if (data.success && data.item) {
        setInventory((prev) =>
          prev.map((i) => (i.id === selectedItem.id ? data.item : i))
        );
        setSelectedItem(null);
      } else {
        alert(data.message || 'Failed to adjust stock');
      }
    } catch (err: any) {
      alert('Error adjusting stock: ' + err?.message);
    } finally {
      setIsAdjusting(false);
    }
  };

  const columns: ColumnDef<InventoryItem>[] = [
    {
      accessorKey: 'sku',
      header: 'SKU & Category',
      cell: ({ row }) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F9FAFB] dark:bg-[#18202A] text-[#667085] dark:text-[#98A2B3] border border-[#E4E7EC] dark:border-[#252B33]">
            <Boxes className="h-4 w-4" />
          </div>
          <div>
            <span className="font-mono font-semibold text-[#111827] dark:text-[#F2F4F7] text-xs">
              {row.original.sku}
            </span>
            <div className="text-[11px] text-[#667085] dark:text-[#98A2B3]">
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
          <div className="font-semibold text-[#111827] dark:text-[#F2F4F7]">
            {row.original.name}
          </div>
          <div className="text-xs text-[#667085] dark:text-[#98A2B3]">
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
              className={`font-bold text-sm tabular-nums ${
                isLow ? 'text-[#B42318] dark:text-[#FDA29B]' : 'text-[#111827] dark:text-[#F2F4F7]'
              }`}
            >
              {row.original.quantity} {row.original.unit}
            </span>
            {isLow && (
              <Badge variant="danger" className="text-xs">
                Reorder
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
        <span className="text-xs font-mono bg-[#F9FAFB] dark:bg-[#18202A] text-[#344054] dark:text-[#D0D5DD] px-2 py-0.5 rounded-[6px] border border-[#E4E7EC] dark:border-[#252B33]">
          {row.original.location}
        </span>
      ),
    },
    {
      accessorKey: 'unitCost',
      header: 'Unit Cost',
      cell: ({ row }) => (
        <span className="font-medium text-[#111827] dark:text-[#F2F4F7] tabular-nums text-xs">
          {formatCurrency(row.original.unitCost)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Adjust',
      cell: ({ row }) => (
        <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs" onClick={() => setSelectedItem(row.original)}>
          Restock / Adjust
        </Button>
      ),
    },
  ];

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-12 font-sans">
      <PageHeader
        title="Raw Material & Sheet Inventory"
        description="Live synchronization with Neon PostgreSQL stock levels, sheet metal gauges, tube stock, hardware fasteners, and automated stock alerts."
        breadcrumbs={[{ label: 'Inventory' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchInventory} disabled={loading} className="text-xs">
              <RefreshCw className={`h-3.5 w-3.5 mr-1 ${loading ? 'animate-spin' : ''}`} /> Sync DB
            </Button>
            <Button onClick={() => setIsAddStockOpen(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add Stock SKU
            </Button>
          </div>
        }
      />

      {loading ? (
        <div className="p-12 text-center text-slate-500 dark:text-steel-400">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-brand-500" />
          <p className="text-sm">Fetching stock inventory from Neon database...</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={inventory}
          searchKey="sku"
          searchPlaceholder="Search SKU, material grade, or location..."
        />
      )}

      {/* Add Stock SKU Modal */}
      <CreateStockModal
        isOpen={isAddStockOpen}
        onClose={() => setIsAddStockOpen(false)}
        onAddStock={(newItem) => {
          setInventory((prev) => [newItem, ...prev.filter((i) => i.sku !== newItem.sku && i.id !== newItem.id)]);
        }}
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
              Current stock in Neon DB for <strong>{selectedItem.name}</strong> is{' '}
              <strong className="text-brand-500">{selectedItem.quantity} {selectedItem.unit}</strong>.
            </p>

            <div>
              <label className="block text-xs font-semibold mb-1">Quantity to Add / Restock</label>
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
              <Button onClick={handleAdjustStock} disabled={isAdjusting}>
                {isAdjusting ? 'Updating Database...' : 'Save to Database'}
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
