import { MainLayout } from '@/components/layout/MainLayout';
import { PurchaseOrderTable } from '@/components/purchases/PurchaseOrderTable';
import { mockPurchaseOrders } from '@/data/mockData';
import { ShoppingCart, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Purchases() {
  const { formatCurrency, language } = useLanguage();
  const pendingCount = mockPurchaseOrders.filter(o => o.status === 'pending').length;
  const approvedCount = mockPurchaseOrders.filter(o => o.status === 'approved').length;
  const receivedCount = mockPurchaseOrders.filter(o => o.status === 'received').length;
  const totalValue = mockPurchaseOrders
    .filter(o => o.status !== 'cancelled')
    .reduce((acc, o) => acc + o.totalAmount, 0);

  return (
    <MainLayout title={language === 'id' ? 'Pesanan Pembelian' : 'Purchase Orders'}>
      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <ShoppingCart className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
            <p className="text-sm text-muted-foreground">{language === 'id' ? 'Total Nilai' : 'Total Value'}</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-warning/10">
            <Clock className="w-5 h-5 text-warning" />
          </div>
          <div>
            <p className="text-2xl font-bold">{pendingCount}</p>
            <p className="text-sm text-muted-foreground">{language === 'id' ? 'Menunggu' : 'Pending'}</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <CheckCircle className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">{approvedCount}</p>
            <p className="text-sm text-muted-foreground">{language === 'id' ? 'Disetujui' : 'Approved'}</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-success/10">
            <CheckCircle className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold">{receivedCount}</p>
            <p className="text-sm text-muted-foreground">{language === 'id' ? 'Diterima' : 'Received'}</p>
          </div>
        </div>
      </div>

      <PurchaseOrderTable />
    </MainLayout>
  );
}
