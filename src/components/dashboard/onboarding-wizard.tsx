'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, ArrowRight, Wrench, Boxes, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function OnboardingWizard() {
  const router = useRouter();

  const steps = [
    {
      id: 'step-1',
      title: '1. Connect Shop Floor Machine Fleet',
      description: 'Configure TRUMPF Fiber Lasers, Bystronic Press Brakes, and CNC Milling centers.',
      completed: true,
      actionLabel: 'Manage Machines',
      href: '/machines',
      icon: Wrench,
    },
    {
      id: 'step-2',
      title: '2. Upload DXF / STEP CAD Drawing',
      description: 'Test AI cut perimeter extraction, bend line detection, and weight estimation.',
      completed: true,
      actionLabel: 'Launch CAD Engine',
      href: '/cad-analysis',
      icon: Boxes,
    },
    {
      id: 'step-3',
      title: '3. Invite Team Members & Assign Roles',
      description: 'Add shop floor operators, supervisors, and sales estimators to workspace seats.',
      completed: false,
      actionLabel: 'Invite Seats',
      href: '/settings/organization',
      icon: Users,
    },
  ];

  return (
    <Card className="border-purple-500/20 bg-gradient-to-r from-white via-slate-50 to-purple-50/20 dark:from-steel-900 dark:via-steel-900/90 dark:to-purple-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span>Workspace Activation & Setup Guide</span>
          <span className="text-xs text-brand-500 font-mono font-bold">2 of 3 Completed (66%)</span>
        </CardTitle>
        <CardDescription>Complete initial onboarding steps to activate full AI automation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className={`p-3.5 rounded-xl border transition-all space-y-2 flex flex-col justify-between ${
                  step.completed
                    ? 'border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10'
                    : 'border-brand-500/40 bg-brand-500/5 dark:bg-brand-500/15'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Icon className={`h-4 w-4 ${step.completed ? 'text-emerald-500' : 'text-brand-500'}`} />
                    {step.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Circle className="h-4 w-4 text-brand-500 animate-pulse" />
                    )}
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs">{step.title}</h4>
                  <p className="text-slate-500 dark:text-steel-400 text-[11px]">{step.description}</p>
                </div>

                <Button
                  size="sm"
                  variant={step.completed ? 'outline' : 'primary'}
                  onClick={() => router.push(step.href)}
                  className="w-full mt-2"
                >
                  {step.actionLabel} <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
