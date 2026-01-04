import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { mockProducts, mockStockMovements } from '@/data/mockData';
import { Package, TrendingUp, TrendingDown, DollarSign, AlertTriangle, ArrowUpDown } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const Inventory = () => {
  // Calculate inventory statistics
  const totalItems = mockProducts.reduce((acc, p) => acc + p.quantity, 0);
  const totalValue = mockProducts.reduce((acc, p) => acc + (p.quantity * p.costPrice), 0);
  const lowStockCount = mockProducts.filter(p => p.quantity <= p.minStock && p.quantity > 0).length;
  const outOfStockCount = mockProducts.filter(p => p.quantity === 0).length;

  // Recent movements summary
  const recentMovements = mockStockMovements.slice(0, 5);
  const totalIn = mockStockMovements.filter(m => m.type === 'in').reduce((acc, m) => acc + m.totalPcs, 0);
  const totalOut = mockStockMovements.filter(m => m.type === 'out').reduce((acc, m) => acc + m.totalPcs, 0);

  const getStockLevel = (product: typeof mockProducts[0]) => {
    const percentage = (product.quantity / (product.minStock * 3)) * 100;
    if (product.quantity === 0) return { level: 'out', color: 'bg-destructive', percentage: 0 };
    if (product.quantity <= product.minStock) return { level: 'low', color: 'bg-yellow-500', percentage: Math.min(percentage, 100) };
    return { level: 'good', color: 'bg-green-500', percentage: Math.min(percentage, 100) };
  };

  return (
    <MainLayout title="Inventory">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Stock Units</p>
                <p className="text-2xl font-bold">{totalItems.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Package className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inventory Value</p>
                <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Stock In (Total)</p>
                <p className="text-2xl font-bold text-green-600">+{totalIn.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Stock Out (Total)</p>
                <p className="text-2xl font-bold text-destructive">-{totalOut.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stock Levels */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpDown className="w-5 h-5" />
                Stock Levels Overview
              </CardTitle>
              <CardDescription>Current stock levels for all products</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Min Stock</TableHead>
                    <TableHead>Stock Level</TableHead>
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockProducts.map((product) => {
                    const stockInfo = getStockLevel(product);
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                        <TableCell>
                          {product.quantity} {product.unit}
                        </TableCell>
                        <TableCell>{product.minStock}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={stockInfo.percentage} className="w-16 h-2" />
                            <Badge 
                              variant={stockInfo.level === 'out' ? 'destructive' : stockInfo.level === 'low' ? 'secondary' : 'default'}
                              className="capitalize"
                            >
                              {stockInfo.level === 'out' ? 'Out of Stock' : stockInfo.level === 'low' ? 'Low' : 'Good'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>${(product.quantity * product.costPrice).toLocaleString()}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {lowStockCount > 0 && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <span className="text-lg font-bold text-yellow-600">{lowStockCount}</span>
                  </div>
                  <div>
                    <p className="font-medium text-yellow-600">Low Stock Items</p>
                    <p className="text-sm text-muted-foreground">Items below minimum stock level</p>
                  </div>
                </div>
              )}
              
              {outOfStockCount > 0 && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <div className="h-10 w-10 rounded-full bg-destructive/20 flex items-center justify-center">
                    <span className="text-lg font-bold text-destructive">{outOfStockCount}</span>
                  </div>
                  <div>
                    <p className="font-medium text-destructive">Out of Stock</p>
                    <p className="text-sm text-muted-foreground">Items with zero quantity</p>
                  </div>
                </div>
              )}

              {lowStockCount === 0 && outOfStockCount === 0 && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Package className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-green-600">All Good!</p>
                    <p className="text-sm text-muted-foreground">All items are well stocked</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Movements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentMovements.map((movement) => (
                <div key={movement.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-sm">{movement.productName}</p>
                    <p className="text-xs text-muted-foreground">{movement.reference}</p>
                  </div>
                  <Badge variant={movement.type === 'in' ? 'default' : 'destructive'}>
                    {movement.type === 'in' ? '+' : '-'}{movement.totalPcs}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Inventory;
