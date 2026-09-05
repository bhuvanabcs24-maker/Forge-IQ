'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-slate-100 industrial-grid">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-steel-800 bg-steel-900/90 p-8 shadow-2xl backdrop-blur-md">
        {!submitted ? (
          <>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Reset Password
              </h2>
              <p className="text-xs text-steel-400">
                Enter your work email address to receive password reset instructions.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-steel-300 mb-1">
                  Email Address
                </label>
                <Input
                  type="email"
                  required
                  placeholder="name@company.com"
                  icon={<Mail className="h-4 w-4" />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <Button type="submit" size="lg" className="w-full">
                Send Reset Link
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center space-y-4 py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mx-auto">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold text-white">Instructions Sent</h3>
            <p className="text-xs text-steel-300 leading-relaxed">
              We have sent password reset instructions to{' '}
              <strong className="text-brand-400">{email}</strong>. Please check your inbox.
            </p>
          </div>
        )}

        <div className="text-center border-t border-steel-800 pt-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-xs text-steel-400 hover:text-slate-200"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
