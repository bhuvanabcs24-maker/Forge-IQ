'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCustomerPortal } from '@/context/customer-portal-context';
import { MOCK_CUSTOMERS } from '@/lib/mock-data/manufacturing';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Lock, Mail, ArrowRight, ArrowLeft, Sparkles, CheckCircle2, Eye, EyeOff } from 'lucide-react';

function CustomerPortalLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/portal/dashboard';
  const { login } = useCustomerPortal();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('cust-1');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!email || !password) {
      setErrorMsg('Please enter your corporate email address and password.');
      return;
    }
    setIsSubmitting(true);
    login(email, selectedCustomerId);
    setTimeout(() => {
      router.push(redirectTarget);
    }, 300);
  };

  const handleSelectClient = (cust: (typeof MOCK_CUSTOMERS)[0]) => {
    setEmail(cust.email);
    setSelectedCustomerId(cust.id);
    setPassword('demo_pass_123');
    setIsSubmitting(true);
    login(cust.email, cust.id);
    setTimeout(() => {
      router.push(redirectTarget);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F15] text-[#111827] dark:text-[#F2F4F7] flex flex-col justify-between font-sans">
      {/* Top Header */}
      <header className="w-full border-b border-[#E4E7EC] dark:border-[#252B33] bg-white/80 dark:bg-[#11161D]/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 text-white font-black text-sm shadow-md">
              F
            </div>
            <div>
              <span className="font-extrabold text-lg text-[#111827] dark:text-white">
                Forge<span className="text-brand-600">IQ</span> Customer Portal
              </span>
              <span className="hidden sm:block text-[10px] text-[#667085] dark:text-[#98A2B3]">
                Client & Buyer Production Tracking
              </span>
            </div>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#D0D5DD] dark:border-[#252B33] bg-white dark:bg-[#18202A] text-[#344054] dark:text-[#D0D5DD] hover:bg-[#F9FAFB] transition-colors shadow-2xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Factory Sign In</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col items-center justify-center">
        <div className="w-full max-w-md space-y-6">
          
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40">
              <ShieldCheck className="h-3.5 w-3.5" /> Enterprise Client Access
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111827] dark:text-white">
              Sign In to Customer Portal
            </h1>
            <p className="text-xs sm:text-sm text-[#667085] dark:text-[#98A2B3]">
              Authentication required to track active quotations and live fabrication milestones.
            </p>
          </div>

          {/* Quick 1-Click Client Profiles */}
          <div className="p-3.5 rounded-xl border border-purple-200 dark:border-purple-800/30 bg-purple-50/50 dark:bg-purple-950/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> 1-Click Demo Client Accounts
              </span>
              <span className="text-[10px] text-[#667085] dark:text-[#98A2B3]">Click to auto-login</span>
            </div>
            <div className="space-y-1.5">
              {MOCK_CUSTOMERS.slice(0, 3).map((cust) => (
                <button
                  key={cust.id}
                  type="button"
                  onClick={() => handleSelectClient(cust)}
                  disabled={isSubmitting}
                  className="w-full p-2 rounded-lg border border-[#D0D5DD] dark:border-[#252B33] bg-white dark:bg-[#18202A] hover:border-purple-500 hover:bg-purple-50/80 dark:hover:bg-purple-950/30 text-left transition-all cursor-pointer shadow-2xs flex items-center justify-between"
                >
                  <div className="truncate mr-2">
                    <div className="text-xs font-bold text-[#111827] dark:text-white truncate">
                      {cust.companyName}
                    </div>
                    <div className="text-[11px] text-[#667085] dark:text-[#98A2B3] truncate">
                      {cust.contactName} ({cust.email})
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 shrink-0 bg-purple-100 dark:bg-purple-950/50 px-2 py-0.5 rounded">
                    Sign In →
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Manual Login Card */}
          <div className="bg-white dark:bg-[#11161D] rounded-2xl border border-[#E4E7EC] dark:border-[#252B33] p-6 shadow-sm">
            {errorMsg && (
              <div className="mb-4 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#344054] dark:text-[#D0D5DD] mb-1">
                  Corporate Email Address
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rvance@apexaero.com"
                  icon={<Mail className="h-4 w-4" />}
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#344054] dark:text-[#D0D5DD] mb-1">
                  Account Password
                </label>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your customer password"
                  icon={<Lock className="h-4 w-4" />}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[#667085] hover:text-[#111827] dark:hover:text-white p-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  }
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-xs"
              >
                {isSubmitting ? (
                  'Verifying Client Credentials...'
                ) : (
                  <span className="flex items-center justify-center gap-1.5">
                    Sign In to Customer Portal <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-4 pt-4 border-t border-[#E4E7EC] dark:border-[#252B33] text-center text-xs text-[#667085] dark:text-[#98A2B3]">
              Need a factory account instead?{' '}
              <Link href="/" className="text-brand-600 font-semibold hover:underline">
                Plant Sign In
              </Link>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#E4E7EC] dark:border-[#252B33] bg-white dark:bg-[#11161D] py-4 text-center text-xs text-[#667085] dark:text-[#98A2B3]">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 ForgeIQ Customer Portal. End-to-End Precision Metal Fabrication Tracking.</span>
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" /> 256-Bit SSL Encrypted Client Sessions
          </span>
        </div>
      </footer>
    </div>
  );
}

export default function CustomerPortalLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F15] flex items-center justify-center text-xs text-[#667085]">
          Loading Customer Portal...
        </div>
      }
    >
      <CustomerPortalLoginContent />
    </Suspense>
  );
}
