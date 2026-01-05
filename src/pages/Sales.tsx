import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { SalesOrderTable } from '@/components/sales/SalesOrderTable';
import { mockSalesOrders } from '@/data/mockData';
import { ShoppingBag, DollarSign, TrendingUp, TrendingDown, FileText } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { DateRangeFilter, DateRangePreset } from '@/components/common/DateRangeFilter';
import { GrowthIndicator } from '@/components/common/GrowthIndicator';
import { useFeatureFlags } from '@/contexts/FeatureFlagsContext';
import { Button } from '@/components/ui/button';

export default function Sales() {
  const { formatCurrency, language } = useLanguage();
  const { isEnabled } = useFeatureFlags();
  const [datePreset, setDatePreset] = useState<DateRangePreset>('this_month');
  const [customRange, setCustomRange] = useState<{ from: Date; to: Date } | undefined>();

  const completedOrders = mockSalesOrders.filter(o => o.status === 'completed');
  const pendingOrders = mockSalesOrders.filter(o => o.status === 'pending');
  const totalRevenue = completedOrders.reduce((acc, o) => acc + o.totalRevenue, 0);
  const totalMargin = completedOrders.reduce((acc, o) => acc + o.totalMargin, 0);
  const avgMarginPct = completedOrders.length > 0
    ? completedOrders.reduce((acc, o) => acc + o.marginPercentage, 0) / completedOrders.length
    : 0;

  // Mock growth data
  const growthData = {
    revenue: 18.3,
    margin: 22.1,
    avgMargin: 3.5,
    pending: -10.2,
  };

  const handleDateChange = (preset: DateRangePreset, range: { from: Date; to: Date }) => {
    setDatePreset(preset);
    if (preset === 'custom') {
      setCustomRange(range);
    }
  };

  return (
    <MainLayout title={language === 'id' ? 'Pesanan Penjualan' : 'Sales Orders'}>
      {/* Header with Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold">{language === 'id' ? 'Ringkasan Penjualan' : 'Sales Summary'}</h2>
          <p className="text-sm text-muted-foreground">
            {language === 'id' ? 'Pantau pesanan penjualan dan pertumbuhan' : 'Monitor sales orders and growth'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isEnabled('growthAnalytics') && (
            <DateRangeFilter
              value={datePreset}
              customRange={customRange}
              onChange={handleDateChange}
            />
          )}
          <Button variant="outline" size="sm">
            <FileText className="w-4 h-4 mr-2" />
            {language === 'id' ? 'Laporan' : 'Report'}
          </Button>
        </div>
      </div>

      {/* Quick Stats with Growth */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">{language === 'id' ? 'Total Pendapatan' : 'Total Revenue'}</p>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
          {isEnabled('growthAnalytics') && (
            <GrowthIndicator value={growthData.revenue} size="sm" className="mt-2" />
          )}
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-success/10">
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <p className="text-sm text-muted-foreground">{language === 'id' ? 'Total Margin' : 'Total Margin'}</p>
          </div>
          <p className="text-2xl font-bold text-success">{formatCurrency(totalMargin)}</p>
          {isEnabled('growthAnalytics') && (
            <GrowthIndicator value={growthData.margin} size="sm" className="mt-2" />
          )}
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-success/10">
              {avgMarginPct >= 0 ? (
                <TrendingUp className="w-5 h-5 text-success" />
              ) : (
                <TrendingDown className="w-5 h-5 text-destructive" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">{language === 'id' ? 'Rata-rata Margin' : 'Avg Margin %'}</p>
          </div>
          <p className="text-2xl font-bold">{avgMarginPct.toFixed(1)}%</p>
          {isEnabled('growthAnalytics') && (
            <GrowthIndicator value={growthData.avgMargin} size="sm" className="mt-2" />
          )}
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-warning/10">
              <ShoppingBag className="w-5 h-5 text-warning" />
            </div>
            <p className="text-sm text-muted-foreground">{language === 'id' ? 'Pesanan Menunggu' : 'Pending Orders'}</p>
          </div>
          <p className="text-2xl font-bold">{pendingOrders.length}</p>
          {isEnabled('growthAnalytics') && (
            <GrowthIndicator value={growthData.pending} size="sm" className="mt-2" />
          )}
        </div>
      </div>

      <SalesOrderTable />
    </MainLayout>
  );
}
