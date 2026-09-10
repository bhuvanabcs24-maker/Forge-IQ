# ForgeIQ — Performance Baseline Report

## 1. Executive Summary
This document records the pre-optimization performance baselines for ForgeIQ across all system tiers: Database, API, RAG Knowledge Retrieval, AI Orchestration, Deterministic Tool Execution, and Concurrency Throughput.

All metrics are measured against the active ForgeIQ infrastructure (Neon Serverless PostgreSQL 18.6 and the FastAPI/Python AI microservice).

---

## 2. Database Baseline

### Infrastructure
- **Engine**: PostgreSQL 18.6 (Neon Serverless)
- **Region**: `aws-us-east-2`
- **Driver**: `@neondatabase/serverless` (HTTP pooled client)

### Query Latencies (Uncached Cold / Remote Roundtrip)
| Query Target | P50 (ms) | P90 (ms) | P95 (ms) | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `SELECT * FROM orders ORDER BY created_at DESC LIMIT 50` | 377.2 ms | 412.0 ms | 435.5 ms | Missing index on `created_at` |
| `SELECT * FROM production_jobs WHERE current_stage_id != 'delivered'` | 384.1 ms | 420.3 ms | 441.2 ms | Sequential scan on unindexed stage |
| `SELECT * FROM inventory_items ORDER BY material_grade` | 395.4 ms | 430.8 ms | 450.0 ms | Unindexed sorting |
| `SELECT * FROM machines ORDER BY id` | 351.0 ms | 382.4 ms | 399.1 ms | Full table scan |
| `SELECT * FROM customers ORDER BY company_name` | 367.3 ms | 398.2 ms | 412.5 ms | Unindexed customer sorting |
| **Average Remote Roundtrip** | **375.0 ms** | **408.7 ms** | **427.7 ms** | High cold HTTP network overhead |

### Database Bottlenecks Identified
1. **Missing Target Indexes**: Sequential scans on `orders.created_at`, `orders.customer_id`, `production_jobs.current_stage_id`, `inventory_items.category`, and `machines.status`.
2. **Redundant Concurrent Requests**: Simultaneous frontend components (e.g. Dashboard stats widget + Active Jobs table) trigger separate HTTP queries for the exact same rows.
3. **No Query Result Caching**: Every page navigation re-executed identical SQL over the public internet.

---

## 3. RAG & Knowledge Retrieval Baseline

### Configuration
- **Embedding Dimensions**: 384 (all-MiniLM-L6-v2)
- **Document Store**: 100 industrial manufacturing specifications and material standards
- **Similarity Metric**: Cosine similarity

### Latencies
| Component | Baseline Latency | Bottleneck |
| :--- | :--- | :--- |
| **Embedding Generation** | 0.023 ms | No LRU query caching for repeated engineering queries |
| **Vector Search Retrieval** | 1.171 ms | Dynamic L2 norm calculation in Python loop for every record |
| **Total RAG Retrieval** | **1.194 ms** | Redundant Euclidean norm recalculation |

---

## 4. Deterministic Tool Execution Baseline

### Manufacturing Calculators
| Calculator Function | Baseline Latency | Call Overhead |
| :--- | :--- | :--- |
| `calculate_material_weight` | 0.009 ms | Float arithmetic re-evaluated every time |
| `calculate_laser_time` | 0.009 ms | Recomputed pierces, perimeter, and speed |
| `calculate_bending_time` | 0.008 ms | Repeated tonnage and cycle estimations |
| `calculate_quote` | 0.022 ms | Multi-step markup and manufacturing aggregation |

---

## 5. AI Orchestrator Baseline

| Metric | Baseline | Target |
| :--- | :--- | :--- |
| **Time to First Action / Token** | 1.25 ms | < 100 ms |
| **Total Orchestration Latency** | 1.31 ms | < 200 ms |
| **Inference Gate** | Local deterministic fallback | Deterministic engine |

---

## 6. Concurrency & Throughput Baseline

Measured via simultaneous asynchronous task execution on the AI microservice:

| Concurrency Level | Total Duration | Throughput (req/sec) |
| :--- | :--- | :--- |
| **10 concurrent requests** | 11.6 ms | 860.1 req/s |
| **25 concurrent requests** | 28.9 ms | 863.6 req/s |
| **50 concurrent requests** | 58.1 ms | 860.5 req/s |
