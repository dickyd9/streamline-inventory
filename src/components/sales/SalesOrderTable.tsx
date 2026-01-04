import { useState } from 'react';
import { SalesOrder, SalesOrderStatus, StockMovement, Product, Customer } from '@/types/inventory';
import { mockSalesOrders as initialOrders, mockProducts, mockStockMovements, mockCustomers } from '@/data/mockData';
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
import { Label } from '@/components/ui/label';
import { Eye, Search, Plus, FileText, MoreHorizontal, CheckCircle, XCircle, TrendingUp, TrendingDown, DollarSign, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SalesOrderDialog } from './SalesOrderDialog';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePermissions } from '@/hooks/usePermissions';
import { useActivityLog } from '@/hooks/useActivityLog';

const statusStyles: Record<SalesOrderStatus, string> = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  received: 'bg-primary/10 text-primary border-primary/20',
  partially_paid: 'bg-info/10 text-info border-info/20',
  paid: 'bg-success/10 text-success border-success/20',
  completed: 'bg-success/10 text-success border-success/20',
  cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
};

const paymentStatusStyles = {
  unpaid: 'bg-destructive/10 text-destructive border-destructive/20',
  partial: 'bg-warning/10 text-warning border-warning/20',
  paid: 'bg-success/10 text-success border-success/20',
};

function OrderDetailsDialog({ order }: { order: SalesOrder }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Eye className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {order.orderNumber}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Customer</p>
              <p className="font-medium">{order.customerName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Order Status</p>
              <Badge variant="outline" className={cn("capitalize", statusStyles[order.status])}>
                {order.status.replace('_', ' ')}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Payment Status</p>
              <Badge variant="outline" className={cn("capitalize", paymentStatusStyles[order.paymentStatus])}>
                {order.paymentStatus === 'partial' ? 'Partially Paid' : order.paymentStatus}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Paid Amount</p>
              <p className="font-medium">${order.paidAmount.toFixed(2)} / ${order.totalRevenue.toFixed(2)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Order Date</p>
              <p className="font-medium">{order.orderDate}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Margin %</p>
              <p className={cn(
                "font-medium flex items-center gap-1",
                order.totalMargin >= 0 ? "text-success" : "text-destructive"
              )}>
                {order.totalMargin >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {order.marginPercentage.toFixed(1)}%
              </p>
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
                    <th className="text-right p-3 font-medium">Sell Price</th>
                    <th className="text-right p-3 font-medium">Cost</th>
                    <th className="text-right p-3 font-medium">Revenue</th>
                    <th className="text-right p-3 font-medium">Margin</th>
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
                      <td className="p-3 text-right">${item.sellingPrice.toFixed(2)}</td>
                      <td className="p-3 text-right text-muted-foreground">${item.costPrice.toFixed(2)}</td>
                      <td className="p-3 text-right font-medium">${item.revenue.toFixed(2)}</td>
                      <td className={cn(
                        "p-3 text-right font-medium",
                        item.margin >= 0 ? "text-success" : "text-destructive"
                      )}>
                        ${item.margin.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-2 border-t">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-xl font-bold">${order.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Cost</p>
              <p className="text-xl font-medium">${order.totalCost.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Margin</p>
              <p className={cn(
                "text-xl font-bold flex items-center justify-center gap-1",
                order.totalMargin >= 0 ? "text-success" : "text-destructive"
              )}>
                {order.totalMargin >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                ${order.totalMargin.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RecordPaymentDialog({ order, onRecordPayment }: { order: SalesOrder; onRecordPayment: (orderId: string, amount: number) => void }) {
  const [open, setOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const remaining = order.totalRevenue - order.paidAmount;

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
          Record Payment
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record Payment - {order.orderNumber}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Total Amount</p>
              <p className="font-medium">${order.totalRevenue.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Already Paid</p>
              <p className="font-medium text-success">${order.paidAmount.toFixed(2)}</p>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground">Remaining</p>
              <p className="font-bold text-lg">${remaining.toFixed(2)}</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Payment Amount</Label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              max={remaining}
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder={`Max: $${remaining.toFixed(2)}`}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!paymentAmount || parseFloat(paymentAmount) <= 0 || parseFloat(paymentAmount) > remaining}>
            Record Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SalesOrderTable() {
  const [orders, setOrders] = useState<SalesOrder[]>(initialOrders);
  const { language, formatCurrency } = useLanguage();
  const { canApprove } = usePermissions();
  const { logActivity } = useActivityLog();
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [customers] = useState<Customer[]>(mockCustomers);
  const [movements, setMovements] = useState<StockMovement[]>(mockStockMovements);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateOrder = (orderData: Omit<SalesOrder, 'id' | 'orderNumber'>) => {
    const orderNumber = `SO-${new Date().getFullYear()}-${String(orders.length + 1).padStart(3, '0')}`;
    const newOrder: SalesOrder = {
      ...orderData,
      id: Date.now().toString(),
      orderNumber,
    };
    setOrders([newOrder, ...orders]);
    logActivity({
      action: 'create',
      entityType: 'sales_order',
      entityId: newOrder.id,
      entityName: orderNumber,
      details: { customer: orderData.customerName, totalRevenue: orderData.totalRevenue },
    });
    toast.success(language === 'id' ? `Pesanan ${orderNumber} berhasil dibuat` : `Sales Order ${orderNumber} created`);
  };

  const updateOrderStatus = (orderId: string, newStatus: SalesOrderStatus) => {
    const order = orders.find(o => o.id === orderId);
    setOrders(orders.map(o =>
      o.id === orderId ? { ...o, status: newStatus } : o
    ));
    logActivity({
      action: newStatus === 'cancelled' ? 'cancel' : 'update',
      entityType: 'sales_order',
      entityId: orderId,
      entityName: order?.orderNumber,
      details: { newStatus },
    });
    toast.success(language === 'id' ? `Status pesanan diperbarui ke ${newStatus}` : `Order status updated to ${newStatus.replace('_', ' ')}`);
  };

  const recordPayment = (orderId: string, amount: number) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const newPaidAmount = order.paidAmount + amount;
    const newPaymentStatus = newPaidAmount >= order.totalRevenue ? 'paid' : 'partial';
    
    setOrders(orders.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          paidAmount: newPaidAmount,
          paymentStatus: newPaymentStatus as 'unpaid' | 'partial' | 'paid',
        };
      }
      return o;
    }));
    
    logActivity({
      action: 'payment',
      entityType: 'sales_order',
      entityId: orderId,
      entityName: order.orderNumber,
      details: { amount, newPaidAmount, paymentStatus: newPaymentStatus },
    });
    
    toast.success(language === 'id' ? `Pembayaran ${formatCurrency(amount)} dicatat` : `Payment of ${formatCurrency(amount)} recorded`);
  };

  const completeOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Create stock out movements for each item
    const newMovements: StockMovement[] = order.items.map((item, idx) => ({
      id: `${Date.now()}-${idx}`,
      productId: item.productId,
      productName: item.productName,
      type: 'out' as const,
      adjustmentReason: 'sale' as const,
      quantity: item.quantity,
      unit: item.unit,
      pcsPerUnit: item.pcsPerUnit,
      totalPcs: item.totalPcs,
      costPerPc: item.costPrice / item.pcsPerUnit,
      totalValue: item.cost,
      sellingPricePerPc: item.sellingPrice / item.pcsPerUnit,
      totalRevenue: item.revenue,
      margin: item.margin,
      reference: order.orderNumber,
      notes: `Sales to ${order.customerName}`,
      date: new Date().toISOString().split('T')[0],
      createdBy: 'Current User',
    }));

    setMovements([...newMovements, ...movements]);

    // Update product quantities
    setProducts(products.map(p => {
      const soldItem = order.items.find(i => i.productId === p.id);
      if (soldItem) {
        return {
          ...p,
          quantity: Math.max(0, p.quantity - soldItem.totalPcs),
          lastUpdated: new Date().toISOString().split('T')[0],
        };
      }
      return p;
    }));

    // Update order status
    setOrders(orders.map(o =>
      o.id === orderId ? { ...o, status: 'completed' as const } : o
    ));

    toast.success(`Order ${order.orderNumber} completed - Stock reduced and margin recorded`);
  };

  const cancelOrder = (orderId: string) => {
    setOrders(orders.map(o =>
      o.id === orderId ? { ...o, status: 'cancelled' as const } : o
    ));
    toast.success('Order cancelled');
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by order # or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="received">Received</SelectItem>
            <SelectItem value="partially_paid">Partially Paid</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Button className="gap-2" onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4" />
          New Sale
        </Button>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
              <TableHead className="text-right">Margin</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id} className="table-row-hover">
                <TableCell className="font-medium">{order.orderNumber}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell className="text-muted-foreground">{order.orderDate}</TableCell>
                <TableCell className="text-right font-medium">${order.totalRevenue.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <span className={cn(
                    "font-semibold flex items-center justify-end gap-1",
                    order.totalMargin >= 0 ? "text-success" : "text-destructive"
                  )}>
                    {order.totalMargin >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    ${order.totalMargin.toFixed(2)}
                    <span className="text-xs text-muted-foreground">({order.marginPercentage.toFixed(0)}%)</span>
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn("capitalize", statusStyles[order.status])}>
                    {order.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn("capitalize", paymentStatusStyles[order.paymentStatus])}>
                    {order.paymentStatus === 'partial' ? `$${order.paidAmount.toFixed(0)}` : order.paymentStatus}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <OrderDetailsDialog order={order} />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover">
                        {order.status === 'pending' && (
                          <>
                            <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'received')}>
                              <Package className="w-4 h-4 mr-2" />
                              Mark as Received
                            </DropdownMenuItem>
                            <RecordPaymentDialog order={order} onRecordPayment={recordPayment} />
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => cancelOrder(order.id)} className="text-destructive">
                              <XCircle className="w-4 h-4 mr-2" />
                              Cancel Order
                            </DropdownMenuItem>
                          </>
                        )}
                        {order.status === 'received' && (
                          <>
                            <RecordPaymentDialog order={order} onRecordPayment={recordPayment} />
                            {order.paymentStatus === 'paid' && (
                              <DropdownMenuItem onClick={() => completeOrder(order.id)}>
                                <CheckCircle className="w-4 h-4 mr-2 text-success" />
                                Complete Order
                              </DropdownMenuItem>
                            )}
                          </>
                        )}
                        {(order.status === 'partially_paid' || order.status === 'paid') && (
                          <>
                            {order.paymentStatus !== 'paid' && (
                              <RecordPaymentDialog order={order} onRecordPayment={recordPayment} />
                            )}
                            <DropdownMenuItem onClick={() => completeOrder(order.id)}>
                              <CheckCircle className="w-4 h-4 mr-2 text-success" />
                              Complete Order
                            </DropdownMenuItem>
                          </>
                        )}
                        {order.status === 'completed' && (
                          <DropdownMenuItem disabled>
                            Order completed
                          </DropdownMenuItem>
                        )}
                        {order.status === 'cancelled' && (
                          <DropdownMenuItem disabled>
                            Order cancelled
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredOrders.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No sales orders found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Order Dialog */}
      <SalesOrderDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        products={products}
        customers={customers}
        onSave={handleCreateOrder}
      />
    </div>
  );
}
