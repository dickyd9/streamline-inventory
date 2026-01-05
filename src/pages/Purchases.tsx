import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PurchaseOrderTable } from '@/components/purchases/PurchaseOrderTable';
import { mockPurchaseOrders } from '@/data/mockData';
import { ShoppingCart, Clock, CheckCircle, FileText } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { DateRangeFilter, getDateRange, DateRangePreset } from '@/components/common/DateRangeFilter';
import { GrowthIndicator } from '@/components/common/GrowthIndicator';
import { useFeatureFlags } from '@/contexts/FeatureFlagsContext';
import { Button } from '@/components/ui/button';

export default function Purchases() {
  const { formatCurrency, language } = useLanguage();
  const { isEnabled } = useFeatureFlags();
  const [datePreset, setDatePreset] = useState<DateRangePreset>('this_month');
  const [customRange, setCustomRange] = useState<{ from: Date; to: Date } | undefined>();

  const pendingCount = mockPurchaseOrders.filter(o => o.status === 'pending').length;
  const approvedCount = mockPurchaseOrders.filter(o => o.status === 'approved').length;
  const receivedCount = mockPurchaseOrders.filter(o => o.status === 'received').length;
  const totalValue = mockPurchaseOrders
    .filter(o => o.status !== 'cancelled')
    .reduce((acc, o) => acc + o.totalAmount, 0);

  // Mock growth data
  const growthData = {
    totalValue: 12.5,
    pending: -5.2,
    approved: 8.3,
    received: 15.7,
  };

  const handleDateChange = (preset: DateRangePreset, range: { from: Date; to: Date }) => {
    setDatePreset(preset);
    if (preset === 'custom') {
      setCustomRange(range);
    }
  };

  return (
    <MainLayout title={language === 'id' ? 'Pesanan Pembelian' : 'Purchase Orders'}>
      {/* Header with Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold">{language === 'id' ? 'Ringkasan Pembelian' : 'Purchase Summary'}</h2>
          <p className="text-sm text-muted-foreground">
            {language === 'id' ? 'Pantau pesanan pembelian dan pertumbuhan' : 'Monitor purchase orders and growth'}
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
              <ShoppingCart className="w-5 h-5 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">{language === 'id' ? 'Total Nilai' : 'Total Value'}</p>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
          {isEnabled('growthAnalytics') && (
            <GrowthIndicator value={growthData.totalValue} size="sm" className="mt-2" />
          )}
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-warning/10">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <p className="text-sm text-muted-foreground">{language === 'id' ? 'Menunggu' : 'Pending'}</p>
          </div>
          <p className="text-2xl font-bold">{pendingCount}</p>
          {isEnabled('growthAnalytics') && (
            <GrowthIndicator value={growthData.pending} size="sm" className="mt-2" />
          )}
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <CheckCircle className="w-5 h-5 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">{language === 'id' ? 'Disetujui' : 'Approved'}</p>
          </div>
          <p className="text-2xl font-bold">{approvedCount}</p>
          {isEnabled('growthAnalytics') && (
            <GrowthIndicator value={growthData.approved} size="sm" className="mt-2" />
          )}
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-success/10">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <p className="text-sm text-muted-foreground">{language === 'id' ? 'Diterima' : 'Received'}</p>
          </div>
          <p className="text-2xl font-bold">{receivedCount}</p>
          {isEnabled('growthAnalytics') && (
            <GrowthIndicator value={growthData.received} size="sm" className="mt-2" />
          )}
        </div>
      </div>

      <PurchaseOrderTable />
    </MainLayout>
  );
}
