import { mockPurchaseOrders } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const statusStyles = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  approved: 'bg-primary/10 text-primary border-primary/20',
  received: 'bg-success/10 text-success border-success/20',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
};

export function RecentOrders() {
  return (
    <div className="stat-card">
      <h3 className="font-semibold text-lg mb-4">Recent Purchase Orders</h3>
      <div className="space-y-3">
        {mockPurchaseOrders.slice(0, 4).map((order) => (
          <div 
            key={order.id}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <div>
              <p className="font-medium">{order.orderNumber}</p>
              <p className="text-sm text-muted-foreground">{order.supplier}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">${order.totalAmount.toLocaleString()}</p>
              <Badge 
                variant="outline" 
                className={cn("capitalize mt-1", statusStyles[order.status])}
              >
                {order.status}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
