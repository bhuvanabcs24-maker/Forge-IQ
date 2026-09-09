import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db/neon';
import { Customer, CustomerStatus } from '@/types';

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

export async function GET() {
  try {
    const sql = getSql();
    const rows = await sql`
      SELECT 
        id, 
        company_name as "companyName", 
        contact_name as "contactName", 
        email, 
        phone, 
        industry, 
        address, 
        status, 
        total_orders as "totalOrders", 
        lifetime_value as "lifetimeValue", 
        created_at as "createdAt"
      FROM customers
      ORDER BY total_orders DESC, created_at DESC;
    `;

    if (rows && rows.length > 0) {
      const customers: Customer[] = rows.map((r: any) => ({
        id: String(r.id),
        companyName: String(r.companyName),
        contactName: String(r.contactName),
        email: String(r.email),
        phone: String(r.phone),
        industry: String(r.industry || 'Metal Fabrication'),
        address: String(r.address || ''),
        status: r.status as CustomerStatus,
        totalOrders: Number(r.totalOrders || 0),
        lifetimeValue: Number(r.lifetimeValue || 0),
        createdAt: toIsoDate(r.createdAt),
      }));

      return NextResponse.json({ success: true, source: 'neon_postgresql', customers });
    }

    return NextResponse.json({ success: true, source: 'empty', customers: [] });
  } catch (err: any) {
    console.error('Customers Neon DB query error:', err?.message);
    return NextResponse.json({ success: false, message: err?.message, customers: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyName, contactName, email, phone, industry, address } = body;

    if (!companyName || !email) {
      return NextResponse.json(
        { success: false, message: 'Company Name and Email are required' },
        { status: 400 }
      );
    }

    const newCustomerId = body.id || `cust-${Date.now()}`;
    const sql = getSql();

    const inserted = await sql`
      INSERT INTO customers (
        id, company_name, contact_name, email, phone, industry, address, status, total_orders, lifetime_value, created_at
      )
      VALUES (
        ${newCustomerId},
        ${companyName},
        ${contactName || 'Primary Contact'},
        ${email},
        ${phone || '+91 80 0000 0000'},
        ${industry || 'Industrial Manufacturing'},
        ${address || 'Industrial Estate'},
        'Active',
        0,
        0,
        NOW()
      )
      ON CONFLICT (id) DO UPDATE
      SET 
        company_name = EXCLUDED.company_name,
        contact_name = EXCLUDED.contact_name,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone
      RETURNING 
        id, 
        company_name as "companyName", 
        contact_name as "contactName", 
        email, 
        phone, 
        industry, 
        address, 
        status, 
        total_orders as "totalOrders", 
        lifetime_value as "lifetimeValue", 
        created_at as "createdAt";
    `;

    const c = inserted[0];
    return NextResponse.json({
      success: true,
      source: 'neon_postgresql',
      customer: {
        id: String(c.id),
        companyName: String(c.companyName),
        contactName: String(c.contactName),
        email: String(c.email),
        phone: String(c.phone),
        industry: String(c.industry),
        address: String(c.address),
        status: c.status as CustomerStatus,
        totalOrders: Number(c.totalOrders),
        lifetimeValue: Number(c.lifetimeValue),
        createdAt: toIsoDate(c.createdAt),
      },
    });
  } catch (err: any) {
    console.error('Customer create error:', err?.message);
    return NextResponse.json(
      { success: false, message: err?.message || 'Customer database operation failed' },
      { status: 500 }
    );
  }
}
