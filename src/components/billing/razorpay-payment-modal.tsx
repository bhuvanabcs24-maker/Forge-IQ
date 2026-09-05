'use client';

import React, { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { useRazorpay } from '@/hooks/use-razorpay';
import { ShieldCheck, CheckCircle2, CreditCard, Lock, Sparkles, AlertCircle, Loader2 } from 'lucide-react';

export interface RazorpayModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  itemTitle: string;
  itemSubtitle?: string;
  amount: number; // in INR
  metadata?: Record<string, string>;
  onPaymentSuccess?: (payment: { paymentId: string; orderId: string }) => void;
}

export function RazorpayPaymentModal({
  isOpen,
  onClose,
  title,
  description,
  itemTitle,
  itemSubtitle,
  amount,
  metadata,
  onPaymentSuccess,
}: RazorpayModalProps) {
  const { openCheckout, isLoading, error } = useRazorpay();
  const [paymentSuccessData, setPaymentSuccessData] = useState<{
    paymentId: string;
    orderId: string;
  } | null>(null);

  const handlePay = () => {
    openCheckout({
      amount,
      currency: 'INR',
      title: 'ForgeIQ Platform',
      description: itemTitle,
      notes: metadata,
      onSuccess: (res) => {
        setPaymentSuccessData(res);
        if (onPaymentSuccess) {
          onPaymentSuccess(res);
        }
      },
      onError: (err) => {
        console.error('Payment failed:', err);
      },
    });
  };

  const handleModalClose = () => {
    setPaymentSuccessData(null);
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleModalClose}
      title={paymentSuccessData ? 'Payment Confirmed' : title}
      description={paymentSuccessData ? 'Transaction recorded on ForgeIQ' : description}
      maxWidth="md"
    >
      {paymentSuccessData ? (
        /* Success Screen */
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500 dark:text-emerald-400">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Payment Successful!</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Your transaction has been securely settled via Razorpay.
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Payment ID:</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                {paymentSuccessData.paymentId}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Order ID:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">
                {paymentSuccessData.orderId}
              </span>
            </div>
            <div className="flex justify-between border-t border-slate-200 dark:border-slate-800 pt-2 font-semibold">
              <span className="text-slate-700 dark:text-slate-300">Amount Paid:</span>
              <span className="text-slate-900 dark:text-slate-100">{formatCurrency(amount)}</span>
            </div>
          </div>

          <Button
            onClick={handleModalClose}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
          >
            Done
          </Button>
        </div>
      ) : (
        /* Checkout Summary Screen */
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="border-sky-500/30 text-sky-600 dark:text-sky-400 bg-sky-500/10 text-[11px] gap-1">
              <Sparkles className="h-3 w-3" /> Razorpay Secured Checkout
            </Badge>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
              <Lock className="h-3 w-3 text-emerald-500" /> 256-bit SSL
            </div>
          </div>

          {/* Line Item Card */}
          <div className="rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 space-y-3 text-xs">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold text-slate-900 dark:text-slate-200 text-sm">{itemTitle}</div>
                {itemSubtitle && <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{itemSubtitle}</div>}
              </div>
              <div className="text-right">
                <div className="font-extrabold text-base text-slate-900 dark:text-slate-100">{formatCurrency(amount)}</div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400">Inclusive of GST</div>
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px]">
              <span>Supported Methods:</span>
              <span className="text-slate-800 dark:text-slate-200 font-medium">UPI, Cards, NetBanking, EMI</span>
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-500 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              variant="outline"
              onClick={handleModalClose}
              disabled={isLoading}
              className="border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePay}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-sky-600 to-brand-600 hover:from-sky-700 hover:to-brand-700 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-sky-900/30"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connecting Gateway...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  Pay {formatCurrency(amount)} via Razorpay
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 pt-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>PCI-DSS Level 1 Compliant • Powered by Razorpay</span>
          </div>
        </div>
      )}
    </Dialog>
  );
}
