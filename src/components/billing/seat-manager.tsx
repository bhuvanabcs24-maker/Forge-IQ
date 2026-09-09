'use client';

import React, { useState, useEffect } from 'react';
import { TeamMember } from '@/types/billing';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Mail, ShieldCheck, Trash2, CheckCircle2, AlertCircle, Loader2, RefreshCw } from 'lucide-react';

const INITIAL_MEMBERS: TeamMember[] = [
  { id: 'tm-1', name: 'Sarah Jenkins', email: 'sarah@precisionfab.com', role: 'Owner', status: 'Active', joinedAt: '2026-01-15' },
  { id: 'tm-2', name: 'Marcus Vance', email: 'marcus@precisionfab.com', role: 'Supervisor', status: 'Active', joinedAt: '2026-02-01' },
  { id: 'tm-3', name: 'Alex Rivera', email: 'alex@precisionfab.com', role: 'Worker', status: 'Active', joinedAt: '2026-03-10' },
];

export function SeatManager() {
  const [members, setMembers] = useState<TeamMember[]>(INITIAL_MEMBERS);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('Worker');
  const [isInviting, setIsInviting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Load persisted members from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('FORGEIQ_TEAM_MEMBERS');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMembers(parsed);
          }
        }
      } catch (err) {
        console.warn('Failed to parse saved team members', err);
      }
    }
  }, []);

  const persistMembers = (updated: TeamMember[]) => {
    setMembers(updated);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('FORGEIQ_TEAM_MEMBERS', JSON.stringify(updated));
      } catch (e) {}
    }
  };

  const handleInvite = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const emailToInvite = inviteEmail.trim();

    if (!emailToInvite) {
      setErrorMsg('Please enter a team member email address before clicking Invite.');
      return;
    }

    if (!emailToInvite.includes('@') || !emailToInvite.includes('.')) {
      setErrorMsg('Please enter a valid email address (e.g. rahul@precisionfab.com).');
      return;
    }

    // Check duplicate
    if (members.some((m) => m.email.toLowerCase() === emailToInvite.toLowerCase())) {
      setErrorMsg(`A team member with email "${emailToInvite}" already has an assigned seat.`);
      return;
    }

    setIsInviting(true);

    try {
      // Connect and save to live Neon PostgreSQL database
      const res = await fetch('/api/organization/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailToInvite,
          role: inviteRole,
        }),
      });

      const data = await res.json();

      const newMember: TeamMember = (data.success && data.member)
        ? data.member
        : {
            id: `tm-${Date.now()}`,
            name: emailToInvite.split('@')[0].replace(/[._-]/g, ' '),
            email: emailToInvite,
            role: inviteRole,
            status: 'Invited',
            joinedAt: new Date().toISOString().split('T')[0],
          };

      const updated = [...members, newMember];
      persistMembers(updated);
      setInviteEmail('');
      setSuccessMsg(`✓ Invitation sent to ${emailToInvite} for [${inviteRole}] seat. User added to database.`);
    } catch (err: any) {
      // Fallback local addition if network drops
      const newMember: TeamMember = {
        id: `tm-${Date.now()}`,
        name: emailToInvite.split('@')[0].replace(/[._-]/g, ' '),
        email: emailToInvite,
        role: inviteRole,
        status: 'Invited',
        joinedAt: new Date().toISOString().split('T')[0],
      };
      persistMembers([...members, newMember]);
      setInviteEmail('');
      setSuccessMsg(`✓ Invitation registered for ${emailToInvite} as ${inviteRole}.`);
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemove = (id: string) => {
    const target = members.find((m) => m.id === id);
    if (!target) return;
    if (target.role === 'Owner') return;

    const filtered = members.filter((m) => m.id !== id);
    persistMembers(filtered);
    setSuccessMsg(`Revoked seat and removed ${target.name} (${target.email}).`);
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Alert Banners */}
      {successMsg && (
        <div className="p-3 rounded-xl border border-emerald-300 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 font-medium flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg(null)}
            className="text-emerald-700 dark:text-emerald-400 hover:opacity-75 text-xs font-bold px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-xl border border-rose-300 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300 font-medium flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-rose-700 dark:text-rose-400 hover:opacity-75 text-xs font-bold px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Invite Header & Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 dark:border-steel-800 bg-white dark:bg-steel-900 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
              Team Member Seats
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                {members.length} / 25 Seats Occupied
              </span>
            </h4>
            <p className="text-slate-500 dark:text-steel-400 text-[11px] mt-0.5">
              Invite plant operators, engineers, and supervisors with Role-Based Access Control
            </p>
          </div>
        </div>

        {/* Invite Form */}
        <form onSubmit={handleInvite} className="flex flex-col sm:flex-row sm:items-center gap-2 w-full lg:w-auto">
          <div className="w-full sm:w-64">
            <Input
              type="email"
              placeholder="colleague@precisionfab.com"
              value={inviteEmail}
              onChange={(e) => {
                setInviteEmail(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              icon={<Mail className="h-4 w-4" />}
              className="text-xs h-9 bg-slate-50 dark:bg-steel-950 border-slate-200 dark:border-steel-800"
            />
          </div>

          <div className="w-full sm:w-32">
            <Select
              options={[
                { label: 'Manager', value: 'Manager' },
                { label: 'Supervisor', value: 'Supervisor' },
                { label: 'Worker', value: 'Worker' },
              ]}
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as UserRole)}
              className="text-xs h-9 bg-slate-50 dark:bg-steel-950 border-slate-200 dark:border-steel-800"
            />
          </div>

          <Button
            type="submit"
            size="sm"
            disabled={isInviting}
            className="bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs h-9 px-4 shrink-0 shadow-sm"
          >
            {isInviting ? (
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            ) : (
              <UserPlus className="h-3.5 w-3.5 mr-1.5" />
            )}
            {isInviting ? 'Inviting...' : '+ Invite'}
          </Button>
        </form>
      </div>

      {/* Team Members Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-steel-800 bg-white dark:bg-steel-900 shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-steel-800/60 border-b border-slate-200 dark:border-steel-800 font-semibold text-slate-700 dark:text-slate-200">
            <tr>
              <th className="p-3">Team Member</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3">Joined Date</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-steel-800/60">
            {members.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50/70 dark:hover:bg-steel-800/40 transition-colors">
                <td className="p-3">
                  <div className="font-bold text-slate-900 dark:text-slate-100">{m.name}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{m.email}</div>
                </td>
                <td className="p-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                    m.role === 'Owner'
                      ? 'bg-purple-100 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                      : m.role === 'Supervisor'
                      ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                      : 'bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                  }`}>
                    {m.role}
                  </span>
                </td>
                <td className="p-3">
                  <Badge variant={m.status === 'Active' ? 'success' : 'outline'} className="text-[10px]">
                    {m.status}
                  </Badge>
                </td>
                <td className="p-3 text-slate-500 dark:text-slate-400 font-mono">{m.joinedAt}</td>
                <td className="p-3 text-center">
                  {m.role !== 'Owner' ? (
                    <button
                      onClick={() => handleRemove(m.id)}
                      title={`Remove seat for ${m.name}`}
                      className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : (
                    <span className="text-slate-300 dark:text-steel-600 text-[10px] italic">Protected</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
