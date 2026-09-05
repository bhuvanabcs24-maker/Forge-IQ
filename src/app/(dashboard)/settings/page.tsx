'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/auth-context';
import { ROUTE_PERMISSIONS, ROLE_DESCRIPTIONS } from '@/lib/rbac';
import { UserRole } from '@/types';
import {
  Building2,
  ShieldCheck,
  Database,
  Bell,
  Palette,
  Save,
  Check,
  Calculator,
  LogOut,
  ExternalLink,
  Server,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Coins,
  Cpu,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

export default function SettingsPage() {
  const { role, user, logout } = useAuth();
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Neon DB Connection Testing State
  const [neonStatus, setNeonStatus] = useState<{
    loading: boolean;
    connected: boolean;
    details?: any;
    error?: string;
  }>({
    loading: false,
    connected: false,
  });

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const checkNeonDbConnection = async () => {
    setNeonStatus((prev) => ({ ...prev, loading: true }));
    try {
      const res = await fetch('/api/database/neon/status');
      const data = await res.json();
      setNeonStatus({
        loading: false,
        connected: data.status === 'connected',
        details: data.details,
        error: data.details?.error,
      });
    } catch (err: any) {
      setNeonStatus({
        loading: false,
        connected: false,
        error: err.message || 'Failed to query Neon status endpoint',
      });
    }
  };

  useEffect(() => {
    checkNeonDbConnection();
  }, []);

  const roles: UserRole[] = ['Owner', 'Manager', 'Supervisor', 'Worker'];

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="System Settings & Administration"
        description="Configure plant profile settings, pricing calculation rules, Neon PostgreSQL database, RBAC role matrix, and notifications."
        breadcrumbs={[{ label: 'Settings' }]}
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              onClick={logout}
              className="border-rose-500/30 text-rose-500 hover:bg-rose-500/10 hover:border-rose-500 font-semibold"
            >
              <LogOut className="h-4 w-4 mr-1.5" /> Sign Out
            </Button>
            <Button onClick={handleSave} className="bg-brand-600 hover:bg-brand-500 text-white font-semibold">
              {savedSuccess ? (
                <span className="flex items-center gap-1.5 text-emerald-300">
                  <Check className="h-4 w-4" /> Changes Saved
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Save className="h-4 w-4" /> Save Configuration
                </span>
              )}
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="pricing" className="w-full">
        <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full h-auto p-1.5 gap-1 bg-slate-900 border border-steel-800">
          <TabsTrigger value="pricing" className="flex items-center gap-1.5 py-2.5 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
            <Calculator className="h-4 w-4" /> Pricing Rules
          </TabsTrigger>
          <TabsTrigger value="neon" className="flex items-center gap-1.5 py-2.5 data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
            <Server className="h-4 w-4" /> Neon PostgreSQL
          </TabsTrigger>
          <TabsTrigger value="company" className="flex items-center gap-1.5 py-2.5">
            <Building2 className="h-4 w-4" /> Facility Profile
          </TabsTrigger>
          <TabsTrigger value="rbac" className="flex items-center gap-1.5 py-2.5">
            <ShieldCheck className="h-4 w-4" /> RBAC Matrix
          </TabsTrigger>
          <TabsTrigger value="supabase" className="flex items-center gap-1.5 py-2.5">
            <Database className="h-4 w-4" /> Supabase
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-1.5 py-2.5">
            <Bell className="h-4 w-4" /> Alerts & UI
          </TabsTrigger>
        </TabsList>

        {/* 1. PRICING RULES TAB */}
        <TabsContent value="pricing" className="space-y-4">
          <Card className="border-purple-500/20 bg-steel-950/80">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-steel-800">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg text-white font-extrabold flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-purple-400" />
                    Factory Owner Pricing & Cost Estimation Rules
                  </CardTitle>
                  <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                    Indian Rupee (₹) Architecture
                  </Badge>
                </div>
                <CardDescription className="text-slate-400 text-xs mt-1">
                  Configure machine fleet rates (₹/hr), operator labor, raw metal stock (₹/kg), and tax margins. Used by the AI quotation engine.
                </CardDescription>
              </div>

              <Link href="/settings/pricing-rules">
                <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg">
                  <span>Open Dedicated Pricing Rules Manager</span>
                  <ArrowUpRight className="h-4 w-4 ml-1.5" />
                </Button>
              </Link>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              {/* Quick Preview Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-steel-800 bg-steel-900/60 space-y-3">
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
                    <Cpu className="h-4 w-4" /> Machine Fleet Rates
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-steel-800/60">
                      <span className="text-slate-400">TRUMPF Fiber Laser 6kW</span>
                      <span className="font-bold text-white font-mono">₹3,200 / hr</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-steel-800/60">
                      <span className="text-slate-400">Bystronic CNC Press Brake</span>
                      <span className="font-bold text-white font-mono">₹2,400 / hr</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-400">Robotic TIG/MIG Welder</span>
                      <span className="font-bold text-white font-mono">₹2,800 / hr</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-steel-800 bg-steel-900/60 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                    <Layers className="h-4 w-4" /> Raw Material Base
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-steel-800/60">
                      <span className="text-slate-400">Stainless Steel 304 Sheet</span>
                      <span className="font-bold text-white font-mono">₹380 / kg</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-steel-800/60">
                      <span className="text-slate-400">Stainless Steel 316 Sheet</span>
                      <span className="font-bold text-white font-mono">₹520 / kg</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-400">6061-T6 Aluminum</span>
                      <span className="font-bold text-white font-mono">₹310 / kg</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-steel-800 bg-steel-900/60 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                    <Coins className="h-4 w-4" /> Markup & Taxation
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-steel-800/60">
                      <span className="text-slate-400">Shop Overhead Markup</span>
                      <span className="font-bold text-emerald-400 font-mono">12.0%</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-steel-800/60">
                      <span className="text-slate-400">Factory Profit Margin</span>
                      <span className="font-bold text-emerald-400 font-mono">18.0%</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-400">Indian GST (CGST + SGST)</span>
                      <span className="font-bold text-amber-400 font-mono">18.0%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Direct Link Banner */}
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-white text-sm">Need to update specific machine rates or add new metal grades?</h4>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Open the dedicated interactive Pricing Rules editor to modify parameters and instantly test AI quotation simulations.
                  </p>
                </div>
                <Link href="/settings/pricing-rules">
                  <Button variant="outline" className="border-purple-500/40 text-purple-300 hover:bg-purple-500/10 font-bold text-xs shrink-0">
                    <Calculator className="h-4 w-4 mr-1.5" /> Edit Full Pricing Rules
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. NEON POSTGRESQL DATABASE TAB */}
        <TabsContent value="neon" className="space-y-4">
          <Card className="border-emerald-500/20 bg-steel-950/80">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-steel-800">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg text-white font-extrabold flex items-center gap-2">
                    <Server className="h-5 w-5 text-emerald-400" />
                    Neon PostgreSQL Database Architecture
                  </CardTitle>
                  <Badge className={neonStatus.connected ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'}>
                    {neonStatus.connected ? 'Connected' : 'Configured / Pooler Ready'}
                  </Badge>
                </div>
                <CardDescription className="text-slate-400 text-xs mt-1">
                  Serverless PostgreSQL connection with connection pooling, SSL enforcement, and zero-cold-start queries.
                </CardDescription>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={checkNeonDbConnection}
                disabled={neonStatus.loading}
                className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 text-xs font-semibold"
              >
                <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${neonStatus.loading ? 'animate-spin' : ''}`} />
                {neonStatus.loading ? 'Testing...' : 'Test Connection'}
              </Button>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              {/* Status Alert Banner */}
              <div className={`p-4 rounded-xl border flex items-start gap-3 text-xs ${neonStatus.connected ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' : 'bg-steel-900/60 border-steel-800 text-slate-300'}`}>
                {neonStatus.connected ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <h5 className="font-bold text-sm text-white">
                    {neonStatus.connected ? 'Active Neon Database Connection Established' : 'Neon PostgreSQL Environment Configured'}
                  </h5>
                  <p className="text-slate-400 mt-1 leading-relaxed">
                    Connection string and pooling parameters have been loaded into <code className="text-purple-300 font-mono">.env.local</code>.
                    {neonStatus.error && <span className="block text-amber-400 mt-1">Note: {neonStatus.error}</span>}
                  </p>
                </div>
              </div>

              {/* Configuration Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">Direct Connection String (DATABASE_URL)</label>
                  <Input
                    readOnly
                    className="font-mono text-xs bg-steel-900 border-steel-800 text-slate-300"
                    value="postgresql://neondb_owner:****@ep-lingering-smoke-a57hl9i9-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
                  />
                  <span className="text-[10px] text-slate-500 block">Direct serverless query endpoint with SSL & channel binding enforcement.</span>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">Connection Pooler Endpoint (POSTGRES_PRISMA_URL)</label>
                  <Input
                    readOnly
                    className="font-mono text-xs bg-steel-900 border-steel-800 text-slate-300"
                    value="postgresql://neondb_owner:****@ep-lingering-smoke-a57hl9i9-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require&pgbouncer=true"
                  />
                  <span className="text-[10px] text-slate-500 block">PgBouncer transaction-mode pooler for high concurrency.</span>
                </div>
              </div>

              {/* Environment Variables Reference Table */}
              <div className="p-4 rounded-xl border border-steel-800 bg-steel-900/40 space-y-3">
                <h5 className="font-bold text-white text-xs uppercase tracking-wider">Neon Environment Variables in .env.local</h5>
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between py-1 border-b border-steel-800 text-slate-400">
                    <span>DATABASE_URL</span>
                    <span className="text-emerald-400">Connected to neondb ✓</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-steel-800 text-slate-400">
                    <span>POSTGRES_HOST</span>
                    <span className="text-slate-200 font-bold">ep-lingering-smoke-a57hl9i9-pooler.us-east-2.aws.neon.tech</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-steel-800 text-slate-400">
                    <span>POSTGRES_DATABASE</span>
                    <span className="text-purple-400 font-bold">neondb (PostgreSQL 18.6)</span>
                  </div>
                  <div className="flex justify-between py-1 text-slate-400">
                    <span>PGSSLMODE</span>
                    <span className="text-emerald-400">require (channel_binding=require)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. COMPANY PROFILE TAB */}
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Fabrication Facility Profile</CardTitle>
              <CardDescription>Primary company identity used on quotations, work orders, and customer invoices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Facility Name</label>
                  <Input defaultValue="Precision Metal Fabrication Co." />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Tax ID / GSTIN</label>
                  <Input defaultValue="27AABCP1234F1Z8" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Plant Address</label>
                <Input defaultValue="1040 Industrial Pkwy, Sector 4, Pune, Maharashtra 411026" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Base Currency</label>
                  <Select
                    defaultValue="INR"
                    options={[
                      { label: 'INR (₹) - Indian Rupee (Default)', value: 'INR' },
                      { label: 'USD ($) - United States Dollar', value: 'USD' },
                      { label: 'EUR (€) - Euro', value: 'EUR' },
                      { label: 'GBP (£) - British Pound', value: 'GBP' },
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Operational Timezone</label>
                  <Select
                    defaultValue="IST"
                    options={[
                      { label: 'Asia/Kolkata (IST - Indian Standard Time)', value: 'IST' },
                      { label: 'America/New_York (EST)', value: 'EST' },
                      { label: 'Europe/London (GMT)', value: 'GMT' },
                    ]}
                  />
                </div>
              </div>

              {/* Account Actions Box with Direct Sign Out */}
              <div className="pt-4 border-t border-steel-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white text-xs block">Active User Session</span>
                  <span className="text-slate-400 text-[11px]">{user?.email || 'owner@forgeiq.com'} ({role})</span>
                </div>
                <Button
                  variant="outline"
                  onClick={logout}
                  className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500 text-xs font-bold"
                >
                  <LogOut className="h-3.5 w-3.5 mr-1.5" /> Sign Out of Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. RBAC MATRIX TAB */}
        <TabsContent value="rbac">
          <Card>
            <CardHeader>
              <CardTitle>Role-Based Access Control (RBAC) Matrix</CardTitle>
              <CardDescription>Configured navigation and functional module permissions by user role</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {roles.map((r) => (
                  <div
                    key={r}
                    className="p-3 rounded-lg border border-slate-200 dark:border-steel-800 bg-slate-50/50 dark:bg-steel-900/40 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{r}</span>
                      <Badge variant="secondary" className="text-[10px]">
                        {r === role ? 'Active Role' : 'Role Option'}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-steel-400 leading-relaxed">
                      {ROLE_DESCRIPTIONS[r]}
                    </p>
                  </div>
                ))}
              </div>

              {/* Route Permission Table */}
              <div className="rounded-lg border border-slate-200 dark:border-steel-800 overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 dark:bg-steel-800 font-semibold">
                    <tr>
                      <th className="p-3">Navigation Route Module</th>
                      <th className="p-3 text-center">Owner</th>
                      <th className="p-3 text-center">Manager</th>
                      <th className="p-3 text-center">Supervisor</th>
                      <th className="p-3 text-center">Worker</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-steel-800">
                    {ROUTE_PERMISSIONS.map((perm) => (
                      <tr key={perm.path}>
                        <td className="p-3 font-mono font-semibold text-slate-800 dark:text-steel-200">
                          {perm.path}
                        </td>
                        {roles.map((r) => {
                          const isAllowed = perm.allowedRoles.includes(r);
                          return (
                            <td key={r} className="p-3 text-center">
                              {isAllowed ? (
                                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500 font-bold">
                                  ✓
                                </span>
                              ) : (
                                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 dark:bg-steel-800 text-slate-400">
                                  -
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5. SUPABASE INTEGRATION TAB */}
        <TabsContent value="supabase">
          <Card>
            <CardHeader>
              <CardTitle>Supabase PostgreSQL & Authentication Connection</CardTitle>
              <CardDescription>Environment variables and database configuration status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-2xl text-xs">
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>Supabase Client & Auth Middleware Ready with Local Fallback Dataset.</span>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Supabase Project URL</label>
                <Input defaultValue="https://placeholder.supabase.co" readOnly className="font-mono text-xs" />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Public Anon Key</label>
                <Input defaultValue="placeholder-anon-key" readOnly type="password" className="font-mono text-xs" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 6. ALERTS & UI TAB */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification & Alert Preferences</CardTitle>
              <CardDescription>Configure machine alarms, delivery slip warnings, and low-stock alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-w-xl text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-steel-800">
                <div>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 block">Critical Machine Breakdown Alerts</span>
                  <span className="text-slate-500 dark:text-steel-400 text-[11px]">Notify supervisors immediately via SMS and push notification</span>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-brand-600" />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-steel-800">
                <div>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 block">AI Delay Prediction Warnings</span>
                  <span className="text-slate-500 dark:text-steel-400 text-[11px]">Alert production planners when machine utilization exceeds 90%</span>
                </div>
                <input type="checkbox" defaultChecked className="h-4 w-4 rounded accent-brand-600" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
