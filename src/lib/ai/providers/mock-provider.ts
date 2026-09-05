import { AiProvider, ProcessDocumentResult, AiProviderOptions } from './base';
import { ExtractedOrderData, SampleDocumentPreset } from '@/types/ai-order-intake';

export const SAMPLE_PRESETS: SampleDocumentPreset[] = [
  {
    id: 'preset-whatsapp',
    title: 'WhatsApp Order Screenshot',
    type: 'WhatsApp Screenshot',
    description: 'Incoming message from Apex Aerospace with laser cutting specs & rush request.',
    fileName: 'WhatsApp_Chat_Apex_Order.png',
    mockOcrText: `[WhatsApp Image 2026-08-07]
Apex Aerospace - Robert Vance:
"Hey Sarah, need 150 pcs of 304 Stainless Steel flanges cut ASAP.
Thickness: 6mm (1/4 in).
Dimensions: 400mm x 400mm outer ring.
Drawing ref: DWG-SS-992-REV3.
Delivery date: August 18th 2026.
Email: rvance@apexaero.com / Ph: +1 (555) 234-8901.
Please mark as Rush!"`,
    mockExtractedData: {
      customerName: { value: 'Robert Vance', confidence: 96, isUserConfirmed: true },
      companyName: { value: 'Apex Aerospace Solutions', confidence: 98, isUserConfirmed: true },
      phone: { value: '+1 (555) 234-8901', confidence: 92, isUserConfirmed: true },
      email: { value: 'rvance@apexaero.com', confidence: 95, isUserConfirmed: true },
      material: { value: 'Stainless Steel', confidence: 94, isUserConfirmed: true },
      materialGrade: { value: '304 Stainless', confidence: 88, isUserConfirmed: true },
      thickness: { value: '6mm (0.25 in)', confidence: 91, isUserConfirmed: true },
      dimensions: { value: '400mm x 400mm Ring', confidence: 85, isUserConfirmed: true },
      quantity: { value: 150, confidence: 96, isUserConfirmed: true },
      deliveryDate: { value: '2026-08-18', confidence: 76, isUserConfirmed: false }, // LOW CONFIDENCE (<80%)
      priority: { value: 'Rush', confidence: 95, isUserConfirmed: true },
      specialInstructions: { value: 'Deburring required on inner bore ring prior to shipping.', confidence: 72, isUserConfirmed: false }, // LOW CONFIDENCE (<80%)
      drawingRefNumber: { value: 'DWG-SS-992-REV3', confidence: 68, isUserConfirmed: false }, // LOW CONFIDENCE (<80%)
    },
  },
  {
    id: 'preset-po-pdf',
    title: 'Formal PDF Purchase Order',
    type: 'PDF Purchase Order',
    description: 'Official corporate purchase order from Titan Heavy Machinery.',
    fileName: 'PO_Titan_Heavy_WO892.pdf',
    mockOcrText: `PURCHASE ORDER: PO-2026-8841
BUYER: Titan Heavy Machinery Inc.
CONTACT: Sarah Jenkins (sjenkins@titanheavy.com)
PHONE: +1 (555) 876-1234
LINE ITEM 1: Heavy Gauge Excavator Bucket Liners
MATERIAL: A36 Structural Carbon Steel
THICKNESS: 12mm (0.50 in)
DIMENSIONS: 1200mm x 2400mm Sheet
QUANTITY: 40 Pcs
DRAWING #: THM-CUT-401-A
REQUIRED DELIVERY: 2026-08-25
PRIORITY: High
SPECIAL NOTES: Bevel edges 45 degrees for welding preparation.`,
    mockExtractedData: {
      customerName: { value: 'Sarah Jenkins', confidence: 99, isUserConfirmed: true },
      companyName: { value: 'Titan Heavy Machinery', confidence: 99, isUserConfirmed: true },
      phone: { value: '+1 (555) 876-1234', confidence: 97, isUserConfirmed: true },
      email: { value: 'sjenkins@titanheavy.com', confidence: 99, isUserConfirmed: true },
      material: { value: 'Carbon Steel', confidence: 96, isUserConfirmed: true },
      materialGrade: { value: 'A36 Structural Steel', confidence: 95, isUserConfirmed: true },
      thickness: { value: '12mm (0.50 in)', confidence: 98, isUserConfirmed: true },
      dimensions: { value: '1200mm x 2400mm', confidence: 94, isUserConfirmed: true },
      quantity: { value: 40, confidence: 99, isUserConfirmed: true },
      deliveryDate: { value: '2026-08-25', confidence: 95, isUserConfirmed: true },
      priority: { value: 'High', confidence: 96, isUserConfirmed: true },
      specialInstructions: { value: 'Bevel edges 45 degrees for welding preparation.', confidence: 91, isUserConfirmed: true },
      drawingRefNumber: { value: 'THM-CUT-401-A', confidence: 98, isUserConfirmed: true },
    },
  },
  {
    id: 'preset-blueprint',
    title: 'Handwritten Drawing / Blueprint Photo',
    type: 'Scanned Blueprint',
    description: 'Scanned napkin sketch & DWG blueprint snippet from new lead Vanguard Enclosures.',
    fileName: 'Blueprint_Scan_NEMA4X.jpg',
    mockOcrText: `BLUEPRINT NOTE:
Vanguard Enclosures Inc. - Marcus Sterling
Email: msterling@vanguard.com
NEMA 4X Enclosure Plate
Material: Aluminum 6061-T6
Thickness: 3mm
Dims: 600x800mm
Qty: 80
DWG Ref: VNG-808-SK
Deliv: Aug 28th
Notes: Powder coat grey RAL 7035.`,
    mockExtractedData: {
      customerName: { value: 'Marcus Sterling', confidence: 88, isUserConfirmed: true },
      companyName: { value: 'Vanguard Enclosures Inc.', confidence: 92, isUserConfirmed: true },
      phone: { value: '+1 (555) 432-9081', confidence: 64, isUserConfirmed: false }, // LOW CONFIDENCE
      email: { value: 'msterling@vanguard.com', confidence: 90, isUserConfirmed: true },
      material: { value: 'Aluminum', confidence: 93, isUserConfirmed: true },
      materialGrade: { value: '6061-T6 Aluminum', confidence: 89, isUserConfirmed: true },
      thickness: { value: '3mm (0.12 in)', confidence: 87, isUserConfirmed: true },
      dimensions: { value: '600mm x 800mm', confidence: 84, isUserConfirmed: true },
      quantity: { value: 80, confidence: 95, isUserConfirmed: true },
      deliveryDate: { value: '2026-08-28', confidence: 78, isUserConfirmed: false }, // LOW CONFIDENCE
      priority: { value: 'Normal', confidence: 82, isUserConfirmed: true },
      specialInstructions: { value: 'Powder coat grey RAL 7035 finish after CNC bending.', confidence: 65, isUserConfirmed: false }, // LOW CONFIDENCE
      drawingRefNumber: { value: 'VNG-808-SK', confidence: 75, isUserConfirmed: false }, // LOW CONFIDENCE
    },
  },
];

export class MockAiProvider implements AiProvider {
  name = 'Mock AI Document Engine (Multi-Format OCR & Vision)';

  async processDocument(
    file: { name: string; type: string; size: number; buffer?: ArrayBuffer },
    options?: AiProviderOptions
  ): Promise<ProcessDocumentResult> {
    // Artificial processing delay simulating OCR + LLM inference
    await new Promise((resolve) => setTimeout(resolve, 1800));

    // Match preset if provided or pick based on file name
    const preset =
      SAMPLE_PRESETS.find((p) => p.id === options?.samplePresetId) ||
      SAMPLE_PRESETS.find((p) => file.name.toLowerCase().includes(p.type.toLowerCase().split(' ')[0])) ||
      SAMPLE_PRESETS[0];

    return {
      rawOcrText: preset.mockOcrText,
      extractedData: JSON.parse(JSON.stringify(preset.mockExtractedData)),
      processingTimeMs: 1840,
      providerName: this.name,
      modelUsed: 'ForgeIQ-Vision-OCR-v2',
    };
  }
}
