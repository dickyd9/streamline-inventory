import { MainLayout } from '@/components/layout/MainLayout';
import { CustomerTable } from '@/components/customers/CustomerTable';

export default function Customers() {
  return (
    <MainLayout title="Customers">
      <CustomerTable />
    </MainLayout>
  );
}
