import { useState, useEffect } from 'react';
import { PurchaseOrder, PurchaseOrderItem, UnitType, UNIT_OPTIONS } from '@/types/inventory';
import { mockProducts, mockSuppliers } from '@/data/mockData';
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
import { Plus, Trash2, Building2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface PurchaseOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (order: Omit<PurchaseOrder, 'id' | 'orderNumber'>) => void;
}

const PAYMENT_METHODS = [
  { value: 'cash', labelId: 'Tunai', labelEn: 'Cash' },
  { value: 'bank_transfer', labelId: 'Transfer Bank', labelEn: 'Bank Transfer' },
  { value: 'credit_card', labelId: 'Kartu Kredit', labelEn: 'Credit Card' },
  { value: 'debit_card', labelId: 'Kartu Debit', labelEn: 'Debit Card' },
  { value: 'giro', labelId: 'Giro', labelEn: 'Giro' },
  { value: 'credit', labelId: 'Kredit/Tempo', labelEn: 'Credit/Terms' },
];

export function PurchaseOrderDialog({ open, onOpenChange, onSave }: PurchaseOrderDialogProps) {
  const { language, formatCurrency } = useLanguage();
  const [supplierMode, setSupplierMode] = useState<'select' | 'manual'>('select');
  const [supplierId, setSupplierId] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [items, setItems] = useState<PurchaseOrderItem[]>([]);

  // Tax & Discount
  const [enableTax, setEnableTax] = useState(true);
  const [taxRate, setTaxRate] = useState(11);
  const [enableDiscount, setEnableDiscount] = useState(false);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState(0);

  useEffect(() => {
    if (open) {
      setSupplierMode('select');
      setSupplierId('');
      setSupplierName('');
      setExpectedDate('');
      setNotes('');
      setPaymentMethod('bank_transfer');
      setItems([]);
      setEnableTax(true);
      setTaxRate(11);
      setEnableDiscount(false);
      setDiscountType('percentage');
      setDiscountValue(0);
    }
  }, [open]);

  const finalSupplier = supplierMode === 'select'
    ? mockSuppliers.find(s => s.id === supplierId)?.name || ''
    : supplierName.trim();

  const addItem = () => {
    setItems([...items, { 
      productId: '', 
      productName: '', 
      quantity: 1, 
      unit: 'pcs',
      pcsPerUnit: 1,
      unitPrice: 0,
      totalPcs: 1,
      costPerPc: 0,
    }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof PurchaseOrderItem | 'customPcsPerUnit', value: string | number) => {
    const newItems = [...items];
    const currentItem = newItems[index];
    
    if (field === 'productId') {
      const product = mockProducts.find(p => p.id === value);
      if (product) {
        const pcsPerUnit = currentItem.pcsPerUnit || 1;
        const unitPrice = product.costPrice * pcsPerUnit;
        newItems[index] = {
          ...currentItem,
          productId: value as string,
          productName: product.name,
          unitPrice,
          totalPcs: currentItem.quantity * pcsPerUnit,
          costPerPc: product.costPrice,
        };
      }
    } else if (field === 'unit') {
      const unitInfo = UNIT_OPTIONS.find(u => u.type === value);
      const product = mockProducts.find(p => p.id === currentItem.productId);
      if (unitInfo && product) {
        // Set default pcsPerUnit from unit option, but allow custom override
        newItems[index] = {
          ...currentItem,
          unit: value as UnitType,
          pcsPerUnit: unitInfo.pcsPerUnit,
          unitPrice: product.costPrice * unitInfo.pcsPerUnit,
          totalPcs: currentItem.quantity * unitInfo.pcsPerUnit,
          costPerPc: product.costPrice,
        };
      }
    } else if (field === 'customPcsPerUnit') {
      // Allow custom pcs per unit input
      const customPcs = typeof value === 'number' ? value : parseInt(value as string) || 1;
      const product = mockProducts.find(p => p.id === currentItem.productId);
      if (product) {
        newItems[index] = {
          ...currentItem,
          pcsPerUnit: customPcs,
          unitPrice: product.costPrice * customPcs,
          totalPcs: currentItem.quantity * customPcs,
          costPerPc: product.costPrice,
        };
      } else {
        newItems[index] = {
          ...currentItem,
          pcsPerUnit: customPcs,
          totalPcs: currentItem.quantity * customPcs,
          costPerPc: currentItem.unitPrice / customPcs,
        };
      }
    } else if (field === 'quantity') {
      const qty = typeof value === 'number' ? value : parseInt(value as string) || 1;
      newItems[index] = {
        ...currentItem,
        quantity: qty,
        totalPcs: qty * currentItem.pcsPerUnit,
      };
    } else if (field === 'unitPrice') {
      const price = typeof value === 'number' ? value : parseFloat(value as string) || 0;
      newItems[index] = {
        ...currentItem,
        unitPrice: price,
        costPerPc: price / currentItem.pcsPerUnit,
      };
    }
    
    setItems(newItems);
  };

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const discountAmount = enableDiscount 
    ? (discountType === 'percentage' ? (subtotal * discountValue / 100) : discountValue)
    : 0;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = enableTax ? (taxableAmount * taxRate / 100) : 0;
  const totalAmount = taxableAmount + taxAmount;
  const totalPcs = items.reduce((sum, item) => sum + item.totalPcs, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || !finalSupplier) return;
    
    onSave({
      supplier: finalSupplier,
      items,
      totalAmount,
      status: 'pending',
      orderDate: new Date().toISOString().split('T')[0],
      expectedDate,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {language === 'id' ? 'Buat Pesanan Pembelian' : 'Create Purchase Order'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Supplier Selection */}
          <div className="space-y-2">
            <Label>{language === 'id' ? 'Pemasok' : 'Supplier'}</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              <Button
                type="button"
                variant={supplierMode === 'select' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSupplierMode('select')}
              >
                <Building2 className="w-4 h-4 mr-1" />
                {language === 'id' ? 'Pilih dari daftar' : 'Select from list'}
              </Button>
              <Button
                type="button"
                variant={supplierMode === 'manual' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSupplierMode('manual')}
              >
                {language === 'id' ? 'Isi manual' : 'Enter manually'}
              </Button>
            </div>
            
            {supplierMode === 'select' ? (
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger>
                  <SelectValue placeholder={language === 'id' ? 'Pilih pemasok' : 'Select supplier'} />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {mockSuppliers.filter(s => s.status === 'active').map((sup) => (
                    <SelectItem key={sup.id} value={sup.id}>{sup.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                placeholder={language === 'id' ? 'Masukkan nama pemasok' : 'Enter supplier name'}
                required={supplierMode === 'manual'}
              />
            )}
          </div>

          {/* Expected Date & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{language === 'id' ? 'Tanggal Diharapkan' : 'Expected Delivery Date'}</Label>
              <Input
                type="date"
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
                required
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

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>{language === 'id' ? 'Item Pesanan' : 'Order Items'}</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="w-4 h-4 mr-1" /> {language === 'id' ? 'Tambah' : 'Add Item'}
              </Button>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                {language === 'id' 
                  ? 'Klik "Tambah" untuk menambahkan produk' 
                  : 'Click "Add Item" to add products to this order'}
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item, index) => {
                  const lineTotal = item.quantity * item.unitPrice;
                  return (
                    <div key={index} className="p-3 sm:p-4 bg-muted/50 rounded-lg space-y-3">
                      <div className="flex gap-3 items-end">
                        <div className="flex-1 space-y-1">
                          <Label className="text-xs">{language === 'id' ? 'Produk' : 'Product'}</Label>
                          <Select
                            value={item.productId}
                            onValueChange={(value) => updateItem(index, 'productId', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={language === 'id' ? 'Pilih produk' : 'Select product'} />
                            </SelectTrigger>
                            <SelectContent className="bg-popover">
                              {mockProducts.map((prod) => (
                                <SelectItem key={prod.id} value={prod.id}>
                                  {prod.name} ({formatCurrency(prod.costPrice)}/pcs)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">{language === 'id' ? 'Jumlah' : 'Quantity'}</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">{language === 'id' ? 'Satuan' : 'Unit'}</Label>
                          <Select
                            value={item.unit}
                            onValueChange={(value) => updateItem(index, 'unit', value)}
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
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">{language === 'id' ? 'Pcs/Unit' : 'Pcs/Unit'}</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.pcsPerUnit}
                            onChange={(e) => updateItem(index, 'customPcsPerUnit', parseInt(e.target.value) || 1)}
                            placeholder="e.g. 12"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">{language === 'id' ? `Harga/${item.unit}` : `Price/${item.unit}`}</Label>
                          <Input
                            type="number"
                            step="100"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">{language === 'id' ? 'Subtotal' : 'Subtotal'}</Label>
                          <div className="h-9 flex items-center px-3 bg-background rounded-md border font-medium text-sm">
                            {formatCurrency(lineTotal)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground flex flex-wrap gap-4 pt-1">
                        <span>Total pcs: <strong>{item.totalPcs}</strong></span>
                        {item.costPerPc > 0 && (
                          <span>{language === 'id' ? 'Biaya/pcs:' : 'Cost/pc:'} <strong>{formatCurrency(item.costPerPc)}</strong></span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tax & Discount */}
          {items.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
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
          )}

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
          {items.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 border-t bg-muted/30 rounded-lg p-4 gap-4">
              <div className="text-sm text-muted-foreground">
                {language === 'id' ? 'Total Item:' : 'Total Items:'} <strong>{items.length}</strong> | 
                Total Pcs: <strong>{totalPcs.toLocaleString()}</strong>
              </div>
              <div className="text-right space-y-1">
                <div className="text-sm text-muted-foreground">
                  Subtotal: {formatCurrency(subtotal)}
                </div>
                {enableDiscount && discountAmount > 0 && (
                  <div className="text-sm text-destructive">
                    {language === 'id' ? 'Diskon:' : 'Discount:'} -{formatCurrency(discountAmount)}
                  </div>
                )}
                {enableTax && (
                  <div className="text-sm text-muted-foreground">
                    PPN ({taxRate}%): {formatCurrency(taxAmount)}
                  </div>
                )}
                <p className="text-xl font-bold">{formatCurrency(totalAmount)}</p>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {language === 'id' ? 'Batal' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={items.length === 0 || !finalSupplier}>
              {language === 'id' ? 'Buat Pesanan' : 'Create Order'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
