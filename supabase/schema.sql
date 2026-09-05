-- ForgeIQ Database Schema (PostgreSQL / Supabase)
-- Target Domain: Fabrication & Sheet Metal Manufacturing Intelligence SaaS

-- 1. Create Enums
CREATE TYPE user_role AS ENUM ('Owner', 'Manager', 'Supervisor', 'Worker');
CREATE TYPE customer_status AS ENUM ('Active', 'Lead', 'Inactive');
CREATE TYPE quotation_status AS ENUM ('Draft', 'Sent', 'Approved', 'Rejected', 'Expired');
CREATE TYPE order_priority AS ENUM ('Low', 'Normal', 'High', 'Rush');
CREATE TYPE order_status AS ENUM ('Pending', 'In Production', 'Quality Check', 'Ready for Shipping', 'Completed', 'Cancelled');
CREATE TYPE inventory_category AS ENUM ('Sheet Metal', 'Tube & Pipe', 'Hardware & Fasteners', 'Consumable', 'Finished Part');
CREATE TYPE machine_status AS ENUM ('Operational', 'In Use', 'Maintenance', 'Offline');
CREATE TYPE machine_type AS ENUM ('Laser Cutter', 'CNC Press Brake', 'Robotic Welder', 'Powder Coat Line', 'Deburring Machine');
CREATE TYPE supplier_status AS ENUM ('Preferred', 'Active', 'Under Review');
CREATE TYPE po_status AS ENUM ('Draft', 'Sent', 'Partial', 'Received', 'Cancelled');
CREATE TYPE invoice_status AS ENUM ('Paid', 'Pending', 'Overdue');

-- 2. Profiles Table (Extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'Worker',
    department TEXT,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Customers Table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    industry TEXT DEFAULT 'Metal Fabrication',
    address TEXT NOT NULL,
    status customer_status NOT NULL DEFAULT 'Active',
    total_orders INT NOT NULL DEFAULT 0,
    lifetime_value NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Quotations Table
CREATE TABLE quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_number TEXT NOT NULL UNIQUE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    title TEXT NOT NULL,
    status quotation_status NOT NULL DEFAULT 'Draft',
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
    valid_until DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Work / Sales Orders Table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL UNIQUE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    title TEXT NOT NULL,
    priority order_priority NOT NULL DEFAULT 'Normal',
    status order_status NOT NULL DEFAULT 'Pending',
    progress_percent INT NOT NULL DEFAULT 0,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    due_date DATE NOT NULL,
    assigned_supervisor UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Inventory Items Table
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category inventory_category NOT NULL DEFAULT 'Sheet Metal',
    material_grade TEXT NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    unit TEXT NOT NULL DEFAULT 'Sheets',
    reorder_point INT NOT NULL DEFAULT 10,
    unit_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    location TEXT NOT NULL,
    last_restocked TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Machines Fleet Table
CREATE TABLE machines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    type machine_type NOT NULL DEFAULT 'Laser Cutter',
    status machine_status NOT NULL DEFAULT 'Operational',
    efficiency_rate NUMERIC(5, 2) NOT NULL DEFAULT 95.00,
    hours_logged_this_month NUMERIC(8, 2) NOT NULL DEFAULT 0.00,
    last_maintenance DATE NOT NULL,
    next_scheduled_maintenance DATE NOT NULL,
    assigned_operator UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- 8. Workers Table
CREATE TABLE workers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_code TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'Worker',
    specialization TEXT NOT NULL,
    shift TEXT NOT NULL DEFAULT 'Morning',
    status TEXT NOT NULL DEFAULT 'Active',
    certifications TEXT[] NOT NULL DEFAULT '{}',
    hourly_rate NUMERIC(8, 2) NOT NULL DEFAULT 25.00,
    assigned_machine UUID REFERENCES machines(id) ON DELETE SET NULL
);

-- 9. Suppliers Table
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    materials_supplied TEXT[] NOT NULL DEFAULT '{}',
    average_lead_time_days INT NOT NULL DEFAULT 5,
    rating NUMERIC(3, 2) NOT NULL DEFAULT 4.50,
    status supplier_status NOT NULL DEFAULT 'Active'
);

-- 10. Purchase Orders Table
CREATE TABLE purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_number TEXT NOT NULL UNIQUE,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
    supplier_name TEXT NOT NULL,
    status po_status NOT NULL DEFAULT 'Draft',
    total_cost NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    item_count INT NOT NULL DEFAULT 1,
    expected_delivery DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Invoices Table
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT NOT NULL UNIQUE,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status invoice_status NOT NULL DEFAULT 'Pending',
    due_date DATE NOT NULL,
    issued_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- 12. Activity Logs Table
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_name TEXT NOT NULL,
    user_role user_role NOT NULL,
    action TEXT NOT NULL,
    target TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    log_type TEXT NOT NULL DEFAULT 'system'
);

-- Row Level Security (RLS) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all business records
CREATE POLICY "Allow authenticated read" ON customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read" ON quotations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read" ON orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read" ON inventory_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read" ON machines FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read" ON workers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read" ON suppliers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read" ON purchase_orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read" ON invoices FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read" ON activity_logs FOR SELECT TO authenticated USING (true);
