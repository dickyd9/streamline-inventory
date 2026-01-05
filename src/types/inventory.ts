export type UnitType = 'pcs' | 'box' | 'crate' | 'pack' | 'carton' | 'dozen' | 'kg' | 'liter';

export interface UnitInfo {
  type: UnitType;
  label: string;
  pcsPerUnit: number;
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

// Item type - can be product or service
export type ItemType = 'product' | 'service';

// Category types
export interface ItemCategory {
  id: string;
  name: string;
  itemType: ItemType;
  description?: string;
}

export const PRODUCT_CATEGORIES: ItemCategory[] = [
  { id: 'electronics', name: 'Electronics', itemType: 'product' },
  { id: 'furniture', name: 'Furniture', itemType: 'product' },
  { id: 'stationery', name: 'Stationery', itemType: 'product' },
  { id: 'office_supplies', name: 'Office Supplies', itemType: 'product' },
  { id: 'beverages', name: 'Beverages', itemType: 'product' },
];

export const SERVICE_CATEGORIES: ItemCategory[] = [
  { id: 'salon', name: 'Salon', itemType: 'service' },
  { id: 'spa', name: 'Spa', itemType: 'service' },
  { id: 'consulting', name: 'Consulting', itemType: 'service' },
  { id: 'repair', name: 'Repair', itemType: 'service' },
  { id: 'other_services', name: 'Other Services', itemType: 'service' },
];

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  categoryId?: string;
  itemType: ItemType;
  quantity: number; // 0 for services
  minStock: number; // 0 for services
  costPrice: number; // for products only (HPP)
  sellingPrice: number; // for products only
  unit: UnitType;
  supplier?: string;
  lastUpdated: string;
  imageUrl?: string;
  // Service-specific fields (services don't have cost/selling price, only a base price)
  basePrice?: number; // for services - the amount charged
  requiresEmployee?: boolean;
  // HPP tracking
  totalCostValue?: number; // total inventory value at cost
  avgCostPrice?: number; // weighted average cost
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
  unitPrice: number;
  totalPcs: number;
  costPerPc: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive';
}

// Employee type - removed commissionRate since it varies per service
export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: 'active' | 'inactive';
  hireDate: string;
  department?: string;
  // Performance tracking
  totalTransactions?: number;
  totalEarnings?: number;
}

// Employee work assignment for services
export interface EmployeeAssignment {
  employeeId: string;
  employeeName: string;
  percentage: number; // work percentage (e.g., 30%, 70%)
  earnings?: number; // calculated earnings from this assignment
}

export type SalesOrderStatus = 'pending' | 'received' | 'partially_paid' | 'paid' | 'completed' | 'cancelled';

export interface SalesOrder {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerName: string;
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
  sellingPrice: number;
  costPrice: number;
  totalPcs: number;
  revenue: number;
  cost: number;
  margin: number;
}

// POS Transaction types
export type POSTransactionStatus = 'draft' | 'in_progress' | 'completed' | 'cancelled';

export interface POSCartItem {
  itemId: string;
  itemName: string;
  itemType: ItemType;
  quantity: number;
  price: number;
  total: number;
  costPrice?: number; // HPP per unit
  // For services
  employeeAssignments?: EmployeeAssignment[];
}

export interface POSTransaction {
  id: string;
  transactionNumber: string;
  items: POSCartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  totalCost: number; // Total HPP
  grossProfit: number; // subtotal - totalCost
  status: POSTransactionStatus;
  customerId?: string;
  customerName?: string;
  paymentMethod?: 'cash' | 'transfer' | 'qris' | 'multi';
  payments: POSPayment[];
  paidAmount: number;
  changeAmount: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  completedBy?: string;
  notes?: string;
}

export interface POSPayment {
  method: 'cash' | 'transfer' | 'qris';
  amount: number;
  reference?: string;
}

// Stock movement types
export type StockAdjustmentReason = 
  | 'purchase'
  | 'sale'
  | 'damage'
  | 'expired'
  | 'correction'
  | 'initial'
  | 'return_in'
  | 'return_out'
  | 'transfer'
  | 'other';

export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock';

export type StockMovementType = 'in' | 'out';

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: StockMovementType;
  adjustmentReason: StockAdjustmentReason;
  quantity: number;
  unit: UnitType;
  pcsPerUnit: number;
  totalPcs: number;
  costPerPc: number;
  totalValue: number;
  sellingPricePerPc?: number;
  totalRevenue?: number;
  margin?: number;
  reference: string;
  notes: string;
  date: string;
  createdBy: string;
}

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

export function calculateWeightedAverageCost(
  existingQty: number,
  existingCost: number,
  newQty: number,
  newCostPerPc: number
): number {
  if (existingQty + newQty === 0) return 0;
  return ((existingQty * existingCost) + (newQty * newCostPerPc)) / (existingQty + newQty);
}

// HPP calculation helpers
export function calculateHPP(items: POSCartItem[]): number {
  return items.reduce((sum, item) => {
    if (item.itemType === 'product' && item.costPrice) {
      return sum + (item.costPrice * item.quantity);
    }
    return sum;
  }, 0);
}

export function calculateGrossProfit(revenue: number, hpp: number): number {
  return revenue - hpp;
}

export function calculateGrossProfitMargin(revenue: number, hpp: number): number {
  if (revenue === 0) return 0;
  return ((revenue - hpp) / revenue) * 100;
}
