# ForgeIQ Production Deployment Guide

This guide details the step-by-step production architecture and deployment workflows for ForgeIQ across **Vercel** (Next.js frontend) and **Railway / Docker** (FastAPI AI microservice), integrated with **Neon Serverless PostgreSQL**.

---

## 🏗️ Architecture Topology

```
                  ┌──────────────────────────────┐
                  │    Global Edge Users / B2B   │
                  └──────────────┬───────────────┘
                                 │ HTTPS
                                 ▼
                  ┌──────────────────────────────┐
                  │   Vercel Global CDN (Next.js) │
                  │      forge-iq-gold.vercel.app │
                  └──────┬───────────────┬───────┘
                         │               │
        Internal JSON API│               │ Pooled PostgreSQL (SSL)
                         ▼               ▼
          ┌─────────────────────────┐  ┌─────────────────────────┐
          │  Railway AI Container   │  │  Neon Serverless DB     │
          │   (FastAPI Microservice)│  │   PostgreSQL 18.6       │
          └─────────────────────────┘  └─────────────────────────┘
```

---

## 1. Frontend Deployment (Vercel)

1. **Connect GitHub Repository**:
   - Link `bhuvanabcs24-maker/Forge-IQ` to Vercel.
   - Framework Preset: **Next.js**.
   - Root Directory: `./`.

2. **Environment Variables**:
   ```ini
   DATABASE_URL="postgresql://user:password@ep-xyz-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
   PYTHON_SERVICE_URL="https://forgeiq-ai-production.up.railway.app"
   AI_PROVIDER="local"
   NEXT_PUBLIC_APP_URL="https://forge-iq-gold.vercel.app"
   ```

3. **Build & Output Settings**:
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

---

## 2. AI Microservice Deployment (Railway / Container)

1. **Dockerfile**:
   ```dockerfile
   FROM python:3.11-slim
   WORKDIR /app
   COPY ai-service/requirements.txt .
   RUN pip install --no-cache-dir -r requirements.txt
   COPY ai-service/ .
   EXPOSE 8000
   CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
   ```

2. **Service Configuration**:
   - Healthcheck Path: `/health`
   - Port: `8000`
   - Environment: `PYTHONPATH=.`, `AI_PROVIDER=local`

---

## 3. Continuous Integration & Quality Gates

Every commit to `main` executes automated validation in GitHub Actions (`.github/workflows/e2e-tests.yml`):
- **Lint & Typecheck**: `npx tsc --noEmit`
- **Unit & Journey Tests**: `pytest ai-service/tests/ -v` (33/33 passing)
- **AI Benchmark Gates**: `python ai-service/evaluation/run_evals.py` (8/8 passing)
- **Playwright E2E Tests**: `npx playwright test` (16/16 passing)
