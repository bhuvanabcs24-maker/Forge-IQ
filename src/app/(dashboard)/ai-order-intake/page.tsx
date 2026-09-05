'use client';

import React, { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { DocumentUploader } from '@/components/ai-order-intake/document-uploader';
import { ProcessingTimeline } from '@/components/ai-order-intake/processing-timeline';
import { OrderIntakeReviewForm } from '@/components/ai-order-intake/review-form';
import {
  DocumentProcessingStatus,
  ProcessingTimelineStep,
  ExtractedOrderData,
  OrderIntakeRecord,
} from '@/types/ai-order-intake';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ArrowRight, FileText, ShoppingBag, UserCheck, RefreshCw, Zap } from 'lucide-react';
import Link from 'next/link';

export default function AiOrderIntakePage() {
  const [status, setStatus] = useState<DocumentProcessingStatus>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileName, setFileName] = useState('');
  const [rawOcrText, setRawOcrText] = useState('');
  const [extractedData, setExtractedData] = useState<ExtractedOrderData | null>(null);
  const [createdOrder, setCreatedOrder] = useState<any | null>(null);

  const [steps, setSteps] = useState<ProcessingTimelineStep[]>([
    { id: '1', title: '1. Document Upload', status: 'pending' },
    { id: '2', title: '2. OCR Parsing', status: 'pending' },
    { id: '3', title: '3. AI Extraction', status: 'pending' },
    { id: '4', title: '4. Order Created', status: 'pending' },
  ]);

  const handleFileSelected = async (
    file: { name: string; type: string; size: number },
    presetId?: string
  ) => {
    setFileName(file.name);
    setStatus('uploading');
    setUploadProgress(20);

    setSteps([
      { id: '1', title: '1. Document Upload', status: 'current', timestamp: 'Just now' },
      { id: '2', title: '2. OCR Parsing', status: 'pending' },
      { id: '3', title: '3. AI Extraction', status: 'pending' },
      { id: '4', title: '4. Order Created', status: 'pending' },
    ]);

    // Simulate pipeline progress
    setTimeout(() => {
      setUploadProgress(60);
      setSteps((prev) =>
        prev.map((s) =>
          s.id === '1'
            ? { ...s, status: 'completed' }
            : s.id === '2'
            ? { ...s, status: 'current', timestamp: 'In progress' }
            : s
        )
      );
    }, 600);

    setTimeout(() => {
      setUploadProgress(90);
      setSteps((prev) =>
        prev.map((s) =>
          s.id === '2'
            ? { ...s, status: 'completed' }
            : s.id === '3'
            ? { ...s, status: 'current', timestamp: 'Extracting' }
            : s
        )
      );
    }, 1200);

    try {
      const res = await fetch('/api/ai/order-intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          samplePresetId: presetId,
        }),
      });
      const json = await res.json();

      if (json.success) {
        setUploadProgress(100);
        setRawOcrText(json.data.rawOcrText);
        setExtractedData(json.data.extractedData);
        setStatus('review_required');

        setSteps((prev) =>
          prev.map((s) =>
            s.id === '3' ? { ...s, status: 'completed', timestamp: 'Completed' } : s
          )
        );
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const handleSaveOrder = (finalData: ExtractedOrderData, matchedCustomer: any) => {
    const orderId = `WO-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrderRecord = {
      orderNumber: orderId,
      customerName: matchedCustomer.companyName,
      title: `${finalData.thickness.value} ${finalData.materialGrade.value} (${finalData.dimensions.value})`,
      priority: finalData.priority.value,
      status: 'In Production',
      totalAmount: finalData.quantity.value * 125,
      dueDate: finalData.deliveryDate.value || '2026-08-25',
      customer: matchedCustomer,
    };

    setCreatedOrder(newOrderRecord);
    setStatus('completed');

    setSteps((prev) =>
      prev.map((s) =>
        s.id === '4' ? { ...s, status: 'completed', timestamp: 'Order Generated' } : s
      )
    );
  };

  const handleReset = () => {
    setStatus('idle');
    setUploadProgress(0);
    setFileName('');
    setRawOcrText('');
    setExtractedData(null);
    setCreatedOrder(null);
    setSteps([
      { id: '1', title: '1. Document Upload', status: 'pending' },
      { id: '2', title: '2. OCR Parsing', status: 'pending' },
      { id: '3', title: '3. AI Extraction', status: 'pending' },
      { id: '4', title: '4. Order Created', status: 'pending' },
    ]);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Order Intake & Document Understanding"
        description="Ingest WhatsApp screenshots, PDF purchase orders, and drawing photos with automated OCR and confidence verification."
        breadcrumbs={[{ label: 'AI Order Intake' }]}
        actions={
          status !== 'idle' && (
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RefreshCw className="h-3.5 w-3.5 mr-1" /> Start New Intake
            </Button>
          )
        }
      />

      {/* Processing Timeline Indicator */}
      {status !== 'idle' && <ProcessingTimeline steps={steps} />}

      {/* Step 1: Uploading & File Ingestion */}
      {(status === 'idle' || status === 'uploading') && (
        <DocumentUploader
          onFileSelected={handleFileSelected}
          isProcessing={status === 'uploading'}
          uploadProgress={uploadProgress}
        />
      )}

      {/* Step 2: Extracted Data Review & Verification */}
      {status === 'review_required' && extractedData && (
        <OrderIntakeReviewForm
          initialExtractedData={extractedData}
          rawOcrText={rawOcrText}
          onSaveOrder={handleSaveOrder}
          onRetry={handleReset}
        />
      )}

      {/* Step 3: Success Confirmation Screen */}
      {status === 'completed' && createdOrder && (
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="p-8 text-center space-y-6 max-w-xl mx-auto">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-500 mx-auto shadow-inner">
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                Work Order Created Successfully!
              </h3>
              <p className="text-xs text-slate-600 dark:text-steel-300">
                AI extraction verified. Document provenance, OCR text, and AI confidence metadata stored in audit trail.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-steel-800 bg-white dark:bg-steel-900 text-left space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-100 dark:border-steel-800 pb-2">
                <span className="text-slate-500">Work Order ID:</span>
                <span className="font-mono font-bold text-brand-500">{createdOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-steel-800 pb-2">
                <span className="text-slate-500">Customer Account:</span>
                <span className="font-bold">{createdOrder.customer.companyName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-steel-800 pb-2">
                <span className="text-slate-500">Part Description:</span>
                <span>{createdOrder.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Source Document:</span>
                <span className="font-mono">{fileName}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Link href="/orders">
                <Button size="lg">
                  <ShoppingBag className="h-4 w-4 mr-1.5" /> View in Work Orders
                </Button>
              </Link>
              <Button variant="outline" size="lg" onClick={handleReset}>
                Process Another Document
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
