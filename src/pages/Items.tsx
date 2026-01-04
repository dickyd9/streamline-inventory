import { MainLayout } from '@/components/layout/MainLayout';
import { ProductTable } from '@/components/inventory/ProductTable';

const Items = () => {
  return (
    <MainLayout title="Items">
      <ProductTable />
    </MainLayout>
  );
};

export default Items;
