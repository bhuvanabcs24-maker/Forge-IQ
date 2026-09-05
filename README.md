# ForgeIQ — AI-Powered Agentic Commerce & Manufacturing Platform

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-15.1-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38b2ac?logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Ready-green?logo=supabase)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

**An intelligent end-to-end manufacturing commerce operating system connecting buyers and factory shop floors through autonomous AI agents.**

[Overview](#-overview) • [Core Workflow](#-the-core-workflow) • [Key Portals](#-key-portals--experiences) • [Features](#-features--modules) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Deployment](#-deployment)

</div>

---

## 🏭 Overview

**ForgeIQ** bridges the gap between buyers who need precision parts made and the modern manufacturing shop floors that produce them. Traditional manufacturing workflows suffer from fragmented communication, manual quotation delays, opaque production tracking, and disconnected ERP spreadsheets. 

ForgeIQ transforms this into an **agentic manufacturing OS** that automates the entire lifecycle: from RFQ intake and automated engineering cost estimation to machine scheduling, live job tracking, and dispatch delivery.

---

## 🔄 The Core Workflow

ForgeIQ is built around one unified, friction-free journey:

```
[ DISCOVER ] ──▶ [ DECIDE ] ──▶ [ BUY ] ──▶ [ MANUFACTURE ] ──▶ [ TRACK ] ──▶ [ DELIVER ]
   Marketplace      Instant AI     Quote Approval    Gantt Planner      Live Shop Floor    Dispatch &
   Capabilities      Costing       & Invoicing       & Scheduling       Buyer Portal       Logistics
```

1. **DISCOVER**: Buyers find vetted manufacturing partners based on material, tolerance, and process capabilities (CNC, sheet metal, injection molding, 3D printing).
2. **DECIDE**: Intelligent quotation engine parses specifications, drawings, and CAD models to provide instantaneous, accurate pricing and lead times.
3. **BUY**: Seamless quote approval, digital purchase orders, automated invoice generation, and milestone-based payment schedules.
4. **MANUFACTURE**: Operational Factory ERP schedules jobs onto machines and assign shifts to operators using smart capacity planning.
5. **TRACK**: Transparent milestones (Raw Material In ➔ Machining ➔ QC Inspection ➔ Packing) visible to both the shop supervisor and buyer.
6. **DELIVER**: Final quality sign-off, dispatch documentation, shipping tracking, and customer sign-off.

---

## 🌐 Key Portals & Experiences

ForgeIQ provides three integrated interfaces tailored for each stakeholder:

### 1. ⚙️ ForgeIQ Factory (Operational Business OS & ERP)
*Target: Factory Owners, Plant Managers, Estimators, Supervisors, Operators*
- **Executive Cockpit**: Real-time revenue, machine utilization, on-time delivery rate, and active job alerts.
- **Production Planner**: Visual Gantt & timeline board for machine capacity, operation routing, and lead-time buffering.
- **Smart Estimation Engine**: Bill of Materials (BOM) calculator, machining time models, scrap rates, and margin controls.
- **Resource Management**: Complete machine health registry, maintenance logs, and worker shift assignments.
- **Inventory & Supply Chain**: Stock levels, reorder threshold alerts, supplier registry, and Purchase Orders.

### 2. 🛍️ Buyer Experience & Customer Portal
*Target: Procurement Officers, Hardware Engineers, Product Buyers*
- **Self-Service Job Tracking**: Real-time progress status (`Pending`, `In Production`, `QC Passed`, `Dispatched`).
- **Quote Review & Sign-off**: Detailed cost breakdowns, lead time options, and one-click quote approvals.
- **Drawing & CAD Vault**: Centralized revision control for engineering drawings, 3D models, and design feedback.

### 3. 🌐 Manufacturing Marketplace
*Target: Open Bidding, Multi-Vendor Sourcing*
- Discover vetted suppliers across CNC Machining, Sheet Metal Fabrication, 3D Printing, and Injection Molding.
- Direct RFQ broadcast to matched suppliers for competitive bids.

---

## 🤖 AI & Agentic Core

ForgeIQ includes purpose-built agentic capabilities:

- **AI Order Intake**: Parses unstructured RFQs arriving via WhatsApp, emails, or PDFs, extracting dimensions, quantities, materials, and tolerances into structured database orders.
- **CAD & Drawing Analysis**: Reads engineering prints and geometries to flag difficult tolerances, machining overhangs, and recommend optimal manufacturing operations.
- **Conversational AI Assistant**: An in-app copilot answering operational questions: *"Which machines are idle tomorrow afternoon?"*, *"Generate an invoice for Acme Corp PO #402"*, or *"Find bottlenecks in Job 104"*.

---

## 🛠️ Features & Modules

| Module | Route | Description |
| :--- | :--- | :--- |
| **Executive Dashboard** | `/dashboard` | Factory KPI metrics, revenue charts, job status breakdown, alerts |
| **Marketplace** | `/marketplace` | Supplier directory, capability matching, verified shop profiles |
| **Customer Portal** | `/portal/dashboard` | Buyer-facing order tracking, drawing repository, milestone updates |
| **Orders & RFQs** | `/orders` | End-to-end lifecycle management of incoming buyer requests |
| **Automated Quotations** | `/quotations` | Dynamic pricing models, markup configuration, PDF export |
| **Production Planner** | `/production` | Interactive Gantt chart, machine scheduling, route operations |
| **Shop Floor Machines** | `/machines` | Machine status (Running, Idle, Maintenance), utilization rates |
| **Workers & Shifts** | `/workers` | Operator rosters, skill certifications, attendance scheduling |
| **Inventory & Materials** | `/inventory` | Raw metal stocks, hardware consumables, auto-reorder alerts |
| **Suppliers** | `/suppliers` | Vetted vendor database, lead-time tracking, quality scoring |
| **Purchase Orders** | `/purchase-orders` | Inbound procurement orders linked directly to production jobs |
| **Invoices & Billing** | `/invoices` | Automated tax invoices, milestone payments, credit terms |
| **AI Order Intake** | `/ai-order-intake` | Multi-channel AI parser for WhatsApp / PDF / email orders |
| **AI Copilot** | `/ai-assistant` | Agentic assistant for factory analytics and task automation |

---

## 💻 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Server Actions)
- **UI Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom design tokens
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Data Visualization**: [Recharts](https://recharts.org/) (Custom WCAG AA dark-mode tooltips & responsive containers)
- **Data Tables**: [@tanstack/react-table](https://tanstack.com/table)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Backend & Auth**: [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/nextjs) + Next.js API route handlers
- **Containerization**: Docker & Docker Compose

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.18.0` or higher (Node 20+ recommended)
- **Package Manager**: `npm`, `pnpm`, or `yarn`
- **Git**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/bhuvanabcs24-maker/Forge-IQ.git
   cd Forge-IQ
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables (Optional for local mock mode):**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
   *(Note: ForgeIQ includes rich mock and fallback providers, allowing the entire application to be run and evaluated out-of-the-box without external database setup).*

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open in Browser:**
   - Landing & Experience Portal: [http://localhost:3000](http://localhost:3000)
   - Factory ERP Dashboard: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
   - Buyer Marketplace: [http://localhost:3000/marketplace](http://localhost:3000/marketplace)
   - Customer Portal: [http://localhost:3000/portal/dashboard](http://localhost:3000/portal/dashboard)

---

## 📦 Production Build

To test the production build locally:

```bash
# Build the optimized production bundle
npm run build

# Start the production server
npm start
```

---

## 🐳 Docker Deployment

Run the entire application using Docker:

```bash
# Build and run the container
docker compose up --build -d

# View container logs
docker compose logs -f

# Stop the container
docker compose down
```

---

## ☁️ Deploy to Vercel

ForgeIQ is pre-configured for frictionless deployment to [Vercel](https://vercel.com):

1. Push your latest code to your GitHub repository:
   ```bash
   git push origin main
   ```
2. Go to [**vercel.com/new**](https://vercel.com/new).
3. Import your **`Forge-IQ`** repository.
4. Framework preset **Next.js** will be detected automatically.
5. Click **Deploy**.

---

## 📂 Project Structure

```
ForgeIQ/
├── public/                  # Static assets, logos, CAD icons
├── src/
│   ├── app/                 # Next.js App Router (Pages & API routes)
│   │   ├── (auth)/          # Login, Registration, Password recovery
│   │   ├── (dashboard)/     # Factory ERP (Dashboard, Orders, Production, etc.)
│   │   ├── (portal)/        # Buyer-facing tracking & quote portal
│   │   ├── api/             # API routes (webhooks, copilot, quotations)
│   │   ├── marketplace/     # Public manufacturing marketplace
│   │   ├── globals.css      # Design system variables & base styles
│   │   ├── layout.tsx       # Root layout & theme providers
│   │   └── page.tsx         # Unified experience gateway landing page
│   ├── components/          # Reusable UI & domain components
│   │   ├── ui/              # Buttons, inputs, modals, cards, badges
│   │   ├── dashboard/       # Metrics cards, status widgets, charts
│   │   ├── production/      # Gantt timelines, shift planners
│   │   ├── quotations/      # Quotation builder & breakdown tables
│   │   └── copilot/         # AI chat drawer and agent widgets
│   ├── context/             # Global React state (Theme, Auth, Cart)
│   ├── lib/                 # Core utilities, AI models, mock data
│   │   ├── ai/              # AI providers and prompt engineering
│   │   ├── cad/             # Drawing geometry parsers
│   │   ├── supabase/        # Supabase client and SSR middleware
│   │   └── mock-data/       # Realistic enterprise manufacturing data
│   └── types/               # TypeScript interfaces & database types
├── docker-compose.yml       # Container orchestration
├── next.config.ts           # Next.js configuration
├── tailwind.config.ts       # Tailwind CSS theme extensions
├── tsconfig.json            # TypeScript configuration
└── vercel.json              # Vercel security headers & deployment rules
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
