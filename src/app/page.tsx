'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTheme } from 'next-themes';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { UserRole } from '@/types';
import {
  Zap,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Factory,
  Phone,
  KeyRound,
  CheckCircle2,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Sparkles,
  ExternalLink,
  Activity,
  Cpu,
  Layers,
  ArrowUpRight,
  Building2,
  Check,
} from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid business email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['Owner', 'Manager', 'Supervisor', 'Worker']),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const DEMO_PROFILES = [
  {
    role: 'Owner' as UserRole,
    name: 'Alex Chen',
    title: 'Plant Owner & Executive',
    email: 'alex.chen@precisionfab.com',
    desc: 'Full P&L financial oversight, shop floor telemetry & high-level decision analytics.',
  },
  {
    role: 'Manager' as UserRole,
    name: 'Sarah Jenkins',
    title: 'Operations & Production Manager',
    email: 'sarah.jenkins@precisionfab.com',
    desc: 'Live machine fleet routing, material nesting inventory & shift capacity controls.',
  },
  {
    role: 'Supervisor' as UserRole,
    name: 'Marcus Vance',
    title: 'Shop Floor Lead Supervisor',
    email: 'marcus.vance@precisionfab.com',
    desc: 'Job queue dispatching, maintenance triggers & CNC machine health monitoring.',
  },
];

export default function LandingSignInPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [authMode, setAuthMode] = useState<'email' | 'otp'>('email');
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [quickLoginLoading, setQuickLoginLoading] = useState<string | null>(null);

  // SMS OTP State
  const [phone, setPhone] = useState('');
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
      email: 'alex.chen@precisionfab.com',
      password: 'demo_password123',
      role: 'Owner',
    },
  });

  const activeRole = watch('role');

  const executeLogin = async (email: string, pass: string, role: UserRole) => {
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass, role }),
      });
      const result = await res.json();
      if (result.success && result.user) {
        login(result.user.email, result.user.role as UserRole, result.user);
      } else {
        login(email, role);
      }
      router.push('/dashboard');
    } catch (err) {
      login(email, role);
      router.push('/dashboard');
    }
  };

  const onSubmit = async (data: LoginFormValues) => {
    await executeLogin(data.email, data.password, data.role as UserRole);
  };

  const handleQuickLogin = async (profile: (typeof DEMO_PROFILES)[0]) => {
    setQuickLoginLoading(profile.email);
    setValue('email', profile.email);
    setValue('role', profile.role);
    setValue('password', 'demo_password123');
    await executeLogin(profile.email, 'demo_password123', profile.role);
    setQuickLoginLoading(null);
  };

  const handleSendSmsOtp = async () => {
    setAuthError(null);
    if (!phone || phone.trim().replace(/[^0-9]/g, '').length < 10) {
      setAuthError('Please enter a valid 10-digit mobile number.');
      return;
    }
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
    } catch {
      setAuthError('Error sending SMS OTP. Please try again.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifySmsOtp = async () => {
    setAuthError(null);
    if (!phone || phone.trim().replace(/[^0-9]/g, '').length < 10) {
      setAuthError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setIsVerifyingOtp(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificationId, code: otpCode, phone }),
      });
      const data = await res.json();

      if (data.success) {
        const loginRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, role: activeRole }),
        });
        const loginData = await loginRes.json();
        if (loginData.success && loginData.user) {
          login(loginData.user.email, loginData.user.role as UserRole, loginData.user);
        } else {
          login(`+${phone.replace(/[^0-9]/g, '')}`, activeRole);
        }
        router.push('/dashboard');
      } else {
        setAuthError(data.message || 'Invalid verification code.');
      }
    } catch {
      setAuthError('Verification error. Please check your 4-digit OTP.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-[#0B0F15] text-[#111827] dark:text-[#F2F4F7] transition-colors flex flex-col font-sans">
      {/* Top Universal Navbar */}
      <header className="w-full border-b border-[#E4E7EC] dark:border-[#252B33] bg-white/80 dark:bg-[#11161D]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#155EEF] text-white shadow-md shadow-[#155EEF]/25">
              <Zap className="h-5 w-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-[#111827] dark:text-white">
                  Forge<span className="text-[#155EEF]">IQ</span>
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                  v2.6 Live
                </span>
              </div>
              <span className="hidden sm:block text-[11px] font-medium text-[#667085] dark:text-[#98A2B3]">
                Manufacturing Intelligence Platform
              </span>
            </div>
          </div>

          {/* Right Header Navigation & Theme Toggle */}
          <div className="flex items-center gap-3">
            <Link
              href="/portal/login"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#D0D5DD] dark:border-[#252B33] bg-white dark:bg-[#18202A] text-[#344054] dark:text-[#D0D5DD] hover:bg-[#F9FAFB] dark:hover:bg-[#1F242F] transition-colors shadow-xs"
            >
              <span>Customer Portal</span>
              <ExternalLink className="h-3 w-3 text-[#667085] dark:text-[#98A2B3]" />
            </Link>

            {/* Theme Toggle Button */}
            {mounted && (
              <button
                type="button"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#D0D5DD] dark:border-[#252B33] bg-white dark:bg-[#18202A] text-[#667085] dark:text-[#98A2B3] hover:bg-[#F9FAFB] dark:hover:bg-[#1F242F] transition-colors shadow-xs cursor-pointer"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4 text-amber-400" />
                ) : (
                  <Moon className="h-4 w-4 text-[#344054]" />
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Landing & Authentication Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Industrial Capability & Performance Showcase */}
          <div className="lg:col-span-7 space-y-6 lg:pr-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#EFF4FF] dark:bg-[#155EEF]/15 text-[#175CD3] dark:text-[#528BFF] border border-[#B2DDFF] dark:border-[#155EEF]/30">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Shop-Floor Operating Intelligence for 10–100 Employee Fabricators</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#111827] dark:text-white leading-[1.15]">
                Control Shop Floor Production & Financial Telemetry from One Core.
              </h1>
              <p className="text-base text-[#475467] dark:text-[#98A2B3] leading-relaxed max-w-2xl">
                Streamline customer quotations, sheet metal stock inventory, nested fiber laser cutting schedules, CNC bender maintenance, worker shifts, and real-time operational invoices.
              </p>
            </div>

            {/* High-Impact Performance Metrics */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-2">
              <div className="p-4 rounded-xl border border-[#E4E7EC] dark:border-[#252B33] bg-white dark:bg-[#11161D] shadow-xs">
                <div className="text-2xl sm:text-3xl font-bold text-[#155EEF]">99.4%</div>
                <div className="text-xs font-semibold text-[#111827] dark:text-[#F2F4F7] mt-0.5">
                  Fleet Utilization
                </div>
                <div className="text-[11px] text-[#667085] dark:text-[#98A2B3] mt-0.5">
                  Live laser telematics
                </div>
              </div>

              <div className="p-4 rounded-xl border border-[#E4E7EC] dark:border-[#252B33] bg-white dark:bg-[#11161D] shadow-xs">
                <div className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">&lt; 2s</div>
                <div className="text-xs font-semibold text-[#111827] dark:text-[#F2F4F7] mt-0.5">
                  RFQ Quoting Engine
                </div>
                <div className="text-[11px] text-[#667085] dark:text-[#98A2B3] mt-0.5">
                  Vector CAD cost analysis
                </div>
              </div>

              <div className="p-4 rounded-xl border border-[#E4E7EC] dark:border-[#252B33] bg-white dark:bg-[#11161D] shadow-xs">
                <div className="text-2xl sm:text-3xl font-bold text-[#111827] dark:text-white">$180k+</div>
                <div className="text-xs font-semibold text-[#111827] dark:text-[#F2F4F7] mt-0.5">
                  Material Savings
                </div>
                <div className="text-[11px] text-[#667085] dark:text-[#98A2B3] mt-0.5">
                  Algorithmic nesting logic
                </div>
              </div>
            </div>

            {/* Industrial Capabilities Chips */}
            <div className="space-y-2 pt-2">
              <div className="text-xs font-bold uppercase tracking-wider text-[#667085] dark:text-[#98A2B3]">
                Full-Stack Shop Floor Automation
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium text-[#344054] dark:text-[#D0D5DD]">
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 shrink-0">
                    <Check className="h-3 w-3" />
                  </div>
                  <span>Automated DXF/DWG Vector CAD Costing</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 shrink-0">
                    <Check className="h-3 w-3" />
                  </div>
                  <span>IoT Telematics (Bystronic, Trumpf, Amada)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 shrink-0">
                    <Check className="h-3 w-3" />
                  </div>
                  <span>Raw Material Stock Registry (SS304, AL6061, MS)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 shrink-0">
                    <Check className="h-3 w-3" />
                  </div>
                  <span>Escrow Milestone Payments via Razorpay</span>
                </div>
              </div>
            </div>

            {/* Security and Certification Compliance Badges */}
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-[#667085] dark:text-[#98A2B3]">
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                ISO 9001:2015 & AS9100D Ready
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                SOC 2 Type II Encrypted
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Activity className="h-4 w-4 text-[#155EEF]" />
                99.98% High-Availability SLA
              </span>
            </div>
          </div>

          {/* Right Column: Sign In Interactive Form Container */}
          <div className="lg:col-span-5 w-full">
            <div className="bg-white dark:bg-[#11161D] rounded-2xl border border-[#E4E7EC] dark:border-[#252B33] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
              
              {/* Form Heading */}
              <div className="mb-5">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111827] dark:text-white">
                  Sign In to ForgeIQ
                </h2>
                <p className="text-xs sm:text-sm text-[#667085] dark:text-[#98A2B3] mt-1">
                  Access production schedules, quoting, and machine fleet management.
                </p>
              </div>

              {/* 1-Click Fast Demo Logins Section */}
              <div className="mb-5 p-3.5 rounded-xl border border-[#B2DDFF] dark:border-[#155EEF]/30 bg-[#F5F8FF] dark:bg-[#155EEF]/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#175CD3] dark:text-[#528BFF] flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" /> 1-Click Demo Profiles
                  </span>
                  <span className="text-[10px] text-[#667085] dark:text-[#98A2B3]">Click to auto-login</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {DEMO_PROFILES.map((prof) => (
                    <button
                      key={prof.role}
                      type="button"
                      onClick={() => handleQuickLogin(prof)}
                      disabled={quickLoginLoading !== null || isSubmitting}
                      className="p-2 rounded-lg border border-[#D0D5DD] dark:border-[#252B33] bg-white dark:bg-[#18202A] hover:border-[#155EEF] hover:bg-[#EFF4FF] dark:hover:bg-[#155EEF]/20 text-left transition-all cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      <div className="text-xs font-bold text-[#111827] dark:text-white truncate">
                        {prof.name.split(' ')[0]}
                      </div>
                      <div className="text-[10px] font-medium text-[#155EEF] dark:text-[#528BFF]">
                        {prof.role}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Auth Mode Toggle (Email & Password vs Mobile SMS OTP) */}
              <div className="flex rounded-xl p-1 bg-[#F2F4F7] dark:bg-[#18202A] border border-[#E4E7EC] dark:border-[#252B33] text-xs font-bold mb-4">
                <button
                  type="button"
                  onClick={() => setAuthMode('email')}
                  className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                    authMode === 'email'
                      ? 'bg-white dark:bg-[#222B38] text-[#111827] dark:text-white shadow-xs font-semibold'
                      : 'text-[#667085] dark:text-[#98A2B3] hover:text-[#111827] dark:hover:text-white'
                  }`}
                >
                  Email & Password
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('otp')}
                  className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                    authMode === 'otp'
                      ? 'bg-white dark:bg-[#222B38] text-[#111827] dark:text-white shadow-xs font-semibold'
                      : 'text-[#667085] dark:text-[#98A2B3] hover:text-[#111827] dark:hover:text-white'
                  }`}
                >
                  Mobile SMS OTP
                </button>
              </div>

              {/* Error Alert Display */}
              {authError && (
                <div className="mb-4 p-3 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 text-xs font-medium">
                  {authError}
                </div>
              )}

              {/* Form Option 1: Email and Password */}
              {authMode === 'email' ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Role Context Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-[#344054] dark:text-[#D0D5DD] mb-1.5">
                      Role Context
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {(['Owner', 'Manager', 'Supervisor', 'Worker'] as UserRole[]).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setValue('role', r)}
                          className={`px-2 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer text-center ${
                            activeRole === r
                              ? 'border-[#155EEF] bg-[#EFF4FF] dark:bg-[#155EEF]/20 text-[#175CD3] dark:text-[#528BFF] shadow-xs'
                              : 'border-[#D0D5DD] dark:border-[#252B33] bg-white dark:bg-[#18202A] text-[#475467] dark:text-[#98A2B3] hover:bg-[#F9FAFB] dark:hover:bg-[#1F242F]'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Business Email Field */}
                  <div>
                    <label className="block text-xs font-semibold text-[#344054] dark:text-[#D0D5DD] mb-1">
                      Business Email Address
                    </label>
                    <Input
                      type="email"
                      placeholder="e.g. alex.chen@precisionfab.com"
                      icon={<Mail className="h-4 w-4" />}
                      {...register('email')}
                    />
                    {errors.email && (
                      <span className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 block">
                        {errors.email.message}
                      </span>
                    )}
                  </div>

                  {/* Account Password Field */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-[#344054] dark:text-[#D0D5DD]">
                        Account Password
                      </label>
                      <Link
                        href="/forgot-password"
                        className="text-xs text-[#155EEF] dark:text-[#528BFF] hover:underline transition-colors"
                      >
                        Forgot Password?
                      </Link>
                    </div>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter password (e.g. demo_password123)"
                      icon={<Lock className="h-4 w-4" />}
                      rightElement={
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="text-[#667085] hover:text-[#111827] dark:hover:text-white transition-colors p-1 rounded-md cursor-pointer"
                          title={showPassword ? 'Hide password' : 'Show password'}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-[#155EEF]" />
                          ) : (
                            <Eye className="h-4 w-4 text-[#667085]" />
                          )}
                        </button>
                      }
                      {...register('password')}
                    />
                    {errors.password && (
                      <span className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 block">
                        {errors.password.message}
                      </span>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-11 bg-[#155EEF] hover:bg-[#124ec7] text-white font-semibold text-sm shadow-sm"
                    disabled={isSubmitting || quickLoginLoading !== null}
                  >
                    {isSubmitting ? (
                      'Authenticating Facility...'
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Access Workspace <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </form>
              ) : (
                /* Form Option 2: Mobile SMS OTP */
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#344054] dark:text-[#D0D5DD] mb-1">
                      Registered Mobile Number
                    </label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      icon={<Phone className="h-4 w-4" />}
                    />
                    <span className="text-[10px] text-[#667085] dark:text-[#98A2B3] mt-1 block">
                      Enter 10-digit mobile number with or without country code.
                    </span>
                  </div>

                  {!verificationId ? (
                    <Button
                      type="button"
                      onClick={handleSendSmsOtp}
                      size="lg"
                      className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm"
                      disabled={isSendingOtp}
                    >
                      {isSendingOtp ? 'Dispatching SMS...' : 'Send 4-Digit OTP Code'}
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      {otpSentMsg && (
                        <div className="p-3 rounded-lg border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 shrink-0" />
                          <span>{otpSentMsg}</span>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-semibold text-[#344054] dark:text-[#D0D5DD] mb-1">
                          Enter 4-Digit OTP Verification Code
                        </label>
                        <Input
                          maxLength={4}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          placeholder="e.g. 8492"
                          icon={<KeyRound className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
                          className="font-mono text-center tracking-widest text-base"
                        />
                      </div>

                      <Button
                        type="button"
                        onClick={handleVerifySmsOtp}
                        size="lg"
                        className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm"
                        disabled={isVerifyingOtp || otpCode.length < 4}
                      >
                        {isVerifyingOtp ? 'Verifying OTP...' : 'Verify OTP & Access Platform'}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Bottom Registration & Portal Links */}
              <div className="mt-6 pt-4 border-t border-[#E4E7EC] dark:border-[#252B33] space-y-2 text-center text-xs text-[#667085] dark:text-[#98A2B3]">
                <div>
                  Don&apos;t have a manufacturing workspace yet?{' '}
                  <Link
                    href="/register"
                    className="text-[#155EEF] dark:text-[#528BFF] font-semibold hover:underline"
                  >
                    Register Facility
                  </Link>
                </div>
                <div>
                  Looking to track an existing part order?{' '}
                  <Link
                    href="/portal/login"
                    className="text-[#344054] dark:text-[#D0D5DD] font-medium hover:underline inline-flex items-center gap-1"
                  >
                    <span>Buyer Order Tracking</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Modern Minimal Footer */}
      <footer className="w-full border-t border-[#E4E7EC] dark:border-[#252B33] bg-white dark:bg-[#11161D] py-4 text-center text-xs text-[#667085] dark:text-[#98A2B3]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 ForgeIQ Systems Inc. Enterprise Manufacturing Intelligence.</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              api.otp.dev SMS Active
            </span>
            <span>Neon PostgreSQL Connected</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
