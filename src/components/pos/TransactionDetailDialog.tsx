import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { POSTransaction } from '@/types/inventory';
import { Clock, CheckCircle2, FileText, Play, User, Scissors, Package, Printer } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface TransactionDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: POSTransaction | null;
  onUpdateStatus: (transaction: POSTransaction, status: POSTransaction['status']) => void;
}

export function TransactionDetailDialog({ open, onOpenChange, transaction, onUpdateStatus }: TransactionDetailDialogProps) {
  const { language, formatCurrency } = useLanguage();

  if (!transaction) return null;

  const statusConfig = {
    draft: { label: 'Draft', icon: FileText, color: 'bg-muted text-muted-foreground' },
    in_progress: { label: 'Dalam Proses', icon: Clock, color: 'bg-warning/10 text-warning' },
    completed: { label: 'Selesai', icon: CheckCircle2, color: 'bg-success/10 text-success' },
    cancelled: { label: 'Dibatalkan', icon: FileText, color: 'bg-destructive/10 text-destructive' },
  };

  const config = statusConfig[transaction.status];
  const Icon = config.icon;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={`p-2 rounded ${config.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <span>{transaction.transactionNumber}</span>
              <Badge variant="outline" className="ml-2">{config.label}</Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Customer & Time Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{language === 'id' ? 'Customer' : 'Customer'}</p>
              <p className="font-medium flex items-center gap-2">
                <User className="w-4 h-4" />
                {transaction.customerName || 'Walk-in'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{language === 'id' ? 'Waktu' : 'Time'}</p>
              <p className="font-medium">
                {new Date(transaction.createdAt).toLocaleString('id-ID')}
              </p>
            </div>
          </div>

          <Separator />

          {/* Items Table */}
          <div>
            <h3 className="font-semibold mb-2">{language === 'id' ? 'Item' : 'Items'}</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === 'id' ? 'Nama' : 'Name'}</TableHead>
                  <TableHead className="text-center">{language === 'id' ? 'Tipe' : 'Type'}</TableHead>
                  <TableHead className="text-right">{language === 'id' ? 'Harga' : 'Price'}</TableHead>
                  <TableHead className="text-center">{language === 'id' ? 'Qty' : 'Qty'}</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transaction.items.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.itemName}</p>
                        {item.employeeAssignments && item.employeeAssignments.length > 0 && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {item.employeeAssignments.map((a, i) => (
                              <span key={i}>
                                {a.employeeName} ({a.percentage}%)
                                {i < item.employeeAssignments!.length - 1 && ', '}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {item.itemType === 'service' ? (
                        <Badge variant="outline" className="gap-1">
                          <Scissors className="w-3 h-3" />
                          Jasa
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <Package className="w-3 h-3" />
                          Produk
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.price)}
                    </TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Separator />

          {/* Summary */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(transaction.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Pajak (10%)</span>
              <span>{formatCurrency(transaction.tax)}</span>
            </div>
            {transaction.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Diskon</span>
                <span className="text-destructive">-{formatCurrency(transaction.discount)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">{formatCurrency(transaction.total)}</span>
            </div>
            {transaction.totalCost > 0 && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">HPP</span>
                  <span className="text-destructive">{formatCurrency(transaction.totalCost)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{language === 'id' ? 'Laba Kotor' : 'Gross Profit'}</span>
                  <span className="text-success">{formatCurrency(transaction.grossProfit)}</span>
                </div>
              </>
            )}
          </div>

          {/* Payment Info */}
          {transaction.payments.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold">{language === 'id' ? 'Pembayaran' : 'Payment'}</h3>
                {transaction.payments.map((p, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="capitalize">{p.method}</span>
                    <span>{formatCurrency(p.amount)}</span>
                  </div>
                ))}
                {transaction.changeAmount > 0 && (
                  <div className="flex justify-between text-sm text-success">
                    <span>{language === 'id' ? 'Kembalian' : 'Change'}</span>
                    <span>{formatCurrency(transaction.changeAmount)}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {transaction.status === 'draft' && (
            <Button onClick={() => { onUpdateStatus(transaction, 'in_progress'); onOpenChange(false); }}>
              <Play className="w-4 h-4 mr-2" />
              {language === 'id' ? 'Mulai Proses' : 'Start Processing'}
            </Button>
          )}
          {transaction.status === 'in_progress' && (
            <Button onClick={() => { onUpdateStatus(transaction, 'completed'); onOpenChange(false); }}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {language === 'id' ? 'Selesaikan' : 'Complete'}
            </Button>
          )}
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            {language === 'id' ? 'Cetak' : 'Print'}
          </Button>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {language === 'id' ? 'Tutup' : 'Close'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
