import { mockSalesOrders, mockProducts } from '@/data/mockData';
import { TrendingUp, Award, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TopProduct {
  productId: string;
  productName: string;
  totalSold: number;
  totalRevenue: number;
  totalMargin: number;
}

export function TopSellingProducts() {
  // Calculate top selling products from completed sales
  const completedOrders = mockSalesOrders.filter(o => o.status === 'completed');
  
  const productSales: Record<string, TopProduct> = {};
  
  completedOrders.forEach(order => {
    order.items.forEach(item => {
      if (!productSales[item.productId]) {
        productSales[item.productId] = {
          productId: item.productId,
          productName: item.productName,
          totalSold: 0,
          totalRevenue: 0,
          totalMargin: 0,
        };
      }
      productSales[item.productId].totalSold += item.totalPcs;
      productSales[item.productId].totalRevenue += item.revenue;
      productSales[item.productId].totalMargin += item.margin;
    });
  });

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 5);

  if (topProducts.length === 0) {
    return (
      <div className="stat-card">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-lg">Top Selling Products</h3>
        </div>
        <p className="text-muted-foreground text-sm text-center py-4">
          No sales data available yet
        </p>
      </div>
    );
  }

  return (
    <div className="stat-card">
      <div className="flex items-center gap-2 mb-4">
        <Award className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-lg">Top Selling Products</h3>
      </div>
      <div className="space-y-3">
        {topProducts.map((product, index) => {
          const productData = mockProducts.find(p => p.id === product.productId);
          const stockStatus = productData 
            ? productData.quantity <= productData.minStock 
              ? 'low' 
              : 'ok'
            : 'unknown';
          
          return (
            <div key={product.productId} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-sm">{product.productName}</p>
                  <p className="text-xs text-muted-foreground">
                    {product.totalSold} pcs sold
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-sm text-success">
                  ${product.totalRevenue.toFixed(0)}
                </p>
                {stockStatus === 'low' && (
                  <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/20">
                    Low Stock
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
