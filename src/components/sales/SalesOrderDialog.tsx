import { useState, useEffect } from 'react';
import { SalesOrder, SalesOrderItem, UnitType, UNIT_OPTIONS, Product } from '@/types/inventory';
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
import { Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SalesOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  onSave: (order: Omit<SalesOrder, 'id' | 'orderNumber'>) => void;
}

interface ItemInput {
  productId: string;
  quantity: number;
  unit: UnitType;
  customPrice?: number; // optional override for selling price
}

export function SalesOrderDialog({ open, onOpenChange, products, onSave }: SalesOrderDialogProps) {
  const [customerName, setCustomerName] = useState('');
  const [items, setItems] = useState<ItemInput[]>([{ productId: '', quantity: 1, unit: 'pcs' }]);

  useEffect(() => {
    if (open) {
      setCustomerName('');
      setItems([{ productId: '', quantity: 1, unit: 'pcs' }]);
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

    // Use custom price if set, otherwise use product's selling price
    const sellingPricePerPc = item.customPrice !== undefined 
      ? item.customPrice / pcsPerUnit 
      : product.sellingPrice;
    const costPricePerPc = product.costPrice;

    const sellingPrice = sellingPricePerPc * pcsPerUnit; // price per unit (box, dozen, etc.)
    const costPrice = costPricePerPc * pcsPerUnit;

    const revenue = item.quantity * sellingPrice;
    const cost = item.quantity * costPrice;
    const margin = revenue - cost;
    const marginPct = revenue > 0 ? (margin / revenue) * 100 : 0;

    // Check if enough stock
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

  const totalRevenue = validItems.reduce((sum, x) => sum + (x.details?.revenue || 0), 0);
  const totalCost = validItems.reduce((sum, x) => sum + (x.details?.cost || 0), 0);
  const totalMargin = totalRevenue - totalCost;
  const marginPercentage = totalRevenue > 0 ? (totalMargin / totalRevenue) * 100 : 0;

  const canSubmit = customerName.trim() && validItems.length > 0 && 
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
      customerName,
      items: orderItems,
      totalRevenue,
      totalCost,
      totalMargin,
      marginPercentage,
      status: 'pending',
      orderDate: new Date().toISOString().split('T')[0],
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Sales Order</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Name */}
          <div className="space-y-2">
            <Label>Customer Name</Label>
            <Input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter customer name"
              required
            />
          </div>

          {/* Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Items</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-1">
                <Plus className="w-4 h-4" />
                Add Item
              </Button>
            </div>

            {items.map((item, index) => {
              const details = calculateItemDetails(item);
              return (
                <div key={index} className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      {/* Product */}
                      <Select
                        value={item.productId}
                        onValueChange={(v) => updateItem(index, 'productId', v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                          {products.filter(p => p.quantity > 0).map((prod) => (
                            <SelectItem key={prod.id} value={prod.id}>
                              {prod.name} (Stock: {prod.quantity})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Quantity */}
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        placeholder="Qty"
                      />

                      {/* Unit */}
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

                  {/* Custom Price Override (optional) */}
                  {details && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Selling Price per {item.unit} (optional override)
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.customPrice ?? ''}
                          onChange={(e) => updateItem(index, 'customPrice', e.target.value ? parseFloat(e.target.value) : undefined as any)}
                          placeholder={`Default: $${details.sellingPrice.toFixed(2)}`}
                        />
                      </div>
                    </div>
                  )}

                  {/* Item calculations */}
                  {details && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Total Pcs:</span>
                        <span className={cn(
                          "ml-1 font-medium",
                          !details.hasEnoughStock && "text-destructive"
                        )}>
                          {details.totalPcs}
                          {!details.hasEnoughStock && " (insufficient)"}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Revenue:</span>
                        <span className="ml-1 font-medium">${details.revenue.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Cost:</span>
                        <span className="ml-1 font-medium">${details.cost.toFixed(2)}</span>
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
                          ${details.margin.toFixed(2)} ({details.marginPct.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Summary */}
          {validItems.length > 0 && (
            <div className="bg-primary/5 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Revenue:</span>
                <span className="font-semibold">${totalRevenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Cost:</span>
                <span className="font-medium">${totalCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="font-medium">Total Margin:</span>
                <span className={cn(
                  "font-bold text-lg flex items-center gap-1",
                  totalMargin >= 0 ? "text-success" : "text-destructive"
                )}>
                  {totalMargin >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  ${totalMargin.toFixed(2)} ({marginPercentage.toFixed(1)}%)
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              Create Sales Order
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
