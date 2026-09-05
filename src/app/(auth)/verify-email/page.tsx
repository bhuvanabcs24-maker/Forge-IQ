'use client';

import React from 'react';
import Link from 'next/link';
import { MailCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-slate-100 industrial-grid">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-steel-800 bg-steel-900/90 p-8 shadow-2xl backdrop-blur-md text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/20 text-brand-400 mx-auto">
          <MailCheck className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Check Your Email
          </h2>
          <p className="text-xs text-steel-300 leading-relaxed">
            We sent a verification link to your registered business email. Please click the link to activate your workspace access.
          </p>
        </div>

        <div className="p-3 rounded-lg border border-steel-800 bg-steel-950/60 text-xs text-steel-400">
          Didn&apos;t receive email? Check spam folder or click to resend.
        </div>

        <Link href="/login" className="block w-full">
          <Button size="lg" className="w-full">
            Proceed to Login <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
