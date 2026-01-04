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

// Customer type
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive';
}

// Sales Order status types
export type SalesOrderStatus = 'pending' | 'received' | 'partially_paid' | 'paid' | 'completed' | 'cancelled';

// Sales Order types
export interface SalesOrder {
  id: string;
  orderNumber: string;
  customerId?: string; // optional - linked to customer master
  customerName: string; // can be entered directly without master
  items: SalesOrderItem[];
  totalRevenue: number;
  totalCost: number;
  totalMargin: number;
  marginPercentage: number;
  status: SalesOrderStatus;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  paidAmount: number;
  orderDate: string;
  deliveryDate?: string;
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

// Stock movement adjustment types
export type StockAdjustmentReason = 
  | 'purchase' // from purchase order
  | 'sale' // from sales order
  | 'damage' // damaged goods
  | 'expired' // expired products
  | 'correction' // inventory correction
  | 'initial' // initial stock
  | 'return_in' // customer return
  | 'return_out' // return to supplier
  | 'transfer' // transfer between locations
  | 'other';

export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock';

export type StockMovementType = 'in' | 'out';

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: StockMovementType;
  adjustmentReason: StockAdjustmentReason; // reason for adjustment
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

// Adjustment reason labels
export const ADJUSTMENT_REASONS: { type: StockAdjustmentReason; label: string; direction: 'in' | 'out' | 'both' }[] = [
  { type: 'purchase', label: 'Purchase Order', direction: 'in' },
  { type: 'sale', label: 'Sales Order', direction: 'out' },
  { type: 'damage', label: 'Damaged Goods', direction: 'out' },
  { type: 'expired', label: 'Expired Products', direction: 'out' },
  { type: 'correction', label: 'Inventory Correction', direction: 'both' },
  { type: 'initial', label: 'Initial Stock', direction: 'in' },
  { type: 'return_in', label: 'Customer Return', direction: 'in' },
  { type: 'return_out', label: 'Return to Supplier', direction: 'out' },
  { type: 'transfer', label: 'Transfer', direction: 'both' },
  { type: 'other', label: 'Other', direction: 'both' },
];

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
