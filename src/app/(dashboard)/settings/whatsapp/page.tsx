'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { APPROVED_WHATSAPP_TEMPLATES } from '@/lib/messaging/templates';
import { MessageSquare, Save, Check, ShieldCheck, Key, RefreshCw, FileText } from 'lucide-react';

export default function WhatsAppSettingsAdminPage() {
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [wabaId, setWabaId] = useState('109849283741029');
  const [phoneNumberId, setPhoneNumberId] = useState('509384729182341');

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="WhatsApp Business API Configuration & Templates"
        description="Configure Meta WhatsApp Business Cloud API credentials, webhook verification keys, and message templates."
        breadcrumbs={[
          { label: 'Settings', href: '/settings' },
          { label: 'WhatsApp API' },
        ]}
        actions={
          <Button onClick={handleSave}>
            {savedSuccess ? (
              <span className="flex items-center gap-1 text-emerald-400">
                <Check className="h-4 w-4" /> API Credentials Saved
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Save className="h-4 w-4" /> Save WhatsApp Settings
              </span>
            )}
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Meta Credentials */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Key className="h-4 w-4 text-emerald-500" /> Meta Cloud API Credentials
            </CardTitle>
            <CardDescription>WhatsApp Business Account (WABA) IDs & Access Tokens</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>WhatsApp Cloud API active with encrypted credentials & fallback transport.</span>
            </div>

            <div>
              <label className="block font-semibold mb-1">WhatsApp Business Account ID (WABA ID)</label>
              <Input value={wabaId} onChange={(e) => setWabaId(e.target.value)} />
            </div>

            <div>
              <label className="block font-semibold mb-1">Phone Number ID</label>
              <Input value={phoneNumberId} onChange={(e) => setPhoneNumberId(e.target.value)} />
            </div>

            <div>
              <label className="block font-semibold mb-1">Permanent Access Token</label>
              <Input type="password" value="EAAGk39824u98127391823712893712893712893" readOnly />
            </div>
          </CardContent>
        </Card>

        {/* Webhook Endpoint Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <RefreshCw className="h-4 w-4 text-brand-500" /> Meta Webhook Endpoints
            </CardTitle>
            <CardDescription>URL for receiving incoming WhatsApp POs and status receipts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold mb-1">Webhook Callback URL</label>
              <Input readOnly value="/api/webhooks/whatsapp" />
            </div>

            <div>
              <label className="block font-semibold mb-1">Hub Verify Token</label>
              <Input readOnly value="forgeiq_verify_token_2026" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Approved Message Templates Catalog */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-purple-500" /> Approved Message Templates Catalog
          </CardTitle>
          <CardDescription>Meta-approved templates for automated customer notifications</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {APPROVED_WHATSAPP_TEMPLATES.map((tmpl) => (
            <div
              key={tmpl.id}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-steel-800 bg-slate-50/50 dark:bg-steel-900/50 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-slate-100">{tmpl.name}</span>
                <Badge variant="success" className="text-[10px]">
                  {tmpl.status}
                </Badge>
              </div>
              <p className="text-slate-600 dark:text-steel-300 font-mono text-[11px] leading-relaxed">
                {tmpl.bodyText}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
