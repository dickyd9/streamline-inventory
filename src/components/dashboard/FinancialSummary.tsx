import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Receipt, Wallet } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, subMonths } from 'date-fns';

const COLORS = [
  'hsl(142, 76%, 36%)',  // Green for income
  'hsl(0, 84%, 60%)',    // Red for expenses
];

const EXPENSE_COLORS = [
  'hsl(217, 91%, 60%)',
  'hsl(280, 67%, 60%)',
  'hsl(45, 93%, 47%)',
  'hsl(340, 82%, 52%)',
  'hsl(200, 80%, 50%)',
  'hsl(142, 76%, 36%)',
  'hsl(25, 95%, 53%)',
  'hsl(173, 58%, 39%)',
];

interface FinancialSummaryProps {
  dateFilter: string;
  onDateFilterChange: (value: string) => void;
}

export function FinancialSummary({ dateFilter, onDateFilterChange }: FinancialSummaryProps) {
  const { language, formatCurrency } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState<{ total: number; count: number }>({ total: 0, count: 0 });
  const [expensesData, setExpensesData] = useState<{ total: number; count: number; byCategory: Record<string, number> }>({ 
    total: 0, 
    count: 0, 
    byCategory: {} 
  });
  const [trendData, setTrendData] = useState<{ period: string; income: number; expense: number }[]>([]);

  const getDateRange = () => {
    const now = new Date();
    switch (dateFilter) {
      case 'day':
        return { start: startOfDay(now), end: endOfDay(now) };
      case 'week':
        return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
      case 'month':
      default:
        return { start: startOfMonth(now), end: endOfMonth(now) };
    }
  };

  useEffect(() => {
    const fetchFinancialData = async () => {
      setLoading(true);
      const { start, end } = getDateRange();

      try {
        // Fetch completed sales orders
        const { data: sales } = await supabase
          .from('sales_orders')
          .select('total_amount, id')
          .eq('status', 'completed')
          .gte('order_date', start.toISOString())
          .lte('order_date', end.toISOString());

        const salesTotal = sales?.reduce((sum, s) => sum + Number(s.total_amount), 0) || 0;
        setSalesData({ total: salesTotal, count: sales?.length || 0 });

        // Fetch expenses
        const { data: expenses } = await supabase
          .from('expenses')
          .select('amount, category_name')
          .gte('expense_date', start.toISOString())
          .lte('expense_date', end.toISOString());

        const expenseTotal = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
        const byCategory = expenses?.reduce((acc, e) => {
          acc[e.category_name] = (acc[e.category_name] || 0) + Number(e.amount);
          return acc;
        }, {} as Record<string, number>) || {};

        setExpensesData({ total: expenseTotal, count: expenses?.length || 0, byCategory });

        // Fetch trend data based on filter
        await fetchTrendData();
      } catch (error) {
        console.error('Error fetching financial data:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchTrendData = async () => {
      const now = new Date();
      let intervals: Date[] = [];
      let formatStr = 'dd/MM';

      if (dateFilter === 'day') {
        // Last 7 days
        intervals = eachDayOfInterval({ start: subDays(now, 6), end: now });
        formatStr = 'EEE';
      } else if (dateFilter === 'week') {
        // Last 4 weeks
        intervals = eachWeekOfInterval({ start: subDays(now, 27), end: now }, { weekStartsOn: 1 });
        formatStr = "'W'w";
      } else {
        // Last 6 months
        intervals = eachMonthOfInterval({ start: subMonths(now, 5), end: now });
        formatStr = 'MMM';
      }

      const trend: { period: string; income: number; expense: number }[] = [];

      for (let i = 0; i < intervals.length; i++) {
        const periodStart = dateFilter === 'day' ? startOfDay(intervals[i]) :
                           dateFilter === 'week' ? startOfWeek(intervals[i], { weekStartsOn: 1 }) :
                           startOfMonth(intervals[i]);
        const periodEnd = dateFilter === 'day' ? endOfDay(intervals[i]) :
                         dateFilter === 'week' ? endOfWeek(intervals[i], { weekStartsOn: 1 }) :
                         endOfMonth(intervals[i]);

        const { data: periodSales } = await supabase
          .from('sales_orders')
          .select('total_amount')
          .eq('status', 'completed')
          .gte('order_date', periodStart.toISOString())
          .lte('order_date', periodEnd.toISOString());

        const { data: periodExpenses } = await supabase
          .from('expenses')
          .select('amount')
          .gte('expense_date', periodStart.toISOString())
          .lte('expense_date', periodEnd.toISOString());

        trend.push({
          period: format(intervals[i], formatStr),
          income: periodSales?.reduce((sum, s) => sum + Number(s.total_amount), 0) || 0,
          expense: periodExpenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0,
        });
      }

      setTrendData(trend);
    };

    fetchFinancialData();
  }, [dateFilter]);

  const netProfit = salesData.total - expensesData.total;
  const profitMargin = salesData.total > 0 ? (netProfit / salesData.total) * 100 : 0;

  const pieData = [
    { name: language === 'id' ? 'Pemasukan' : 'Income', value: salesData.total },
    { name: language === 'id' ? 'Pengeluaran' : 'Expenses', value: expensesData.total },
  ];

  const categoryPieData = Object.entries(expensesData.byCategory).map(([name, value]) => ({
    name,
    value,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-foreground mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Date Filter */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {language === 'id' ? 'Ringkasan Keuangan' : 'Financial Summary'}
        </h3>
        <Select value={dateFilter} onValueChange={onDateFilterChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">{language === 'id' ? 'Hari Ini' : 'Today'}</SelectItem>
            <SelectItem value="week">{language === 'id' ? 'Minggu Ini' : 'This Week'}</SelectItem>
            <SelectItem value="month">{language === 'id' ? 'Bulan Ini' : 'This Month'}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'id' ? 'Total Pemasukan' : 'Total Income'}
                </p>
                <p className="text-2xl font-bold text-success">{formatCurrency(salesData.total)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {salesData.count} {language === 'id' ? 'pesanan' : 'orders'}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'id' ? 'Total Pengeluaran' : 'Total Expenses'}
                </p>
                <p className="text-2xl font-bold text-destructive">{formatCurrency(expensesData.total)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {expensesData.count} {language === 'id' ? 'transaksi' : 'transactions'}
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
                  {language === 'id' ? 'Laba Bersih' : 'Net Profit'}
                </p>
                <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {formatCurrency(netProfit)}
                </p>
                <Badge variant={netProfit >= 0 ? 'default' : 'destructive'} className="mt-1">
                  {profitMargin.toFixed(1)}% {language === 'id' ? 'margin' : 'margin'}
                </Badge>
              </div>
              <div className={`h-12 w-12 rounded-full ${netProfit >= 0 ? 'bg-success/10' : 'bg-destructive/10'} flex items-center justify-center`}>
                <Wallet className={`h-6 w-6 ${netProfit >= 0 ? 'text-success' : 'text-destructive'}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'id' ? 'Kategori OPEX' : 'OPEX Categories'}
                </p>
                <p className="text-2xl font-bold">{Object.keys(expensesData.byCategory).length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'id' ? 'kategori aktif' : 'active categories'}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Receipt className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expense Trend */}
        <Card className="stat-card">
          <CardHeader>
            <CardTitle className="text-base">
              {language === 'id' ? 'Tren Pemasukan vs Pengeluaran' : 'Income vs Expense Trend'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="period" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                  />
                  <YAxis 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="income" fill={COLORS[0]} name={language === 'id' ? 'Pemasukan' : 'Income'} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" fill={COLORS[1]} name={language === 'id' ? 'Pengeluaran' : 'Expenses'} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Expense by Category */}
        <Card className="stat-card">
          <CardHeader>
            <CardTitle className="text-base">
              {language === 'id' ? 'Pengeluaran per Kategori' : 'Expenses by Category'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {categoryPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryPieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend 
                      layout="vertical" 
                      align="right" 
                      verticalAlign="middle"
                      formatter={(value) => <span className="text-xs text-foreground">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  {language === 'id' ? 'Tidak ada data pengeluaran' : 'No expense data'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
