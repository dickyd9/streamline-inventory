import { MainLayout } from '@/components/layout/MainLayout';
import { StockMovementTable } from '@/components/stock/StockMovementTable';
import { mockStockMovements } from '@/data/mockData';
import { ArrowDownCircle, ArrowUpCircle, ArrowLeftRight, TrendingUp } from 'lucide-react';

export default function StockMovements() {
  const totalIn = mockStockMovements
    .filter(m => m.type === 'in')
    .reduce((acc, m) => acc + m.totalPcs, 0);
  const totalOut = mockStockMovements
    .filter(m => m.type === 'out')
    .reduce((acc, m) => acc + m.totalPcs, 0);
  const netMovement = totalIn - totalOut;
  const totalTransactions = mockStockMovements.length;

  return (
    <MainLayout title="Stock Movements">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-success/10">
            <ArrowDownCircle className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold text-success">+{totalIn.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Total Stock In</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-destructive/10">
            <ArrowUpCircle className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <p className="text-2xl font-bold text-destructive">-{totalOut.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Total Stock Out</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className={`text-2xl font-bold ${netMovement >= 0 ? 'text-success' : 'text-destructive'}`}>
              {netMovement >= 0 ? '+' : ''}{netMovement.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">Net Movement</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <ArrowLeftRight className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">{totalTransactions}</p>
            <p className="text-sm text-muted-foreground">Transactions</p>
          </div>
        </div>
      </div>

      <StockMovementTable />
    </MainLayout>
  );
}
