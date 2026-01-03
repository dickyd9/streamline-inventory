import { mockProducts } from '@/data/mockData';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export function LowStockAlert() {
  const lowStockItems = mockProducts.filter(p => p.quantity <= p.minStock);

  return (
    <div className="stat-card border-warning/20 bg-warning/5">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-warning" />
        <h3 className="font-semibold text-lg">Low Stock Alerts</h3>
        <span className="ml-auto text-sm text-muted-foreground">
          {lowStockItems.length} items
        </span>
      </div>
      <div className="space-y-4">
        {lowStockItems.map((product) => {
          const stockPercentage = Math.round((product.quantity / product.minStock) * 100);
          return (
            <div key={product.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                </div>
                <span className="text-sm font-medium">
                  {product.quantity} / {product.minStock}
                </span>
              </div>
              <Progress 
                value={stockPercentage} 
                className="h-2"
              />
            </div>
          );
        })}
      </div>
      <Button className="w-full mt-4" variant="outline">
        Create Purchase Order
      </Button>
    </div>
  );
}
