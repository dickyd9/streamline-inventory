import { useState, useEffect } from 'react';
import { SalesOrder, SalesOrderItem, UnitType, UNIT_OPTIONS, Product, Customer } from '@/types/inventory';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, TrendingUp, TrendingDown, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface SalesOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  customers: Customer[];
  onSave: (order: Omit<SalesOrder, 'id' | 'orderNumber'>) => void;
}

interface ItemInput {
  productId: string;
  quantity: number;
  unit: UnitType;
  customPrice?: number;
}

const PAYMENT_METHODS = [
  { value: 'cash', labelId: 'Tunai', labelEn: 'Cash' },
  { value: 'bank_transfer', labelId: 'Transfer Bank', labelEn: 'Bank Transfer' },
  { value: 'credit_card', labelId: 'Kartu Kredit', labelEn: 'Credit Card' },
  { value: 'debit_card', labelId: 'Kartu Debit', labelEn: 'Debit Card' },
  { value: 'e_wallet', labelId: 'E-Wallet', labelEn: 'E-Wallet' },
  { value: 'qris', labelId: 'QRIS', labelEn: 'QRIS' },
  { value: 'credit', labelId: 'Kredit/Tempo', labelEn: 'Credit/Terms' },
];

export function SalesOrderDialog({ open, onOpenChange, products, customers, onSave }: SalesOrderDialogProps) {
  const { language, formatCurrency } = useLanguage();
  const [customerMode, setCustomerMode] = useState<'select' | 'manual'>('select');
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [items, setItems] = useState<ItemInput[]>([{ productId: '', quantity: 1, unit: 'pcs' }]);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  
  // Tax & Discount (Indonesian compliance)
  const [enableTax, setEnableTax] = useState(true);
  const [taxRate, setTaxRate] = useState(11); // PPN 11%
  const [enableDiscount, setEnableDiscount] = useState(false);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState(0);

  useEffect(() => {
    if (open) {
      setCustomerMode('select');
      setCustomerId('');
      setCustomerName('');
      setItems([{ productId: '', quantity: 1, unit: 'pcs' }]);
      setDueDate('');
      setNotes('');
      setPaymentMethod('cash');
      setEnableTax(true);
      setTaxRate(11);
      setEnableDiscount(false);
      setDiscountType('percentage');
      setDiscountValue(0);
    }
  }, [open]);

  const addItem = () => {
    setItems([...items, { productId: '', quantity: 1, unit: 'pcs' }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof ItemInput, value: string | number) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const calculateItemDetails = (item: ItemInput) => {
    const product = products.find(p => p.id === item.productId);
    if (!product) return null;

    const unitInfo = UNIT_OPTIONS.find(u => u.type === item.unit);
    const pcsPerUnit = unitInfo?.pcsPerUnit || 1;
    const totalPcs = item.quantity * pcsPerUnit;

    const sellingPricePerPc = item.customPrice !== undefined 
      ? item.customPrice / pcsPerUnit 
      : product.sellingPrice;
    const costPricePerPc = product.costPrice;

    const sellingPrice = sellingPricePerPc * pcsPerUnit;
    const costPrice = costPricePerPc * pcsPerUnit;

    const revenue = item.quantity * sellingPrice;
    const cost = item.quantity * costPrice;
    const margin = revenue - cost;
    const marginPct = revenue > 0 ? (margin / revenue) * 100 : 0;

    const hasEnoughStock = product.quantity >= totalPcs;

    return {
      product,
      pcsPerUnit,
      totalPcs,
      sellingPrice,
      costPrice,
      sellingPricePerPc,
      costPricePerPc,
      revenue,
      cost,
      margin,
      marginPct,
      hasEnoughStock,
    };
  };

  const validItems = items
    .map((item, index) => ({ item, index, details: calculateItemDetails(item) }))
    .filter(x => x.details !== null);

  const subtotal = validItems.reduce((sum, x) => sum + (x.details?.revenue || 0), 0);
  const totalCost = validItems.reduce((sum, x) => sum + (x.details?.cost || 0), 0);
  
  // Calculate discount
  const discountAmount = enableDiscount 
    ? (discountType === 'percentage' ? (subtotal * discountValue / 100) : discountValue)
    : 0;
  
  // Calculate tax on (subtotal - discount) - Indonesian PPN standard
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = enableTax ? (taxableAmount * taxRate / 100) : 0;
  
  const totalRevenue = taxableAmount + taxAmount;
  const totalMargin = totalRevenue - totalCost - taxAmount;
  const marginPercentage = totalRevenue > 0 ? (totalMargin / totalRevenue) * 100 : 0;

  const finalCustomerName = customerMode === 'select' 
    ? customers.find(c => c.id === customerId)?.name || ''
    : customerName.trim();

  const canSubmit = finalCustomerName && validItems.length > 0 && 
    validItems.every(x => x.details?.hasEnoughStock);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const orderItems: SalesOrderItem[] = validItems.map(({ item, details }) => ({
      productId: item.productId,
      productName: details!.product.name,
      quantity: item.quantity,
      unit: item.unit,
      pcsPerUnit: details!.pcsPerUnit,
      sellingPrice: details!.sellingPrice,
      costPrice: details!.costPrice,
      totalPcs: details!.totalPcs,
      revenue: details!.revenue,
      cost: details!.cost,
      margin: details!.margin,
    }));

    onSave({
      customerId: customerMode === 'select' ? customerId : undefined,
      customerName: finalCustomerName,
      items: orderItems,
      totalRevenue,
      totalCost,
      totalMargin,
      marginPercentage,
      status: 'pending',
      paymentStatus: 'unpaid',
      paidAmount: 0,
      orderDate: new Date().toISOString().split('T')[0],
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {language === 'id' ? 'Buat Pesanan Penjualan' : 'Create Sales Order'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Selection */}
          <div className="space-y-2">
            <Label>{language === 'id' ? 'Pelanggan' : 'Customer'}</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              <Button
                type="button"
                variant={customerMode === 'select' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCustomerMode('select')}
              >
                <User className="w-4 h-4 mr-1" />
                {language === 'id' ? 'Pilih dari daftar' : 'Select from list'}
              </Button>
              <Button
                type="button"
                variant={customerMode === 'manual' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCustomerMode('manual')}
              >
                {language === 'id' ? 'Isi manual' : 'Enter manually'}
              </Button>
            </div>
            
            {customerMode === 'select' ? (
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger>
                  <SelectValue placeholder={language === 'id' ? 'Pilih pelanggan' : 'Select customer'} />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {customers.filter(c => c.status === 'active').map((cust) => (
                    <SelectItem key={cust.id} value={cust.id}>
                      {cust.name} {cust.phone && `(${cust.phone})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder={language === 'id' ? 'Masukkan nama pelanggan' : 'Enter customer name'}
                required={customerMode === 'manual'}
              />
            )}
          </div>

          {/* Due Date & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{language === 'id' ? 'Jatuh Tempo' : 'Due Date'}</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'id' ? 'Metode Pembayaran' : 'Payment Method'}</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {language === 'id' ? method.labelId : method.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>{language === 'id' ? 'Item' : 'Items'}</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-1">
                <Plus className="w-4 h-4" />
                {language === 'id' ? 'Tambah' : 'Add Item'}
              </Button>
            </div>

            {items.map((item, index) => {
              const details = calculateItemDetails(item);
              const product = products.find(p => p.id === item.productId);
              return (
                <div key={index} className="bg-muted/50 rounded-lg p-3 sm:p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <Select
                        value={item.productId}
                        onValueChange={(v) => updateItem(index, 'productId', v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={language === 'id' ? 'Pilih produk' : 'Select product'} />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                          {products.filter(p => p.quantity > 0).map((prod) => (
                            <SelectItem key={prod.id} value={prod.id}>
                              {prod.name} (Stok: {prod.quantity})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        placeholder={language === 'id' ? 'Jumlah' : 'Qty'}
                      />

                      <Select
                        value={item.unit}
                        onValueChange={(v) => updateItem(index, 'unit', v as UnitType)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                          {UNIT_OPTIONS.map((u) => (
                            <SelectItem key={u.type} value={u.type}>
                              {u.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Custom price input */}
                      <div className="space-y-1">
                        <Input
                          type="number"
                          min="0"
                          step="100"
                          value={item.customPrice ?? ''}
                          onChange={(e) => updateItem(index, 'customPrice', e.target.value ? parseFloat(e.target.value) : '')}
                          placeholder={product ? formatCurrency(product.sellingPrice * (UNIT_OPTIONS.find(u => u.type === item.unit)?.pcsPerUnit || 1)) : (language === 'id' ? 'Harga' : 'Price')}
                          className="text-sm"
                        />
                        {product && (
                          <p className="text-xs text-muted-foreground">
                            {language === 'id' ? 'Rekomendasi:' : 'Suggested:'} {formatCurrency(product.sellingPrice * (UNIT_OPTIONS.find(u => u.type === item.unit)?.pcsPerUnit || 1))}/{item.unit}
                          </p>
                        )}
                      </div>
                    </div>
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {details && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Total Pcs:</span>
                        <span className={cn(
                          "ml-1 font-medium",
                          !details.hasEnoughStock && "text-destructive"
                        )}>
                          {details.totalPcs}
                          {!details.hasEnoughStock && (language === 'id' ? " (kurang)" : " (insufficient)")}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{language === 'id' ? 'Pendapatan:' : 'Revenue:'}</span>
                        <span className="ml-1 font-medium">{formatCurrency(details.revenue)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">{language === 'id' ? 'Biaya:' : 'Cost:'}</span>
                        <span className="ml-1 font-medium">{formatCurrency(details.cost)}</span>
                      </div>
                      <div className={cn(
                        "flex items-center gap-1",
                        details.margin >= 0 ? "text-success" : "text-destructive"
                      )}>
                        {details.margin >= 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        <span className="font-medium">
                          {formatCurrency(details.margin)} ({details.marginPct.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Tax & Discount Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
            {/* Tax */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>{language === 'id' ? 'PPN (Pajak)' : 'Tax (VAT)'}</Label>
                <Switch checked={enableTax} onCheckedChange={setEnableTax} />
              </div>
              {enableTax && (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                    className="w-20"
                  />
                  <span className="text-muted-foreground">%</span>
                </div>
              )}
            </div>

            {/* Discount */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>{language === 'id' ? 'Diskon' : 'Discount'}</Label>
                <Switch checked={enableDiscount} onCheckedChange={setEnableDiscount} />
              </div>
              {enableDiscount && (
                <div className="flex items-center gap-2">
                  <Select value={discountType} onValueChange={(v) => setDiscountType(v as 'percentage' | 'fixed')}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="percentage">%</SelectItem>
                      <SelectItem value="fixed">Rp</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min="0"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                    className="flex-1"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>{language === 'id' ? 'Catatan' : 'Notes'}</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={language === 'id' ? 'Catatan tambahan...' : 'Additional notes...'}
              rows={2}
            />
          </div>

          {/* Summary */}
          {validItems.length > 0 && (
            <div className="bg-primary/5 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              {enableDiscount && discountAmount > 0 && (
                <div className="flex justify-between text-sm text-destructive">
                  <span>{language === 'id' ? 'Diskon:' : 'Discount:'}</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              {enableTax && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">PPN ({taxRate}%):</span>
                  <span className="font-medium">{formatCurrency(taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t">
                <span className="font-medium">Total:</span>
                <span className="font-bold text-lg">{formatCurrency(totalRevenue)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="font-medium">{language === 'id' ? 'Margin:' : 'Margin:'}</span>
                <span className={cn(
                  "font-bold flex items-center gap-1",
                  totalMargin >= 0 ? "text-success" : "text-destructive"
                )}>
                  {totalMargin >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {formatCurrency(totalMargin)} ({marginPercentage.toFixed(1)}%)
                </span>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {language === 'id' ? 'Batal' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {language === 'id' ? 'Buat Pesanan' : 'Create Order'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
