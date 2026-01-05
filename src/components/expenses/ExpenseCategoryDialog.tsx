import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { usePermissions } from '@/hooks/usePermissions';

interface ExpenseCategory {
  id: string;
  name: string;
  description: string | null;
  is_default: boolean;
  is_active: boolean;
}

interface ExpenseCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: ExpenseCategory[];
  onCategoriesChange: () => void;
}

export function ExpenseCategoryDialog({ open, onOpenChange, categories, onCategoriesChange }: ExpenseCategoryDialogProps) {
  const { language } = useLanguage();
  const { isOwnerOrAdmin } = usePermissions();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error(language === 'id' ? 'Nama kategori wajib diisi' : 'Category name is required');
      return;
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from('expense_categories')
          .update({ name: formData.name, description: formData.description })
          .eq('id', editingId);
        
        if (error) throw error;
        toast.success(language === 'id' ? 'Kategori berhasil diperbarui' : 'Category updated');
      } else {
        const { error } = await supabase
          .from('expense_categories')
          .insert({ name: formData.name, description: formData.description });
        
        if (error) throw error;
        toast.success(language === 'id' ? 'Kategori berhasil ditambahkan' : 'Category added');
      }

      setIsAdding(false);
      setEditingId(null);
      setFormData({ name: '', description: '' });
      onCategoriesChange();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(language === 'id' ? 'Gagal menyimpan kategori' : 'Failed to save category');
    }
  };

  const handleEdit = (category: ExpenseCategory) => {
    setEditingId(category.id);
    setFormData({ name: category.name, description: category.description || '' });
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('expense_categories')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) throw error;
      toast.success(language === 'id' ? 'Kategori berhasil dihapus' : 'Category deleted');
      onCategoriesChange();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error(language === 'id' ? 'Gagal menghapus kategori' : 'Failed to delete category');
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '', description: '' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {language === 'id' ? 'Kelola Kategori Pengeluaran' : 'Manage Expense Categories'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isAdding ? (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <div className="space-y-2">
                <Label>{language === 'id' ? 'Nama Kategori' : 'Category Name'}</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={language === 'id' ? 'Nama kategori' : 'Category name'}
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'id' ? 'Deskripsi' : 'Description'}</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={language === 'id' ? 'Deskripsi (opsional)' : 'Description (optional)'}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave}>
                  {language === 'id' ? 'Simpan' : 'Save'}
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  {language === 'id' ? 'Batal' : 'Cancel'}
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => setIsAdding(true)} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              {language === 'id' ? 'Tambah Kategori' : 'Add Category'}
            </Button>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{language === 'id' ? 'Nama' : 'Name'}</TableHead>
                <TableHead>{language === 'id' ? 'Deskripsi' : 'Description'}</TableHead>
                <TableHead>{language === 'id' ? 'Tipe' : 'Type'}</TableHead>
                <TableHead className="w-[100px]">{language === 'id' ? 'Aksi' : 'Actions'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-muted-foreground">{category.description || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={category.is_default ? 'secondary' : 'outline'}>
                      {category.is_default 
                        ? (language === 'id' ? 'Default' : 'Default')
                        : (language === 'id' ? 'Custom' : 'Custom')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEdit(category)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {isOwnerOrAdmin && !category.is_default && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDelete(category.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
