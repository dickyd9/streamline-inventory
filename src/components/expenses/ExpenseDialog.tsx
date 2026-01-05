import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ExpenseCategory {
  id: string;
  name: string;
  description: string | null;
  is_default: boolean;
  is_active: boolean;
}

interface Expense {
  id: string;
  expense_number: string;
  category_id: string | null;
  category_name: string;
  amount: number;
  expense_date: string;
  description: string | null;
  notes: string | null;
  payment_method: string;
  reference: string | null;
  status: string;
}

interface ExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: Expense | null;
  categories: ExpenseCategory[];
  onSave: (data: Partial<Expense>) => void;
}

export function ExpenseDialog({ open, onOpenChange, expense, categories, onSave }: ExpenseDialogProps) {
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    category_id: '',
    category_name: '',
    amount: 0,
    expense_date: new Date(),
    description: '',
    notes: '',
    payment_method: 'cash',
    reference: '',
    status: 'approved',
  });

  useEffect(() => {
    if (expense) {
      setFormData({
        category_id: expense.category_id || '',
        category_name: expense.category_name,
        amount: expense.amount,
        expense_date: new Date(expense.expense_date),
        description: expense.description || '',
        notes: expense.notes || '',
        payment_method: expense.payment_method,
        reference: expense.reference || '',
        status: expense.status,
      });
    } else {
      setFormData({
        category_id: categories[0]?.id || '',
        category_name: categories[0]?.name || '',
        amount: 0,
        expense_date: new Date(),
        description: '',
        notes: '',
        payment_method: 'cash',
        reference: '',
        status: 'approved',
      });
    }
  }, [expense, categories, open]);

  const handleCategoryChange = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    setFormData(prev => ({
      ...prev,
      category_id: categoryId,
      category_name: category?.name || '',
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      expense_date: formData.expense_date.toISOString(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {expense 
              ? (language === 'id' ? 'Edit Pengeluaran' : 'Edit Expense')
              : (language === 'id' ? 'Tambah Pengeluaran' : 'Add Expense')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{language === 'id' ? 'Kategori' : 'Category'}</Label>
              <Select value={formData.category_id} onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder={language === 'id' ? 'Pilih kategori' : 'Select category'} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{language === 'id' ? 'Tanggal' : 'Date'}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.expense_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.expense_date ? format(formData.expense_date, "dd/MM/yyyy") : "Pick date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.expense_date}
                    onSelect={(date) => setFormData(prev => ({ ...prev, expense_date: date || new Date() }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{language === 'id' ? 'Jumlah' : 'Amount'}</Label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                required
                min={0}
              />
            </div>

            <div className="space-y-2">
              <Label>{language === 'id' ? 'Metode Pembayaran' : 'Payment Method'}</Label>
              <Select value={formData.payment_method} onValueChange={(v) => setFormData(prev => ({ ...prev, payment_method: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">{language === 'id' ? 'Tunai' : 'Cash'}</SelectItem>
                  <SelectItem value="bank_transfer">{language === 'id' ? 'Transfer Bank' : 'Bank Transfer'}</SelectItem>
                  <SelectItem value="credit_card">{language === 'id' ? 'Kartu Kredit' : 'Credit Card'}</SelectItem>
                  <SelectItem value="other">{language === 'id' ? 'Lainnya' : 'Other'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{language === 'id' ? 'Deskripsi' : 'Description'}</Label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder={language === 'id' ? 'Deskripsi singkat' : 'Brief description'}
            />
          </div>

          <div className="space-y-2">
            <Label>{language === 'id' ? 'Referensi' : 'Reference'}</Label>
            <Input
              value={formData.reference}
              onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
              placeholder={language === 'id' ? 'No. bukti, kwitansi, dll' : 'Receipt no., invoice, etc.'}
            />
          </div>

          <div className="space-y-2">
            <Label>{language === 'id' ? 'Catatan' : 'Notes'}</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder={language === 'id' ? 'Catatan tambahan...' : 'Additional notes...'}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {language === 'id' ? 'Batal' : 'Cancel'}
            </Button>
            <Button type="submit">
              {language === 'id' ? 'Simpan' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
