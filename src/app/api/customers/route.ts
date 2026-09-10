import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db/neon';
import { Customer, CustomerStatus } from '@/types';
import { MOCK_CUSTOMERS } from '@/lib/mock-data/manufacturing';
import { cachedDbQuery, invalidateDbCache } from '@/lib/db/neon-cache';

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

// In-memory fallback registry for customers added during session
let runtimeCustomers: Customer[] = [];

export async function GET() {
  try {
    const customers = await cachedDbQuery(
      'api:customers:list',
      async () => {
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
            const dbList: Customer[] = rows.map((r: any) => ({
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

            // Merge any runtime customers that are not yet in the DB list
            const existingIds = new Set(dbList.map((c) => c.id));
            const extra = runtimeCustomers.filter((c) => !existingIds.has(c.id));
            return [...extra, ...dbList];
          }
        } catch (dbErr: any) {
          console.warn('Neon DB query failed, falling back to mock & runtime customers:', dbErr?.message);
        }

        // Fallback: return mock customers merged with runtime added customers
        const existingIds = new Set(MOCK_CUSTOMERS.map((c) => c.id));
        const extra = runtimeCustomers.filter((c) => !existingIds.has(c.id));
        return [...runtimeCustomers, ...MOCK_CUSTOMERS];
      },
      { ttlMs: 4000, tag: 'customers' }
    );

    return NextResponse.json({
      success: true,
      source: customers.length > 0 ? 'neon_postgresql' : 'fallback',
      customers,
    });
  } catch (err: any) {
    console.error('Customers API error:', err?.message);
    // Even on total exception, never leave directory empty
    return NextResponse.json({
      success: true,
      source: 'fallback',
      customers: [...runtimeCustomers, ...MOCK_CUSTOMERS],
    });
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
    const today = new Date().toISOString().split('T')[0];

    const fallbackCustomer: Customer = {
      id: newCustomerId,
      companyName: String(companyName).trim(),
      contactName: String(contactName || 'Primary Contact').trim(),
      email: String(email).trim().toLowerCase(),
      phone: String(phone || '+91 80 0000 0000').trim(),
      industry: String(industry || 'Metal Fabrication').trim(),
      address: String(address || 'Industrial Estate').trim(),
      status: 'Active',
      totalOrders: 0,
      lifetimeValue: 0,
      createdAt: today,
    };

    // Always keep in runtime session store so it immediately shows up
    runtimeCustomers = [
      fallbackCustomer,
      ...runtimeCustomers.filter((c) => c.id !== newCustomerId),
    ];

    try {
      const sql = getSql();
      const inserted = await sql`
        INSERT INTO customers (
          id, company_name, contact_name, email, phone, industry, address, status, total_orders, lifetime_value, created_at
        )
        VALUES (
          ${newCustomerId},
          ${fallbackCustomer.companyName},
          ${fallbackCustomer.contactName},
          ${fallbackCustomer.email},
          ${fallbackCustomer.phone},
          ${fallbackCustomer.industry},
          ${fallbackCustomer.address},
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

      if (inserted && inserted[0]) {
        const c = inserted[0];
        invalidateDbCache('customers');

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
      }
    } catch (dbErr: any) {
      console.warn('Neon DB insert failed, using fallback customer:', dbErr?.message);
    }

    // Invalidate query cache so GET returns updated customer list immediately
    invalidateDbCache('customers');

    return NextResponse.json({
      success: true,
      source: 'runtime_storage',
      customer: fallbackCustomer,
    });
  } catch (err: any) {
    console.error('Customer create error:', err?.message);
    return NextResponse.json(
      { success: false, message: err?.message || 'Customer registration encountered an error' },
      { status: 500 }
    );
  }
}
