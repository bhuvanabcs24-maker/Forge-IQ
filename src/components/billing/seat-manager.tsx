'use client';

import React, { useState } from 'react';
import { TeamMember } from '@/types/billing';
import { UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Mail, ShieldCheck, Trash2 } from 'lucide-react';

export function SeatManager() {
  const [members, setMembers] = useState<TeamMember[]>([
    { id: 'tm-1', name: 'Sarah Jenkins', email: 'sarah@precisionfab.com', role: 'Owner', status: 'Active', joinedAt: '2026-01-15' },
    { id: 'tm-2', name: 'Marcus Vance', email: 'marcus@precisionfab.com', role: 'Supervisor', status: 'Active', joinedAt: '2026-02-01' },
    { id: 'tm-3', name: 'Alex Rivera', email: 'alex@precisionfab.com', role: 'Worker', status: 'Active', joinedAt: '2026-03-10' },
  ]);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('Worker');

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;

    const newMember: TeamMember = {
      id: `tm-${Date.now()}`,
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole,
      status: 'Invited',
      joinedAt: new Date().toISOString().split('T')[0],
    };

    setMembers([...members, newMember]);
    setInviteEmail('');
  };

  const handleRemove = (id: string) => {
    setMembers(members.filter((m) => m.id !== id));
  };

  return (
    <div className="space-y-4 text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-200 dark:border-steel-800 bg-white dark:bg-steel-900">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 font-bold">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              Team Member Seats ({members.length} / 25 Seats Occupied)
            </h4>
            <p className="text-slate-500 dark:text-steel-400">
              Manage organization users and RBAC role assignments
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Input
            type="email"
            placeholder="colleague@precisionfab.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="w-48 text-xs"
          />
          <Select
            options={[
              { label: 'Manager', value: 'Manager' },
              { label: 'Supervisor', value: 'Supervisor' },
              { label: 'Worker', value: 'Worker' },
            ]}
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value as UserRole)}
            className="w-28 text-xs"
          />
          <Button size="sm" onClick={handleInvite}>
            <UserPlus className="h-3.5 w-3.5 mr-1" /> Invite
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-steel-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-steel-800/60 border-b border-slate-200 dark:border-steel-800 font-semibold">
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
              <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-steel-800/40">
                <td className="p-3">
                  <div className="font-bold text-slate-900 dark:text-slate-100">{m.name}</div>
                  <div className="text-[11px] text-slate-500">{m.email}</div>
                </td>
                <td className="p-3 font-semibold">{m.role}</td>
                <td className="p-3">
                  <Badge variant={m.status === 'Active' ? 'success' : 'outline'}>{m.status}</Badge>
                </td>
                <td className="p-3 text-slate-500">{m.joinedAt}</td>
                <td className="p-3 text-center">
                  {m.role !== 'Owner' && (
                    <button onClick={() => handleRemove(m.id)} className="text-slate-400 hover:text-rose-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
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
