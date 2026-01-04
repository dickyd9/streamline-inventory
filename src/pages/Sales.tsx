import { MainLayout } from '@/components/layout/MainLayout';
import { SalesOrderTable } from '@/components/sales/SalesOrderTable';
import { mockSalesOrders } from '@/data/mockData';
import { ShoppingBag, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Sales() {
  const { formatCurrency, language } = useLanguage();
  const completedOrders = mockSalesOrders.filter(o => o.status === 'completed');
  const pendingOrders = mockSalesOrders.filter(o => o.status === 'pending');
  const totalRevenue = completedOrders.reduce((acc, o) => acc + o.totalRevenue, 0);
  const totalMargin = completedOrders.reduce((acc, o) => acc + o.totalMargin, 0);
  const avgMarginPct = completedOrders.length > 0
    ? completedOrders.reduce((acc, o) => acc + o.marginPercentage, 0) / completedOrders.length
    : 0;

  return (
    <MainLayout title={language === 'id' ? 'Pesanan Penjualan' : 'Sales Orders'}>
      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <DollarSign className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
            <p className="text-sm text-muted-foreground">{language === 'id' ? 'Total Pendapatan' : 'Total Revenue'}</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-success/10">
            <TrendingUp className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold text-success">{formatCurrency(totalMargin)}</p>
            <p className="text-sm text-muted-foreground">{language === 'id' ? 'Total Margin' : 'Total Margin'}</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-success/10">
            {avgMarginPct >= 0 ? (
              <TrendingUp className="w-5 h-5 text-success" />
            ) : (
              <TrendingDown className="w-5 h-5 text-destructive" />
            )}
          </div>
          <div>
            <p className="text-2xl font-bold">{avgMarginPct.toFixed(1)}%</p>
            <p className="text-sm text-muted-foreground">{language === 'id' ? 'Rata-rata Margin' : 'Avg Margin %'}</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-warning/10">
            <ShoppingBag className="w-5 h-5 text-warning" />
          </div>
          <div>
            <p className="text-2xl font-bold">{pendingOrders.length}</p>
            <p className="text-sm text-muted-foreground">{language === 'id' ? 'Pesanan Menunggu' : 'Pending Orders'}</p>
          </div>
        </div>
      </div>

      <SalesOrderTable />
    </MainLayout>
  );
}
