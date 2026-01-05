import { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { POSTransaction } from '@/types/inventory';
import { Printer, Download, CheckCircle2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface ReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: POSTransaction | null;
}

export function ReceiptDialog({ open, onOpenChange, transaction }: ReceiptDialogProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!transaction) return null;

  const handlePrint = () => {
    const printContent = receiptRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${transaction.transactionNumber}</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              padding: 20px;
              max-width: 300px;
              margin: 0 auto;
            }
            .receipt-header { text-align: center; margin-bottom: 16px; }
            .receipt-header h1 { font-size: 18px; margin: 0; }
            .receipt-header p { font-size: 12px; margin: 4px 0; color: #666; }
            .receipt-info { font-size: 12px; margin-bottom: 16px; }
            .receipt-items { font-size: 12px; }
            .receipt-item { display: flex; justify-content: space-between; margin: 4px 0; }
            .receipt-divider { border-top: 1px dashed #ccc; margin: 12px 0; }
            .receipt-total { font-size: 14px; font-weight: bold; display: flex; justify-content: space-between; }
            .receipt-footer { text-align: center; font-size: 11px; color: #666; margin-top: 20px; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-success" />
            Transaksi Selesai
          </DialogTitle>
        </DialogHeader>

        {/* Receipt Preview */}
        <div 
          ref={receiptRef}
          className="bg-white p-4 rounded-lg border font-mono text-sm"
        >
          <div className="text-center mb-4">
            <h1 className="font-bold text-lg">INVENPRO</h1>
            <p className="text-xs text-muted-foreground">Jl. Contoh No. 123, Jakarta</p>
            <p className="text-xs text-muted-foreground">Tel: (021) 123-4567</p>
          </div>

          <Separator className="my-3" />

          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span>No. Transaksi:</span>
              <span>{transaction.transactionNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Tanggal:</span>
              <span>{new Date(transaction.completedAt || transaction.updatedAt).toLocaleDateString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span>Waktu:</span>
              <span>{new Date(transaction.completedAt || transaction.updatedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            {transaction.customerName && (
              <div className="flex justify-between">
                <span>Customer:</span>
                <span>{transaction.customerName}</span>
              </div>
            )}
            {transaction.completedBy && (
              <div className="flex justify-between">
                <span>Kasir:</span>
                <span>{transaction.completedBy}</span>
              </div>
            )}
          </div>

          <Separator className="my-3" />

          <div className="space-y-2">
            {transaction.items.map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between">
                  <span className="truncate flex-1">{item.itemName}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{item.quantity} x Rp {item.price.toLocaleString()}</span>
                  <span>Rp {item.total.toLocaleString()}</span>
                </div>
                {item.employeeAssignments && item.employeeAssignments.length > 0 && (
                  <div className="text-xs text-muted-foreground pl-2">
                    Dikerjakan: {item.employeeAssignments.map(a => `${a.employeeName} (${a.percentage}%)`).join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>

          <Separator className="my-3" />

          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>Rp {transaction.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Pajak (10%)</span>
              <span>Rp {transaction.tax.toLocaleString()}</span>
            </div>
            {transaction.discount > 0 && (
              <div className="flex justify-between text-success">
                <span>Diskon</span>
                <span>-Rp {transaction.discount.toLocaleString()}</span>
              </div>
            )}
          </div>

          <Separator className="my-3" />

          <div className="flex justify-between font-bold">
            <span>TOTAL</span>
            <span>Rp {transaction.total.toLocaleString()}</span>
          </div>

          <div className="mt-2 space-y-1 text-xs">
            {transaction.payments.map((payment, idx) => (
              <div key={idx} className="flex justify-between">
                <span>{payment.method === 'cash' ? 'Tunai' : payment.method === 'transfer' ? 'Transfer' : 'QRIS'}</span>
                <span>Rp {payment.amount.toLocaleString()}</span>
              </div>
            ))}
            {transaction.changeAmount > 0 && (
              <div className="flex justify-between font-medium">
                <span>Kembalian</span>
                <span>Rp {transaction.changeAmount.toLocaleString()}</span>
              </div>
            )}
          </div>

          <Separator className="my-3" />

          <div className="text-center text-xs text-muted-foreground">
            <p>Terima kasih atas kunjungan Anda!</p>
            <p>Barang yang sudah dibeli tidak dapat dikembalikan</p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Cetak
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
