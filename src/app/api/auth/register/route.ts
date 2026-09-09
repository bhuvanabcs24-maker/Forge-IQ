import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db/neon';
import { UserRole } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, companyName, email, phone, password, role } = body;

    if (!fullName || !email) {
      return NextResponse.json(
        { success: false, message: 'Full name and email address are required' },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPhone = phone ? String(phone).replace(/[^0-9]/g, '') : null;
    const cleanRole = (role || 'Owner') as UserRole;

    const sql = getSql();

    // Insert user into Neon PostgreSQL database
    const result = await sql`
      INSERT INTO users (email, phone, full_name, company_name, role, department)
      VALUES (
        ${cleanEmail},
        ${cleanPhone},
        ${String(fullName).trim()},
        ${companyName ? String(companyName).trim() : null},
        ${cleanRole},
        'Executive Operations'
      )
      ON CONFLICT (email) DO UPDATE
      SET 
        full_name = EXCLUDED.full_name,
        company_name = COALESCE(EXCLUDED.company_name, users.company_name),
        phone = COALESCE(EXCLUDED.phone, users.phone),
        updated_at = NOW()
      RETURNING id, email, phone, full_name, company_name, role, department, created_at;
    `;

    const userRow = result[0];

    return NextResponse.json({
      success: true,
      source: 'neon_postgresql',
      user: {
        id: String(userRow.id),
        email: String(userRow.email),
        fullName: String(userRow.full_name),
        companyName: userRow.company_name ? String(userRow.company_name) : undefined,
        role: userRow.role as UserRole,
        phone: userRow.phone ? String(userRow.phone) : undefined,
        department: String(userRow.department || 'Executive Operations'),
        createdAt: new Date(userRow.created_at).toISOString().split('T')[0],
      },
    });
  } catch (error: any) {
    console.error('Neon DB Registration error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Database registration failed' },
      { status: 500 }
    );
  }
}
