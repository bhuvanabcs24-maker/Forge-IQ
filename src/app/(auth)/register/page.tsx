'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Zap, Mail, Lock, Building2, User, ArrowRight } from 'lucide-react';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  companyName: z.string().min(2, 'Company name is required'),
  email: z.string().email('Please enter a valid work email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();

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
      password: '',
    },
  });

  const onSubmit = (data: RegisterFormValues) => {
    router.push('/verify-email');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 text-slate-100 industrial-grid">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-steel-800 bg-steel-900/90 p-8 shadow-2xl backdrop-blur-md">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-500/30 mb-2">
            <Zap className="h-6 w-6 fill-current" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Register Your Manufacturing Plant
          </h2>
          <p className="text-xs text-steel-400">
            Set up an executive Owner account for ForgeIQ Manufacturing Platform.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-steel-300 mb-1">
              Full Name
            </label>
            <Input icon={<User className="h-4 w-4" />} placeholder="Sarah Jenkins" {...register('fullName')} />
            {errors.fullName && (
              <span className="text-[11px] text-rose-400 mt-1 block">{errors.fullName.message}</span>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-steel-300 mb-1">
              Fabrication Plant / Company Name
            </label>
            <Input icon={<Building2 className="h-4 w-4" />} placeholder="Precision Metal Fab Ltd." {...register('companyName')} />
            {errors.companyName && (
              <span className="text-[11px] text-rose-400 mt-1 block">{errors.companyName.message}</span>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-steel-300 mb-1">
              Work Email Address
            </label>
            <Input type="email" icon={<Mail className="h-4 w-4" />} placeholder="owner@company.com" {...register('email')} />
            {errors.email && (
              <span className="text-[11px] text-rose-400 mt-1 block">{errors.email.message}</span>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-steel-300 mb-1">
              Account Password
            </label>
            <Input type="password" icon={<Lock className="h-4 w-4" />} placeholder="••••••••" {...register('password')} />
            {errors.password && (
              <span className="text-[11px] text-rose-400 mt-1 block">{errors.password.message}</span>
            )}
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            Create Executive Workspace <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </form>

        <div className="text-center text-xs text-steel-400 border-t border-steel-800 pt-4">
          Already registered?{' '}
          <Link href="/login" className="text-brand-400 font-semibold hover:text-brand-300">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
