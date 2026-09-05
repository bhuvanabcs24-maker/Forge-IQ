import { InventoryReservationStatus } from '@/types/production-planner';
import { MOCK_INVENTORY } from '@/lib/mock-data/manufacturing';

export function checkAndReserveMaterial(
  materialGrade: string,
  requiredQty: number
): InventoryReservationStatus {
  // Find matching sheet metal stock SKU in inventory
  const stockItem = MOCK_INVENTORY.find(
    (item) =>
      item.materialGrade.toLowerCase().includes(materialGrade.toLowerCase()) ||
      materialGrade.toLowerCase().includes(item.materialGrade.toLowerCase())
  ) || MOCK_INVENTORY[0];

  const hasShortage = stockItem.quantity < requiredQty;
  const shortageAmount = hasShortage ? requiredQty - stockItem.quantity : 0;

  return {
    isReserved: !hasShortage,
    requiredSku: stockItem.sku,
    requiredQuantity: requiredQty,
    availableQuantity: stockItem.quantity,
    unit: stockItem.unit,
    hasShortage,
    shortageAmount,
    recommendedPoNumber: hasShortage ? `PO-2026-REC${Math.floor(100 + Math.random() * 900)}` : undefined,
  };
}
