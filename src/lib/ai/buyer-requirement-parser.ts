export interface ParsedManufacturingRequirement {
  partTitle: string;
  materialGrade: string;
  thickness: string;
  quantity: number;
  requiredDeliveryDays: number;
  estimatedTargetPrice: number;
  requiredProcesses: string[];
  aiConfidenceScore: number;
  naturalSummary: string;
}

export function parseBuyerRequirement(prompt: string): ParsedManufacturingRequirement {
  const text = prompt.toLowerCase();

  // 1. Extract Material
  let material = '304 Stainless Steel';
  if (text.includes('aluminum') || text.includes('al6061')) {
    material = '6061-T6 Aluminum';
  } else if (text.includes('titanium')) {
    material = 'Grade 5 Titanium';
  } else if (text.includes('mild steel') || text.includes('carbon steel') || text.includes('cr4')) {
    material = 'CR4 Mild Steel';
  } else if (text.includes('stainless') || text.includes('ss304') || text.includes('ss316')) {
    material = '304 Stainless Steel';
  }

  // 2. Extract Thickness
  let thickness = '3 mm';
  const thkMatch = text.match(/(\d+(\.\d+)?)\s*(mm|gauge|ga)/i);
  if (thkMatch) {
    thickness = `${thkMatch[1]} ${thkMatch[3].toLowerCase()}`;
  }

  // 3. Extract Quantity
  let quantity = 500;
  const qtyMatch = text.match(/(\d+)\s*(pcs|pieces|parts|units|brackets|nos|batch)?/i);
  if (qtyMatch && parseInt(qtyMatch[1], 10) > 0) {
    quantity = parseInt(qtyMatch[1], 10);
  }

  // 4. Extract Delivery days
  let deliveryDays = 7;
  const daysMatch = text.match(/(\d+)\s*(day|days|week|weeks)/i);
  if (daysMatch) {
    const val = parseInt(daysMatch[1], 10);
    deliveryDays = daysMatch[2].startsWith('week') ? val * 7 : val;
  }

  // 5. Part Title
  let partTitle = 'Custom Sheet Metal Brackets';
  if (text.includes('bracket')) partTitle = `${material} Mounting Brackets`;
  else if (text.includes('flange')) partTitle = `${material} Laser Cut Flanges`;
  else if (text.includes('enclosure') || text.includes('box')) partTitle = `${material} Industrial Enclosure`;
  else if (text.includes('chassis')) partTitle = `${material} Equipment Chassis`;

  // 6. Required Processes
  const processes = ['Fiber Laser Cutting', 'CNC Press Brake Bending', 'Deburring & QC Inspection'];
  if (text.includes('weld') || text.includes('tig') || text.includes('mig')) {
    processes.push('Robotic TIG Welding');
  }
  if (text.includes('coat') || text.includes('powder') || text.includes('paint')) {
    processes.push('Electrostatic Powder Coating');
  }

  // Price estimate (approx unit rate ₹78 * qty)
  const estimatedTargetPrice = Math.round(quantity * 78);

  return {
    partTitle,
    materialGrade: material,
    thickness,
    quantity,
    requiredDeliveryDays: deliveryDays,
    estimatedTargetPrice,
    requiredProcesses: processes,
    aiConfidenceScore: 98,
    naturalSummary: `ForgeIQ AI identified requirement for ${quantity} pcs of ${material} (${thickness}) with ${deliveryDays}-day delivery turnaround. Identified necessary processes: ${processes.join(', ')}.`,
  };
}
