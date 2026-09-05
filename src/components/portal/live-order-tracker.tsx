'use client';

import React, { useState } from 'react';
import { CustomerOrderView, StageMediaPhoto, CustomerFeedbackRating } from '@/types/customer-portal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StagePhotoGallery } from './stage-photo-gallery';
import { PostDeliveryFeedbackModal } from './post-delivery-feedback-modal';
import { globalEscrowService } from '@/lib/marketplace/escrow-service';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  Truck,
  ShieldCheck,
  Camera,
  RotateCcw,
  Star,
  AlertTriangle,
  Cpu,
  UserCheck,
  Check,
  MapPin,
  PackageCheck,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export const UNIFIED_JOURNEY_STAGES = [
  { id: 'quote_approved', name: 'Quote Approved', description: 'Digital quotation signoff & deposit confirmed' },
  { id: 'material_reserved', name: 'Material Reserved', description: 'Raw 304 SS sheet metal stock allocated from inventory' },
  { id: 'scheduled', name: 'Production Scheduled', description: 'Queued on machine planner & assigned to operators' },
  { id: 'laser_cutting', name: 'Laser Cutting', description: 'High-speed fiber laser nesting & profile cutting' },
  { id: 'bending', name: 'CNC Bending', description: 'Precision multi-axis press brake angle forming' },
  { id: 'welding', name: 'Welding', description: 'Robotic cell TIG/MIG joint welding' },
  { id: 'finishing', name: 'Finishing', description: 'Vibratory deburring & protective powder coating' },
  { id: 'quality_check', name: 'Quality Check', description: 'Coordinate measuring machine (CMM) dimensional QA' },
  { id: 'dispatch', name: 'Dispatch', description: 'Packaged, strapped to pallet, and collected by courier' },
  { id: 'delivered', name: 'Delivered', description: 'Delivered to buyer facility & accepted' },
];

export function LiveOrderTracker({ order }: { order: CustomerOrderView }) {
  const router = useRouter();

  // Active stage is index 5 (Welding in progress) matching prompt narrative:
  // "✓ Quote Approved, ✓ Material Reserved, ✓ Production Scheduled, ✓ Laser Cutting, ✓ CNC Bending, 🔄 Welding, ○ Finishing, ○ Quality Check, ○ Dispatch, ○ Delivered"
  const [activeStageIndex, setActiveStageIndex] = useState(5);
  const [isPhotoGalleryOpen, setIsPhotoGalleryOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isDeliveryConfirmed, setIsDeliveryConfirmed] = useState(false);
  const [deliveryTransitStep, setDeliveryTransitStep] = useState<'picked_up' | 'in_transit' | 'near_destination' | 'delivered'>('near_destination');
  const [userRating, setUserRating] = useState<CustomerFeedbackRating | undefined>(order.feedbackRating);

  const samplePhotos: StageMediaPhoto[] = [
    {
      id: 'p-1',
      stageId: 'laser_cutting',
      stageName: 'Laser Cutting',
      photoUrl: '/sample_laser_cut.jpg',
      caption: 'TRUMPF 6kW Fiber Laser profile cut edge quality check (SS304 3mm)',
      uploadedAt: 'Today, 09:30 AM',
      operatorName: 'Marcus Vance',
    },
    {
      id: 'p-2',
      stageId: 'bending',
      stageName: 'CNC Bending',
      photoUrl: '/sample_bending.jpg',
      caption: 'Bystronic Press Brake 90° angle bend verification (+/- 0.1° tolerance)',
      uploadedAt: 'Today, 11:15 AM',
      operatorName: 'Alex Rivera',
    },
    {
      id: 'p-3',
      stageId: 'welding',
      stageName: 'Welding',
      photoUrl: '/sample_welding.jpg',
      caption: 'Robotic TIG seam welding joint penetration inspection',
      uploadedAt: 'Today, 01:40 PM',
      operatorName: 'Priya Sharma',
    },
  ];

  const handleConfirmDelivery = () => {
    setIsDeliveryConfirmed(true);
    setActiveStageIndex(9); // Completed
    setDeliveryTransitStep('delivered');
    setIsFeedbackOpen(true);
  };

  return (
    <div className="p-6 rounded-3xl border border-slate-200 dark:border-steel-800 bg-white dark:bg-steel-900/90 shadow-xl space-y-6 text-xs">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-steel-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-xl text-slate-900 dark:text-slate-100 tracking-tight">
              {order.orderNumber || 'FG-2042'}
            </h3>
            <Badge status={isDeliveryConfirmed ? 'Delivered' : order.status} />
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Sparkles className="h-3 w-3" /> Live Manufacturing Journey
            </span>
          </div>
          <p className="text-slate-500 dark:text-steel-400 mt-1 font-semibold text-sm">
            {order.title || '500 Stainless Steel Brackets (3mm SS304)'}
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPhotoGalleryOpen(true)}
            className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
          >
            <Camera className="h-3.5 w-3.5 mr-1" /> Production Photos ({samplePhotos.length})
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/quotations/builder')}
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reorder Product
          </Button>

          {!userRating ? (
            <Button size="sm" onClick={() => setIsFeedbackOpen(true)}>
              <Star className="h-3.5 w-3.5 mr-1 text-amber-400 fill-current" /> Rate Quality
            </Button>
          ) : (
            <Badge variant="success" className="font-bold flex items-center gap-1 py-1 px-2.5">
              <Star className="h-3 w-3 fill-current text-amber-400" /> Rated {userRating.overallScore}/5
            </Badge>
          )}
        </div>
      </div>

      {/* Live Manufacturing Pulse Banner */}
      <div className="p-4 rounded-2xl border border-brand-500/30 bg-gradient-to-r from-brand-950/40 via-brand-900/20 to-purple-950/30 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span>
            </span>
            <div>
              <span className="font-black text-slate-900 dark:text-slate-100 text-sm">
                Current Stage: {UNIFIED_JOURNEY_STAGES[activeStageIndex].name}
              </span>
              <span className="text-slate-400 text-xs ml-2 font-mono font-bold">
                ({isDeliveryConfirmed ? 100 : 78}% Overall Progress)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-slate-200">
              <Cpu className="h-3.5 w-3.5 text-brand-400" /> KUKA Robotic TIG Cell 02
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
              <UserCheck className="h-3.5 w-3.5" /> Priya Sharma (Certified Welder)
            </span>
          </div>
        </div>

        <div className="text-[11px] text-slate-300 pt-2 border-t border-brand-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span>Started: Today @ 01:15 PM • Est Stage Finish: Today @ 03:45 PM</span>
          <div className="flex items-center gap-2">
            <span className="font-bold text-emerald-400">AI Confidence: 96%</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">Target Delivery: <strong>Tomorrow · 3:00 PM</strong></span>
          </div>
        </div>
      </div>

      {/* Delay Predictions (if any) */}
      {order.delayReasoning && (
        <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
            <div>
              <strong>AI Schedule Alert:</strong> {order.delayReasoning}
            </div>
          </div>
          <Badge className="bg-amber-500/20 text-amber-300 shrink-0">
            Revised Delivery: {order.revisedEta}
          </Badge>
        </div>
      )}

      {/* 10-Stage Visual Journey Timeline */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider">
            Manufacturing Journey (Quote Approved ➔ Delivered)
          </h4>
          <span className="text-[11px] text-slate-400">
            Stage {activeStageIndex + 1} of {UNIFIED_JOURNEY_STAGES.length}
          </span>
        </div>

        <div className="space-y-1.5">
          {UNIFIED_JOURNEY_STAGES.map((stage, idx) => {
            const isDone = idx < activeStageIndex;
            const isCurrent = idx === activeStageIndex;

            return (
              <div
                key={stage.id}
                className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                  isCurrent
                    ? 'border-brand-500 bg-brand-500/10 dark:bg-brand-500/15 ring-1 ring-brand-500/30'
                    : isDone
                    ? 'border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10'
                    : 'border-slate-200 dark:border-steel-800/60 opacity-40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full shrink-0">
                    {isDone ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : isCurrent ? (
                      <Clock className="h-4 w-4 text-brand-400 animate-spin" />
                    ) : (
                      <span className="h-3 w-3 rounded-full border border-slate-300 dark:border-steel-700" />
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-2">
                      {stage.name}
                      {isCurrent && (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.2 bg-brand-500 text-white rounded">
                          ACTIVE
                        </span>
                      )}
                      {isDone && (
                        <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5">
                          <Check className="h-3 w-3" /> Done
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-steel-400">
                      {stage.description}
                    </div>
                  </div>
                </div>

                {isDone && idx <= 2 && (
                  <button
                    onClick={() => setIsPhotoGalleryOpen(true)}
                    className="text-purple-400 font-bold hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <Camera className="h-3 w-3" /> Inspect Photo
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 6 — DELIVER: Live Courier Transit Telemetry */}
      <div className="p-5 rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-950/30 via-steel-900 to-slate-950 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/20 text-blue-400 font-bold shrink-0">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h5 className="font-bold text-sm text-slate-100">Live Logistics & Dispatch Tracking</h5>
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-[10px]">
                  Carrier: FedEx Freight Express
                </Badge>
              </div>
              <p className="text-slate-400 text-xs font-mono mt-0.5">
                Tracking Number: TRK-2026-8919 • Dispatch Pallet ID: #PLT-098
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Estimated Arrival</span>
            <span className="text-base font-extrabold text-blue-400">Tomorrow · 3:00 PM (14 Mins Away)</span>
          </div>
        </div>

        {/* Live Delivery Progress Steps: Picked Up -> In Transit -> 2 km Away -> Estimated Arrival */}
        <div className="p-3 rounded-xl bg-steel-950/80 border border-steel-800 grid grid-cols-4 gap-2 text-center text-[11px]">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold flex flex-col items-center">
            <CheckCircle2 className="h-4 w-4 mb-1" />
            <span>1. Picked Up</span>
            <span className="text-[9px] text-slate-500 font-normal">Factory Gate 3</span>
          </div>
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold flex flex-col items-center">
            <CheckCircle2 className="h-4 w-4 mb-1" />
            <span>2. In Transit</span>
            <span className="text-[9px] text-slate-500 font-normal">Highway Route 9</span>
          </div>
          <div className={`p-2 rounded-lg font-bold flex flex-col items-center ${isDeliveryConfirmed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/40'}`}>
            <MapPin className="h-4 w-4 mb-1 animate-bounce" />
            <span>3. 2 km Away</span>
            <span className="text-[9px] text-slate-400 font-normal">Express Van #8</span>
          </div>
          <div className={`p-2 rounded-lg font-bold flex flex-col items-center ${isDeliveryConfirmed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-steel-900 text-slate-500'}`}>
            <PackageCheck className="h-4 w-4 mb-1" />
            <span>4. Arrived</span>
            <span className="text-[9px] text-slate-500 font-normal">Buyer Dock</span>
          </div>
        </div>

        {/* Post-Delivery Confirmation & Escrow Release Action */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-steel-800">
          <div className="text-[11px] text-slate-400">
            {isDeliveryConfirmed ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> Delivery confirmed. Escrow payment released to manufacturer.
              </span>
            ) : (
              <span>Confirm delivery upon physical receipt at loading dock to release final escrow payout.</span>
            )}
          </div>

          {!isDeliveryConfirmed ? (
            <Button
              size="sm"
              onClick={handleConfirmDelivery}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
            >
              <PackageCheck className="h-3.5 w-3.5 mr-1" /> Confirm Delivery & Release Payout
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsFeedbackOpen(true)}
              className="border-amber-500/40 text-amber-300"
            >
              <Star className="h-3.5 w-3.5 mr-1 fill-current" /> Submit 5-Star Rating
            </Button>
          )}
        </div>
      </div>

      {/* Modals */}
      <StagePhotoGallery
        isOpen={isPhotoGalleryOpen}
        onClose={() => setIsPhotoGalleryOpen(false)}
        orderNumber={order.orderNumber || 'FG-2042'}
        photos={samplePhotos}
      />

      <PostDeliveryFeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        orderNumber={order.orderNumber || 'FG-2042'}
        onSubmitFeedback={(rating) => setUserRating(rating)}
      />
    </div>
  );
}
