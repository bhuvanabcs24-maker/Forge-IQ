'use client';

import React from 'react';
import { ExtractedField } from '@/types/ai-order-intake';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExtractedFieldInputProps {
  label: string;
  fieldKey: string;
  field: ExtractedField<any>;
  type?: 'text' | 'number' | 'date' | 'select';
  selectOptions?: { label: string; value: string }[];
  onChange: (value: any) => void;
  onConfirm: () => void;
}

export function ExtractedFieldInput({
  label,
  fieldKey,
  field,
  type = 'text',
  selectOptions,
  onChange,
  onConfirm,
}: ExtractedFieldInputProps) {
  const isLowConfidence = field.confidence < 80;
  const needsConfirmation = isLowConfidence && !field.isUserConfirmed;

  return (
    <div
      className={cn(
        'p-3.5 rounded-xl border transition-all space-y-2',
        needsConfirmation
          ? 'border-amber-500/50 bg-amber-500/5 dark:bg-amber-500/10 shadow-xs'
          : 'border-slate-200 dark:border-steel-800 bg-white dark:bg-steel-900/70'
      )}
    >
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-800 dark:text-steel-200 flex items-center gap-1.5">
          {label}
          {needsConfirmation && (
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
              <AlertTriangle className="h-3 w-3" /> Needs Review (&lt;80%)
            </span>
          )}
        </label>

        {/* Confidence Score Pill Badge */}
        <div className="flex items-center gap-2">
          <Badge
            className={cn(
              'text-[10px] font-bold px-2 py-0.5',
              field.confidence >= 90
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                : field.confidence >= 80
                ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30'
                : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40 animate-pulse'
            )}
          >
            {field.confidence}% Confidence
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {type === 'select' && selectOptions ? (
          <select
            value={field.value}
            onChange={(e) => onChange(e.target.value)}
            className="flex h-9 w-full rounded-md border border-slate-300 dark:border-steel-700 bg-white dark:bg-steel-900 px-3 py-1.5 text-xs font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
          >
            {selectOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <Input
            type={type}
            value={field.value}
            onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
            className={cn(
              'text-xs font-medium',
              needsConfirmation && 'border-amber-400 focus:ring-amber-500'
            )}
          />
        )}

        {/* Confirm Button for Low Confidence Values */}
        {needsConfirmation ? (
          <Button
            type="button"
            size="sm"
            onClick={onConfirm}
            className="bg-amber-600 hover:bg-amber-700 text-white shrink-0 text-xs px-3"
          >
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Confirm
          </Button>
        ) : (
          <div className="text-emerald-500 p-1 shrink-0" title="Field verified">
            <CheckCircle2 className="h-4 w-4 opacity-80" />
          </div>
        )}
      </div>
    </div>
  );
}
