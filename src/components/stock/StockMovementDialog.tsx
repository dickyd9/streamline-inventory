import { useState, useEffect } from 'react';
import { StockMovement, StockMovementType, StockAdjustmentReason, UnitType, UNIT_OPTIONS, ADJUSTMENT_REASONS, Product } from '@/types/inventory';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface StockMovementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  onSave: (movement: Omit<StockMovement, 'id'>) => void;
}

export function StockMovementDialog({ open, onOpenChange, products, onSave }: StockMovementDialogProps) {
  const { formatCurrency, language } = useLanguage();
  const [movementType, setMovementType] = useState<StockMovementType>('in');
  const [adjustmentReason, setAdjustmentReason] = useState<StockAdjustmentReason>('correction');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState<UnitType>('pcs');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [customCostPerPc, setCustomCostPerPc] = useState<number | null>(null);

  const selectedProduct = products.find(p => p.id === productId);
  const selectedUnit = UNIT_OPTIONS.find(u => u.type === unit);
  const totalPcs = quantity * (selectedUnit?.pcsPerUnit || 1);
  const costPerPc = customCostPerPc ?? (selectedProduct?.costPrice || 0);
  const totalValue = totalPcs * costPerPc;

  // Filter adjustment reasons based on movement type
  const availableReasons = ADJUSTMENT_REASONS.filter(r => 
    r.direction === 'both' || r.direction === movementType
  );

  useEffect(() => {
    if (open) {
      setMovementType('in');
      setAdjustmentReason('correction');
      setProductId('');
      setQuantity(1);
      setUnit('pcs');
      setReference('');
      setNotes('');
      setCustomCostPerPc(null);
    }
  }, [open]);

  // Update adjustment reason when movement type changes
  useEffect(() => {
    const currentReasonValid = availableReasons.some(r => r.type === adjustmentReason);
    if (!currentReasonValid) {
      setAdjustmentReason(availableReasons[0]?.type || 'correction');
    }
  }, [movementType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !selectedUnit) return;

    onSave({
      productId,
      productName: selectedProduct.name,
      type: movementType,
      adjustmentReason,
      quantity,
      unit,
      pcsPerUnit: selectedUnit.pcsPerUnit,
      totalPcs,
      costPerPc,
      totalValue,
      sellingPricePerPc: movementType === 'out' ? selectedProduct.sellingPrice : undefined,
      totalRevenue: movementType === 'out' ? totalPcs * selectedProduct.sellingPrice : undefined,
      margin: movementType === 'out' ? (totalPcs * selectedProduct.sellingPrice) - totalValue : undefined,
      reference,
      notes,
      date: new Date().toISOString().split('T')[0],
      createdBy: 'Current User',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{language === 'id' ? 'Catat Pergerakan Stok' : 'Record Stock Movement'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Movement Type */}
          <div className="space-y-2">
            <Label>{language === 'id' ? 'Tipe Pergerakan' : 'Movement Type'}</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={movementType === 'in' ? 'default' : 'outline'}
                className={cn(
                  "flex-1 gap-2",
                  movementType === 'in' && "bg-success hover:bg-success/90"
                )}
                onClick={() => setMovementType('in')}
              >
                <ArrowDownCircle className="w-4 h-4" />
                {language === 'id' ? 'Stok Masuk' : 'Stock In'}
              </Button>
              <Button
                type="button"
                variant={movementType === 'out' ? 'default' : 'outline'}
                className={cn(
                  "flex-1 gap-2",
                  movementType === 'out' && "bg-destructive hover:bg-destructive/90"
                )}
                onClick={() => setMovementType('out')}
              >
                <ArrowUpCircle className="w-4 h-4" />
                {language === 'id' ? 'Stok Keluar' : 'Stock Out'}
              </Button>
            </div>
          </div>

          {/* Adjustment Reason */}
          <div className="space-y-2">
            <Label>{language === 'id' ? 'Alasan' : 'Reason'}</Label>
            <Select value={adjustmentReason} onValueChange={(v) => setAdjustmentReason(v as StockAdjustmentReason)}>
              <SelectTrigger>
                <SelectValue placeholder={language === 'id' ? 'Pilih alasan' : 'Select reason'} />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {availableReasons.map((reason) => (
                  <SelectItem key={reason.type} value={reason.type}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Product Selection */}
          <div className="space-y-2">
            <Label>{language === 'id' ? 'Produk' : 'Product'}</Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger>
                <SelectValue placeholder={language === 'id' ? 'Pilih produk' : 'Select product'} />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {products.map((prod) => (
                  <SelectItem key={prod.id} value={prod.id}>
                    {prod.name} (SKU: {prod.sku}) - {language === 'id' ? 'Stok' : 'Stock'}: {prod.quantity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quantity and Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{language === 'id' ? 'Jumlah' : 'Quantity'}</Label>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'id' ? 'Satuan' : 'Unit'}</Label>
              <Select value={unit} onValueChange={(v) => setUnit(v as UnitType)}>
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
          </div>

          {/* Cost per piece override for stock in */}
          {movementType === 'in' && selectedProduct && (
            <div className="space-y-2">
              <Label>{language === 'id' ? 'Harga per pcs (opsional)' : 'Cost per piece (optional override)'}</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={customCostPerPc ?? ''}
                onChange={(e) => setCustomCostPerPc(e.target.value ? parseFloat(e.target.value) : null)}
                placeholder={`Default: ${formatCurrency(selectedProduct.costPrice)}`}
              />
            </div>
          )}

          {/* Calculation Summary */}
          {selectedProduct && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{language === 'id' ? 'Pcs per satuan:' : 'Pieces per unit:'}</span>
                <span className="font-medium">{selectedUnit?.pcsPerUnit || 1}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{language === 'id' ? 'Total pcs:' : 'Total pieces:'}</span>
                <span className="font-medium">{totalPcs} pcs</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{language === 'id' ? 'Harga per pcs:' : 'Cost price (per pc):'}</span>
                <span className="font-medium">{formatCurrency(costPerPc)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="font-medium">{language === 'id' ? 'Total Nilai:' : 'Total Value:'}</span>
                <span className="font-bold text-lg">{formatCurrency(totalValue)}</span>
              </div>
              {movementType === 'out' && (
                <div className="flex justify-between text-sm text-success">
                  <span>{language === 'id' ? 'Pendapatan penjualan:' : 'Selling revenue:'}</span>
                  <span className="font-medium">{formatCurrency(totalPcs * selectedProduct.sellingPrice)}</span>
                </div>
              )}
              <div className={cn(
                "flex justify-between text-sm pt-2",
                movementType === 'in' ? "text-success" : "text-destructive"
              )}>
                <span>{language === 'id' ? `Stok baru setelah ${movementType === 'in' ? 'masuk' : 'keluar'}:` : `New stock after ${movementType === 'in' ? 'receiving' : 'issue'}:`}</span>
                <span className="font-medium">
                  {movementType === 'in' 
                    ? selectedProduct.quantity + totalPcs 
                    : Math.max(0, selectedProduct.quantity - totalPcs)
                  } pcs
                </span>
              </div>
            </div>
          )}

          {/* Reference */}
          <div className="space-y-2">
            <Label>{language === 'id' ? 'Referensi (No. PO, SO, atau ID)' : 'Reference (PO#, SO#, or ID)'}</Label>
            <Input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder={language === 'id' ? 'cth: PO-2026-001, ADJ-001' : 'e.g., PO-2026-001, ADJ-001'}
              required
            />
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {language === 'id' ? 'Batal' : 'Cancel'}
            </Button>
            <Button 
              type="submit" 
              disabled={!productId || quantity < 1}
              className={cn(
                movementType === 'in' ? "bg-success hover:bg-success/90" : "bg-destructive hover:bg-destructive/90"
              )}
            >
              {movementType === 'in' 
                ? (language === 'id' ? 'Catat Stok Masuk' : 'Record Stock In') 
                : (language === 'id' ? 'Catat Stok Keluar' : 'Record Stock Out')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
