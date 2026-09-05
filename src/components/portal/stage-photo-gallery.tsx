'use client';

import React from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StageMediaPhoto } from '@/types/customer-portal';
import { Camera, UserCheck, Clock, ShieldCheck } from 'lucide-react';

interface StagePhotoGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  photos: StageMediaPhoto[];
}

export function StagePhotoGallery({
  isOpen,
  onClose,
  orderNumber,
  photos,
}: StagePhotoGalleryProps) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`Shop Floor Visual Inspection Gallery - ${orderNumber}`} maxWidth="lg">
      <div className="space-y-4 text-xs">
        <p className="text-slate-500 dark:text-steel-400">
          Real-time high-resolution inspection photos captured by shop floor technicians during part fabrication.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="p-3 rounded-xl border border-slate-200 dark:border-steel-800 bg-white dark:bg-steel-900 space-y-2.5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="font-bold">
                  {photo.stageName}
                </Badge>
                <span className="text-[10px] text-slate-400">{photo.uploadedAt}</span>
              </div>

              {/* Photo Frame Container */}
              <div className="relative h-44 w-full rounded-lg bg-steel-950 overflow-hidden border border-slate-200 dark:border-steel-800 flex items-center justify-center industrial-grid">
                <div className="text-center space-y-1 p-4">
                  <Camera className="h-8 w-8 text-brand-500 mx-auto opacity-80" />
                  <span className="font-bold text-slate-200 block text-xs">{photo.caption}</span>
                  <span className="text-[10px] text-steel-400 block font-mono">
                    Technician: {photo.operatorName}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-steel-300 pt-1">
                <span className="flex items-center gap-1 font-semibold">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> CMM Verified
                </span>
                <span className="text-[10px] text-slate-400">QA Pass</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-steel-800">
          <Button onClick={onClose}>Close Inspection Gallery</Button>
        </div>
      </div>
    </Dialog>
  );
}
