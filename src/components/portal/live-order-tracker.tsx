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
      <div className="p-4 rounded-2xl border border-blue-200 dark:border-brand-500/30 bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-purple-50/70 dark:from-brand-950/40 dark:via-brand-900/20 dark:to-purple-950/30 space-y-3">
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
              <span className="text-slate-500 dark:text-slate-400 text-xs ml-2 font-mono font-bold">
                ({isDeliveryConfirmed ? 100 : 78}% Overall Progress)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200">
              <Cpu className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" /> KUKA Robotic TIG Cell 02
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
              <UserCheck className="h-3.5 w-3.5" /> Priya Sharma (Certified Welder)
            </span>
          </div>
        </div>

        <div className="text-[11px] text-slate-600 dark:text-slate-300 pt-2 border-t border-blue-200/60 dark:border-brand-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span>Started: Today @ 01:15 PM • Est Stage Finish: Today @ 03:45 PM</span>
          <div className="flex items-center gap-2">
            <span className="font-bold text-emerald-600 dark:text-emerald-400">AI Confidence: 96%</span>
            <span className="text-slate-400 dark:text-slate-500">•</span>
            <span className="text-slate-600 dark:text-slate-300">Target Delivery: <strong className="text-slate-900 dark:text-slate-100">Tomorrow · 3:00 PM</strong></span>
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
      <div className="p-5 rounded-2xl border border-blue-200 dark:border-blue-500/30 bg-gradient-to-br from-blue-50/80 via-slate-50/90 to-white dark:from-blue-950/30 dark:via-steel-900 dark:to-slate-950 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold shrink-0">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h5 className="font-bold text-sm text-slate-900 dark:text-slate-100">Live Logistics & Dispatch Telematics</h5>
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping" />
                  LIVE IOT TELEMETRY
                </Badge>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30 text-[10px]">
                  Carrier: BlueDart Industrial Express (Fleet #MH-12-RN-8821)
                </Badge>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-xs font-mono mt-0.5">
                Tracking Number: BDA-2026-98124 • Dispatch Pallet ID: #PLT-098 • IoT Shock & Tilt Sensors: Nominal
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-bold">Estimated Arrival</span>
            <span className="text-base font-extrabold text-blue-600 dark:text-blue-400">Tomorrow · 3:00 PM (14 Mins Away)</span>
          </div>
        </div>

        {/* Live Delivery Progress Steps: Picked Up -> In Transit -> 2 km Away -> Estimated Arrival */}
        <div className="p-3 rounded-xl bg-white dark:bg-steel-950/80 border border-slate-200 dark:border-steel-800 grid grid-cols-4 gap-2 text-center text-[11px] shadow-2xs">
          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-transparent font-bold flex flex-col items-center">
            <CheckCircle2 className="h-4 w-4 mb-1 text-emerald-600 dark:text-emerald-400" />
            <span>1. Picked Up</span>
            <span className="text-[9px] text-slate-500 font-normal">Factory Gate 3</span>
          </div>
          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-transparent font-bold flex flex-col items-center">
            <CheckCircle2 className="h-4 w-4 mb-1 text-emerald-600 dark:text-emerald-400" />
            <span>2. In Transit</span>
            <span className="text-[9px] text-slate-500 font-normal">Highway Route 9</span>
          </div>
          <div className={`p-2 rounded-lg font-bold flex flex-col items-center ${isDeliveryConfirmed ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80' : 'bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-transparent ring-1 ring-blue-500/30'}`}>
            <MapPin className="h-4 w-4 mb-1 animate-bounce text-blue-600 dark:text-blue-400" />
            <span>3. 2 km Away</span>
            <span className="text-[9px] text-slate-600 dark:text-slate-400 font-normal">Express Van #8</span>
          </div>
          <div className={`p-2 rounded-lg font-bold flex flex-col items-center ${isDeliveryConfirmed ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300' : 'bg-slate-50 dark:bg-steel-900 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-transparent'}`}>
            <PackageCheck className="h-4 w-4 mb-1" />
            <span>4. Arrived</span>
            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-normal">Buyer Dock</span>
          </div>
        </div>

        {/* Post-Delivery Confirmation & Escrow Release Action */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-200 dark:border-steel-800">
          <div className="text-[11px] text-slate-600 dark:text-slate-400">
            {isDeliveryConfirmed ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
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
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm"
            >
              <PackageCheck className="h-3.5 w-3.5 mr-1" /> Confirm Delivery & Release Payout
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsFeedbackOpen(true)}
                className="border-amber-400 text-amber-600 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/20"
              >
                <Star className="h-3.5 w-3.5 mr-1 fill-current text-amber-500" /> Submit 5-Star Rating
              </Button>
              <Button
                size="sm"
                onClick={() => router.push('/marketplace?reorder=FG-2042')}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-sm"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" /> 1-Click Reorder Batch
              </Button>
            </div>
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
