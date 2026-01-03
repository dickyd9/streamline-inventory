import { Product, Supplier, PurchaseOrder } from '@/types/inventory';

export const mockProducts: Product[] = [
  { id: '1', name: 'Wireless Mouse', sku: 'WM-001', category: 'Electronics', quantity: 150, minStock: 50, unitPrice: 29.99, supplier: 'TechSupply Co.', lastUpdated: '2026-01-02' },
  { id: '2', name: 'USB-C Cable', sku: 'UC-002', category: 'Electronics', quantity: 25, minStock: 100, unitPrice: 12.99, supplier: 'TechSupply Co.', lastUpdated: '2026-01-01' },
  { id: '3', name: 'Office Chair', sku: 'OC-003', category: 'Furniture', quantity: 45, minStock: 20, unitPrice: 199.99, supplier: 'Office Plus', lastUpdated: '2025-12-28' },
  { id: '4', name: 'Desk Lamp', sku: 'DL-004', category: 'Furniture', quantity: 0, minStock: 30, unitPrice: 49.99, supplier: 'LightWorld', lastUpdated: '2025-12-25' },
  { id: '5', name: 'Notebook A5', sku: 'NB-005', category: 'Stationery', quantity: 500, minStock: 200, unitPrice: 4.99, supplier: 'Paper House', lastUpdated: '2026-01-03' },
  { id: '6', name: 'Ballpoint Pen (12pk)', sku: 'BP-006', category: 'Stationery', quantity: 80, minStock: 50, unitPrice: 8.99, supplier: 'Paper House', lastUpdated: '2026-01-02' },
  { id: '7', name: 'Monitor Stand', sku: 'MS-007', category: 'Electronics', quantity: 35, minStock: 25, unitPrice: 79.99, supplier: 'TechSupply Co.', lastUpdated: '2025-12-30' },
  { id: '8', name: 'Keyboard Mechanical', sku: 'KM-008', category: 'Electronics', quantity: 60, minStock: 40, unitPrice: 129.99, supplier: 'TechSupply Co.', lastUpdated: '2026-01-01' },
];

export const mockSuppliers: Supplier[] = [
  { id: '1', name: 'TechSupply Co.', email: 'orders@techsupply.com', phone: '+1 (555) 123-4567', address: '123 Tech Blvd, Silicon Valley, CA', status: 'active' },
  { id: '2', name: 'Office Plus', email: 'sales@officeplus.com', phone: '+1 (555) 234-5678', address: '456 Office Park, New York, NY', status: 'active' },
  { id: '3', name: 'LightWorld', email: 'info@lightworld.com', phone: '+1 (555) 345-6789', address: '789 Bright St, Los Angeles, CA', status: 'inactive' },
  { id: '4', name: 'Paper House', email: 'contact@paperhouse.com', phone: '+1 (555) 456-7890', address: '321 Paper Lane, Chicago, IL', status: 'active' },
];

export const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: '1',
    orderNumber: 'PO-2026-001',
    supplier: 'TechSupply Co.',
    items: [
      { productId: '2', productName: 'USB-C Cable', quantity: 200, unitPrice: 10.99 },
      { productId: '1', productName: 'Wireless Mouse', quantity: 50, unitPrice: 25.99 },
    ],
    totalAmount: 3497.50,
    status: 'pending',
    orderDate: '2026-01-02',
    expectedDate: '2026-01-10',
  },
  {
    id: '2',
    orderNumber: 'PO-2026-002',
    supplier: 'LightWorld',
    items: [
      { productId: '4', productName: 'Desk Lamp', quantity: 50, unitPrice: 42.99 },
    ],
    totalAmount: 2149.50,
    status: 'approved',
    orderDate: '2026-01-01',
    expectedDate: '2026-01-08',
  },
  {
    id: '3',
    orderNumber: 'PO-2025-098',
    supplier: 'Paper House',
    items: [
      { productId: '5', productName: 'Notebook A5', quantity: 300, unitPrice: 3.99 },
      { productId: '6', productName: 'Ballpoint Pen (12pk)', quantity: 100, unitPrice: 7.49 },
    ],
    totalAmount: 1946.00,
    status: 'received',
    orderDate: '2025-12-20',
    expectedDate: '2025-12-28',
  },
  {
    id: '4',
    orderNumber: 'PO-2025-097',
    supplier: 'Office Plus',
    items: [
      { productId: '3', productName: 'Office Chair', quantity: 20, unitPrice: 175.00 },
    ],
    totalAmount: 3500.00,
    status: 'cancelled',
    orderDate: '2025-12-15',
    expectedDate: '2025-12-25',
  },
];
