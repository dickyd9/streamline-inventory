import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentOrders } from '@/components/dashboard/RecentOrders';
import { LowStockAlert } from '@/components/dashboard/LowStockAlert';
import { AdvancedCharts } from '@/components/dashboard/AdvancedCharts';
import { TopSellingProducts } from '@/components/dashboard/TopSellingProducts';
import { BusinessInsights } from '@/components/dashboard/BusinessInsights';
import { FinancialSummary } from '@/components/dashboard/FinancialSummary';
import { TopEmployees } from '@/components/dashboard/TopEmployees';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { mockProducts, mockPurchaseOrders, mockSuppliers, mockSalesOrders } from '@/data/mockData';
import { Package, ShoppingCart, AlertTriangle, DollarSign, TrendingUp } from 'lucide-react';
import { useFeatureFlags } from '@/contexts/FeatureFlagsContext';

const Dashboard = () => {
  const [dateFilter, setDateFilter] = useState('month');
  const { isEnabled } = useFeatureFlags();
  const totalProducts = mockProducts.length;
  const lowStockCount = mockProducts.filter(p => p.quantity <= p.minStock).length;
  const pendingOrders = mockPurchaseOrders.filter(o => o.status === 'pending').length;
  const totalInventoryValue = mockProducts.reduce((acc, p) => acc + (p.quantity * p.costPrice), 0);
  
  // Sales metrics
  const completedSales = mockSalesOrders.filter(o => o.status === 'completed');
  const totalRevenue = completedSales.reduce((acc, o) => acc + o.totalRevenue, 0);
  const totalMargin = completedSales.reduce((acc, o) => acc + o.totalMargin, 0);
  const pendingSalesOrders = mockSalesOrders.filter(o => o.status === 'pending').length;

  return (
    <MainLayout title="Dashboard">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard
          title="Total Products"
          value={totalProducts}
          subtitle={`${mockSuppliers.filter(s => s.status === 'active').length} active suppliers`}
          icon={Package}
          variant="primary"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Inventory Value"
          value={`$${totalInventoryValue.toLocaleString()}`}
          subtitle="At cost price"
          icon={DollarSign}
          variant="default"
        />
        <StatCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          subtitle={`${completedSales.length} orders`}
          icon={TrendingUp}
          variant="success"
          trend={{ value: 15, isPositive: true }}
        />
        <StatCard
          title="Pending Orders"
          value={pendingOrders + pendingSalesOrders}
          subtitle={`${pendingOrders} PO, ${pendingSalesOrders} SO`}
          icon={ShoppingCart}
          variant="warning"
        />
        <StatCard
          title="Low Stock Items"
          value={lowStockCount}
          subtitle="Require attention"
          icon={AlertTriangle}
          variant="destructive"
        />
      </div>

      {/* Financial Summary Section */}
      <div className="mb-6">
        <FinancialSummary dateFilter={dateFilter} onDateFilterChange={setDateFilter} />
      </div>

      {/* Top row - Charts and insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <AdvancedCharts />
        </div>
        <div>
          <BusinessInsights />
        </div>
      </div>

      {/* Bottom row - Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div>
          <TopSellingProducts />
        </div>
        <div>
          <LowStockAlert />
        </div>
        <div>
          <TopEmployees />
        </div>
        <div>
          <RecentTransactions />
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
