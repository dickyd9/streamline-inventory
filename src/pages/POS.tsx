import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingCart,
  FileText,
  Clock,
  CheckCircle2,
  CreditCard,
  Banknote,
  Smartphone,
  X,
  Scissors,
  Package,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockProducts, mockCustomers, mockPOSTransactions, mockEmployees } from '@/data/mockData';
import { useFeatureFlags } from '@/contexts/FeatureFlagsContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { POSTransaction, POSCartItem, POSPayment, Product, calculateHPP } from '@/types/inventory';
import { TransactionCard } from '@/components/pos/TransactionCard';
import { ServiceCompletionDialog } from '@/components/pos/ServiceCompletionDialog';
import { ReceiptDialog } from '@/components/pos/ReceiptDialog';
import { TransactionDetailDialog } from '@/components/pos/TransactionDetailDialog';

export default function POS() {
  const { isEnabled } = useFeatureFlags();
  const [cart, setCart] = useState<POSCartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [transactions, setTransactions] = useState<POSTransaction[]>(mockPOSTransactions);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [payments, setPayments] = useState<POSPayment[]>([]);
  const [paidAmount, setPaidAmount] = useState<string>('');
  const [activeTransactionView, setActiveTransactionView] = useState<'draft' | 'in_progress' | 'completed'>('draft');
  const [showServiceDialog, setShowServiceDialog] = useState(false);
  const [pendingCompleteTransaction, setPendingCompleteTransaction] = useState<POSTransaction | null>(null);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState<POSTransaction | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [viewingTransaction, setViewingTransaction] = useState<POSTransaction | null>(null);

  // Filter items based on business type flags
  const availableProducts = useMemo(() => {
    return mockProducts.filter(product => {
      if (product.itemType === 'service' && !isEnabled('servicesBusiness')) return false;
      if (product.itemType === 'product' && !isEnabled('productsBusiness')) return false;
      return true;
    });
  }, [isEnabled]);

  // Get categories from available products
  const categories = useMemo(() => {
    const cats = [...new Set(availableProducts.map(p => p.category))];
    return ['Semua', ...cats];
  }, [availableProducts]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return availableProducts.filter(product => {
      const matchesCategory = selectedCategory === 'Semua' || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const hasStock = product.itemType === 'service' || product.quantity > 0;
      return matchesCategory && matchesSearch && hasStock;
    });
  }, [selectedCategory, searchQuery, availableProducts]);

  // Cart calculations with HPP
  const cartSubtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const cartTax = cartSubtotal * 0.1;
  const cartTotal = cartSubtotal + cartTax;
  const cartHPP = calculateHPP(cart);
  const cartGrossProfit = cartSubtotal - cartHPP;

  // Transaction counts
  const draftTransactions = transactions.filter(t => t.status === 'draft');
  const inProgressTransactions = transactions.filter(t => t.status === 'in_progress');
  const completedTransactions = transactions.filter(t => t.status === 'completed');

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.itemId === product.id);
      if (existing) {
        return prev.map(item => 
          item.itemId === product.id 
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
            : item
        );
      }
      
      // Use basePrice for services, sellingPrice for products
      const price = product.itemType === 'service' 
        ? (product.basePrice || 0) 
        : product.sellingPrice;
      
      return [...prev, {
        itemId: product.id,
        itemName: product.name,
        itemType: product.itemType || 'product',
        quantity: 1,
        price,
        total: price,
        costPrice: product.itemType === 'product' ? product.costPrice : undefined,
      }];
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => 
      prev.map(item => {
        if (item.itemId === itemId) {
          const newQty = Math.max(0, item.quantity + delta);
          if (newQty === 0) return null;
          return { ...item, quantity: newQty, total: newQty * item.price };
        }
        return item;
      }).filter(Boolean) as POSCartItem[]
    );
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.itemId !== itemId));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomer('');
    setCustomerName('');
    setPayments([]);
  };

  const handlePayment = () => {
    if (cart.length === 0) {
      toast.error('Keranjang kosong');
      return;
    }
    setShowPaymentDialog(true);
    setPaidAmount(cartTotal.toFixed(2));
    setPayments([]);
  };

  const addPayment = () => {
    const amount = parseFloat(paidAmount) || 0;
    if (amount <= 0) return;
    
    setPayments([...payments, { method: paymentMethod as 'cash' | 'transfer' | 'qris', amount }]);
    setPaidAmount('');
  };

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const remainingAmount = cartTotal - totalPaid;

  const processPayment = () => {
    if (totalPaid < cartTotal) {
      toast.error('Jumlah pembayaran kurang');
      return;
    }

    const newTransaction: POSTransaction = {
      id: Date.now().toString(),
      transactionNumber: `POS-${new Date().getFullYear()}-${(transactions.length + 1).toString().padStart(3, '0')}`,
      items: cart,
      subtotal: cartSubtotal,
      tax: cartTax,
      discount: 0,
      total: cartTotal,
      totalCost: cartHPP,
      grossProfit: cartGrossProfit,
      status: 'draft',
      customerId: selectedCustomer || undefined,
      customerName: customerName || selectedCustomer ? mockCustomers.find(c => c.id === selectedCustomer)?.name : 'Walk-in',
      paymentMethod: payments.length > 1 ? 'multi' : (payments[0]?.method || 'cash'),
      payments,
      paidAmount: totalPaid,
      changeAmount: totalPaid - cartTotal,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTransactions([newTransaction, ...transactions]);
    toast.success(`Pembayaran berhasil! Kembalian: Rp ${(totalPaid - cartTotal).toLocaleString()}`);
    setShowPaymentDialog(false);
    clearCart();
  };

  const saveDraft = () => {
    if (cart.length === 0) {
      toast.error('Keranjang kosong');
      return;
    }

    const newTransaction: POSTransaction = {
      id: Date.now().toString(),
      transactionNumber: `POS-${new Date().getFullYear()}-${(transactions.length + 1).toString().padStart(3, '0')}`,
      items: cart,
      subtotal: cartSubtotal,
      tax: cartTax,
      discount: 0,
      total: cartTotal,
      totalCost: cartHPP,
      grossProfit: cartGrossProfit,
      status: 'draft',
      customerId: selectedCustomer || undefined,
      customerName: customerName || (selectedCustomer ? mockCustomers.find(c => c.id === selectedCustomer)?.name : undefined),
      payments: [],
      paidAmount: 0,
      changeAmount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTransactions([newTransaction, ...transactions]);
    toast.success('Transaksi disimpan sebagai draft');
    clearCart();
  };

  const handleViewTransaction = (transaction: POSTransaction) => {
    setViewingTransaction(transaction);
    setShowDetailDialog(true);
  };

  const handleUpdateStatus = (transaction: POSTransaction, newStatus: POSTransaction['status']) => {
    // If completing and has services, show service completion dialog
    if (newStatus === 'completed') {
      const serviceItems = transaction.items.filter(item => item.itemType === 'service');
      if (serviceItems.length > 0 && isEnabled('servicesBusiness')) {
        setPendingCompleteTransaction(transaction);
        setShowServiceDialog(true);
        return;
      }
    }

    // Update status
    setTransactions(prev => prev.map(t => 
      t.id === transaction.id 
        ? { ...t, status: newStatus, updatedAt: new Date().toISOString(), completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined }
        : t
    ));
    toast.success(`Status diubah ke ${newStatus === 'in_progress' ? 'Dalam Proses' : 'Selesai'}`);

    if (newStatus === 'completed') {
      const updated = { ...transaction, status: 'completed' as const, completedAt: new Date().toISOString() };
      setCompletedTransaction(updated);
      setShowReceiptDialog(true);
    }
  };

  const handleServiceCompletion = (updatedItems: POSCartItem[]) => {
    if (!pendingCompleteTransaction) return;

    const updated: POSTransaction = {
      ...pendingCompleteTransaction,
      items: pendingCompleteTransaction.items.map(item => {
        const updatedItem = updatedItems.find(u => u.itemId === item.itemId);
        return updatedItem || item;
      }),
      status: 'completed',
      updatedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      completedBy: 'Kasir', // Would be actual user name
    };

    setTransactions(prev => prev.map(t => t.id === updated.id ? updated : t));
    setShowServiceDialog(false);
    setPendingCompleteTransaction(null);
    setCompletedTransaction(updated);
    setShowReceiptDialog(true);
    toast.success('Transaksi selesai!');
  };

  const handleSelectTransaction = (transaction: POSTransaction) => {
    // Load transaction into cart for editing
    if (transaction.status === 'draft') {
      setCart(transaction.items);
      setCustomerName(transaction.customerName || '');
      setSelectedCustomer(transaction.customerId || '');
      // Remove from transactions temporarily
      setTransactions(prev => prev.filter(t => t.id !== transaction.id));
      toast.info('Transaksi dimuat ke keranjang');
    } else {
      // For in_progress or completed, show detail dialog
      handleViewTransaction(transaction);
    }
  };

  if (!isEnabled('pos')) {
    return (
      <MainLayout title="Point of Sale">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Modul POS Tidak Tersedia</h2>
            <p className="text-muted-foreground">Hubungi administrator untuk mengaktifkan fitur ini.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Point of Sale">
      <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-8rem)]">
        {/* Left: Products */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Today's Transactions - Detailed Cards */}
          <div className="mb-4">
            <Tabs value={activeTransactionView} onValueChange={(v) => setActiveTransactionView(v as any)}>
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="draft" className="gap-2">
                  <FileText className="w-4 h-4" />
                  Draft ({draftTransactions.length})
                </TabsTrigger>
                <TabsTrigger value="in_progress" className="gap-2">
                  <Clock className="w-4 h-4" />
                  Proses ({inProgressTransactions.length})
                </TabsTrigger>
                <TabsTrigger value="completed" className="gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Selesai ({completedTransactions.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="draft" className="mt-3">
                <ScrollArea className="h-32">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {draftTransactions.length === 0 ? (
                      <p className="text-sm text-muted-foreground col-span-full text-center py-4">Tidak ada draft</p>
                    ) : (
                      draftTransactions.map(t => (
                        <TransactionCard 
                          key={t.id} 
                          transaction={t} 
                          onView={handleViewTransaction} 
                          onUpdateStatus={handleUpdateStatus}
                          onSelect={handleSelectTransaction}
                        />
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="in_progress" className="mt-3">
                <ScrollArea className="h-32">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {inProgressTransactions.length === 0 ? (
                      <p className="text-sm text-muted-foreground col-span-full text-center py-4">Tidak ada yang sedang diproses</p>
                    ) : (
                      inProgressTransactions.map(t => (
                        <TransactionCard 
                          key={t.id} 
                          transaction={t} 
                          onView={handleViewTransaction} 
                          onUpdateStatus={handleUpdateStatus}
                          onSelect={handleSelectTransaction}
                        />
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="completed" className="mt-3">
                <ScrollArea className="h-32">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {completedTransactions.slice(0, 6).length === 0 ? (
                      <p className="text-sm text-muted-foreground col-span-full text-center py-4">Belum ada transaksi selesai</p>
                    ) : (
                      completedTransactions.slice(0, 6).map(t => (
                        <TransactionCard 
                          key={t.id} 
                          transaction={t} 
                          onView={handleViewTransaction} 
                          onUpdateStatus={() => {}}
                          onSelect={() => { setCompletedTransaction(t); setShowReceiptDialog(true); }}
                        />
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>

          {/* Search & Categories */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari produk atau jasa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="flex-1 flex flex-col min-h-0">
            <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
              {categories.map(cat => (
                <TabsTrigger key={cat} value={cat} className="shrink-0">
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedCategory} className="flex-1 mt-3 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 pb-4">
                  {filteredProducts.map(product => (
                    <Card 
                      key={product.id}
                      className={cn(
                        "cursor-pointer hover:border-primary transition-colors",
                        product.itemType === 'service' && "border-l-4 border-l-primary"
                      )}
                      onClick={() => addToCart(product)}
                    >
                      <CardContent className="p-3">
                        <div className="aspect-square bg-muted rounded-lg mb-2 flex items-center justify-center">
                          {product.itemType === 'service' ? (
                            <Scissors className="w-8 h-8 text-primary/50" />
                          ) : (
                            <Package className="w-8 h-8 text-muted-foreground/50" />
                          )}
                        </div>
                        <h4 className="font-medium text-sm truncate">{product.name}</h4>
                        <p className="text-xs text-muted-foreground">{product.sku}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-semibold text-primary">
                            Rp {(product.itemType === 'service' ? (product.basePrice || 0) : product.sellingPrice).toLocaleString()}
                          </span>
                          {product.itemType === 'product' ? (
                            <Badge variant="secondary" className="text-xs">
                              {product.quantity}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              Jasa
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: Cart */}
        <div className="w-full lg:w-96 flex flex-col bg-card rounded-xl border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Keranjang
              </div>
              {cart.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearCart}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col overflow-hidden p-4 pt-0">
            {/* Customer Selection */}
            <div className="mb-4 space-y-2">
              <Label className="text-sm">Customer</Label>
              <div className="flex gap-2">
                <Select value={selectedCustomer} onValueChange={(val) => {
                  setSelectedCustomer(val);
                  const customer = mockCustomers.find(c => c.id === val);
                  setCustomerName(customer?.name || '');
                }}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Pilih atau input manual" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="walk-in">Walk-in Customer</SelectItem>
                    {mockCustomers.map(customer => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedCustomer === '' && (
                <Input
                  placeholder="Nama customer (opsional)"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              )}
            </div>

            {/* Cart Items */}
            <ScrollArea className="flex-1 -mx-4 px-4">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                  <ShoppingCart className="w-12 h-12 mb-2 opacity-50" />
                  <p>Keranjang kosong</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.itemId} className={cn(
                      "flex items-center gap-3 p-2 rounded-lg bg-muted/50",
                      item.itemType === 'service' && "border-l-2 border-l-primary"
                    )}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          {item.itemType === 'service' && <Scissors className="w-3 h-3 text-primary" />}
                          <p className="font-medium text-sm truncate">{item.itemName}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Rp {item.price.toLocaleString()} x {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.itemId, -1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.itemId, 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => removeFromCart(item.itemId)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Cart Summary */}
            <div className="mt-4 pt-4 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>Rp {cartSubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pajak (10%)</span>
                <span>Rp {cartTax.toLocaleString()}</span>
              </div>
              {cartHPP > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">HPP</span>
                  <span className="text-destructive">Rp {cartHPP.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                <span>Total</span>
                <span className="text-primary">Rp {cartTotal.toLocaleString()}</span>
              </div>
              {cartHPP > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Laba Kotor</span>
                  <span className="text-success">Rp {cartGrossProfit.toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={saveDraft} disabled={cart.length === 0}>
                Simpan Draft
              </Button>
              <Button onClick={handlePayment} disabled={cart.length === 0}>
                Bayar
              </Button>
            </div>
          </CardContent>
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pembayaran</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span className="text-primary">Rp {cartTotal.toLocaleString()}</span>
            </div>

            {isEnabled('multiPayment') && (
              <>
                <div className="space-y-2">
                  <Label>Metode Pembayaran</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      type="button"
                      variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                      className="flex flex-col gap-1 h-auto py-3"
                      onClick={() => setPaymentMethod('cash')}
                    >
                      <Banknote className="w-5 h-5" />
                      <span className="text-xs">Tunai</span>
                    </Button>
                    <Button
                      type="button"
                      variant={paymentMethod === 'transfer' ? 'default' : 'outline'}
                      className="flex flex-col gap-1 h-auto py-3"
                      onClick={() => setPaymentMethod('transfer')}
                    >
                      <CreditCard className="w-5 h-5" />
                      <span className="text-xs">Transfer</span>
                    </Button>
                    <Button
                      type="button"
                      variant={paymentMethod === 'qris' ? 'default' : 'outline'}
                      className="flex flex-col gap-1 h-auto py-3"
                      onClick={() => setPaymentMethod('qris')}
                    >
                      <Smartphone className="w-5 h-5" />
                      <span className="text-xs">QRIS</span>
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Jumlah"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={addPayment} variant="secondary">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {payments.length > 0 && (
                  <div className="space-y-2 p-3 bg-muted rounded-lg">
                    {payments.map((p, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="capitalize">{p.method}</span>
                        <span>Rp {p.amount.toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 flex justify-between font-medium">
                      <span>Total Dibayar</span>
                      <span>Rp {totalPaid.toLocaleString()}</span>
                    </div>
                    {remainingAmount > 0 && (
                      <div className="flex justify-between text-sm text-destructive">
                        <span>Sisa</span>
                        <span>Rp {remainingAmount.toLocaleString()}</span>
                      </div>
                    )}
                    {remainingAmount < 0 && (
                      <div className="flex justify-between text-sm text-success">
                        <span>Kembalian</span>
                        <span>Rp {Math.abs(remainingAmount).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {!isEnabled('multiPayment') && (
              <div className="space-y-2">
                <Label>Jumlah Bayar</Label>
                <Input
                  type="number"
                  value={paidAmount}
                  onChange={(e) => {
                    setPaidAmount(e.target.value);
                    setPayments([{ method: 'cash', amount: parseFloat(e.target.value) || 0 }]);
                  }}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Batal
            </Button>
            <Button onClick={processPayment} disabled={totalPaid < cartTotal}>
              Proses Pembayaran
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Service Completion Dialog */}
      <ServiceCompletionDialog
        open={showServiceDialog}
        onOpenChange={setShowServiceDialog}
        serviceItems={pendingCompleteTransaction?.items.filter(i => i.itemType === 'service') || []}
        onComplete={handleServiceCompletion}
      />

      {/* Receipt Dialog */}
      <ReceiptDialog
        open={showReceiptDialog}
        onOpenChange={setShowReceiptDialog}
        transaction={completedTransaction}
      />

      {/* Transaction Detail Dialog */}
      <TransactionDetailDialog
        open={showDetailDialog}
        onOpenChange={setShowDetailDialog}
        transaction={viewingTransaction}
        onUpdateStatus={handleUpdateStatus}
      />
    </MainLayout>
  );
}
