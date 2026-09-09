import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db/neon';
import { Machine, MachineStatus, MachineType } from '@/types';

function toIsoDate(val: any, fallback = '2026-08-10'): string {
  if (!val) return fallback;
  try {
    const d = val instanceof Date ? val : new Date(val);
    if (isNaN(d.getTime())) return fallback;
    return d.toISOString().split('T')[0];
  } catch {
    return fallback;
  }
}

export async function GET() {
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT 
        id, 
        code, 
        name, 
        type, 
        status, 
        efficiency_rate as "efficiencyRate", 
        hours_logged_this_month as "hoursLoggedThisMonth", 
        last_maintenance as "lastMaintenance", 
        next_scheduled_maintenance as "nextScheduledMaintenance"
      FROM machines
      ORDER BY code;
    `;

    if (rows && rows.length > 0) {
      const machines: Machine[] = rows.map((r: any) => ({
        id: String(r.id),
        code: String(r.code),
        name: String(r.name),
        type: r.type as MachineType,
        status: r.status as MachineStatus,
        efficiencyRate: Number(r.efficiencyRate),
        hoursLoggedThisMonth: Number(r.hoursLoggedThisMonth),
        lastMaintenance: toIsoDate(r.lastMaintenance, '2026-08-10'),
        nextScheduledMaintenance: toIsoDate(r.nextScheduledMaintenance, '2026-09-20'),
      }));

      return NextResponse.json({ success: true, source: 'neon_postgresql', machines });
    }

    return NextResponse.json({ success: true, source: 'empty', machines: [] });
  } catch (err: any) {
    console.error('Machines Neon DB query error:', err?.message);
    return NextResponse.json({ success: false, message: err?.message, machines: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, code, status, name, type, hoursLoggedThisMonth, efficiencyRate } = body;

    const sql = getSql();

    // 1. Update status or log hours on existing machine
    if (id || (code && !name)) {
      const updated = await sql`
        UPDATE machines
        SET 
          status = COALESCE(${status}, status),
          hours_logged_this_month = COALESCE(${hoursLoggedThisMonth ? Number(hoursLoggedThisMonth) : null}, hours_logged_this_month),
          efficiency_rate = COALESCE(${efficiencyRate ? Number(efficiencyRate) : null}, efficiency_rate)
        WHERE id = ${id || ''} OR code = ${code || ''}
        RETURNING 
          id, 
          code, 
          name, 
          type, 
          status, 
          efficiency_rate as "efficiencyRate", 
          hours_logged_this_month as "hoursLoggedThisMonth", 
          last_maintenance as "lastMaintenance", 
          next_scheduled_maintenance as "nextScheduledMaintenance";
      `;

      if (updated && updated.length > 0) {
        const m = updated[0];
        return NextResponse.json({ 
          success: true, 
          source: 'neon_postgresql', 
          machine: {
            id: String(m.id),
            code: String(m.code),
            name: String(m.name),
            type: m.type as MachineType,
            status: m.status as MachineStatus,
            efficiencyRate: Number(m.efficiencyRate),
            hoursLoggedThisMonth: Number(m.hoursLoggedThisMonth),
            lastMaintenance: toIsoDate(m.lastMaintenance, '2026-08-10'),
            nextScheduledMaintenance: toIsoDate(m.nextScheduledMaintenance, '2026-09-20'),
          } 
        });
      }
    }

    // 2. Insert new machine
    if (!name || !code) {
      return NextResponse.json(
        { success: false, message: 'Machine Code and Name are required' },
        { status: 400 }
      );
    }

    const newMachineId = id || `mach-${Date.now()}`;
    const cleanCode = code.trim().toUpperCase();

    const inserted = await sql`
      INSERT INTO machines (
        id, code, name, type, status, efficiency_rate, 
        hours_logged_this_month, last_maintenance, next_scheduled_maintenance
      )
      VALUES (
        ${newMachineId},
        ${cleanCode},
        ${name},
        ${type || 'Laser Cutter'},
        ${status || 'Operational'},
        ${Number(efficiencyRate) || 95.0},
        ${Number(hoursLoggedThisMonth) || 0.0},
        NOW(),
        NOW() + INTERVAL '30 days'
      )
      ON CONFLICT (code) DO UPDATE
      SET 
        name = EXCLUDED.name,
        status = EXCLUDED.status, 
        type = EXCLUDED.type,
        efficiency_rate = EXCLUDED.efficiency_rate
      RETURNING 
        id, 
        code, 
        name, 
        type, 
        status, 
        efficiency_rate as "efficiencyRate", 
        hours_logged_this_month as "hoursLoggedThisMonth", 
        last_maintenance as "lastMaintenance", 
        next_scheduled_maintenance as "nextScheduledMaintenance";
    `;

    const m = inserted[0];
    return NextResponse.json({ 
      success: true, 
      source: 'neon_postgresql', 
      machine: {
        id: String(m.id),
        code: String(m.code),
        name: String(m.name),
        type: m.type as MachineType,
        status: m.status as MachineStatus,
        efficiencyRate: Number(m.efficiencyRate),
        hoursLoggedThisMonth: Number(m.hoursLoggedThisMonth),
        lastMaintenance: toIsoDate(m.lastMaintenance, '2026-08-10'),
        nextScheduledMaintenance: toIsoDate(m.nextScheduledMaintenance, '2026-09-20'),
      } 
    });
  } catch (err: any) {
    console.error('Machine database error:', err?.message);
    return NextResponse.json(
      { success: false, message: err?.message || 'Machine database operation failed' },
      { status: 500 }
    );
  }
}
