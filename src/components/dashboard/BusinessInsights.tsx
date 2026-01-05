import { mockSalesOrders, mockProducts, mockPurchaseOrders, mockStockMovements } from '@/data/mockData';
import { TrendingUp, TrendingDown, AlertCircle, DollarSign, Package, ShoppingBag, CheckCircle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

interface Insight {
  type: 'success' | 'warning' | 'info' | 'danger';
  icon: React.ReactNode;
  title: string;
  description: string;
  link?: string;
}

export function BusinessInsights() {
  const { formatCurrency, language } = useLanguage();
  const navigate = useNavigate();
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
      title: language === 'id' 
        ? `${outOfStockItems.length} produk habis stok`
        : `${outOfStockItems.length} product${outOfStockItems.length > 1 ? 's' : ''} out of stock`,
      description: outOfStockItems.map(p => p.name).slice(0, 2).join(', ') + (outOfStockItems.length > 2 ? ` +${outOfStockItems.length - 2} lainnya` : ''),
      link: '/inventory',
    });
  }

  if (lowStockItems.length > 0) {
    insights.push({
      type: 'warning',
      icon: <AlertCircle className="w-4 h-4" />,
      title: language === 'id'
        ? `${lowStockItems.length} item stok menipis`
        : `${lowStockItems.length} item${lowStockItems.length > 1 ? 's' : ''} running low`,
      description: language === 'id' 
        ? 'Pertimbangkan membuat pesanan pembelian'
        : 'Consider creating purchase orders to replenish stock',
      link: '/purchases',
    });
  }

  if (totalUnpaid > 0) {
    insights.push({
      type: 'info',
      icon: <DollarSign className="w-4 h-4" />,
      title: language === 'id'
        ? `${formatCurrency(totalUnpaid)} pembayaran tertunda`
        : `${formatCurrency(totalUnpaid)} in pending payments`,
      description: language === 'id'
        ? `${unpaidOrders.length} pesanan menunggu pembayaran`
        : `${unpaidOrders.length} order${unpaidOrders.length > 1 ? 's' : ''} awaiting payment`,
      link: '/invoices',
    });
  }

  if (avgMarginPct >= 30) {
    insights.push({
      type: 'success',
      icon: <TrendingUp className="w-4 h-4" />,
      title: language === 'id'
        ? `Margin laba tinggi: ${avgMarginPct.toFixed(1)}%`
        : `Strong profit margin: ${avgMarginPct.toFixed(1)}%`,
      description: language === 'id'
        ? 'Strategi harga Anda berjalan baik'
        : 'Your pricing strategy is performing well',
      link: '/reports',
    });
  } else if (avgMarginPct > 0 && avgMarginPct < 20) {
    insights.push({
      type: 'warning',
      icon: <TrendingDown className="w-4 h-4" />,
      title: language === 'id'
        ? `Margin laba rendah: ${avgMarginPct.toFixed(1)}%`
        : `Low profit margin: ${avgMarginPct.toFixed(1)}%`,
      description: language === 'id'
        ? 'Pertimbangkan untuk meninjau harga atau biaya Anda'
        : 'Consider reviewing your pricing or costs',
      link: '/reports',
    });
  }

  if (pendingPurchases.length > 0) {
    insights.push({
      type: 'info',
      icon: <ShoppingBag className="w-4 h-4" />,
      title: language === 'id'
        ? `${pendingPurchases.length} pesanan pembelian dalam proses`
        : `${pendingPurchases.length} purchase order${pendingPurchases.length > 1 ? 's' : ''} in progress`,
      description: language === 'id'
        ? 'Pengisian stok sedang dalam perjalanan'
        : 'Stock replenishment on the way',
      link: '/purchases',
    });
  }

  if (completedSales.length > 0 && totalMargin > 0) {
    insights.push({
      type: 'success',
      icon: <CheckCircle className="w-4 h-4" />,
      title: language === 'id'
        ? `Total keuntungan: ${formatCurrency(totalMargin)}`
        : `Total profit: ${formatCurrency(totalMargin)}`,
      description: language === 'id'
        ? `Dari ${completedSales.length} penjualan selesai`
        : `From ${completedSales.length} completed sale${completedSales.length > 1 ? 's' : ''}`,
      link: '/sales',
    });
  }

  const typeStyles = {
    success: 'bg-success/10 border-success/20 text-success',
    warning: 'bg-warning/10 border-warning/20 text-warning',
    info: 'bg-primary/10 border-primary/20 text-primary',
    danger: 'bg-destructive/10 border-destructive/20 text-destructive',
  };

  const handleClick = (link?: string) => {
    if (link) {
      navigate(link);
    }
  };

  return (
    <div className="stat-card">
      <h3 className="font-semibold text-lg mb-4">
        {language === 'id' ? 'Wawasan Bisnis' : 'Business Insights'}
      </h3>
      {insights.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-4">
          {language === 'id' 
            ? 'Belum ada wawasan. Mulai berjualan untuk melihat analisis bisnis.'
            : 'No insights available yet. Start making sales to see business intelligence.'}
        </p>
      ) : (
        <div className="space-y-3">
          {insights.slice(0, 5).map((insight, index) => (
            <div 
              key={index} 
              onClick={() => handleClick(insight.link)}
              className={cn(
                "p-3 rounded-lg border flex items-start gap-3 transition-all",
                typeStyles[insight.type],
                insight.link && "cursor-pointer hover:opacity-80 hover:scale-[1.01]"
              )}
            >
              <div className="mt-0.5">{insight.icon}</div>
              <div className="flex-1">
                <p className="font-medium text-sm">{insight.title}</p>
                <p className="text-xs opacity-80">{insight.description}</p>
              </div>
              {insight.link && (
                <ChevronRight className="w-4 h-4 mt-0.5 opacity-60" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
