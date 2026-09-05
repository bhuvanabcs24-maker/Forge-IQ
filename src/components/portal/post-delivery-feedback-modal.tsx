'use client';

import React, { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CustomerFeedbackRating } from '@/types/customer-portal';
import { Star, Check, Sparkles } from 'lucide-react';

interface PostDeliveryFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  onSubmitFeedback: (rating: CustomerFeedbackRating) => void;
}

export function PostDeliveryFeedbackModal({
  isOpen,
  onClose,
  orderNumber,
  onSubmitFeedback,
}: PostDeliveryFeedbackModalProps) {
  const [qualityScore, setQualityScore] = useState(5);
  const [communicationScore, setCommunicationScore] = useState(5);
  const [deliveryScore, setDeliveryScore] = useState(5);
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    onSubmitFeedback({
      qualityScore,
      communicationScore,
      deliveryScore,
      overallScore: Math.round((qualityScore + communicationScore + deliveryScore) / 3),
      comments,
      submittedAt: new Date().toISOString().split('T')[0],
    });
    setTimeout(() => onClose(), 1200);
  };

  const renderStars = (score: number, setScore: (s: number) => void) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setScore(star)}
          className="p-1 text-amber-400 hover:scale-110 transition-transform"
        >
          <Star className={`h-5 w-5 ${star <= score ? 'fill-current' : 'text-slate-300 dark:text-steel-700'}`} />
        </button>
      ))}
    </div>
  );

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`Product Quality & Service Rating - ${orderNumber}`} maxWidth="md">
      <div className="space-y-4 text-xs">
        {submitted ? (
          <div className="p-6 text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500 font-bold">
              <Check className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Feedback Submitted!</h4>
            <p className="text-slate-500">Thank you for rating Precision Metal Fabrication Co.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-steel-800">
                <span className="font-semibold">Part Manufacturing Quality & Tolerances</span>
                {renderStars(qualityScore, setQualityScore)}
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-steel-800">
                <span className="font-semibold">Supplier Communication & Updates</span>
                {renderStars(communicationScore, setCommunicationScore)}
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-steel-800">
                <span className="font-semibold">On-Time Delivery & Packaging</span>
                {renderStars(deliveryScore, setDeliveryScore)}
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1">Additional Review Comments</label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Share feedback on part finish, dimensional accuracy, or shipping speed..."
                className="w-full h-20 p-2.5 rounded-lg border border-slate-300 dark:border-steel-700 bg-white dark:bg-steel-800 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-steel-800">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                Submit Customer Rating
              </Button>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}
