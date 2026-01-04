import { useState } from 'react';
import { StockMovement, Product } from '@/types/inventory';
import { mockStockMovements as initialMovements, mockProducts } from '@/data/mockData';
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
import { ArrowDownCircle, ArrowUpCircle, Search, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StockMovementDialog } from './StockMovementDialog';
import { toast } from 'sonner';

export function StockMovementTable() {
  const [movements, setMovements] = useState<StockMovement[]>(initialMovements);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredMovements = movements
    .filter(movement => {
      const matchesSearch = 
        movement.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movement.reference.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || movement.type === typeFilter;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleAddMovement = (movementData: Omit<StockMovement, 'id'>) => {
    const newMovement: StockMovement = {
      ...movementData,
      id: Date.now().toString(),
    };
    setMovements([newMovement, ...movements]);
    
    // Update product stock
    setProducts(products.map(p => {
      if (p.id === movementData.productId) {
        const newQuantity = movementData.type === 'in'
          ? p.quantity + movementData.totalPcs
          : Math.max(0, p.quantity - movementData.totalPcs);
        return { ...p, quantity: newQuantity, lastUpdated: movementData.date };
      }
      return p;
    }));
    
    toast.success(`Stock ${movementData.type === 'in' ? 'received' : 'issued'}: ${movementData.totalPcs} pcs of ${movementData.productName}`);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by product or reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="in">Stock In</SelectItem>
            <SelectItem value="out">Stock Out</SelectItem>
          </SelectContent>
        </Select>
        <Button className="gap-2" onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4" />
          Record Movement
        </Button>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead className="text-right">Total Pcs</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMovements.map((movement) => (
              <TableRow key={movement.id} className="table-row-hover">
                <TableCell className="text-muted-foreground">{movement.date}</TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "gap-1",
                      movement.type === 'in' 
                        ? "bg-success/10 text-success border-success/20" 
                        : "bg-destructive/10 text-destructive border-destructive/20"
                    )}
                  >
                    {movement.type === 'in' ? (
                      <ArrowDownCircle className="w-3 h-3" />
                    ) : (
                      <ArrowUpCircle className="w-3 h-3" />
                    )}
                    {movement.type === 'in' ? 'IN' : 'OUT'}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{movement.productName}</TableCell>
                <TableCell className="text-right font-medium">{movement.quantity}</TableCell>
                <TableCell className="text-muted-foreground capitalize">{movement.unit}</TableCell>
                <TableCell className={cn(
                  "text-right font-semibold",
                  movement.type === 'in' ? "text-success" : "text-destructive"
                )}>
                  {movement.type === 'in' ? '+' : '-'}{movement.totalPcs}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {movement.reference}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-muted-foreground">
                  {movement.notes || '-'}
                </TableCell>
              </TableRow>
            ))}
            {filteredMovements.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No stock movements found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog */}
      <StockMovementDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        products={products}
        onSave={handleAddMovement}
      />
    </div>
  );
}
