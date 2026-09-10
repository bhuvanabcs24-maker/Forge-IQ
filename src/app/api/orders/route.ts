import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db/neon';
import { Order, OrderPriority, OrderStatus } from '@/types';

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
    const orders = await cachedDbQuery(
      'api:orders:list',
      async () => {
        const sql = getSql();
        const rows = await sql`
          SELECT 
            id, 
            order_number as "orderNumber", 
            customer_id as "customerId", 
            customer_name as "customerName", 
            title, 
            priority, 
            status, 
            progress_percent as "progressPercent", 
            total_amount as "totalAmount", 
            due_date as "dueDate", 
            material_sku as "materialSku",
            assigned_machine_id as "assignedMachineId",
            quantity_units as "quantityUnits",
            created_at as "createdAt"
          FROM orders
          ORDER BY created_at DESC;
        `;

        if (!rows || rows.length === 0) return [];

        return rows.map((r: any) => ({
          id: String(r.id),
          orderNumber: String(r.orderNumber),
          customerId: String(r.customerId || 'cust-1'),
          customerName: String(r.customerName),
          title: String(r.title),
          priority: r.priority as OrderPriority,
          status: r.status as OrderStatus,
          progressPercent: Number(r.progressPercent || 0),
          totalAmount: Number(r.totalAmount || 0),
          dueDate: toIsoDate(r.dueDate, '2026-09-30'),
          materialSku: r.materialSku ? String(r.materialSku) : undefined,
          assignedMachineId: r.assignedMachineId ? String(r.assignedMachineId) : undefined,
          quantityUnits: r.quantityUnits ? Number(r.quantityUnits) : 50,
          createdAt: toIsoDate(r.createdAt, '2026-09-01'),
        }));
      },
      { ttlMs: 4000, tag: 'orders' }
    );

    return NextResponse.json({ 
      success: true, 
      source: orders.length > 0 ? 'neon_postgresql' : 'empty', 
      orders 
    });
  } catch (err: any) {
    console.error('Orders Neon DB query error:', err?.message);
    return NextResponse.json({ success: false, message: err?.message, orders: [] }, { status: 500 });
  }
}


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      title, 
      customerName, 
      priority, 
      totalAmount, 
      dueDate, 
      customerId,
      materialSku,
      assignedMachineId,
      quantityUnits
    } = body;

    if (!title || !customerName) {
      return NextResponse.json(
        { success: false, message: 'Part Title and Customer Name are required' },
        { status: 400 }
      );
    }

    const orderId = body.id || `ord-${Date.now()}`;
    const orderNumber = body.orderNumber || `WO-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const cleanPriority = (priority || 'Normal') as OrderPriority;
    const cleanAmount = Number(totalAmount) || 25000;
    const cleanDueDate = dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
    const cleanQty = Number(quantityUnits) || 50;
    const cleanMaterialSku = materialSku || 'RAW-SS304-18G';
    const cleanMachineId = assignedMachineId || 'mach-1';

    const sql = getSql();

    // 1. Insert into orders table with real-world foreign attributes
    await sql`
      INSERT INTO orders (
        id, order_number, customer_id, customer_name, title, 
        priority, status, progress_percent, total_amount, due_date,
        material_sku, assigned_machine_id, quantity_units
      )
      VALUES (
        ${orderId},
        ${orderNumber},
        ${customerId || 'cust-1'},
        ${customerName},
        ${title},
        ${cleanPriority},
        'In Production',
        10,
        ${cleanAmount},
        ${cleanDueDate},
        ${cleanMaterialSku},
        ${cleanMachineId},
        ${cleanQty}
      )
      ON CONFLICT (order_number) DO UPDATE
      SET 
        title = EXCLUDED.title, 
        total_amount = EXCLUDED.total_amount, 
        due_date = EXCLUDED.due_date,
        material_sku = EXCLUDED.material_sku,
        assigned_machine_id = EXCLUDED.assigned_machine_id,
        quantity_units = EXCLUDED.quantity_units;
    `;

    // 2. Real-World Connection: Get machine name for dispatch
    let machineName = 'CNC Center';
    try {
      const machRows = await sql`SELECT name FROM machines WHERE id = ${cleanMachineId} OR code = ${cleanMachineId}`;
      if (machRows && machRows.length > 0) {
        machineName = machRows[0].name;
      }
      // Update machine status to 'In Use'
      await sql`UPDATE machines SET status = 'In Use' WHERE id = ${cleanMachineId} OR code = ${cleanMachineId}`;
    } catch (mErr: any) {
      console.warn('Machine link warning:', mErr?.message);
    }

    // 3. Real-World Connection: Deduct/Reserve required material from inventory_items
    try {
      const reservedUnits = Math.min(cleanQty, 25);
      await sql`
        UPDATE inventory_items 
        SET quantity = GREATEST(0, quantity - ${reservedUnits})
        WHERE sku = ${cleanMaterialSku};
      `;
    } catch (invErr: any) {
      console.warn('Inventory reservation warning:', invErr?.message);
    }

    // 4. Real-World Connection: Automatically provision a connected production_job in shop floor
    const jobId = `JOB-2026-${orderNumber.replace('WO-2026-', '')}`;
    try {
      await sql`
        INSERT INTO production_jobs (
          id, job_id, order_id, order_number, customer_name, part_title, 
          priority, current_stage_id, progress_percent, due_date, estimated_hours, 
          assigned_machine_id, assigned_machine_name, material_sku, material_quantity_reserved
        )
        VALUES (
          ${`job-${Date.now()}`},
          ${jobId},
          ${orderId},
          ${orderNumber},
          ${customerName},
          ${title},
          ${cleanPriority},
          'scheduled',
          10,
          ${cleanDueDate},
          12.0,
          ${cleanMachineId},
          ${machineName},
          ${cleanMaterialSku},
          ${Math.min(cleanQty, 25)}
        )
        ON CONFLICT (job_id) DO NOTHING;
      `;
    } catch (jobErr: any) {
      console.warn('Production job auto-creation warning:', jobErr?.message);
    }

    // 5. Real-World Connection: Update customer order count & lifetime value
    try {
      await sql`
        UPDATE customers
        SET 
          total_orders = total_orders + 1,
          lifetime_value = lifetime_value + ${cleanAmount}
        WHERE company_name ILIKE ${customerName} OR id = ${customerId || ''};
      `;
    } catch (custErr: any) {
      console.warn('Customer lifetime update warning:', custErr?.message);
    }

    const createdOrder: Order = {
      id: orderId,
      orderNumber,
      customerId: customerId || 'cust-1',
      customerName,
      title,
      priority: cleanPriority,
      status: 'In Production',
      progressPercent: 10,
      totalAmount: cleanAmount,
      dueDate: cleanDueDate,
      createdAt: new Date().toISOString().split('T')[0],
    };

    invalidateDbCache('orders');
    invalidateDbCache('jobs');

    return NextResponse.json({ 
      success: true, 
      source: 'neon_postgresql', 
      order: createdOrder,
      jobId,
      assignedMachine: machineName,
      reservedMaterialSku: cleanMaterialSku
    });

  } catch (err: any) {
    console.error('Failed to create order in Neon DB:', err?.message);
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}
