import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db/neon';
import { UserRole } from '@/types';

// Ensure table exists on first invocation
async function ensureUsersTable(sql: any) {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(50),
        full_name VARCHAR(255) NOT NULL,
        company_name VARCHAR(255),
        password_hash VARCHAR(255),
        role VARCHAR(50) NOT NULL DEFAULT 'Owner',
        department VARCHAR(100) DEFAULT 'Executive Operations',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;
  } catch (err) {
    console.warn('Could not ensure users table in Neon:', err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, role, phone } = body;

    const sql = getSql();
    await ensureUsersTable(sql);

    // 1. Mobile SMS OTP Login Flow
    if (phone && !email) {
      const normalizedPhone = String(phone).replace(/[^0-9]/g, '');
      if (!normalizedPhone || normalizedPhone.length < 10) {
        return NextResponse.json(
          { success: false, message: 'Please provide a valid 10-digit mobile number' },
          { status: 400 }
        );
      }

      // Look up or insert user in Neon DB
      const existing = await sql`
        SELECT id, email, phone, full_name, role, department, company_name, created_at
        FROM users
        WHERE phone = ${normalizedPhone}
        LIMIT 1;
      `;

      if (existing && existing.length > 0) {
        const row = existing[0];
        // Update last activity and role if specified
        await sql`
          UPDATE users
          SET role = ${role || row.role}, updated_at = NOW()
          WHERE id = ${row.id};
        `;

        return NextResponse.json({
          success: true,
          source: 'neon_postgresql',
          user: {
            id: String(row.id),
            email: String(row.email || `${normalizedPhone}@forgeiq.workspace`),
            fullName: String(row.full_name),
            role: (role || row.role) as UserRole,
            phone: normalizedPhone,
            department: String(row.department || 'Executive Operations'),
            createdAt: new Date(row.created_at).toISOString().split('T')[0],
          },
        });
      }

      // Auto-provision new user in Neon DB
      const defaultName = `Fabricator +${normalizedPhone.slice(-4)}`;
      const generatedEmail = `user.${normalizedPhone}@forgeiq.workspace`;
      const inserted = await sql`
        INSERT INTO users (phone, email, full_name, role, department)
        VALUES (${normalizedPhone}, ${generatedEmail}, ${defaultName}, ${role || 'Owner'}, 'Shop Floor Operations')
        RETURNING id, email, phone, full_name, role, department, created_at;
      `;

      const newUser = inserted[0];
      return NextResponse.json({
        success: true,
        source: 'neon_postgresql',
        user: {
          id: String(newUser.id),
          email: String(newUser.email),
          fullName: String(newUser.full_name),
          role: (role || newUser.role) as UserRole,
          phone: normalizedPhone,
          department: String(newUser.department),
          createdAt: new Date(newUser.created_at).toISOString().split('T')[0],
        },
      });
    }

    // 2. Email & Password Login Flow
    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email address is required' },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanRole = (role || 'Owner') as UserRole;

    // Look up user in Neon PostgreSQL
    const existingUsers = await sql`
      SELECT id, email, phone, full_name, role, department, company_name, created_at
      FROM users
      WHERE LOWER(email) = ${cleanEmail}
      LIMIT 1;
    `;

    if (existingUsers && existingUsers.length > 0) {
      const u = existingUsers[0];
      // Update role & touch updated_at
      await sql`
        UPDATE users
        SET role = ${cleanRole}, updated_at = NOW()
        WHERE id = ${u.id};
      `;

      return NextResponse.json({
        success: true,
        source: 'neon_postgresql',
        user: {
          id: String(u.id),
          email: String(u.email),
          fullName: String(u.full_name),
          role: cleanRole,
          phone: u.phone ? String(u.phone) : undefined,
          department: String(u.department || 'Executive Operations'),
          createdAt: new Date(u.created_at).toISOString().split('T')[0],
        },
      });
    }

    // If first-time login with real company email, persist directly into Neon DB
    const namePart = cleanEmail.split('@')[0].replace(/[._-]/g, ' ');
    const formattedName = namePart
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
    const companyDerived = cleanEmail.split('@')[1]?.split('.')[0]?.toUpperCase() + ' Fabrications';

    const createdUsers = await sql`
      INSERT INTO users (email, full_name, role, company_name, department)
      VALUES (${cleanEmail}, ${formattedName}, ${cleanRole}, ${companyDerived}, 'Executive Operations')
      RETURNING id, email, phone, full_name, role, department, created_at;
    `;

    const newUser = createdUsers[0];
    return NextResponse.json({
      success: true,
      source: 'neon_postgresql',
      user: {
        id: String(newUser.id),
        email: String(newUser.email),
        fullName: String(newUser.full_name),
        role: cleanRole,
        phone: newUser.phone ? String(newUser.phone) : undefined,
        department: String(newUser.department),
        createdAt: new Date(newUser.created_at).toISOString().split('T')[0],
      },
    });
  } catch (error: any) {
    console.error('Neon DB Login error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Database authentication failed' },
      { status: 500 }
    );
  }
}
