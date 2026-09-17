# ForgeIQ — 5-Minute Technical Pitch & Live Demo Script

> **Track**: Razorpay Buildathon 2026 / Senior Backend & AI Systems Portfolio  
> **Presenter**: Bhuvan A B  
> **Duration**: Exactly 5 Minutes (300 Seconds)  
> **Target Audience**: Technical Judges, Staff Software Engineers, Engineering Directors  
> **Live Demo URL**: [https://forge-iq-gold.vercel.app](https://forge-iq-gold.vercel.app)

---

## ⏱️ Second-by-Second Timing Breakdown

| Segment | Timestamp | Focus | Core Message / Takeaway |
| :--- | :--- | :--- | :--- |
| **1. Problem & Scale** | `0:00 – 1:00` (60s) | The $450B Fabrication Friction | Estimators spend 3 hours/quote; LLMs hallucinate numbers that break CNC tools. |
| **2. The Core Insight** | `1:00 – 1:45` (45s) | Deterministic-First Philosophy | Never use an LLM for physics or finance; math for calculus, AI for exceptions. |
| **3. Live Demonstration** | `1:45 – 3:15` (90s) | End-to-End System Execution | Upload real complex CAD → 18ms analysis → 1-Click quote → Settlement ledger. |
| **4. Hard Engineering & Failures**| `3:15 – 4:15` (60s) | 109 Tests & Post-Mortem | The "66% Weight Vanishing Act" bug, negative lookahead tokenizer, 109 tests. |
| **5. Razorpay Tie-in & Close** | `4:15 – 5:00` (45s) | Autonomous Settlement OS | Cryptographic CAD-to-Rupee lineage via Razorpay Webhooks & multi-party escrow. |

---

## 🎬 Minute-by-Minute Pitch Script & Presenter Cues

```
+───────────────────────────────────────────────────────────────────────────────────────────+
|                                    DEMO WORKSTATION SETUP                                 |
+───────────────────────────────────────────────────────────────────────────────────────────+
| Tab 1: https://forge-iq-gold.vercel.app/cad (CAD Intelligence Studio)                    |
| Tab 2: Terminal with: ./pytest tests/ -v (Ready to show 109 passing tests)               |
| Tab 3: GitHub Repo: https://github.com/bhuvanabcs24-maker/Forge-IQ                       |
| File Ready on Desktop: ForgeIQ_Test_03_Complex_Profile.dxf                                |
+───────────────────────────────────────────────────────────────────────────────────────────+
```

---

### Segment 1: The Problem & Scale (0:00 – 1:00)

**[VISUAL]**: *Open on ForgeIQ Landing Page. Do not touch mouse yet. Speak with confidence and pace.*

> "Good morning judges. Precision sheet metal fabrication is a **$450 billion global industry**, but its financial operations are stuck in the 1990s. 
>
> Today, when a hardware manufacturer submits an engineering drawing for a quotation, a human estimator spends **two to four hours** calculating toolpaths, laser pierce points, press brake tonnages, and material nesting scrap. Quotations take 3 to 5 days to turn around.
>
> When tech companies try to automate this with modern AI, they make a fatal mistake: they feed CAD drawings into multimodal LLMs. 
> 
> **Here is the brutal truth**: LLMs are probabilistic token predictors. If an LLM hallucinates a sheet thickness of 2 mm instead of 6 mm, it understates material mass by 66%, miscalculates cutting speeds, and programs a laser that crashes on the factory floor—costing tens of thousands of dollars in scrapped steel.
>
> In manufacturing and finance, **a 95% accurate model is a 100% liability**."

---

### Segment 2: The Deterministic-First Insight (1:00 – 1:45)

**[VISUAL]**: *Switch to Tab 1 (`/cad`). Scroll to the architecture overview card.*

> "We built **ForgeIQ** around an uncompromising engineering insight:
>
> **Most manufacturing and financial problems aren't AI problems; they are physics, computational geometry, and arithmetic problems.**
>
> ForgeIQ uses a **Deterministic-First Hybrid Architecture**:
> - **Tier 1 (The Core)**: Zero-hallucination computational geometry. Pure Python, graph traversal, and rotating calipers algorithms that calculate outer perimeters, internal cutouts, press-brake bends, and net mass with 100% mathematical repeatability.
> - **Tier 2 (Statistical Corroboration)**: Layer-agnostic geometric classifiers that identify features regardless of customer layer naming.
> - **Tier 3 (AI Exception Triage)**: LLMs used *strictly* for what they excel at—unstructured text parsing of drawing notes and triaging human payment disputes.
>
> The result? Sub-20 millisecond execution, zero third-party API token costs, and 100% physical accuracy."

---

### Segment 3: Live End-to-End Demonstration (1:45 – 3:15)

**[VISUAL]**: *Click 'Upload DXF' and drag `ForgeIQ_Test_03_Complex_Profile.dxf` into the drop zone.*

#### Step 1: Real-Time CAD Extraction (1:45 – 2:15)
> "Let’s watch it work in production on a hostile industrial part: `Test 03 Complex Profile`. 
>
> Notice this drawing intentionally hides its press-brake bends on an ambiguous `REF_LINES` layer, contains 3 internal cutouts, and has 7 precision bolt holes.
>
> I hit upload—**done in 18 milliseconds**."

**[VISUAL]**: *Point cursor to the Live Telemetry Cards on the right.*

> "Look at the telemetry:
> - Envelope: **500 × 360 × 8 mm** calculated via Minimum Oriented Bounding Box.
> - Outer Perimeter: **1576.50 mm**.
> - Exactly **7 holes** classified across 4 distinct drill diameters.
> - Exactly **4 press-brake bends at 90°**, detected geometrically by spatial span ratio without relying on layer names.
> - Net Weight: **10.16 kg**, conserving physical mass after subtracting hole and cutout voids."

#### Step 2: 1-Click AI Quotation with Full Data Lineage (2:15 – 2:45)
**[VISUAL]**: *Click the blue button: '1-Click Generate AI Quotation'.*

> "Now, one click converts this geometry into an executable commercial quotation.
>
> Notice there is **zero mock data**. The Quote Builder instantly hydrates with the exact part:
> - 1 piece, Mild Steel, 10.16 kg.
> - Laser cutting time derived from ISO 9013 thermal speed curves.
> - Press brake tooling cost amortized across the batch.
> - Complete cryptographic lineage: This quote is permanently bound to CAD Hash `cad_8f9a2b...`."

#### Step 3: Financial Settlement & Escrow Ledger (2:45 – 3:15)
**[VISUAL]**: *Scroll down to the 'Financial Breakdown & Razorpay Settlement Ledger'.*

> "Here is where the Track 04 financial controller takes over. When this quote converts to a work order:
> - ForgeIQ initiates a **Razorpay Route multi-party split**: ₹1,850 to the raw steel supplier, ₹1,200 to the fabrication plant, and ₹240 platform fee.
> - The funds are held in automated milestone escrow.
> - GST at 18% and TDS withholding are calculated deterministically to the exact paisa."

---

### Segment 4: Hard Engineering, 109 Tests & Failure Post-Mortem (3:15 – 4:15)

**[VISUAL]**: *Switch to Tab 2 (Terminal). Run `./pytest tests/ -v` and let it stream green.*

> "Any developer can make a happy path work once. What defines ForgeIQ is how it handles failures.
>
> Let me tell you about **The 66% Weight Vanishing Act**:
> During early testing of Test 02, our parser extracted a part thickness of 2 mm instead of 6 mm. Net weight dropped from 7 kg to 2.3 kg.
>
> Why? The drawing title block contained the text `PART: BRACKET-TEST-02`. A greedy regular expression matched the `T` and hyphen `-02` as `Thickness = 2.0 mm` before it ever reached the note `THK 6.0 mm`.
>
> Instead of patching it with another hack, we re-architected our tokenizer with strict word boundaries and negative lookahead, and enforced an invariant test: **Net Mass must always equal (Gross Area - Void Area) × Thickness × Density**.
>
> Today, our test suite contains **109 automated tests** passing in 1.9 seconds—including 16 adversarial tests with self-intersecting loops and binary injection payloads, 17 mathematical invariants, 16 edge cases, and 12 performance benchmarks."

---

### Segment 5: Business Value, Razorpay Tie-in & Close (4:15 – 5:00)

**[VISUAL]**: *Switch to Tab 1 (`/quotations/builder`), pointing to the Audit Lineage Badge.*

> "Why does this matter to Razorpay?
>
> Razorpay processes billions of rupees for B2B merchants. In high-value manufacturing, settlement disputes happen when what was invoiced does not match what was physically fabricated.
>
> By uniting **deterministic CAD extraction** with **Razorpay's Settlement and Webhook APIs**:
> 1. Every settled rupee is cryptographically tied to verified physical machine operations.
> 2. Webhooks reconcile payments deterministically in real time.
> 3. Disputed chargebacks are eliminated because every quote has an immutable mathematical audit trail.
>
> ForgeIQ proves what AI should be: **Not a substitute for judgment or math, but an amplifier of trust.**
>
> The system is fully deployed, production-tested, and open-source. Thank you, and I welcome your questions."

---

## 🛡️ Judge Q&A Cheat Sheet (Top 5 Anticipated Questions)

### Q1: "Why not use an open-source vision model like YOLO or Claude Vision to detect holes and bends?"
> **Answer**:  
> "Vision models operate in pixel raster space, meaning they lose floating-point precision, scale, and vector topology. A 0.5 mm tolerance error in sheet metal means a bolt will not fit through a hole on an assembly line. Furthermore, vision models cost 1,500ms to 4,000ms per inference and cost money per call. By parsing the underlying DXF vector entities directly with `ezdxf` and graph algorithms, we achieve sub-20ms latency at zero inference cost with 100% mathematical precision."

### Q2: "What happens if an uploaded DXF file is completely non-standard, messy, or corrupt?"
> **Answer**:  
> "We built a 3-tier fallback parser and validation pipeline in `DxfNormalizer`. First, it runs through our security sanitizer (`cad_sanitizer.py`) which blocks embedded AutoLISP shell scripts and files over 10MB. Second, if standard parsing fails, it invokes ezdxf's repair and recovery mode to salvage valid polylines. Third, if a DXF has zero semantic layers, our geometric spanning ratio detector identifies bends and loops purely by coordinate topology."

### Q3: "How does the financial settlement reconcile if a machine breaks down mid-production?"
> **Answer**:  
> "ForgeIQ uses milestone-based escrow tracking. When an order is placed, funds are captured via Razorpay and held in escrow. As machine telematics confirm operations (e.g. laser cutting complete, bending verified), milestone payouts are released to suppliers via Razorpay Route. If a machine fails, the remaining unexecuted operations trigger an automated partial refund webhook (`refund.created`) or re-route allocation to another vendor without ledger divergence."

### Q4: "How did you optimize throughput from 860 to 4,589 requests per second?"
> **Answer**:  
> "Three targeted architectural changes: First, we identified database query overhead and added 12 high-traffic B-Tree indexes on PostgreSQL. Second, we implemented in-flight request deduplication so concurrent identical requests share a single database Promise instead of spamming connection pools. Third, we added memory-bounded LRU memoization on physical property calculators, accelerating execution by 4.5x."

### Q5: "Is the frontend running on mock data or real backend APIs?"
> **Answer**:  
> "It runs on live production infrastructure: Next.js 15 deployed on Vercel connecting to a Python FastAPI backend and Neon PostgreSQL. You can upload any standard DXF right now on the live site ([forge-iq-gold.vercel.app](https://forge-iq-gold.vercel.app)), inspect the network tab, and see live JSON payloads returned with cryptographically unique analysis IDs."

---

## 🧯 Emergency Fallback Plans

1. **If Internet Drops During Demo**:
   - Run local backend: `PYTHONPATH=ai-service ai-service/.venv/bin/uvicorn app.main:app --port 8000`
   - Run local frontend: `npm run dev` (running at `localhost:3000`)
   - Pre-loaded offline fixtures in `/public/samples/` work completely offline.
2. **If Browser Tab Freezes**:
   - Directly demonstrate via CLI: `./pytest tests/ -v`
   - Run cURL against local or production API:
     ```bash
     curl -X POST "https://forge-iq-gold.vercel.app/api/cad/analyze" \
       -F "file=@public/samples/ForgeIQ_Test_03_Complex_Profile.dxf"
     ```
