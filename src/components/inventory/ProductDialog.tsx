import { useState, useEffect, useRef } from 'react';
import { Product, UnitType, UNIT_OPTIONS } from '@/types/inventory';
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
import { ImagePlus, Trash2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSave: (product: Omit<Product, 'id' | 'lastUpdated'> & { imageUrl?: string }) => void;
}

const categories = ['Electronics', 'Furniture', 'Stationery', 'Office Supplies', 'Beverages'];
const suppliers = ['TechSupply Co.', 'Office Plus', 'LightWorld', 'Paper House', 'Fresh Supplies'];

export function ProductDialog({ open, onOpenChange, product, onSave }: ProductDialogProps) {
  const { language, formatCurrency } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    quantity: 0,
    minStock: 0,
    costPrice: 0,
    sellingPrice: 0,
    unit: 'pcs' as UnitType,
    supplier: '',
    imageUrl: '',
  });
  
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        sku: product.sku,
        category: product.category,
        quantity: product.quantity,
        minStock: product.minStock,
        costPrice: product.costPrice,
        sellingPrice: product.sellingPrice,
        unit: product.unit,
        supplier: product.supplier,
        imageUrl: (product as any).imageUrl || '',
      });
      setPreviewUrl((product as any).imageUrl || '');
    } else {
      setFormData({
        name: '',
        sku: '',
        category: '',
        quantity: 0,
        minStock: 0,
        costPrice: 0,
        sellingPrice: 0,
        unit: 'pcs',
        supplier: '',
        imageUrl: '',
      });
      setPreviewUrl('');
    }
  }, [product, open]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: language === 'id' ? 'Error' : 'Error',
        description: language === 'id' ? 'File harus berupa gambar' : 'File must be an image',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: language === 'id' ? 'Error' : 'Error',
        description: language === 'id' ? 'Ukuran file maksimal 5MB' : 'File size must be less than 5MB',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      setFormData({ ...formData, imageUrl: publicUrl });
      setPreviewUrl(publicUrl);
      
      toast({
        title: language === 'id' ? 'Berhasil' : 'Success',
        description: language === 'id' ? 'Gambar berhasil diunggah' : 'Image uploaded successfully',
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: language === 'id' ? 'Error' : 'Error',
        description: language === 'id' ? 'Gagal mengunggah gambar' : 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, imageUrl: '' });
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product 
              ? (language === 'id' ? 'Edit Produk' : 'Edit Product')
              : (language === 'id' ? 'Tambah Produk Baru' : 'Add New Product')}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>{language === 'id' ? 'Gambar Produk' : 'Product Image'}</Label>
            <div className="flex items-center gap-4">
              <div 
                className="w-24 h-24 border-2 border-dashed border-border rounded-lg flex items-center justify-center overflow-hidden bg-muted/50 cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImagePlus className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading 
                    ? (language === 'id' ? 'Mengunggah...' : 'Uploading...') 
                    : (language === 'id' ? 'Pilih Gambar' : 'Choose Image')}
                </Button>
                {previewUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveImage}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    {language === 'id' ? 'Hapus' : 'Remove'}
                  </Button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">{language === 'id' ? 'Nama Produk' : 'Product Name'}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">{language === 'id' ? 'Kategori' : 'Category'}</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={language === 'id' ? 'Pilih kategori' : 'Select category'} />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier">{language === 'id' ? 'Pemasok' : 'Supplier'}</Label>
              <Select
                value={formData.supplier}
                onValueChange={(value) => setFormData({ ...formData, supplier: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={language === 'id' ? 'Pilih pemasok' : 'Select supplier'} />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {suppliers.map((sup) => (
                    <SelectItem key={sup} value={sup}>{sup}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unit">{language === 'id' ? 'Satuan Dasar' : 'Base Unit'}</Label>
              <Select
                value={formData.unit}
                onValueChange={(value) => setFormData({ ...formData, unit: value as UnitType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {UNIT_OPTIONS.map((u) => (
                    <SelectItem key={u.type} value={u.type}>{u.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="costPrice">{language === 'id' ? 'Harga Beli (Rp)' : 'Cost Price (Rp)'}</Label>
              <Input
                id="costPrice"
                type="number"
                min="0"
                step="100"
                value={formData.costPrice}
                onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sellingPrice">{language === 'id' ? 'Harga Jual (Rp)' : 'Selling Price (Rp)'}</Label>
            <Input
              id="sellingPrice"
              type="number"
              min="0"
              step="100"
              value={formData.sellingPrice}
              onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
              required
            />
            {formData.costPrice > 0 && formData.sellingPrice > 0 && (
              <p className="text-xs text-muted-foreground">
                {language === 'id' ? 'Margin:' : 'Margin:'} {formatCurrency(formData.sellingPrice - formData.costPrice)} 
                ({((formData.sellingPrice - formData.costPrice) / formData.sellingPrice * 100).toFixed(1)}%)
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">{language === 'id' ? 'Stok Saat Ini' : 'Current Stock'}</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minStock">{language === 'id' ? 'Stok Minimum' : 'Min Stock Level'}</Label>
              <Input
                id="minStock"
                type="number"
                min="0"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                required
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {language === 'id' ? 'Batal' : 'Cancel'}
            </Button>
            <Button type="submit">
              {product 
                ? (language === 'id' ? 'Simpan Perubahan' : 'Save Changes')
                : (language === 'id' ? 'Tambah Produk' : 'Add Product')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
