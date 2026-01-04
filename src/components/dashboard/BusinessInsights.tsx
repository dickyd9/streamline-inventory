import { mockSalesOrders, mockProducts, mockPurchaseOrders, mockStockMovements } from '@/data/mockData';
import { TrendingUp, TrendingDown, AlertCircle, DollarSign, Package, ShoppingBag, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Insight {
  type: 'success' | 'warning' | 'info' | 'danger';
  icon: React.ReactNode;
  title: string;
  description: string;
}

export function BusinessInsights() {
  const insights: Insight[] = [];

  // Calculate key metrics
  const completedSales = mockSalesOrders.filter(o => o.status === 'completed');
  const totalRevenue = completedSales.reduce((sum, o) => sum + o.totalRevenue, 0);
  const totalMargin = completedSales.reduce((sum, o) => sum + o.totalMargin, 0);
  const avgMarginPct = completedSales.length > 0 
    ? completedSales.reduce((sum, o) => sum + o.marginPercentage, 0) / completedSales.length 
    : 0;

  // Low stock items
  const lowStockItems = mockProducts.filter(p => p.quantity <= p.minStock);
  const outOfStockItems = mockProducts.filter(p => p.quantity === 0);

  // Pending orders
  const pendingSales = mockSalesOrders.filter(o => o.status === 'pending');
  const pendingPurchases = mockPurchaseOrders.filter(o => o.status === 'pending' || o.status === 'approved');

  // Unpaid orders
  const unpaidOrders = mockSalesOrders.filter(o => o.paymentStatus !== 'paid' && o.status !== 'cancelled');
  const totalUnpaid = unpaidOrders.reduce((sum, o) => sum + (o.totalRevenue - o.paidAmount), 0);

  // Generate insights
  if (outOfStockItems.length > 0) {
    insights.push({
      type: 'danger',
      icon: <Package className="w-4 h-4" />,
      title: `${outOfStockItems.length} product${outOfStockItems.length > 1 ? 's' : ''} out of stock`,
      description: outOfStockItems.map(p => p.name).slice(0, 2).join(', ') + (outOfStockItems.length > 2 ? ` +${outOfStockItems.length - 2} more` : ''),
    });
  }

  if (lowStockItems.length > 0) {
    insights.push({
      type: 'warning',
      icon: <AlertCircle className="w-4 h-4" />,
      title: `${lowStockItems.length} item${lowStockItems.length > 1 ? 's' : ''} running low`,
      description: 'Consider creating purchase orders to replenish stock',
    });
  }

  if (totalUnpaid > 0) {
    insights.push({
      type: 'info',
      icon: <DollarSign className="w-4 h-4" />,
      title: `$${totalUnpaid.toFixed(0)} in pending payments`,
      description: `${unpaidOrders.length} order${unpaidOrders.length > 1 ? 's' : ''} awaiting payment`,
    });
  }

  if (avgMarginPct >= 30) {
    insights.push({
      type: 'success',
      icon: <TrendingUp className="w-4 h-4" />,
      title: `Strong profit margin: ${avgMarginPct.toFixed(1)}%`,
      description: 'Your pricing strategy is performing well',
    });
  } else if (avgMarginPct > 0 && avgMarginPct < 20) {
    insights.push({
      type: 'warning',
      icon: <TrendingDown className="w-4 h-4" />,
      title: `Low profit margin: ${avgMarginPct.toFixed(1)}%`,
      description: 'Consider reviewing your pricing or costs',
    });
  }

  if (pendingPurchases.length > 0) {
    insights.push({
      type: 'info',
      icon: <ShoppingBag className="w-4 h-4" />,
      title: `${pendingPurchases.length} purchase order${pendingPurchases.length > 1 ? 's' : ''} in progress`,
      description: 'Stock replenishment on the way',
    });
  }

  if (completedSales.length > 0 && totalMargin > 0) {
    insights.push({
      type: 'success',
      icon: <CheckCircle className="w-4 h-4" />,
      title: `Total profit: $${totalMargin.toFixed(0)}`,
      description: `From ${completedSales.length} completed sale${completedSales.length > 1 ? 's' : ''}`,
    });
  }

  const typeStyles = {
    success: 'bg-success/10 border-success/20 text-success',
    warning: 'bg-warning/10 border-warning/20 text-warning',
    info: 'bg-primary/10 border-primary/20 text-primary',
    danger: 'bg-destructive/10 border-destructive/20 text-destructive',
  };

  return (
    <div className="stat-card">
      <h3 className="font-semibold text-lg mb-4">Business Insights</h3>
      {insights.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-4">
          No insights available yet. Start making sales to see business intelligence.
        </p>
      ) : (
        <div className="space-y-3">
          {insights.slice(0, 5).map((insight, index) => (
            <div 
              key={index} 
              className={cn(
                "p-3 rounded-lg border flex items-start gap-3",
                typeStyles[insight.type]
              )}
            >
              <div className="mt-0.5">{insight.icon}</div>
              <div>
                <p className="font-medium text-sm">{insight.title}</p>
                <p className="text-xs opacity-80">{insight.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
