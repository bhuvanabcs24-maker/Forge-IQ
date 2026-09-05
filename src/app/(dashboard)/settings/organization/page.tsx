'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SeatManager } from '@/components/billing/seat-manager';
import { Building2, Save, Check, ShieldCheck, Mail } from 'lucide-react';

export default function OrganizationSettingsPage() {
  const [orgName, setOrgName] = useState('Precision Metal Fabrication Co.');
  const [taxId, setTaxId] = useState('GST-US-991823712');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organization Settings & Team Seat Management"
        description="Manage company details, tax registration numbers, team member seats, and RBAC role assignments."
        breadcrumbs={[
          { label: 'Settings', href: '/settings' },
          { label: 'Organization' },
        ]}
        actions={
          <Button onClick={handleSave}>
            {savedSuccess ? (
              <span className="flex items-center gap-1 text-emerald-400">
                <Check className="h-4 w-4" /> Profile Updated
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Save className="h-4 w-4" /> Save Organization Profile
              </span>
            )}
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Organization Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4 text-brand-500" /> Corporate Profile
            </CardTitle>
            <CardDescription>Company legal name and billing information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold mb-1">Company Legal Name</label>
              <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} />
            </div>

            <div>
              <label className="block font-semibold mb-1">Tax Registration Number (GSTIN / VAT ID)</label>
              <Input value={taxId} onChange={(e) => setTaxId(e.target.value)} />
            </div>

            <div>
              <label className="block font-semibold mb-1">Billing Contact Email</label>
              <Input value="billing@precisionfab.com" readOnly />
            </div>
          </CardContent>
        </Card>

        {/* Multi-Tenant Security Policy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-4 w-4 text-emerald-500" /> Multi-Tenant Security & Isolation
            </CardTitle>
            <CardDescription>Security policies enforced across workspace</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-steel-900/60 border border-slate-200 dark:border-steel-800 space-y-1">
              <span className="font-bold text-slate-900 dark:text-slate-100 block">Row-Level Security (RLS) Active</span>
              <span className="text-slate-500">PostgreSQL policies ensure strict data isolation between tenant organizations.</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-steel-900/60 border border-slate-200 dark:border-steel-800 space-y-1">
              <span className="font-bold text-slate-900 dark:text-slate-100 block">Audit Event Logging</span>
              <span className="text-slate-500">All user seat additions, role changes, and subscription edits logged immutably.</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seat Management Suite */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Team Member Seats & Role Assignments</CardTitle>
          <CardDescription>Invite team members and allocate seats within subscription limits</CardDescription>
        </CardHeader>
        <CardContent>
          <SeatManager />
        </CardContent>
      </Card>
    </div>
  );
}
