# ForgeIQ — Autonomous AI Manufacturing Intelligence & Commerce OS

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Neon PostgreSQL](https://img.shields.io/badge/Neon-PostgreSQL%2018-00e599?style=for-the-badge&logo=postgresql&logoColor=black)](https://neon.tech/)
[![OpenAI](https://img.shields.io/badge/AI%20SDK-AsyncOpenAI%20Backend-412991?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)
[![Pytest](https://img.shields.io/badge/Pytest-33%20Passing-brightgreen?style=for-the-badge&logo=pytest&logoColor=white)](https://pytest.org/)
[![AI Benchmark](https://img.shields.io/badge/AI%20Benchmark-10%2F10%20Passed-blueviolet?style=for-the-badge)](ai-service/scripts/evaluate_model.py)
[![Razorpay](https://img.shields.io/badge/Razorpay-INR%20%E2%82%B9-0c2340?style=for-the-badge&logo=razorpay&logoColor=3395FF)](https://razorpay.com/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg?style=for-the-badge)](LICENSE)

<br />

**A full-stack, enterprise-grade Autonomous Manufacturing Intelligence Platform that powers the entire B2B fabrication lifecycle: multimodal RFQ intake, vector-retrieval RAG industrial reasoning, deterministic CAD geometry and BOM costing, autonomous DFM risk analysis, shop-floor remnant inventory tracking, machine scheduling, and Razorpay milestone escrow payments.**

[Feature Showcase](#-feature-showcase--compact-screenshots) • [System Architecture](#-system-architecture) • [Manufacturing AI Knowledge Spec](#-manufacturing-ai-knowledge-specification) • [Master AI Implementation](#-master-ai-implementation-phases-1--6) • [Database Architecture](#-real-world-database-integration) • [Getting Started](#-getting-started) • [Testing & Benchmarks](#-testing--quality-assurance)

</div>

---

## 🌟 Executive Summary & Problem Space

Precision contract manufacturing (sheet metal fabrication, CNC milling, additive printing) is a **$450B+ global industry** burdened by manual friction:
- **Quotation Bottleneck**: Estimators spend hours to days manually calculating laser piercing times, bend deductions, scrap rates, and tooling allowances from engineering drawings.
- **Unstructured RFQ Chaos**: Customer purchase requests arrive fragmented across WhatsApp chats, hand-drawn sketches, unstructured PDFs, and legacy CAD drawings.
- **Shop Floor Blindspots**: Job shops manage million-dollar fiber lasers and press brakes using dry-erase whiteboards and disconnected Excel spreadsheets, leading to delayed milestones and idle machine capacity.
- **AI Hallucination Risk**: Standard commercial LLMs hallucinate prices, invent tolerances, and fail basic engineering physics.

**ForgeIQ solves this end-to-end.** Combining a Next.js 15 App Router frontend with a Python FastAPI AI microservice, vector-indexed industrial RAG knowledge base, deterministic calculation engines, and live serverless Neon PostgreSQL database, ForgeIQ transforms factory operations into an autonomous, transparent, and high-margin workflow.

---

## 📸 Feature Showcase & Compact Screenshots

### 1. Executive Cockpit & 7-Stage Factory Telemetry
> **Real-time factory telemetry, active revenue metrics, priority attention alerts, and 7-stage operational dispatching (`Receive` ➔ `Quote` ➔ `Plan` ➔ `Manufacture` ➔ `QC` ➔ `Dispatch` ➔ `Get Paid`).**

<p align="center">
  <img src="docs/screenshots/dashboard.png" alt="ForgeIQ Executive Dashboard" width="70%" style="max-width: 650px; border-radius: 8px; border: 1px solid #334155; box-shadow: 0 4px 16px rgba(0,0,0,0.2);" />
</p>

- **Dual-Mode Industrial Theme**: Ultra-clean Light theme and high-contrast Dark theme engineered for shop-floor tablet use and executive desktop displays.
- **Agentic Dispatching**: Proactive AI recommendation cards highlight critical-path actions (e.g. *"Inbound RFQ from Apex Aerospace requires pricing turnaround within 4 hours"* or *"Approve CMM Quality Pass on Job #JOB-1082"*).
- **Universal Command Palette (`⌘K`)**: Instant keyboard navigation across orders, CAD analyses, customers, machines, and quotations.

---

### 2. Shop Floor Production Kanban & Stage Synchronization
> **Real-time dispatch board linking parent orders to assigned equipment (`Laser Cutting` ➔ `Bending` ➔ `Welding` ➔ `Finishing` ➔ `QC Inspection` ➔ `Dispatch`).**

<p align="center">
  <img src="docs/screenshots/production-kanban.png" alt="Production Kanban Board" width="70%" style="max-width: 650px; border-radius: 8px; border: 1px solid #334155; box-shadow: 0 4px 16px rgba(0,0,0,0.2);" />
</p>

- **Order-to-Job Synchronization**: Moving jobs between manufacturing stages automatically updates completion percentage on parent orders in Neon PostgreSQL.
- **Machine Fleet Allocation**: Real-time assignment to Bystronic Fiber Lasers, Amada Press Brakes, and Haas VMC milling centers.

---

### 3. Algorithmic Fabrication Pricing Rules (INR ₹)
> **Configure factory overheads, laser cutting hourly rates, CNC press brake rates, and material margins with deterministic recalculation.**

<p align="center">
  <img src="docs/screenshots/pricing-rules.png" alt="Fabrication Pricing Rules" width="70%" style="max-width: 650px; border-radius: 8px; border: 1px solid #334155; box-shadow: 0 4px 16px rgba(0,0,0,0.2);" />
</p>

- **Machine Hourly Rates**: Independent machine rate matrices (e.g., Fiber Laser at ₹1,850/hr, CNC Press Brake at ₹950/hr, Haas VMC at ₹1,200/hr).
- **Logistics & Tax Handling**: Configurable packaging, weight-based logistics, scrap rate compensation, and Indian GST (18%).

---

### 4. Deterministic Quote Builder & Explainable Cost Breakdown
> **Generate auditable, itemized quotations with 16-point mathematical traceability, plain-English AI justifications, and explicit `ASSUMPTION` tagging.**

<p align="center">
  <img src="docs/screenshots/quote-builder.png" alt="Quotation Builder and Cost Breakdown" width="70%" style="max-width: 650px; border-radius: 8px; border: 1px solid #334155; box-shadow: 0 4px 16px rgba(0,0,0,0.2);" />
</p>

- **Zero-Hallucination Math**: Material, laser cycle time, bending strokes, CAM programming, and margins are computed deterministically.
- **Assumption Tracking**: If secondary finishing rates (e.g. powder coating) are unverified, the quote is labeled with `ASSUMPTION` and marked as `LOW` confidence until confirmed.

---

### 5. Multimodal AI Order Intake & Extraction Pipeline
> **Zero manual data entry. Drag & drop incoming customer WhatsApp messages, scanned purchase orders, or technical drawings.**

<p align="center">
  <img src="docs/screenshots/ai-order-intake.png" alt="AI Order Intake Uploader" width="70%" style="max-width: 650px; border-radius: 8px; border: 1px solid #334155; box-shadow: 0 4px 16px rgba(0,0,0,0.2);" />
</p>

- **Universal Document Intake**: Accepts `.pdf`, `.png`, `.jpg`, `.dwg`, and text messages.
- **Field Confidence Scoring**: Visual confidence chips across material grade, sheet thickness, tolerances, and batch quantities with automated clarification questioning.

---

### 6. Factory AI Copilot & Live Shop Floor Inquiries
> **An intelligent manufacturing assistant that queries live database facts and RAG procedures instead of guessing.**

<p align="center">
  <img src="docs/screenshots/factory-copilot.png" alt="Factory AI Copilot" width="70%" style="max-width: 650px; border-radius: 8px; border: 1px solid #334155; box-shadow: 0 4px 16px rgba(0,0,0,0.2);" />
</p>

- **Live Operational Q&A**: Answers *"Which machines are available?"*, *"Do we have enough SS304 sheets?"*, *"Can we bend this 12mm flange?"*, and *"Why is this quote ₹23,028?"*.
- **Tool-Driven Grounding**: Dynamically invokes material calculators, remnant finders, and DFM validators.

---

### 7. Secure Authentication & Password Management
> **Robust authentication powered by Neon PostgreSQL with instant password show/hide eye toggle and OTP SMS verification.**

<p align="center">
  <img src="docs/screenshots/auth-login.png" alt="Secure Authentication" width="70%" style="max-width: 650px; border-radius: 8px; border: 1px solid #334155; box-shadow: 0 4px 16px rgba(0,0,0,0.2);" />
</p>

- **Interactive Eye Symbol**: Seamless show/hide toggle for password fields.
- **Dual Authentication**: Email + password login alongside mobile phone SMS OTP verification.

---

## 🏗️ System Architecture

ForgeIQ utilizes a distributed microservices and serverless architecture designed for sub-second latency, deterministic precision, and zero-hallucination safety:

<p align="center">
  <img src="docs/screenshots/system-architecture.png" alt="System Architecture" width="70%" style="max-width: 650px; border-radius: 8px; border: 1px solid #334155; box-shadow: 0 4px 16px rgba(0,0,0,0.2);" />
</p>

```mermaid
flowchart TD
    subgraph ClientLayer["🖥️ Frontend & Client Layer"]
        Browser["Next.js 15 App Router\n(React 19 + Tailwind CSS 3.4)"]
        Dashboard["Executive Cockpit & Kanban\n(/dashboard, /production)"]
        CommandPalette["Global Command Palette\n(⌘K Quick Dispatch)"]
    end

    subgraph AppServer["⚡ Next.js Backend & API Routes"]
        Middleware["Role-Based Middleware\n(Owner | Manager | Operator | QA | Customer)"]
        ServerActions["Server Actions & Route Handlers\n(/api/orders, /api/inventory, /api/machines)"]
        PythonBridge["Strongly-Typed AI Bridge\n(python-client.ts with Tenant Isolation)"]
    end

    subgraph AIService["🤖 Python AI Microservice (FastAPI :8000)"]
        AsyncOpenAI["Native AsyncOpenAI Client\n(gpt-4o-mini Backend Only)"]
        DFMAgent["Autonomous DFM Agent\n(Tolerances, Flanges, Hardox Validation)"]
        Calculators["Deterministic Calculation Engines\n(Material, Laser Speed, Bending V~8T, Quotes)"]
        KnowledgeResolver["Source Priority Resolver\n(Hierarchy & Staleness Tracking)"]
        VectorStore["Industrial RAG Knowledge Base\n(pgvector / In-Memory Vector Store)"]
    end

    subgraph DatabaseLayer["🗄️ Persistence & Cloud Infrastructure"]
        NeonDB[("Neon Serverless PostgreSQL\n(Orders, Inventory, Machines, Customers, Jobs)")]
        Razorpay["Razorpay Payment Gateway\n(INR ₹ Escrow Orders & Webhooks)"]
    end

    Browser --> Middleware
    Dashboard --> Middleware
    CommandPalette --> Middleware
    Middleware --> ServerActions

    ServerActions <--> NeonDB
    ServerActions --> PythonBridge
    PythonBridge <-->|"Internal HTTP / JSON"| AIService

    AIService --> AsyncOpenAI
    AIService --> DFMAgent
    AIService --> Calculators
    AIService --> KnowledgeResolver
    AIService --> VectorStore

    ServerActions <--> Razorpay
```

---

## 📐 Manufacturing AI Knowledge Specification

ForgeIQ strictly implements the **71-Section Manufacturing AI Knowledge Specification**:

### 1. The Core RAG vs. Fine-Tuning Principle
- **RAG & Live Database**: Used strictly for dynamic factory facts (material prices, current inventory stock, machine availability, active jobs, customer orders). The LLM **NEVER** memorizes volatile prices.
- **Fine-Tuning**: Used primarily for behavior, engineering terminology, reasoning patterns, DFM decision-making, and uncertainty handling.
- **Deterministic Math**: The LLM determines *what* calculation is needed; deterministic Python code computes the exact numbers.

### 2. Strict 8-Tier Source Priority Hierarchy
When conflicting information exists, ForgeIQ resolves values in this exact priority:
1. **Approved Factory Database** (`rank 1`)
2. **Approved Factory SOP** (`rank 2`)
3. **Approved Supplier Data** (`rank 3`)
4. **Machine Manufacturer Documentation** (`rank 4`)
5. **Applicable Engineering Standard** (ISO 2768, ISO 286, ISO 9013) (`rank 5`)
6. **Approved Engineering Reference** (`rank 6`)
7. **General Web Information** (`rank 7`)
8. **LLM Learned Knowledge / Memory** (`rank 8`)

### 3. Zero-Hallucination & Missing Data Policy
If any factory rate or machine parameter is missing:
- Defaults strictly to `TO_BE_PROVIDED` or `UNKNOWN`.
- If an expiry date has passed, the record transitions to `is_stale = True`.
- Quotations with missing data are flagged as `LOW` confidence with explicit `ASSUMPTION` labels.

---

## 🚀 Master AI Implementation (Phases 1 – 6)

### Phase 1: Backend OpenAI & Environment Hardening
- **Native AsyncOpenAI SDK**: Installed official `openai>=1.30.0` library.
- **Environment Compliance**: Hardened `ai-service/.env.example` to strictly contain only `OPENAI_API_KEY=`.
- **Backend-Only Execution**: Zero frontend exposure. All API keys reside strictly on the server side.

### Phase 2: Knowledge Base Schemas & Conflict Resolution
- Implemented `ManufacturingKnowledgeRecord`, `MachineRecord`, `MaterialRecord`, and `ConflictResolutionResult` in `app/models/schemas.py`.
- Created `KnowledgeConflictResolver` in `app/rag/knowledge_loader.py` enforcing the 8-tier hierarchy and staleness tracking (`valid_until`).

### Phase 3: Deterministic Tools & Calculators
- **Material Calculator**: Part weight, sheet weight, nesting efficiency, and scrap ($W = V \times \rho$).
- **Inventory Tools**: Checks exact stock and queries shop-floor remnants before suggesting procurement (Section 32).
- **Laser Cutting Engine**: Bystronic 6kW speed lookup, cutting/piercing time, gas consumption, and machine runtime costing.
- **Bending Engine**: Air bending V-die opening ($V \approx 8T$), bend allowance, bend deduction, and minimum flange checks.
- **Quotation Calculator**: 16-point deterministic breakdown with lead-time calculation (Section 28).

### Phase 4: Autonomous DFM Agent
- **Critical Tolerance Detection**: Flags tolerances $\le \pm 0.05$ mm (such as $\pm 0.02$ mm) as exceeding thermal laser cutting capability and recommends secondary CNC milling and CMM inspection.
- **Short-Flange Condition**: Flags flanges $< 0.7 \times V$ with tooling verification warnings.
- **Hardox Wear Plate Validation**: Refuses mild steel bending parameters; enforces OEM SSAB charts and high-tonnage checks.
- **Hole-to-Bend Proximity**: Validates hole distance $D \ge 2.5T + R$.

### Phase 5 & 6: Data Ingestion, Training Builder & 10-Point Evaluator
- **Standardized Ingestion Pipeline** (`app/ingestion/pipeline.py`): 9-stage pipeline (Fetch ➔ Parse ➔ Validate ➔ Normalize ➔ Deduplicate ➔ Assign Metadata ➔ Store ➔ Index).
- **Continuous Training Dataset Builder** (`scripts/build_training_dataset.py`): Compiles 54 verified decision pairs into `forgeiq_llm_finetune.jsonl` while rejecting hardcoded dynamic prices.
- **10-Point Benchmark Evaluator** (`scripts/evaluate_model.py`): Benchmarks the 10 core dimensions from Section 28 (**10/10 Passed**).

---

## 🗄️ Real-World Database Integration

All platform inputs are connected to live **Neon PostgreSQL** with real-world relationships and zero dummy duplicate data:

```mermaid
erDiagram
    CUSTOMERS ||--o{ ORDERS : "places order"
    ORDERS ||--|| PRODUCTION_JOBS : "spawns shop floor job"
    INVENTORY_ITEMS ||--o{ PRODUCTION_JOBS : "reserves raw material"
    MACHINES ||--o{ PRODUCTION_JOBS : "processes operation"
```

1. **Order ➔ Customer**: Every order links to a verified customer, updating lifetime value (LTV) and order counts.
2. **Order ➔ Goods / Inventory**: Every order specifies required material (e.g., `RAW-SS304-18G`) and deducts stock in `inventory_items`.
3. **Order ➔ Machine ➔ Production Job**: Automatically provisions a linked production dispatch card on assigned machines (`TRUMPF Laser`, `Bystronic Press Brake`, `Haas VMC`).
4. **Kanban Stage Synchronization**: Stage movements persist to Neon PostgreSQL and synchronize parent order status.

---

## 🛠️ Complete Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 15.5.23** | React Server Components, App Router, Nested Layouts |
| **UI Library** | **React 19.0** | Modern concurrency, Server Actions, Transitions |
| **Language** | **TypeScript 5.7** | Strict type safety across all frontend and API layers |
| **Styling** | **Tailwind CSS 3.4** | Dual Light/Dark design system with Slate and Steel tokens |
| **AI Microservice** | **Python 3.11 + FastAPI** | Asynchronous CAD geometry analysis and OCR parsing |
| **AI SDK** | **AsyncOpenAI Native** | Official asynchronous OpenAI Python SDK (backend only) |
| **Database** | **Neon PostgreSQL 18.6** | Serverless SQL with connection pooling and SSL encryption |
| **Payment Gateway** | **Razorpay** | Secure ₹ (INR) online transactions and webhook callbacks |
| **Testing** | **Pytest (33 Tests)** | 33 automated unit tests, journey suites, and DFM validations |
| **Benchmarking** | **10-Point Model Evaluator** | Automated evaluation scorecard (**10/10 Passed**) |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.18.0` or higher (`v20.x` LTS recommended)
- **Python**: `3.10` or higher
- **npm** or **pnpm**

### Step-by-Step Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/bhuvanabcs24-maker/Forge-IQ.git
   cd ForgeIQ
   ```

2. **Install Node dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   *The application includes pre-configured fallback providers, so you can immediately explore without requiring external API keys.*

4. **Start the Python AI Service (Terminal 1):**
   ```bash
   cd ai-service
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   *Interactive Swagger Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)*

5. **Start the Next.js Web Application (Terminal 2):**
   ```bash
   npm run dev -p 3001
   ```
   *The platform is now live at [http://localhost:3001](http://localhost:3001)*

---

## 🧪 Testing & Quality Assurance

ForgeIQ includes automated test suites covering the frontend compilation, the Python AI microservice, and model evaluation benchmarks:

```bash
# 1. Run all 33 automated Pytest suites (endpoints, journeys, DFM, tools, knowledge)
PYTHONPATH=ai-service ai-service/.venv/bin/pytest ai-service/tests/ -v
# Output: 33 passed in 1.04s (100% PASS)

# 2. Run the 10-point Manufacturing AI Benchmark Evaluator
PYTHONPATH=ai-service ai-service/.venv/bin/python ai-service/scripts/evaluate_model.py
# Output: Overall Benchmark Status: ✅ PASSED (10/10)

# 3. Build & validate clean fine-tuning dataset
PYTHONPATH=ai-service ai-service/.venv/bin/python ai-service/scripts/build_training_dataset.py
# Output: 54 verified training pairs built

# 4. Run Next.js TypeScript validation
npx tsc --noEmit
```

### Benchmark Scorecard
```
==================================================
FORGEIQ MASTER AI BENCHMARK EVALUATION SCORECARD
==================================================
Material Cost Accuracy             : ✅ PASS
Quotation Accuracy                 : ✅ PASS
Dfm Accuracy                       : ✅ PASS
Machine Selection                  : ✅ PASS
Inventory Reasoning                : ✅ PASS
Lead Time Estimation               : ✅ PASS
Tool Selection                     : ✅ PASS
Hallucination Rate Zero            : ✅ PASS
Missing Data Handling              : ✅ PASS
Source Attribution                 : ✅ PASS
==================================================
Overall Benchmark Status: ✅ PASSED (10/10)
==================================================
```

---

## 🗺️ Key Application Routes

| Experience | Route | Key Functionality |
| :--- | :--- | :--- |
| **Executive Dashboard** | `/dashboard` | Machine utilization, live revenue, priority attention alerts |
| **Orders Directory** | `/orders` | Live Neon DB orders, material reservations, stage progress |
| **Production Kanban** | `/production` | Live shop floor dispatch board linked to machines |
| **Goods & Inventory** | `/inventory` | Raw material sheets, stock levels, remnant registers |
| **Equipment Fleet** | `/machines` | CNC lasers, press brakes, VMC, maintenance toggle |
| **Customer Directory** | `/customers` | Client accounts, lifetime value (LTV), contact drawer |
| **Pricing Rules** | `/settings` | Machine hourly rates, logistics, and GST parameters |
| **Authentication** | `/auth/login` | Email/password with eye toggle & mobile SMS OTP verification |

---

## 👤 Author

**Bhuvan A B**
- **Institution**: B.M.S. College of Engineering (BMSCE)
- **Email**: bhuvanab.cs24@bmsce.ac.in
- **GitHub**: [@bhuvanabcs24-maker](https://github.com/bhuvanabcs24-maker)

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
