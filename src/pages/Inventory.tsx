import { MainLayout } from '@/components/layout/MainLayout';
import { ProductTable } from '@/components/inventory/ProductTable';
import { mockProducts } from '@/data/mockData';
import { Package, AlertTriangle, CheckCircle } from 'lucide-react';

export default function Inventory() {
  const totalProducts = mockProducts.length;
  const inStockCount = mockProducts.filter(p => p.quantity > p.minStock).length;
  const lowStockCount = mockProducts.filter(p => p.quantity <= p.minStock && p.quantity > 0).length;
  const outOfStockCount = mockProducts.filter(p => p.quantity === 0).length;

  return (
    <MainLayout title="Inventory">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">{totalProducts}</p>
            <p className="text-sm text-muted-foreground">Total Products</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-success/10">
            <CheckCircle className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold">{inStockCount}</p>
            <p className="text-sm text-muted-foreground">In Stock</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-warning/10">
            <AlertTriangle className="w-5 h-5 text-warning" />
          </div>
          <div>
            <p className="text-2xl font-bold">{lowStockCount}</p>
            <p className="text-sm text-muted-foreground">Low Stock</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-destructive/10">
            <Package className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <p className="text-2xl font-bold">{outOfStockCount}</p>
            <p className="text-sm text-muted-foreground">Out of Stock</p>
          </div>
        </div>
      </div>

      <ProductTable />
    </MainLayout>
  );
}
