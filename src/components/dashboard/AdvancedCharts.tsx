import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import { mockProducts, mockSalesOrders } from '@/data/mockData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Activity } from 'lucide-react';

const COLORS = [
  'hsl(217, 91%, 60%)',
  'hsl(142, 76%, 36%)',
  'hsl(45, 93%, 47%)',
  'hsl(280, 67%, 60%)',
  'hsl(340, 82%, 52%)',
  'hsl(200, 80%, 50%)',
];

export function AdvancedCharts() {
  // Category data for pie chart
  const categoryData = mockProducts.reduce((acc, product) => {
    const existing = acc.find(item => item.name === product.category);
    if (existing) {
      existing.value += product.quantity * product.costPrice;
      existing.items += 1;
    } else {
      acc.push({
        name: product.category,
        value: product.quantity * product.costPrice,
        items: 1,
      });
    }
    return acc;
  }, [] as { name: string; value: number; items: number }[]);

  // Sales trend data (mock monthly)
  const salesTrendData = [
    { month: 'Jan', revenue: 45000, profit: 12000, orders: 28 },
    { month: 'Feb', revenue: 52000, profit: 15000, orders: 35 },
    { month: 'Mar', revenue: 48000, profit: 13500, orders: 32 },
    { month: 'Apr', revenue: 61000, profit: 18000, orders: 42 },
    { month: 'May', revenue: 55000, profit: 16000, orders: 38 },
    { month: 'Jun', revenue: 67000, profit: 21000, orders: 48 },
  ];

  // Stock level data
  const stockLevelData = mockProducts.slice(0, 8).map(p => ({
    name: p.name.length > 12 ? p.name.substring(0, 12) + '...' : p.name,
    current: p.quantity,
    min: p.minStock,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-foreground mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {typeof entry.value === 'number' && entry.name.toLowerCase().includes('revenue') 
                ? `$${entry.value.toLocaleString()}` 
                : entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-foreground">{payload[0].name}</p>
          <p className="text-sm text-muted-foreground">
            Value: ${payload[0].value.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">
            Items: {payload[0].payload.items}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="stat-card">
      <Tabs defaultValue="sales" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Analytics Overview</h3>
          <TabsList className="grid grid-cols-4 w-auto">
            <TabsTrigger value="sales" className="px-3">
              <TrendingUp className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="inventory" className="px-3">
              <BarChart3 className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="distribution" className="px-3">
              <PieChartIcon className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="stock" className="px-3">
              <Activity className="w-4 h-4" />
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Sales Trend - Area Chart */}
        <TabsContent value="sales" className="mt-0">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(217, 91%, 60%)" 
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  strokeWidth={2}
                  name="Revenue"
                />
                <Area 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="hsl(142, 76%, 36%)" 
                  fillOpacity={1}
                  fill="url(#colorProfit)"
                  strokeWidth={2}
                  name="Profit"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-muted-foreground">Revenue Trend</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success" />
              <span className="text-muted-foreground">Profit Margin</span>
            </div>
          </div>
        </TabsContent>

        {/* Inventory Value - Bar Chart */}
        <TabsContent value="inventory" className="mt-0">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  angle={-20}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="value" 
                  fill="hsl(var(--primary))" 
                  radius={[6, 6, 0, 0]}
                  name="Value"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        {/* Category Distribution - Pie Chart */}
        <TabsContent value="distribution" className="mt-0">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend 
                  layout="vertical" 
                  align="right" 
                  verticalAlign="middle"
                  formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        {/* Stock Levels - Horizontal Bar */}
        <TabsContent value="stock" className="mt-0">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={stockLevelData} 
                layout="vertical" 
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                <XAxis 
                  type="number"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                />
                <YAxis 
                  type="category"
                  dataKey="name"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  width={80}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="current" fill="hsl(217, 91%, 60%)" name="Current Stock" radius={[0, 4, 4, 0]} />
                <Bar dataKey="min" fill="hsl(0, 84%, 60%)" name="Min Level" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
