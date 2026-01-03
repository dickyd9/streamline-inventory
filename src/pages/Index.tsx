import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentOrders } from '@/components/dashboard/RecentOrders';
import { LowStockAlert } from '@/components/dashboard/LowStockAlert';
import { InventoryChart } from '@/components/dashboard/InventoryChart';
import { mockProducts, mockPurchaseOrders, mockSuppliers } from '@/data/mockData';
import { Package, ShoppingCart, AlertTriangle, DollarSign } from 'lucide-react';

const Dashboard = () => {
  const totalProducts = mockProducts.length;
  const lowStockCount = mockProducts.filter(p => p.quantity <= p.minStock).length;
  const pendingOrders = mockPurchaseOrders.filter(o => o.status === 'pending').length;
  const totalInventoryValue = mockProducts.reduce((acc, p) => acc + (p.quantity * p.unitPrice), 0);

  return (
    <MainLayout title="Dashboard">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
          subtitle="Across all categories"
          icon={DollarSign}
          variant="success"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Pending Orders"
          value={pendingOrders}
          subtitle={`${mockPurchaseOrders.length} total orders`}
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

      {/* Charts and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <InventoryChart />
        </div>
        <div>
          <LowStockAlert />
        </div>
      </div>

      {/* Recent Orders */}
      <div className="mt-6">
        <RecentOrders />
      </div>
    </MainLayout>
  );
};

export default Dashboard;
