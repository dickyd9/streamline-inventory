import { useState } from 'react';
import { PurchaseOrder, StockMovement, Product, calculateWeightedAverageCost } from '@/types/inventory';
import { mockPurchaseOrders as initialOrders, mockProducts, mockStockMovements } from '@/data/mockData';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Eye, Search, Plus, FileText, MoreHorizontal, CheckCircle, XCircle, Package, DollarSign, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PurchaseOrderDialog } from './PurchaseOrderDialog';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePermissions } from '@/hooks/usePermissions';
import { useActivityLog } from '@/hooks/useActivityLog';

const statusStyles = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  approved: 'bg-primary/10 text-primary border-primary/20',
  received: 'bg-success/10 text-success border-success/20',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
};

const paymentStatusStyles = {
  unpaid: 'bg-destructive/10 text-destructive border-destructive/20',
  partial: 'bg-warning/10 text-warning border-warning/20',
  paid: 'bg-success/10 text-success border-success/20',
};

function OrderDetailsDialog({ order, formatCurrency }: { order: PurchaseOrder & { paidAmount?: number; paymentStatus?: string }; formatCurrency: (v: number) => string }) {
  const totalPcs = order.items.reduce((sum, item) => sum + item.totalPcs, 0);
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Eye className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {order.orderNumber}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Supplier</p>
              <p className="font-medium">{order.supplier}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant="outline" className={cn("capitalize", statusStyles[order.status])}>
                {order.status}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Order Date</p>
              <p className="font-medium">{order.orderDate}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Expected Date</p>
              <p className="font-medium">{order.expectedDate}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Payment Status</p>
              <Badge variant="outline" className={cn("capitalize", paymentStatusStyles[order.paymentStatus || 'unpaid'])}>
                {order.paymentStatus === 'partial' ? 'Partially Paid' : (order.paymentStatus || 'Unpaid')}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Paid Amount</p>
              <p className="font-medium">{formatCurrency(order.paidAmount || 0)} / {formatCurrency(order.totalAmount)}</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground mb-2">Items</p>
            <div className="bg-muted/50 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Product</th>
                    <th className="text-right p-3 font-medium">Qty</th>
                    <th className="text-center p-3 font-medium">Unit</th>
                    <th className="text-right p-3 font-medium">Total Pcs</th>
                    <th className="text-right p-3 font-medium">Unit Price</th>
                    <th className="text-right p-3 font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, index) => (
                    <tr key={index} className="border-b last:border-0">
                      <td className="p-3">{item.productName}</td>
                      <td className="p-3 text-right">{item.quantity}</td>
                      <td className="p-3 text-center">
                        <Badge variant="secondary" className="text-xs capitalize">{item.unit}</Badge>
                      </td>
                      <td className="p-3 text-right text-muted-foreground">{item.totalPcs}</td>
                      <td className="p-3 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="p-3 text-right font-medium">{formatCurrency(item.quantity * item.unitPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t">
            <div className="text-sm text-muted-foreground">
              Total Pieces: <strong>{totalPcs.toLocaleString()}</strong>
            </div>
            <div className="text-right">
              <span className="font-semibold">Total Amount: </span>
              <span className="font-bold text-lg">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RecordPaymentDialog({ order, onRecordPayment, formatCurrency, language }: { 
  order: PurchaseOrder & { paidAmount?: number }; 
  onRecordPayment: (orderId: string, amount: number) => void;
  formatCurrency: (v: number) => string;
  language: string;
}) {
  const [open, setOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const remaining = order.totalAmount - (order.paidAmount || 0);

  const handleSubmit = () => {
    const amount = parseFloat(paymentAmount) || 0;
    if (amount > 0 && amount <= remaining) {
      onRecordPayment(order.id, amount);
      setOpen(false);
      setPaymentAmount('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <DollarSign className="w-4 h-4 mr-2" />
          {language === 'id' ? 'Catat Pembayaran' : 'Record Payment'}
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{language === 'id' ? 'Catat Pembayaran' : 'Record Payment'} - {order.orderNumber}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">{language === 'id' ? 'Total' : 'Total Amount'}</p>
              <p className="font-medium">{formatCurrency(order.totalAmount)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{language === 'id' ? 'Sudah Dibayar' : 'Already Paid'}</p>
              <p className="font-medium text-success">{formatCurrency(order.paidAmount || 0)}</p>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground">{language === 'id' ? 'Sisa' : 'Remaining'}</p>
              <p className="font-bold text-lg">{formatCurrency(remaining)}</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label>{language === 'id' ? 'Jumlah Pembayaran' : 'Payment Amount'}</Label>
            <Input
              type="number"
              step="1000"
              min="1"
              max={remaining}
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder={`Max: ${formatCurrency(remaining)}`}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {language === 'id' ? 'Batal' : 'Cancel'}
          </Button>
          <Button onClick={handleSubmit} disabled={!paymentAmount || parseFloat(paymentAmount) <= 0 || parseFloat(paymentAmount) > remaining}>
            {language === 'id' ? 'Catat Pembayaran' : 'Record Payment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function PurchaseOrderTable() {
  const { language, formatCurrency } = useLanguage();
  const { canApprove } = usePermissions();
  const { logActivity } = useActivityLog();
  const [orders, setOrders] = useState<(PurchaseOrder & { paidAmount?: number; paymentStatus?: 'unpaid' | 'partial' | 'paid' })[]>(
    initialOrders.map(o => ({ ...o, paidAmount: 0, paymentStatus: 'unpaid' as const }))
  );
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [movements, setMovements] = useState<StockMovement[]>(mockStockMovements);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateOrder = (orderData: Omit<PurchaseOrder, 'id' | 'orderNumber'>) => {
    const orderNumber = `PO-${new Date().getFullYear()}-${String(orders.length + 1).padStart(3, '0')}`;
    const newOrder = {
      ...orderData,
      id: Date.now().toString(),
      orderNumber,
      paidAmount: 0,
      paymentStatus: 'unpaid' as const,
    };
    setOrders([newOrder, ...orders]);
    logActivity({
      action: 'create',
      entityType: 'purchase_order',
      entityId: newOrder.id,
      entityName: orderNumber,
      details: { supplier: orderData.supplier, totalAmount: orderData.totalAmount },
    });
    toast.success(language === 'id' ? `Pesanan ${orderNumber} berhasil dibuat` : `Order ${orderNumber} created successfully`);
  };

  const updateOrderStatus = (orderId: string, newStatus: PurchaseOrder['status']) => {
    const order = orders.find(o => o.id === orderId);
    setOrders(orders.map(o => 
      o.id === orderId ? { ...o, status: newStatus } : o
    ));
    logActivity({
      action: newStatus === 'approved' ? 'approve' : newStatus === 'cancelled' ? 'cancel' : 'update',
      entityType: 'purchase_order',
      entityId: orderId,
      entityName: order?.orderNumber,
      details: { newStatus },
    });
    toast.success(language === 'id' ? `Status pesanan diperbarui ke ${newStatus}` : `Order status updated to ${newStatus}`);
  };

  const recordPayment = (orderId: string, amount: number) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const newPaidAmount = (order.paidAmount || 0) + amount;
    const newPaymentStatus = newPaidAmount >= order.totalAmount ? 'paid' : 'partial';
    
    setOrders(orders.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          paidAmount: newPaidAmount,
          paymentStatus: newPaymentStatus,
        };
      }
      return o;
    }));
    
    logActivity({
      action: 'payment',
      entityType: 'purchase_order',
      entityId: orderId,
      entityName: order.orderNumber,
      details: { amount, newPaidAmount, paymentStatus: newPaymentStatus },
    });
    
    toast.success(language === 'id' ? `Pembayaran ${formatCurrency(amount)} dicatat` : `Payment of ${formatCurrency(amount)} recorded`);
  };

  // Receive PO: create stock movements and update product costs with weighted average
  const receiveOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const today = new Date().toISOString().split('T')[0];

    // Create stock in movements for each item
    const newMovements: StockMovement[] = order.items.map((item, idx) => ({
      id: `${Date.now()}-${idx}`,
      productId: item.productId,
      productName: item.productName,
      type: 'in' as const,
      adjustmentReason: 'purchase' as const,
      quantity: item.quantity,
      unit: item.unit,
      pcsPerUnit: item.pcsPerUnit,
      totalPcs: item.totalPcs,
      costPerPc: item.costPerPc,
      totalValue: item.quantity * item.unitPrice,
      reference: order.orderNumber,
      notes: `Received from ${order.supplier}`,
      date: today,
      createdBy: 'Current User',
    }));

    setMovements([...newMovements, ...movements]);

    // Update product quantities and weighted average cost
    setProducts(products.map(p => {
      const receivedItem = order.items.find(i => i.productId === p.id);
      if (receivedItem) {
        const newCostPrice = calculateWeightedAverageCost(
          p.quantity,
          p.costPrice,
          receivedItem.totalPcs,
          receivedItem.costPerPc
        );
        return {
          ...p,
          quantity: p.quantity + receivedItem.totalPcs,
          costPrice: newCostPrice,
          lastUpdated: today,
        };
      }
      return p;
    }));

    // Update order status
    setOrders(orders.map(o =>
      o.id === orderId ? { ...o, status: 'received' as const, receivedDate: today } : o
    ));

    toast.success(`${order.orderNumber} received! Stock updated with weighted average costing.`);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={language === 'id' ? 'Cari pesanan...' : 'Search orders...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder={language === 'id' ? 'Semua Status' : 'All Status'} />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="all">{language === 'id' ? 'Semua Status' : 'All Status'}</SelectItem>
            <SelectItem value="pending">{language === 'id' ? 'Menunggu' : 'Pending'}</SelectItem>
            <SelectItem value="approved">{language === 'id' ? 'Disetujui' : 'Approved'}</SelectItem>
            <SelectItem value="received">{language === 'id' ? 'Diterima' : 'Received'}</SelectItem>
            <SelectItem value="cancelled">{language === 'id' ? 'Dibatalkan' : 'Cancelled'}</SelectItem>
          </SelectContent>
        </Select>
        <Button className="gap-2" onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4" />
          {language === 'id' ? 'Pesanan Baru' : 'New Order'}
        </Button>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>{language === 'id' ? 'No. Pesanan' : 'Order Number'}</TableHead>
              <TableHead>{language === 'id' ? 'Pemasok' : 'Supplier'}</TableHead>
              <TableHead>{language === 'id' ? 'Tanggal' : 'Order Date'}</TableHead>
              <TableHead className="text-right">{language === 'id' ? 'Total' : 'Total'}</TableHead>
              <TableHead>{language === 'id' ? 'Status' : 'Status'}</TableHead>
              <TableHead>{language === 'id' ? 'Pembayaran' : 'Payment'}</TableHead>
              <TableHead className="text-right">{language === 'id' ? 'Aksi' : 'Actions'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => {
              const totalPcs = order.items.reduce((sum, item) => sum + item.totalPcs, 0);
              return (
                <TableRow key={order.id} className="table-row-hover">
                  <TableCell className="font-medium">{order.orderNumber}</TableCell>
                  <TableCell>{order.supplier}</TableCell>
                  <TableCell className="text-muted-foreground">{order.orderDate}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(order.totalAmount)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("capitalize", statusStyles[order.status])}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("capitalize", paymentStatusStyles[order.paymentStatus || 'unpaid'])}>
                      {order.paymentStatus === 'partial' 
                        ? formatCurrency(order.paidAmount || 0)
                        : (order.paymentStatus || 'unpaid')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <OrderDetailsDialog order={order} formatCurrency={formatCurrency} />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover">
                          {order.status === 'pending' && canApprove() && (
                            <>
                              <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'approved')}>
                                <CheckCircle className="w-4 h-4 mr-2 text-primary" />
                                {language === 'id' ? 'Setujui Pesanan' : 'Approve Order'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          {order.status === 'approved' && (
                            <>
                              <DropdownMenuItem onClick={() => receiveOrder(order.id)}>
                                <Package className="w-4 h-4 mr-2 text-success" />
                                {language === 'id' ? 'Terima & Update Stok' : 'Receive & Update Stock'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          {(order.status === 'approved' || order.status === 'received') && order.paymentStatus !== 'paid' && (
                            <RecordPaymentDialog
                              order={order}
                              onRecordPayment={recordPayment}
                              formatCurrency={formatCurrency}
                              language={language}
                            />
                          )}
                          {(order.status === 'pending' || order.status === 'approved') && (
                            <DropdownMenuItem 
                              onClick={() => updateOrderStatus(order.id, 'cancelled')}
                              className="text-destructive"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              {language === 'id' ? 'Batalkan Pesanan' : 'Cancel Order'}
                            </DropdownMenuItem>
                          )}
                          {order.status === 'cancelled' && (
                            <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'pending')}>
                              {language === 'id' ? 'Buka Kembali' : 'Reopen Order'}
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Create Order Dialog */}
      <PurchaseOrderDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleCreateOrder}
      />
    </div>
  );
}
