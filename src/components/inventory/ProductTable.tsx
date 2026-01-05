import { useState } from 'react';
import { Product, UNIT_OPTIONS } from '@/types/inventory';
import { mockProducts as initialProducts } from '@/data/mockData';
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
import { Edit, Trash2, Search, Plus, ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductDialog } from './ProductDialog';
import { DeleteProductDialog } from './DeleteProductDialog';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { useActivityLog } from '@/hooks/useActivityLog';

const getStockStatus = (product: Product) => {
  if (product.quantity === 0) return 'out-of-stock';
  if (product.quantity <= product.minStock) return 'low-stock';
  return 'in-stock';
};

const stockStyles = {
  'in-stock': 'bg-success/10 text-success border-success/20',
  'low-stock': 'bg-warning/10 text-warning border-warning/20',
  'out-of-stock': 'bg-destructive/10 text-destructive border-destructive/20',
};

export function ProductTable() {
  const { language, formatCurrency } = useLanguage();
  const { logActivity } = useActivityLog();
  const [products, setProducts] = useState<(Product & { imageUrl?: string })[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const categories = [...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const stockLabels = {
    'in-stock': language === 'id' ? 'Tersedia' : 'In Stock',
    'low-stock': language === 'id' ? 'Stok Menipis' : 'Low Stock',
    'out-of-stock': language === 'id' ? 'Habis' : 'Out of Stock',
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setDialogOpen(true);
  };

  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleSaveProduct = (productData: Omit<Product, 'id' | 'lastUpdated'> & { imageUrl?: string }) => {
    if (selectedProduct) {
      setProducts(products.map(p => 
        p.id === selectedProduct.id 
          ? { ...p, ...productData, lastUpdated: new Date().toISOString().split('T')[0] }
          : p
      ));
      logActivity({
        action: 'update',
        entityType: 'product',
        entityId: selectedProduct.id,
        entityName: productData.name,
        details: { sku: productData.sku, category: productData.category },
      });
      toast.success(language === 'id' ? 'Produk berhasil diperbarui' : 'Product updated successfully');
    } else {
      const newProduct = {
        ...productData,
        id: Date.now().toString(),
        lastUpdated: new Date().toISOString().split('T')[0],
      };
      setProducts([...products, newProduct]);
      logActivity({
        action: 'create',
        entityType: 'product',
        entityId: newProduct.id,
        entityName: productData.name,
        details: { sku: productData.sku, category: productData.category },
      });
      toast.success(language === 'id' ? 'Produk berhasil ditambahkan' : 'Product added successfully');
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedProduct) {
      setProducts(products.filter(p => p.id !== selectedProduct.id));
      logActivity({
        action: 'delete',
        entityType: 'product',
        entityId: selectedProduct.id,
        entityName: selectedProduct.name,
      });
      toast.success(language === 'id' ? 'Produk berhasil dihapus' : 'Product deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedProduct(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={language === 'id' ? 'Cari produk...' : 'Search products...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder={language === 'id' ? 'Semua Kategori' : 'All Categories'} />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="all">{language === 'id' ? 'Semua Kategori' : 'All Categories'}</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button className="gap-2" onClick={handleAddProduct}>
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">{language === 'id' ? 'Tambah Produk' : 'Add Product'}</span>
          <span className="sm:hidden">{language === 'id' ? 'Tambah' : 'Add'}</span>
        </Button>
      </div>

      {/* Mobile Card View */}
      <div className="block lg:hidden space-y-3">
        {filteredProducts.map((product) => {
          const status = getStockStatus(product);
          return (
            <div key={product.id} className="bg-card rounded-lg border p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">{product.sku}</p>
                  <Badge variant="secondary" className="text-xs mt-1">{product.category}</Badge>
                </div>
                <Badge variant="outline" className={cn(stockStyles[status], "shrink-0")}>
                  {stockLabels[status]}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">{language === 'id' ? 'Stok:' : 'Stock:'}</span>
                  <span className={cn(
                    "ml-1 font-medium",
                    status === 'out-of-stock' && "text-destructive",
                    status === 'low-stock' && "text-warning"
                  )}>
                    {product.quantity}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">{language === 'id' ? 'Harga:' : 'Price:'}</span>
                  <span className="ml-1 font-medium text-success">{formatCurrency(product.sellingPrice)}</span>
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2 border-t">
                <Button variant="ghost" size="sm" onClick={() => handleEditProduct(product)}>
                  <Edit className="w-4 h-4 mr-1" />
                  {language === 'id' ? 'Edit' : 'Edit'}
                </Button>
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteClick(product)}>
                  <Trash2 className="w-4 h-4 mr-1" />
                  {language === 'id' ? 'Hapus' : 'Delete'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-12"></TableHead>
              <TableHead>{language === 'id' ? 'Produk' : 'Product'}</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>{language === 'id' ? 'Kategori' : 'Category'}</TableHead>
              <TableHead className="text-right">{language === 'id' ? 'Jumlah' : 'Quantity'}</TableHead>
              <TableHead>{language === 'id' ? 'Satuan' : 'Unit'}</TableHead>
              <TableHead className="text-right">{language === 'id' ? 'Harga' : 'Price'}</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">{language === 'id' ? 'Aksi' : 'Actions'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => {
              const status = getStockStatus(product);
              return (
                <TableRow key={product.id} className="table-row-hover">
                  <TableCell>
                    <div className="w-10 h-10 rounded bg-muted flex items-center justify-center overflow-hidden">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell className="text-right">
                    <span className={cn(
                      "font-medium",
                      status === 'out-of-stock' && "text-destructive",
                      status === 'low-stock' && "text-warning"
                    )}>
                      {product.quantity}
                    </span>
                    <span className="text-muted-foreground"> / {product.minStock}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {product.unit}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="text-xs">
                      <div>{language === 'id' ? 'Beli:' : 'Cost:'} {formatCurrency(product.costPrice)}</div>
                      <div className="text-success">{language === 'id' ? 'Jual:' : 'Sell:'} {formatCurrency(product.sellingPrice)}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(stockStyles[status])}>
                      {stockLabels[status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleEditProduct(product)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDeleteClick(product)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Dialogs */}
      <ProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={selectedProduct}
        onSave={handleSaveProduct}
      />
      <DeleteProductDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        product={selectedProduct}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
