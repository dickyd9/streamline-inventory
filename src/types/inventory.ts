export type UnitType = 'pcs' | 'box' | 'crate' | 'pack' | 'carton' | 'dozen' | 'kg' | 'liter';

export interface UnitInfo {
  type: UnitType;
  label: string;
  pcsPerUnit: number; // how many pieces per unit (1 for pcs, 12 for dozen, etc.)
}

export const UNIT_OPTIONS: UnitInfo[] = [
  { type: 'pcs', label: 'Pieces (Pcs)', pcsPerUnit: 1 },
  { type: 'box', label: 'Box', pcsPerUnit: 10 },
  { type: 'crate', label: 'Crate', pcsPerUnit: 24 },
  { type: 'pack', label: 'Pack', pcsPerUnit: 6 },
  { type: 'carton', label: 'Carton', pcsPerUnit: 48 },
  { type: 'dozen', label: 'Dozen', pcsPerUnit: 12 },
  { type: 'kg', label: 'Kilogram (Kg)', pcsPerUnit: 1 },
  { type: 'liter', label: 'Liter (L)', pcsPerUnit: 1 },
];

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number; // stored in base unit (pcs or kg/liter)
  minStock: number;
  costPrice: number; // weighted average cost per base unit
  sellingPrice: number; // selling price per base unit
  unit: UnitType; // base unit for this product
  supplier: string;
  lastUpdated: string;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive';
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplier: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  status: 'pending' | 'approved' | 'received' | 'cancelled';
  orderDate: string;
  expectedDate: string;
  receivedDate?: string;
}

export interface PurchaseOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unit: UnitType;
  pcsPerUnit: number;
  unitPrice: number; // price per selected unit
  totalPcs: number; // total pieces calculated
  costPerPc: number; // calculated cost per piece for this purchase
}

// Sales Order types
export interface SalesOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  items: SalesOrderItem[];
  totalRevenue: number;
  totalCost: number;
  totalMargin: number;
  marginPercentage: number;
  status: 'pending' | 'completed' | 'cancelled';
  orderDate: string;
}

export interface SalesOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unit: UnitType;
  pcsPerUnit: number;
  sellingPrice: number; // selling price per unit
  costPrice: number; // cost price per unit (from weighted average)
  totalPcs: number;
  revenue: number;
  cost: number;
  margin: number;
}

export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock';

export type StockMovementType = 'in' | 'out';

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: StockMovementType;
  quantity: number;
  unit: UnitType;
  pcsPerUnit: number;
  totalPcs: number;
  costPerPc: number; // cost per piece at time of movement
  totalValue: number; // total cost value
  sellingPricePerPc?: number; // only for stock out (sales)
  totalRevenue?: number; // only for stock out (sales)
  margin?: number; // only for stock out (sales)
  reference: string; // PO number, SO number, adjustment reason, etc.
  notes: string;
  date: string;
  createdBy: string;
}

// Utility function to calculate weighted average cost
export function calculateWeightedAverageCost(
  existingQty: number,
  existingCost: number,
  newQty: number,
  newCostPerPc: number
): number {
  if (existingQty + newQty === 0) return 0;
  return ((existingQty * existingCost) + (newQty * newCostPerPc)) / (existingQty + newQty);
}
