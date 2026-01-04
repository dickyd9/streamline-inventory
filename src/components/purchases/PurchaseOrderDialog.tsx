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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';

interface PurchaseOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (order: Omit<PurchaseOrder, 'id' | 'orderNumber'>) => void;
}

export function PurchaseOrderDialog({ open, onOpenChange, onSave }: PurchaseOrderDialogProps) {
  const [supplier, setSupplier] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [items, setItems] = useState<PurchaseOrderItem[]>([]);

  useEffect(() => {
    if (open) {
      setSupplier('');
      setExpectedDate('');
      setItems([]);
    }
  }, [open]);

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

  const updateItem = (index: number, field: keyof PurchaseOrderItem, value: string | number) => {
    const newItems = [...items];
    const currentItem = newItems[index];
    
    if (field === 'productId') {
      const product = mockProducts.find(p => p.id === value);
      if (product) {
        const pcsPerUnit = UNIT_OPTIONS.find(u => u.type === currentItem.unit)?.pcsPerUnit || 1;
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
        const unitPrice = product.costPrice * unitInfo.pcsPerUnit;
        newItems[index] = {
          ...currentItem,
          unit: value as UnitType,
          pcsPerUnit: unitInfo.pcsPerUnit,
          unitPrice,
          totalPcs: currentItem.quantity * unitInfo.pcsPerUnit,
          costPerPc: product.costPrice,
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

  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const totalPcs = items.reduce((sum, item) => sum + item.totalPcs, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    
    onSave({
      supplier,
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
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Purchase Order</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Supplier</Label>
              <Select value={supplier} onValueChange={setSupplier}>
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {mockSuppliers.filter(s => s.status === 'active').map((sup) => (
                    <SelectItem key={sup.id} value={sup.name}>{sup.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Expected Delivery Date</Label>
              <Input
                type="date"
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Order Items</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="w-4 h-4 mr-1" /> Add Item
              </Button>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                Click "Add Item" to add products to this order
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item, index) => {
                  const lineTotal = item.quantity * item.unitPrice;
                  return (
                    <div key={index} className="p-4 bg-muted/50 rounded-lg space-y-3">
                      <div className="flex gap-3 items-end">
                        <div className="flex-1 space-y-1">
                          <Label className="text-xs">Product</Label>
                          <Select
                            value={item.productId}
                            onValueChange={(value) => updateItem(index, 'productId', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover">
                              {mockProducts.map((prod) => (
                                <SelectItem key={prod.id} value={prod.id}>
                                  {prod.name} (Cost: ${prod.costPrice.toFixed(2)}/pcs)
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
                      
                      <div className="grid grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Quantity</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Unit</Label>
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
                                  {u.label} ({u.pcsPerUnit} pcs)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Price per {item.unit}</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Line Total</Label>
                          <div className="h-9 flex items-center px-3 bg-background rounded-md border font-medium">
                            ${lineTotal.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      
                      {item.productId && (
                        <div className="text-xs text-muted-foreground flex gap-4">
                          <span>Pieces per {item.unit}: <strong>{item.pcsPerUnit}</strong></span>
                          <span>Total pieces: <strong>{item.totalPcs}</strong></span>
                          <span>Cost/pc: <strong>${item.costPerPc.toFixed(2)}</strong></span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {items.length > 0 && (
              <div className="flex justify-between items-center pt-4 border-t bg-muted/30 rounded-lg p-4">
                <div className="text-sm text-muted-foreground">
                  Total Items: <strong>{items.length}</strong> | 
                  Total Pieces: <strong>{totalPcs.toLocaleString()}</strong>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Grand Total</p>
                  <p className="text-2xl font-bold">${totalAmount.toFixed(2)}</p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={items.length === 0 || !supplier}>
              Create Order
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
