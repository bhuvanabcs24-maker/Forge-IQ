'use client';

import React, { useState, useMemo } from 'react';
import { ExtractedOrderData, ExtractedField } from '@/types/ai-order-intake';
import { ExtractedFieldInput } from './extracted-field-input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { matchOrCreateCustomer } from '@/lib/ai/customer-matcher';
import {
  AlertTriangle,
  CheckCircle2,
  Building2,
  Factory,
  FileText,
  RefreshCw,
  PlusCircle,
  UserCheck,
  Zap,
} from 'lucide-react';
import { OrderPriority } from '@/types';

interface OrderIntakeReviewFormProps {
  initialExtractedData: ExtractedOrderData;
  rawOcrText: string;
  onSaveOrder: (finalData: ExtractedOrderData, matchedCustomer: any) => void;
  onRetry: () => void;
}

export function OrderIntakeReviewForm({
  initialExtractedData,
  rawOcrText,
  onSaveOrder,
  onRetry,
}: OrderIntakeReviewFormProps) {
  const [data, setData] = useState<ExtractedOrderData>(initialExtractedData);

  // Calculate fields needing confirmation (<80% confidence and unconfirmed)
  const unconfirmedLowConfidenceCount = useMemo(() => {
    return Object.values(data).filter(
      (f: ExtractedField<any>) => f.confidence < 80 && !f.isUserConfirmed
    ).length;
  }, [data]);

  // Customer match status computation
  const customerMatch = useMemo(() => {
    return matchOrCreateCustomer(
      data.companyName.value,
      data.customerName.value,
      data.email.value,
      data.phone.value
    );
  }, [data.companyName.value, data.customerName.value, data.email.value, data.phone.value]);

  const updateField = (key: keyof ExtractedOrderData, newValue: any) => {
    setData((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        value: newValue,
        isUserConfirmed: true, // Manual editing automatically confirms
      },
    }));
  };

  const confirmField = (key: keyof ExtractedOrderData) => {
    setData((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        isUserConfirmed: true,
      },
    }));
  };

  const confirmAllFields = () => {
    setData((prev) => {
      const updated = { ...prev };
      (Object.keys(updated) as (keyof ExtractedOrderData)[]).forEach((key) => {
        updated[key].isUserConfirmed = true;
      });
      return updated;
    });
  };

  const handleCreateOrder = () => {
    onSaveOrder(data, customerMatch.matchedCustomer);
  };

  return (
    <div className="space-y-6">
      {/* Alert Banner for Low-Confidence Verification Gate */}
      {unconfirmedLowConfidenceCount > 0 ? (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-amber-900 dark:text-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm">
                {unconfirmedLowConfidenceCount} Extracted Field(s) Require Verification
              </h4>
              <p className="text-xs opacity-90">
                AI extraction confidence is below 80% for some attributes. Please verify highlighted values before saving work order.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={confirmAllFields}
            className="bg-amber-600 hover:bg-amber-700 text-white shrink-0"
          >
            Confirm All Extracted Values
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-emerald-900 dark:text-emerald-300 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
            <div>
              <h4 className="font-bold text-sm">All Fields Verified & Ready for Submission</h4>
              <p className="text-xs opacity-90">High confidence scores recorded across extracted customer & job parameters.</p>
            </div>
          </div>
        </div>
      )}

      {/* Customer Match Card Badge */}
      <Card className="border-brand-500/30 bg-brand-500/5">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/20 text-brand-600 dark:text-brand-400">
              {customerMatch.isExisting ? (
                <UserCheck className="h-5 w-5" />
              ) : (
                <PlusCircle className="h-5 w-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {customerMatch.matchedCustomer.companyName}
                </span>
                <Badge
                  variant={customerMatch.isExisting ? 'success' : 'secondary'}
                  className="text-[10px]"
                >
                  {customerMatch.isExisting
                    ? `Matched Existing Client (${customerMatch.matchScore}% Match)`
                    : 'Auto-Register New Client'}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-steel-400 mt-0.5">
                Contact: {data.customerName.value} • {data.email.value} • {data.phone.value}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Structured Review Form Grid */}
      <Tabs defaultValue="extracted" className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="extracted" className="flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5" /> Extracted Parameters
          </TabsTrigger>
          <TabsTrigger value="ocr" className="flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" /> Raw OCR Transcript
          </TabsTrigger>
        </TabsList>

        <TabsContent value="extracted" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer & Contact Section */}
            <Card>
              <CardHeader className="pb-3 border-b border-slate-100 dark:border-steel-800/80">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-brand-500" /> Customer & Contact Details
                </CardTitle>
                <CardDescription>Extracted client entity profile</CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <ExtractedFieldInput
                  label="Contact Person Name"
                  fieldKey="customerName"
                  field={data.customerName}
                  onChange={(val) => updateField('customerName', val)}
                  onConfirm={() => confirmField('customerName')}
                />
                <ExtractedFieldInput
                  label="Company Name"
                  fieldKey="companyName"
                  field={data.companyName}
                  onChange={(val) => updateField('companyName', val)}
                  onConfirm={() => confirmField('companyName')}
                />
                <ExtractedFieldInput
                  label="Phone Number"
                  fieldKey="phone"
                  field={data.phone}
                  onChange={(val) => updateField('phone', val)}
                  onConfirm={() => confirmField('phone')}
                />
                <ExtractedFieldInput
                  label="Email Address"
                  fieldKey="email"
                  field={data.email}
                  onChange={(val) => updateField('email', val)}
                  onConfirm={() => confirmField('email')}
                />
              </CardContent>
            </Card>

            {/* Part & Fabrication Specifications Section */}
            <Card>
              <CardHeader className="pb-3 border-b border-slate-100 dark:border-steel-800/80">
                <CardTitle className="text-base flex items-center gap-2">
                  <Factory className="h-4 w-4 text-brand-500" /> Job & Part Specifications
                </CardTitle>
                <CardDescription>Raw material, thickness, and dimensions</CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <ExtractedFieldInput
                    label="Material Type"
                    fieldKey="material"
                    field={data.material}
                    onChange={(val) => updateField('material', val)}
                    onConfirm={() => confirmField('material')}
                  />
                  <ExtractedFieldInput
                    label="Material Grade"
                    fieldKey="materialGrade"
                    field={data.materialGrade}
                    onChange={(val) => updateField('materialGrade', val)}
                    onConfirm={() => confirmField('materialGrade')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <ExtractedFieldInput
                    label="Material Thickness"
                    fieldKey="thickness"
                    field={data.thickness}
                    onChange={(val) => updateField('thickness', val)}
                    onConfirm={() => confirmField('thickness')}
                  />
                  <ExtractedFieldInput
                    label="Part Dimensions"
                    fieldKey="dimensions"
                    field={data.dimensions}
                    onChange={(val) => updateField('dimensions', val)}
                    onConfirm={() => confirmField('dimensions')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <ExtractedFieldInput
                    label="Quantity (Pcs)"
                    fieldKey="quantity"
                    field={data.quantity}
                    type="number"
                    onChange={(val) => updateField('quantity', val)}
                    onConfirm={() => confirmField('quantity')}
                  />
                  <ExtractedFieldInput
                    label="Required Delivery Date"
                    fieldKey="deliveryDate"
                    field={data.deliveryDate}
                    type="date"
                    onChange={(val) => updateField('deliveryDate', val)}
                    onConfirm={() => confirmField('deliveryDate')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <ExtractedFieldInput
                    label="Priority Level"
                    fieldKey="priority"
                    field={data.priority}
                    type="select"
                    selectOptions={[
                      { label: 'Normal', value: 'Normal' },
                      { label: 'Low', value: 'Low' },
                      { label: 'High', value: 'High' },
                      { label: 'Rush', value: 'Rush' },
                    ]}
                    onChange={(val) => updateField('priority', val as OrderPriority)}
                    onConfirm={() => confirmField('priority')}
                  />
                  <ExtractedFieldInput
                    label="Drawing Ref #"
                    fieldKey="drawingRefNumber"
                    field={data.drawingRefNumber}
                    onChange={(val) => updateField('drawingRefNumber', val)}
                    onConfirm={() => confirmField('drawingRefNumber')}
                  />
                </div>

                <ExtractedFieldInput
                  label="Special Processing Instructions"
                  fieldKey="specialInstructions"
                  field={data.specialInstructions}
                  onChange={(val) => updateField('specialInstructions', val)}
                  onConfirm={() => confirmField('specialInstructions')}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ocr">
          <Card>
            <CardHeader>
              <CardTitle>Raw OCR Transcript Output</CardTitle>
              <CardDescription>Text extracted directly from OCR engine before AI schema parsing</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed border border-steel-800">
                {rawOcrText}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Controls Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-steel-800">
        <Button variant="outline" onClick={onRetry}>
          <RefreshCw className="h-4 w-4 mr-1" /> Re-upload / Process Another File
        </Button>

        <Button
          size="lg"
          onClick={handleCreateOrder}
          disabled={unconfirmedLowConfidenceCount > 0}
          className="shadow-lg shadow-brand-500/20"
        >
          {unconfirmedLowConfidenceCount > 0
            ? `Verify ${unconfirmedLowConfidenceCount} Low-Confidence Field(s) First`
            : 'Create Verified Work Order'}
        </Button>
      </div>
    </div>
  );
}
