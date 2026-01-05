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
  User,
  CreditCard,
  Banknote,
  Smartphone,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockProducts, mockCustomers } from '@/data/mockData';
import { useFeatureFlags } from '@/contexts/FeatureFlagsContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

interface POSTransaction {
  id: string;
  transactionNumber: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'in_progress' | 'completed';
  customerId?: string;
  customerName?: string;
  paymentMethod?: string;
  paidAmount: number;
  createdAt: string;
  updatedAt: string;
}

// Mock transactions for today
const mockTransactions: POSTransaction[] = [
  {
    id: '1',
    transactionNumber: 'POS-2026-001',
    items: [{ productId: '1', productName: 'Wireless Mouse', quantity: 2, price: 35.99, total: 71.98 }],
    subtotal: 71.98,
    tax: 7.20,
    total: 79.18,
    status: 'completed',
    customerName: 'Walk-in Customer',
    paymentMethod: 'cash',
    paidAmount: 79.18,
    createdAt: '2026-01-05T09:30:00',
    updatedAt: '2026-01-05T09:35:00',
  },
  {
    id: '2',
    transactionNumber: 'POS-2026-002',
    items: [
      { productId: '2', productName: 'USB-C Cable', quantity: 3, price: 15.99, total: 47.97 },
      { productId: '5', productName: 'Notebook A5', quantity: 5, price: 5.99, total: 29.95 },
    ],
    subtotal: 77.92,
    tax: 7.79,
    total: 85.71,
    status: 'in_progress',
    customerId: '1',
    customerName: 'Customer Alpha',
    paidAmount: 0,
    createdAt: '2026-01-05T10:15:00',
    updatedAt: '2026-01-05T10:15:00',
  },
  {
    id: '3',
    transactionNumber: 'POS-2026-003',
    items: [{ productId: '8', productName: 'Keyboard Mechanical', quantity: 1, price: 149.99, total: 149.99 }],
    subtotal: 149.99,
    tax: 15.00,
    total: 164.99,
    status: 'draft',
    paidAmount: 0,
    createdAt: '2026-01-05T11:00:00',
    updatedAt: '2026-01-05T11:00:00',
  },
];

const categories = ['Semua', 'Electronics', 'Furniture', 'Stationery', 'Beverages'];

export default function POS() {
  const { isEnabled } = useFeatureFlags();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [transactions] = useState<POSTransaction[]>(mockTransactions);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [paidAmount, setPaidAmount] = useState<string>('');

  // Filter products
  const filteredProducts = useMemo(() => {
    return mockProducts.filter(product => {
      const matchesCategory = selectedCategory === 'Semua' || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch && product.quantity > 0;
    });
  }, [selectedCategory, searchQuery]);

  // Cart calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const cartTax = cartSubtotal * 0.1;
  const cartTotal = cartSubtotal + cartTax;

  // Transaction counts
  const draftCount = transactions.filter(t => t.status === 'draft').length;
  const inProgressCount = transactions.filter(t => t.status === 'in_progress').length;
  const completedCount = transactions.filter(t => t.status === 'completed').length;

  const addToCart = (product: typeof mockProducts[0]) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
            : item
        );
      }
      return [...prev, {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        price: product.sellingPrice,
        total: product.sellingPrice,
      }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => 
      prev.map(item => {
        if (item.productId === productId) {
          const newQty = Math.max(0, item.quantity + delta);
          if (newQty === 0) return null;
          return { ...item, quantity: newQty, total: newQty * item.price };
        }
        return item;
      }).filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomer('');
    setCustomerName('');
  };

  const handlePayment = () => {
    if (cart.length === 0) {
      toast.error('Keranjang kosong');
      return;
    }
    setShowPaymentDialog(true);
    setPaidAmount(cartTotal.toFixed(2));
  };

  const processPayment = () => {
    const paid = parseFloat(paidAmount) || 0;
    if (paid < cartTotal) {
      toast.error('Jumlah pembayaran kurang');
      return;
    }

    const change = paid - cartTotal;
    toast.success(`Pembayaran berhasil! Kembalian: Rp ${change.toFixed(2)}`);
    setShowPaymentDialog(false);
    clearCart();
  };

  const saveDraft = () => {
    if (cart.length === 0) {
      toast.error('Keranjang kosong');
      return;
    }
    toast.success('Transaksi disimpan sebagai draft');
    clearCart();
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
          {/* Today's Transactions Summary */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-muted">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Draft</p>
                  <p className="text-lg font-semibold">{draftCount}</p>
                </div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-warning/10">
                  <Clock className="w-4 h-4 text-warning" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                  <p className="text-lg font-semibold">{inProgressCount}</p>
                </div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-success/10">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Selesai</p>
                  <p className="text-lg font-semibold">{completedCount}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Search & Categories */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari produk..."
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
                      className="cursor-pointer hover:border-primary transition-colors"
                      onClick={() => addToCart(product)}
                    >
                      <CardContent className="p-3">
                        <div className="aspect-square bg-muted rounded-lg mb-2 flex items-center justify-center">
                          <ShoppingCart className="w-8 h-8 text-muted-foreground/50" />
                        </div>
                        <h4 className="font-medium text-sm truncate">{product.name}</h4>
                        <p className="text-xs text-muted-foreground">{product.sku}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-semibold text-primary">
                            Rp {product.sellingPrice.toLocaleString()}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {product.quantity}
                          </Badge>
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
                    <div key={item.productId} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">
                          Rp {item.price.toLocaleString()} x {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.productId, -1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.productId, 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive"
                          onClick={() => removeFromCart(item.productId)}
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
              <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                <span>Total</span>
                <span className="text-primary">Rp {cartTotal.toLocaleString()}</span>
              </div>
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
              <div className="space-y-2">
                <Label>Metode Pembayaran</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                    className="flex flex-col gap-1 h-auto py-3"
                    onClick={() => setPaymentMethod('cash')}
                  >
                    <Banknote className="w-5 h-5" />
                    <span className="text-xs">Cash</span>
                  </Button>
                  <Button
                    variant={paymentMethod === 'transfer' ? 'default' : 'outline'}
                    className="flex flex-col gap-1 h-auto py-3"
                    onClick={() => setPaymentMethod('transfer')}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span className="text-xs">Transfer</span>
                  </Button>
                  <Button
                    variant={paymentMethod === 'qris' ? 'default' : 'outline'}
                    className="flex flex-col gap-1 h-auto py-3"
                    onClick={() => setPaymentMethod('qris')}
                  >
                    <Smartphone className="w-5 h-5" />
                    <span className="text-xs">QRIS</span>
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Jumlah Bayar</Label>
              <Input
                type="number"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                className="text-lg"
              />
            </div>

            {parseFloat(paidAmount) >= cartTotal && (
              <div className="flex justify-between p-3 rounded-lg bg-success/10 text-success">
                <span>Kembalian</span>
                <span className="font-semibold">
                  Rp {(parseFloat(paidAmount) - cartTotal).toLocaleString()}
                </span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Batal
            </Button>
            <Button onClick={processPayment}>
              Proses Pembayaran
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
