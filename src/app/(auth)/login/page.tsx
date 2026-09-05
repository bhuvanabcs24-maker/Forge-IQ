'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserRole } from '@/types';
import { Zap, Lock, Mail, ArrowRight, ShieldCheck, Factory, Phone, KeyRound, CheckCircle2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid business email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['Owner', 'Manager', 'Supervisor', 'Worker']),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [authMode, setAuthMode] = useState<'email' | 'otp'>('email');
  const [authError, setAuthError] = useState<string | null>(null);

  // SMS OTP State
  const [phone, setPhone] = useState('917829023129');
  const [otpCode, setOtpCode] = useState('');
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [otpSentMsg, setOtpSentMsg] = useState<string | null>(null);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'sarah.jenkins@precisionfab.com',
      password: 'password123',
      role: 'Owner',
    },
  });

  const activeRole = watch('role');

  const onSubmit = (data: LoginFormValues) => {
    setAuthError(null);
    try {
      login(data.email, data.role as UserRole);
      router.push('/dashboard');
    } catch (err: any) {
      setAuthError('Authentication failed. Please verify credentials.');
    }
  };

  const handleSendSmsOtp = async () => {
    setAuthError(null);
    setIsSendingOtp(true);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();

      if (data.success) {
        setVerificationId(data.verificationId || 'verif-dev-id');
        setOtpSentMsg(`4-Digit OTP Code sent to +${phone.replace(/[^0-9]/g, '')} via SMS.`);
      } else {
        setAuthError(data.message || 'Failed to dispatch SMS OTP.');
      }
    } catch (err: any) {
      setAuthError('Error sending SMS OTP. Please try again.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifySmsOtp = async () => {
    setAuthError(null);
    setIsVerifyingOtp(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificationId, code: otpCode }),
      });
      const data = await res.json();

      if (data.success) {
        login('sarah.jenkins@precisionfab.com', activeRole);
        router.push('/dashboard');
      } else {
        setAuthError(data.message || 'Invalid verification code.');
      }
    } catch (err: any) {
      setAuthError('Verification error. Please check your 4-digit OTP.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-slate-950 text-slate-100 industrial-grid">
      {/* Left Column: Industrial Brand Showcase */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 border-r border-steel-800 bg-gradient-to-br from-steel-950 via-steel-900 to-slate-950 relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-500/30">
            <Zap className="h-6 w-6 fill-current" />
          </div>
          <div>
            <span className="font-extrabold text-2xl tracking-tight text-white font-sans">
              Forge<span className="text-brand-500">IQ</span>
            </span>
            <span className="block text-[10px] uppercase font-bold tracking-widest text-steel-400">
              Manufacturing Intelligence Platform
            </span>
          </div>
        </div>

        <div className="my-auto max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-400">
            <Factory className="h-3.5 w-3.5" />
            Designed for 10–100 Employee Fabrication Plants
          </div>

          <h1 className="text-4xl font-extrabold text-white tracking-tight leading-tight">
            Control Shop Floor Production & Financial Telemetry from One Intelligent Core.
          </h1>

          <p className="text-sm text-steel-300 leading-relaxed">
            Streamline customer quotations, sheet metal inventory, nested fiber laser jobs, CNC bender maintenance, worker shifts, and real-time operational invoices.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-steel-800/80">
            <div>
              <span className="block text-2xl font-bold text-white">99.4%</span>
              <span className="text-xs text-steel-400">Shop Floor Utilization</span>
            </div>
            <div>
              <span className="block text-2xl font-bold text-white">&lt; 4 Hours</span>
              <span className="text-xs text-steel-400">Quotation Turnaround</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-steel-500 border-t border-steel-800/60 pt-4">
          <span>© 2026 ForgeIQ SaaS Systems Inc.</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" /> api.otp.dev SMS Provider Active
          </span>
        </div>
      </div>

      {/* Right Column: Interactive Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 bg-steel-900/90 backdrop-blur-md">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Sign In to Your Workspace
            </h2>
            <p className="text-xs text-steel-400">
              Select your preferred authentication method to log in to ForgeIQ.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex rounded-xl p-1 bg-steel-800 border border-steel-700 text-xs font-bold">
            <button
              onClick={() => setAuthMode('email')}
              className={`flex-1 py-2 rounded-lg transition-colors cursor-pointer ${
                authMode === 'email' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Email & Password
            </button>
            <button
              onClick={() => setAuthMode('otp')}
              className={`flex-1 py-2 rounded-lg transition-colors cursor-pointer ${
                authMode === 'otp' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Mobile SMS OTP
            </button>
          </div>

          {authError && (
            <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs font-medium">
              {authError}
            </div>
          )}

          {authMode === 'email' ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-steel-300 mb-1">
                  Role Context
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Owner', 'Manager', 'Supervisor', 'Worker'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setValue('role', r)}
                      className={`px-2 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        activeRole === r
                          ? 'border-brand-500 bg-brand-500/20 text-brand-400'
                          : 'border-steel-700 bg-steel-800/60 text-steel-400 hover:bg-steel-800'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-steel-300 mb-1">
                  Business Email Address
                </label>
                <Input
                  type="email"
                  icon={<Mail className="h-4 w-4" />}
                  {...register('email')}
                />
                {errors.email && (
                  <span className="text-[11px] text-rose-400 mt-1 block">
                    {errors.email.message}
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-steel-300">
                    Account Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <Input
                  type="password"
                  icon={<Lock className="h-4 w-4" />}
                  {...register('password')}
                />
                {errors.password && (
                  <span className="text-[11px] text-rose-400 mt-1 block">
                    {errors.password.message}
                  </span>
                )}
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  'Authenticating...'
                ) : (
                  <span className="flex items-center gap-2">
                    Access Platform <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-steel-300 mb-1">
                  Registered Mobile Number
                </label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 917829023129"
                  icon={<Phone className="h-4 w-4" />}
                />
                <span className="text-[10px] text-steel-400 mt-1 block">
                  Includes country code without spaces (e.g. 917829023129)
                </span>
              </div>

              {!verificationId ? (
                <Button
                  onClick={handleSendSmsOtp}
                  size="lg"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                  disabled={isSendingOtp}
                >
                  {isSendingOtp ? 'Dispatching SMS...' : 'Send 4-Digit OTP Code'}
                </Button>
              ) : (
                <div className="space-y-4">
                  {otpSentMsg && (
                    <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-medium flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>{otpSentMsg}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-steel-300 mb-1">
                      Enter 4-Digit OTP Verification Code
                    </label>
                    <Input
                      maxLength={4}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="e.g. 8492"
                      icon={<KeyRound className="h-4 w-4 text-emerald-400" />}
                      className="font-mono text-center tracking-widest text-base"
                    />
                  </div>

                  <Button
                    onClick={handleVerifySmsOtp}
                    size="lg"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                    disabled={isVerifyingOtp || otpCode.length < 4}
                  >
                    {isVerifyingOtp ? 'Verifying OTP...' : 'Verify OTP & Sign In'}
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="text-center pt-4 border-t border-steel-800 text-xs text-steel-400">
            Don&apos;t have a manufacturing workspace yet?{' '}
            <Link
              href="/register"
              className="text-brand-400 font-semibold hover:text-brand-300 underline underline-offset-4"
            >
              Register Facility
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
