'use client';

import React, { useState } from 'react';
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
import { Building2, ShieldCheck, Database, Bell, Palette, Save, Check } from 'lucide-react';

export default function SettingsPage() {
  const { role } = useAuth();
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const roles: UserRole[] = ['Owner', 'Manager', 'Supervisor', 'Worker'];

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Settings & Administration"
        description="Configure plant profile settings, RBAC role matrix, Supabase database credentials, and notification thresholds."
        breadcrumbs={[{ label: 'Settings' }]}
        actions={
          <Button onClick={handleSave}>
            {savedSuccess ? (
              <span className="flex items-center gap-1 text-emerald-400">
                <Check className="h-4 w-4" /> Changes Saved
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Save className="h-4 w-4" /> Save Configuration
              </span>
            )}
          </Button>
        }
      />

      <Tabs defaultValue="company" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
          <TabsTrigger value="company" className="flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5" /> Company Profile
          </TabsTrigger>
          <TabsTrigger value="rbac" className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" /> RBAC Permissions
          </TabsTrigger>
          <TabsTrigger value="supabase" className="flex items-center gap-1.5">
            <Database className="h-3.5 w-3.5" /> Supabase Integration
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-1.5">
            <Bell className="h-3.5 w-3.5" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-1.5">
            <Palette className="h-3.5 w-3.5" /> Appearance
          </TabsTrigger>
        </TabsList>

        {/* Company Profile Tab */}
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
                  <label className="block text-xs font-semibold mb-1">Tax ID / EIN</label>
                  <Input defaultValue="XX-XXXXXXX" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Plant Address</label>
                <Input defaultValue="1040 Industrial Pkwy, Suite 100, Cleveland, OH 44114" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Base Currency</label>
                  <Select
                    options={[
                      { label: 'USD ($) - United States Dollar', value: 'USD' },
                      { label: 'EUR (€) - Euro', value: 'EUR' },
                      { label: 'GBP (£) - British Pound', value: 'GBP' },
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Operational Timezone</label>
                  <Select
                    options={[
                      { label: 'America/New_York (EST)', value: 'EST' },
                      { label: 'America/Chicago (CST)', value: 'CST' },
                      { label: 'America/Los_Angeles (PST)', value: 'PST' },
                    ]}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* RBAC Permissions Matrix */}
        <TabsContent value="rbac">
          <Card>
            <CardHeader>
              <CardTitle>Role-Based Access Control (RBAC) Matrix</CardTitle>
              <CardDescription>Review system navigation permissions across Owner, Manager, Supervisor, and Worker roles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Role Cards Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

        {/* Supabase Integration Tab */}
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
                <label className="block text-xs font-semibold mb-1">NEXT_PUBLIC_SUPABASE_URL</label>
                <Input
                  readOnly
                  value={process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</label>
                <Input
                  type="password"
                  readOnly
                  value={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key-xxxxxxxxxxxx'}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications & Appearance Tabs */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Alert Notification Preferences</CardTitle>
              <CardDescription>Threshold alerts for low material inventory stock and maintenance schedules</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <label className="flex items-center gap-2 font-medium">
                <input type="checkbox" defaultChecked className="rounded text-brand-500" />
                Notify on Low Sheet Metal Stock Alerts (reorder point triggered)
              </label>
              <label className="flex items-center gap-2 font-medium">
                <input type="checkbox" defaultChecked className="rounded text-brand-500" />
                Notify 24 hours prior to scheduled equipment maintenance
              </label>
              <label className="flex items-center gap-2 font-medium">
                <input type="checkbox" defaultChecked className="rounded text-brand-500" />
                Email payment receipt confirmation upon invoice settlement
              </label>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance & Theme</CardTitle>
              <CardDescription>Industrial SaaS UI theme options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <p className="text-slate-600 dark:text-steel-300">
                ForgeIQ uses modern dark slate and steel gray design tokens. Toggle theme seamlessly from top header sun/moon control.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
