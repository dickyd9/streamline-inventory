import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Filter, Receipt, TrendingDown, Calendar, DollarSign } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useActivityLog } from '@/hooks/useActivityLog';
import { toast } from 'sonner';
import { ExpenseDialog } from '@/components/expenses/ExpenseDialog';
import { ExpenseCategoryDialog } from '@/components/expenses/ExpenseCategoryDialog';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfDay, endOfDay } from 'date-fns';

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
  created_at: string;
}

interface ExpenseCategory {
  id: string;
  name: string;
  description: string | null;
  is_default: boolean;
  is_active: boolean;
}

export default function Expenses() {
  const { language, formatCurrency } = useLanguage();
  const { user } = useAuth();
  const { logActivity } = useActivityLog();
  
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('month');
  
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('expense_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (categoriesData) setCategories(categoriesData);

      // Determine date range
      const now = new Date();
      let startDate: Date, endDate: Date;
      
      if (dateFilter === 'day') {
        startDate = startOfDay(now);
        endDate = endOfDay(now);
      } else if (dateFilter === 'week') {
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        endDate = endOfWeek(now, { weekStartsOn: 1 });
      } else {
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
      }

      // Fetch expenses
      let query = supabase
        .from('expenses')
        .select('*')
        .gte('expense_date', startDate.toISOString())
        .lte('expense_date', endDate.toISOString())
        .order('expense_date', { ascending: false });

      if (categoryFilter !== 'all') {
        query = query.eq('category_id', categoryFilter);
      }

      const { data: expensesData, error } = await query;
      
      if (error) throw error;
      if (expensesData) setExpenses(expensesData);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast.error(language === 'id' ? 'Gagal memuat data' : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [categoryFilter, dateFilter]);

  const handleSaveExpense = async (data: Partial<Expense>) => {
    try {
      if (editingExpense) {
        const { error } = await supabase
          .from('expenses')
          .update(data)
          .eq('id', editingExpense.id);
        
        if (error) throw error;
        
        await logActivity({
          action: 'update',
          entityType: 'payment',
          entityId: editingExpense.id,
          entityName: data.description || editingExpense.expense_number,
          details: { amount: data.amount, category: data.category_name },
        });
        
        toast.success(language === 'id' ? 'Pengeluaran berhasil diperbarui' : 'Expense updated successfully');
      } else {
        // Generate expense number
        const { data: lastExpense } = await supabase
          .from('expenses')
          .select('expense_number')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        const nextNum = lastExpense 
          ? parseInt(lastExpense.expense_number.replace('EXP-', '')) + 1 
          : 1;
        const expenseNumber = `EXP-${String(nextNum).padStart(5, '0')}`;

        const insertData = {
          expense_number: expenseNumber,
          category_id: data.category_id || null,
          category_name: data.category_name || '',
          amount: data.amount || 0,
          expense_date: data.expense_date || new Date().toISOString(),
          description: data.description || null,
          notes: data.notes || null,
          payment_method: data.payment_method || 'cash',
          reference: data.reference || null,
          status: data.status || 'approved',
          created_by: user?.id || null,
        };

        const { data: newExpense, error } = await supabase
          .from('expenses')
          .insert(insertData)
          .select()
          .single();
        
        if (error) throw error;
        
        await logActivity({
          action: 'create',
          entityType: 'payment',
          entityId: newExpense?.id,
          entityName: data.description || expenseNumber,
          details: { amount: data.amount, category: data.category_name },
        });
        
        toast.success(language === 'id' ? 'Pengeluaran berhasil ditambahkan' : 'Expense added successfully');
      }
      
      setIsExpenseDialogOpen(false);
      setEditingExpense(null);
      fetchData();
    } catch (error) {
      console.error('Error saving expense:', error);
      toast.error(language === 'id' ? 'Gagal menyimpan pengeluaran' : 'Failed to save expense');
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.expense_number.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Calculate totals
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const categoryBreakdown = filteredExpenses.reduce((acc, e) => {
    acc[e.category_name] = (acc[e.category_name] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);
  const topCategory = Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])[0];

  const getPaymentMethodLabel = (method: string) => {
    const methods: Record<string, { en: string; id: string }> = {
      cash: { en: 'Cash', id: 'Tunai' },
      bank_transfer: { en: 'Bank Transfer', id: 'Transfer Bank' },
      credit_card: { en: 'Credit Card', id: 'Kartu Kredit' },
      other: { en: 'Other', id: 'Lainnya' },
    };
    return methods[method]?.[language] || method;
  };

  return (
    <MainLayout title={language === 'id' ? 'Pengeluaran Operasional' : 'Operational Expenses'}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'id' ? 'Total Pengeluaran' : 'Total Expenses'}
                </p>
                <p className="text-2xl font-bold text-destructive">{formatCurrency(totalExpenses)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {filteredExpenses.length} {language === 'id' ? 'transaksi' : 'transactions'}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'id' ? 'Kategori Terbesar' : 'Top Category'}
                </p>
                <p className="text-lg font-bold">{topCategory?.[0] || '-'}</p>
                <p className="text-sm text-muted-foreground">
                  {topCategory ? formatCurrency(topCategory[1]) : '-'}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Receipt className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'id' ? 'Rata-rata/Transaksi' : 'Avg per Transaction'}
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(filteredExpenses.length > 0 ? totalExpenses / filteredExpenses.length : 0)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'id' ? 'Jumlah Kategori' : 'Categories'}
                </p>
                <p className="text-2xl font-bold">{Object.keys(categoryBreakdown).length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'id' ? 'kategori aktif' : 'active categories'}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={language === 'id' ? 'Cari pengeluaran...' : 'Search expenses...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">{language === 'id' ? 'Hari Ini' : 'Today'}</SelectItem>
            <SelectItem value="week">{language === 'id' ? 'Minggu Ini' : 'This Week'}</SelectItem>
            <SelectItem value="month">{language === 'id' ? 'Bulan Ini' : 'This Month'}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder={language === 'id' ? 'Kategori' : 'Category'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{language === 'id' ? 'Semua Kategori' : 'All Categories'}</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={() => setIsCategoryDialogOpen(true)}>
          {language === 'id' ? 'Kelola Kategori' : 'Manage Categories'}
        </Button>

        <Button onClick={() => { setEditingExpense(null); setIsExpenseDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          {language === 'id' ? 'Tambah Pengeluaran' : 'Add Expense'}
        </Button>
      </div>

      {/* Expenses Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{language === 'id' ? 'No. Transaksi' : 'Transaction No.'}</TableHead>
                <TableHead>{language === 'id' ? 'Tanggal' : 'Date'}</TableHead>
                <TableHead>{language === 'id' ? 'Kategori' : 'Category'}</TableHead>
                <TableHead>{language === 'id' ? 'Deskripsi' : 'Description'}</TableHead>
                <TableHead>{language === 'id' ? 'Metode' : 'Method'}</TableHead>
                <TableHead className="text-right">{language === 'id' ? 'Jumlah' : 'Amount'}</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                  </TableCell>
                </TableRow>
              ) : filteredExpenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    {language === 'id' ? 'Tidak ada data pengeluaran' : 'No expenses found'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredExpenses.map((expense) => (
                  <TableRow 
                    key={expense.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => { setEditingExpense(expense); setIsExpenseDialogOpen(true); }}
                  >
                    <TableCell className="font-medium">{expense.expense_number}</TableCell>
                    <TableCell>{format(new Date(expense.expense_date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{expense.category_name}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{expense.description || '-'}</TableCell>
                    <TableCell>{getPaymentMethodLabel(expense.payment_method)}</TableCell>
                    <TableCell className="text-right font-semibold text-destructive">
                      {formatCurrency(expense.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={expense.status === 'approved' ? 'default' : 'secondary'}>
                        {expense.status === 'approved' 
                          ? (language === 'id' ? 'Disetujui' : 'Approved')
                          : (language === 'id' ? 'Tertunda' : 'Pending')}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ExpenseDialog
        open={isExpenseDialogOpen}
        onOpenChange={setIsExpenseDialogOpen}
        expense={editingExpense}
        categories={categories}
        onSave={handleSaveExpense}
      />

      <ExpenseCategoryDialog
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
        categories={categories}
        onCategoriesChange={fetchData}
      />
    </MainLayout>
  );
}
