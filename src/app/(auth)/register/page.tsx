'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Zap,
  Mail,
  Lock,
  Building2,
  User,
  Phone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  RotateCcw,
  AlertCircle,
  Loader2,
  MessageSquare,
} from 'lucide-react';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  companyName: z.string().min(2, 'Fabrication plant or company name is required'),
  email: z.string().email('Please enter a valid work email'),
  phone: z
    .string()
    .min(10, 'Please enter a valid 10-digit mobile number')
    .max(15, 'Mobile number is too long'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();

  const [step, setStep] = useState<'form' | 'otp' | 'success'>('form');
  const [formData, setFormData] = useState<RegisterFormValues | null>(null);

  // OTP State
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [verificationId, setVerificationId] = useState<string>('');
  const [resendCountdown, setResendCountdown] = useState<number>(60);
  const [canResend, setCanResend] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      companyName: '',
      email: '',
      phone: '7829023129',
      password: '',
    },
  });

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && resendCountdown > 0) {
      timer = setTimeout(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    } else if (resendCountdown === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [step, resendCountdown]);

  // Step 1: Submit Registration Form & Dispatch OTP via api.otp.dev
  const onFormSubmit = async (data: RegisterFormValues) => {
    setOtpError(null);
    setOtpLoading(true);
    setFormData(data);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: data.phone }),
      });
      const result = await res.json();

      if (result.success) {
        setVerificationId(result.verificationId || result.messageId || '');
        setStep('otp');
        setResendCountdown(60);
        setCanResend(false);
      } else {
        setOtpError(result.message || 'Failed to dispatch SMS verification. Please try again.');
      }
    } catch (err: any) {
      setOtpError('Network error connecting to SMS provider. Please retry.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Resend SMS OTP
  const handleResendOtp = async () => {
    if (!formData || !canResend) return;
    setOtpLoading(true);
    setOtpError(null);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone }),
      });
      const result = await res.json();

      if (result.success) {
        setVerificationId(result.verificationId || result.messageId || '');
        setResendCountdown(60);
        setCanResend(false);
      } else {
        setOtpError(result.message || 'Could not resend SMS OTP.');
      }
    } catch (err) {
      setOtpError('Failed to resend OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Step 2: Verify 4-digit code via api.otp.dev
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length < 4) {
      setOtpError('Please enter the complete 4-digit code sent via SMS.');
      return;
    }

    setOtpLoading(true);
    setOtpError(null);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formData?.phone || '',
          code: otpCode.trim(),
          verificationId,
        }),
      });
      const result = await res.json();

      if (result.success) {
        setStep('success');
        if (typeof window !== 'undefined' && formData) {
          localStorage.setItem(
            'FORGEIQ_USER',
            JSON.stringify({
              fullName: formData.fullName,
              companyName: formData.companyName,
              email: formData.email,
              phone: formData.phone,
              verifiedAt: new Date().toISOString(),
            })
          );
        }
        setTimeout(() => {
          router.push('/dashboard?welcome=true');
        }, 1600);
      } else {
        setOtpError(result.message || 'Invalid or expired OTP code. Please check SMS.');
      }
    } catch (err) {
      setOtpError('Verification failed. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-slate-100 industrial-grid">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-steel-800 bg-steel-900/90 p-8 shadow-2xl backdrop-blur-md">
        
        {/* Step 1: Sign-Up Form with Phone Input */}
        {step === 'form' && (
          <>
            <div className="text-center space-y-2">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-500/30 mb-2">
                <Zap className="h-6 w-6 fill-current" />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Register Your Manufacturing Plant
              </h2>
              <p className="text-xs text-steel-400">
                Set up an executive Owner account with SMS-verified authorization.
              </p>
            </div>

            {otpError && (
              <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{otpError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-steel-300 mb-1">
                  Full Name
                </label>
                <Input
                  icon={<User className="h-4 w-4" />}
                  placeholder="Sarah Jenkins"
                  {...register('fullName')}
                />
                {errors.fullName && (
                  <span className="text-[11px] text-rose-400 mt-1 block">{errors.fullName.message}</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-steel-300 mb-1">
                  Fabrication Plant / Company Name
                </label>
                <Input
                  icon={<Building2 className="h-4 w-4" />}
                  placeholder="Precision Metal Fab Ltd."
                  {...register('companyName')}
                />
                {errors.companyName && (
                  <span className="text-[11px] text-rose-400 mt-1 block">{errors.companyName.message}</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-steel-300 mb-1">
                  Work Email Address
                </label>
                <Input
                  type="email"
                  icon={<Mail className="h-4 w-4" />}
                  placeholder="owner@company.com"
                  {...register('email')}
                />
                {errors.email && (
                  <span className="text-[11px] text-rose-400 mt-1 block">{errors.email.message}</span>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-steel-300">
                    Mobile Phone (SMS OTP Verification)
                  </label>
                  <span className="text-[10px] text-brand-400 font-mono flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> Powered by OTP.dev
                  </span>
                </div>
                <div className="flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-steel-700 bg-steel-800 text-steel-300 text-xs font-mono">
                    +91
                  </span>
                  <Input
                    type="tel"
                    icon={<Phone className="h-4 w-4" />}
                    placeholder="7829023129"
                    className="rounded-l-none"
                    {...register('phone')}
                  />
                </div>
                {errors.phone && (
                  <span className="text-[11px] text-rose-400 mt-1 block">{errors.phone.message}</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-steel-300 mb-1">
                  Account Password
                </label>
                <Input
                  type="password"
                  icon={<Lock className="h-4 w-4" />}
                  placeholder="••••••••"
                  {...register('password')}
                />
                {errors.password && (
                  <span className="text-[11px] text-rose-400 mt-1 block">{errors.password.message}</span>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-gradient-to-r from-brand-600 via-purple-600 to-indigo-600 text-white font-bold"
                disabled={isSubmitting || otpLoading}
              >
                {otpLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Sending SMS OTP via OTP.dev...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1.5">
                    Continue to SMS Verification <ArrowRight className="h-4 w-4 ml-1" />
                  </span>
                )}
              </Button>
            </form>

            <div className="text-center text-xs text-steel-400 border-t border-steel-800 pt-4">
              Already registered?{' '}
              <Link href="/login" className="text-brand-400 font-semibold hover:text-brand-300">
                Sign In
              </Link>
            </div>
          </>
        )}

        {/* Step 2: 4-Digit SMS OTP Verification Card */}
        {step === 'otp' && (
          <div className="space-y-5 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 mx-auto">
              <MessageSquare className="h-6 w-6" />
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-300 text-[11px] font-mono">
                <ShieldCheck className="h-3.5 w-3.5 text-sky-400" /> api.otp.dev SMS Gateway
              </div>
              <h3 className="text-xl font-bold text-white">Enter 4-Digit SMS Code</h3>
              <p className="text-xs text-slate-400">
                We sent a 4-digit verification code to{' '}
                <span className="text-white font-mono font-bold">
                  +91 {formData?.phone}
                </span>
              </p>
            </div>

            {otpError && (
              <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-400 flex items-center gap-2 text-left">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{otpError}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <Input
                  type="text"
                  maxLength={4}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="••••"
                  autoFocus
                  className="text-center text-3xl font-mono tracking-[0.6em] font-black h-14 bg-steel-950 border-steel-700 text-white"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Check your SMS inbox for the 4-digit code
                </span>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-700 hover:to-purple-700 text-white font-bold"
                disabled={otpLoading || otpCode.length < 4}
              >
                {otpLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Verifying with OTP.dev...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-4 w-4" /> Verify & Complete Registration
                  </span>
                )}
              </Button>
            </form>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-steel-800">
              <button
                type="button"
                onClick={() => {
                  setStep('form');
                  setOtpError(null);
                }}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ← Edit details
              </button>

              <button
                type="button"
                disabled={!canResend || otpLoading}
                onClick={handleResendOtp}
                className={`font-semibold cursor-pointer ${
                  canResend ? 'text-brand-400 hover:underline' : 'text-slate-600 cursor-not-allowed'
                }`}
              >
                {canResend ? 'Resend SMS OTP' : `Resend in ${resendCountdown}s`}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Success Confirmation Screen */}
        {step === 'success' && (
          <div className="space-y-4 text-center py-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">Mobile Verified Successfully!</h3>
              <p className="text-xs text-slate-400 mt-1">
                Your plant workspace for{' '}
                <span className="text-white font-semibold">{formData?.companyName}</span> has been provisioned.
              </p>
            </div>

            <div className="rounded-xl bg-steel-950 border border-steel-800 p-4 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Owner Name:</span>
                <span className="text-slate-200 font-semibold">{formData?.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Verified Phone:</span>
                <span className="font-mono text-emerald-400">+91 {formData?.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">SMS Verification Provider:</span>
                <span className="font-mono text-slate-300">api.otp.dev</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-brand-400 pt-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Redirecting to your factory dashboard...
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

