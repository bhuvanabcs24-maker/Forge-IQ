'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Lock, Mail, ArrowRight } from 'lucide-react';

export default function CustomerPortalLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('rvance@apexaero.com');
  const [password, setPassword] = useState('••••••••••••');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      router.push('/portal/dashboard');
    }, 800);
  };

  return (
    <div className="min-h-[500px] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-slate-200 dark:border-steel-800 shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-purple-600 text-white font-black text-lg mb-2">
            F
          </div>
          <CardTitle className="text-xl">ForgeIQ Customer Portal</CardTitle>
          <CardDescription>Secure self-service portal for active manufacturing clients</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold mb-1">Corporate Email Address</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Authenticating...' : <span className="flex items-center gap-1">Sign In to Customer Portal <ArrowRight className="h-4 w-4" /></span>}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
