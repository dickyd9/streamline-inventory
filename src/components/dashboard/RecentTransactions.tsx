import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockPOSTransactions } from '@/data/mockData';
import { Clock, CheckCircle2, FileText, ShoppingBag } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFeatureFlags } from '@/contexts/FeatureFlagsContext';
import { cn } from '@/lib/utils';

const statusConfig = {
  draft: { label: 'Draft', icon: FileText, color: 'text-muted-foreground' },
  in_progress: { label: 'Proses', icon: Clock, color: 'text-warning' },
  completed: { label: 'Selesai', icon: CheckCircle2, color: 'text-success' },
  cancelled: { label: 'Batal', icon: FileText, color: 'text-destructive' },
};

export function RecentTransactions() {
  const { language, formatCurrency } = useLanguage();
  const { isEnabled } = useFeatureFlags();

  if (!isEnabled('recentTransactions')) {
    return null;
  }

  const recentTransactions = [...mockPOSTransactions]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ShoppingBag className="w-4 h-4" />
          {language === 'id' ? 'Transaksi Terakhir' : 'Recent Transactions'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentTransactions.map((transaction) => {
          const config = statusConfig[transaction.status];
          const Icon = config.icon;
          
          return (
            <div key={transaction.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <div className={cn("p-2 rounded-lg bg-muted", config.color)}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{transaction.transactionNumber}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {transaction.customerName || 'Walk-in'} • {transaction.items.length} item
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-sm">{formatCurrency(transaction.total)}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(transaction.updatedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}

        {recentTransactions.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            {language === 'id' ? 'Belum ada transaksi' : 'No transactions yet'}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
