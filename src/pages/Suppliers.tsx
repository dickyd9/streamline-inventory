import { MainLayout } from '@/components/layout/MainLayout';
import { SupplierTable } from '@/components/suppliers/SupplierTable';
import { mockSuppliers } from '@/data/mockData';
import { Users, UserCheck, UserX } from 'lucide-react';

export default function Suppliers() {
  const totalSuppliers = mockSuppliers.length;
  const activeCount = mockSuppliers.filter(s => s.status === 'active').length;
  const inactiveCount = mockSuppliers.filter(s => s.status === 'inactive').length;

  return (
    <MainLayout title="Suppliers">
      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">{totalSuppliers}</p>
            <p className="text-sm text-muted-foreground">Total Suppliers</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-success/10">
            <UserCheck className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold">{activeCount}</p>
            <p className="text-sm text-muted-foreground">Active</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted">
            <UserX className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-2xl font-bold">{inactiveCount}</p>
            <p className="text-sm text-muted-foreground">Inactive</p>
          </div>
        </div>
      </div>

      <SupplierTable />
    </MainLayout>
  );
}
