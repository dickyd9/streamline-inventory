import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { POSTransaction } from '@/types/inventory';
import { Clock, FileText, CheckCircle2, Play, Eye, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface TransactionCardProps {
  transaction: POSTransaction;
  onView: (transaction: POSTransaction) => void;
  onUpdateStatus: (transaction: POSTransaction, status: POSTransaction['status']) => void;
  onSelect: (transaction: POSTransaction) => void;
}

const statusConfig = {
  draft: {
    label: 'Draft',
    icon: FileText,
    color: 'bg-muted text-muted-foreground',
    badgeVariant: 'secondary' as const,
  },
  in_progress: {
    label: 'Dalam Proses',
    icon: Clock,
    color: 'bg-warning/10 text-warning',
    badgeVariant: 'default' as const,
  },
  completed: {
    label: 'Selesai',
    icon: CheckCircle2,
    color: 'bg-success/10 text-success',
    badgeVariant: 'default' as const,
  },
  cancelled: {
    label: 'Dibatalkan',
    icon: FileText,
    color: 'bg-destructive/10 text-destructive',
    badgeVariant: 'destructive' as const,
  },
};

export function TransactionCard({ transaction, onView, onUpdateStatus, onSelect }: TransactionCardProps) {
  const config = statusConfig[transaction.status];
  const Icon = config.icon;
  
  const hasServices = transaction.items.some(item => item.itemType === 'service');
  const totalItems = transaction.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Card 
      className={cn(
        "cursor-pointer hover:border-primary transition-all",
        transaction.status === 'in_progress' && "border-warning/50"
      )}
      onClick={() => onSelect(transaction)}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={cn("p-1.5 rounded", config.color)}>
              <Icon className="w-3 h-3" />
            </div>
            <div>
              <p className="font-medium text-sm">{transaction.transactionNumber}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(transaction.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(transaction); }}>
                <Eye className="w-4 h-4 mr-2" />
                Lihat Detail
              </DropdownMenuItem>
              {transaction.status === 'draft' && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onUpdateStatus(transaction, 'in_progress'); }}>
                  <Play className="w-4 h-4 mr-2" />
                  Proses
                </DropdownMenuItem>
              )}
              {transaction.status === 'in_progress' && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onUpdateStatus(transaction, 'completed'); }}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Selesaikan
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="space-y-1.5">
          {transaction.items.slice(0, 2).map((item, idx) => (
            <div key={idx} className="flex justify-between text-xs">
              <span className="truncate flex-1">{item.itemName}</span>
              <span className="text-muted-foreground ml-2">x{item.quantity}</span>
            </div>
          ))}
          {transaction.items.length > 2 && (
            <p className="text-xs text-muted-foreground">+{transaction.items.length - 2} item lainnya</p>
          )}
        </div>

        <div className="flex items-center justify-between mt-3 pt-2 border-t">
          <div className="flex gap-1">
            <Badge variant="secondary" className="text-xs">
              {totalItems} item
            </Badge>
            {hasServices && (
              <Badge variant="outline" className="text-xs">
                Jasa
              </Badge>
            )}
          </div>
          <span className="font-semibold text-sm text-primary">
            Rp {transaction.total.toLocaleString()}
          </span>
        </div>
        
        {transaction.customerName && (
          <p className="text-xs text-muted-foreground mt-2 truncate">
            {transaction.customerName}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
