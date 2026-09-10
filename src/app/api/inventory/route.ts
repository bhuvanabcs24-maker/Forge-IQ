import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db/neon';
import { InventoryItem, InventoryCategory, InventoryUnit } from '@/types';

function toIsoDate(val: any, fallback = '2026-09-01'): string {
  if (!val) return fallback;
  try {
    const d = val instanceof Date ? val : new Date(val);
    if (isNaN(d.getTime())) return fallback;
    return d.toISOString().split('T')[0];
  } catch {
    return fallback;
  }
}

import { cachedDbQuery, invalidateDbCache } from '@/lib/db/neon-cache';

export async function GET() {
  try {
    const inventory = await cachedDbQuery(
      'api:inventory:list',
      async () => {
        const sql = getSql();
        const rows = await sql`
          SELECT 
            id, 
            sku, 
            name, 
            category, 
            material_grade as "materialGrade", 
            quantity, 
            unit, 
            reorder_point as "reorderPoint", 
            unit_cost as "unitCost", 
            location, 
            last_restocked as "lastRestocked"
          FROM inventory_items
          ORDER BY category, name;
        `;

        if (!rows || rows.length === 0) return [];

        return rows.map((r: any) => ({
          id: String(r.id),
          sku: String(r.sku),
          name: String(r.name),
          category: r.category as InventoryCategory,
          materialGrade: String(r.materialGrade || 'Standard'),
          quantity: Number(r.quantity || 0),
          unit: (r.unit || 'Sheets') as InventoryUnit,
          reorderPoint: Number(r.reorderPoint || 10),
          unitCost: Number(r.unitCost || 0),
          location: String(r.location || 'Bay A'),
          lastRestocked: toIsoDate(r.lastRestocked),
        }));
      },
      { ttlMs: 5000, tag: 'inventory' }
    );

    return NextResponse.json({ 
      success: true, 
      source: inventory.length > 0 ? 'neon_postgresql' : 'empty', 
      inventory 
    });
  } catch (err: any) {
    console.error('Inventory Neon DB query error:', err?.message);
    return NextResponse.json({ success: false, message: err?.message, inventory: [] }, { status: 500 });
  }
}


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      id, 
      sku, 
      name, 
      category, 
      materialGrade, 
      quantity, 
      unit, 
      reorderPoint, 
      unitCost, 
      location, 
      adjustQty 
    } = body;

    const sql = getSql();

    // 1. Adjust existing stock
    if (adjustQty !== undefined && (id || sku)) {
      const updated = await sql`
        UPDATE inventory_items
        SET 
          quantity = GREATEST(0, quantity + ${Number(adjustQty)}), 
          last_restocked = NOW()
        WHERE id = ${id || ''} OR sku = ${sku || ''}
        RETURNING 
          id, 
          sku, 
          name, 
          category, 
          material_grade as "materialGrade", 
          quantity, 
          unit, 
          reorder_point as "reorderPoint", 
          unit_cost as "unitCost", 
          location, 
          last_restocked as "lastRestocked";
      `;

      if (updated && updated.length > 0) {
        return NextResponse.json({ 
          success: true, 
          source: 'neon_postgresql', 
          item: {
            ...updated[0],
            quantity: Number(updated[0].quantity),
            reorderPoint: Number(updated[0].reorderPoint),
            unitCost: Number(updated[0].unitCost),
            lastRestocked: updated[0].lastRestocked ? String(updated[0].lastRestocked).split('T')[0] : '2026-09-01'
          } 
        });
      }
    }

    // 2. Insert new stock item
    if (!name || !sku) {
      return NextResponse.json(
        { success: false, message: 'SKU and Item Name are required' },
        { status: 400 }
      );
    }

    const newItemId = id || `inv-${Date.now()}`;
    const cleanSku = sku.trim().toUpperCase();

    const inserted = await sql`
      INSERT INTO inventory_items (
        id, sku, name, category, material_grade, 
        quantity, unit, reorder_point, unit_cost, location, last_restocked
      )
      VALUES (
        ${newItemId},
        ${cleanSku},
        ${name},
        ${category || 'Sheet Metal'},
        ${materialGrade || 'Standard'},
        ${Number(quantity) || 50},
        ${unit || 'Sheets'},
        ${Number(reorderPoint) || 20},
        ${Number(unitCost) || 2500},
        ${location || 'Bay A, Rack 1'},
        NOW()
      )
      ON CONFLICT (sku) DO UPDATE 
      SET 
        name = EXCLUDED.name,
        quantity = inventory_items.quantity + EXCLUDED.quantity, 
        unit_cost = EXCLUDED.unit_cost,
        last_restocked = NOW()
      RETURNING 
        id, 
        sku, 
        name, 
        category, 
        material_grade as "materialGrade", 
        quantity, 
        unit, 
        reorder_point as "reorderPoint", 
        unit_cost as "unitCost", 
        location, 
        last_restocked as "lastRestocked";
    `;

    const r = inserted[0];
    invalidateDbCache('inventory');

    return NextResponse.json({ 
      success: true, 
      source: 'neon_postgresql', 
      item: {
        id: String(r.id),
        sku: String(r.sku),
        name: String(r.name),
        category: r.category as InventoryCategory,
        materialGrade: String(r.materialGrade || 'Standard'),
        quantity: Number(r.quantity),
        unit: (r.unit || 'Sheets') as InventoryUnit,
        reorderPoint: Number(r.reorderPoint),
        unitCost: Number(r.unitCost),
        location: String(r.location),
        lastRestocked: toIsoDate(r.lastRestocked),
      } 
    });
  } catch (err: any) {
    console.error('Inventory database error:', err?.message);
    return NextResponse.json(
      { success: false, message: err?.message || 'Inventory database operation failed' },
      { status: 500 }
    );
  }
}
