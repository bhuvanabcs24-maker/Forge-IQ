import { OperationalPreference, CopilotMessage } from '@/types/copilot';

export const DEFAULT_OPERATIONAL_PREFERENCES: OperationalPreference[] = [
  {
    key: 'preferred_supplier_ss',
    label: 'Preferred Stainless Steel Vendor',
    value: 'Ryerson Metal Distribution (3-day lead time)',
    category: 'Supplier',
  },
  {
    key: 'safety_stock_multiplier',
    label: 'Sheet Metal Safety Stock Buffer',
    value: 'Maintain 20% minimum safety buffer above reorder point',
    category: 'Safety Stock',
  },
  {
    key: 'max_laser_queue',
    label: 'Fiber Laser Max Dispatch Queue',
    value: 'Maximum 24 hours backlogged before shifting to night shift',
    category: 'Machine Shift',
  },
];

export class CopilotMemoryManager {
  private history: CopilotMessage[] = [];
  private preferences: OperationalPreference[] = DEFAULT_OPERATIONAL_PREFERENCES;

  addMessage(msg: CopilotMessage) {
    this.history.push(msg);
  }

  getHistory(): CopilotMessage[] {
    return this.history;
  }

  clearHistory() {
    this.history = [];
  }

  getPreferences(): OperationalPreference[] {
    return this.preferences;
  }
}

export const copilotMemory = new CopilotMemoryManager();
