import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  ClipboardCheck, 
  Calendar,
  Play,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  Save,
  Edit
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePermissions } from '@/hooks/usePermissions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Mock data
const mockProducts = [
  { id: '1', name: 'Laptop ASUS X515', sku: 'LPT-001', systemQty: 25, costPrice: 8500000 },
  { id: '2', name: 'Mouse Wireless', sku: 'MSE-001', systemQty: 150, costPrice: 150000 },
  { id: '3', name: 'Keyboard Mechanical', sku: 'KBD-001', systemQty: 80, costPrice: 500000 },
  { id: '4', name: 'Monitor LG 24"', sku: 'MNT-001', systemQty: 45, costPrice: 2500000 },
  { id: '5', name: 'Webcam HD 1080p', sku: 'WBC-001', systemQty: 60, costPrice: 600000 },
];

interface StocktakeItem {
  productId: string;
  productName: string;
  sku: string;
  systemQty: number;
  countedQty: number | null;
  variance: number | null;
  unitCost: number;
  varianceValue: number;
  notes: string;
}

const mockStocktakes = [
  {
    id: '1',
    stocktake_number: 'ST-2024-001',
    name: 'Stok Opname Bulanan - Januari',
    scheduled_date: '2024-01-15',
    start_date: '2024-01-15',
    end_date: '2024-01-15',
    status: 'approved',
    category: 'All Categories',
    total_items: 50,
    variance_count: 3,
    variance_value: -1500000,
  },
  {
    id: '2',
    stocktake_number: 'ST-2024-002',
    name: 'Pengecekan Mingguan Electronics',
    scheduled_date: '2024-01-22',
    start_date: '2024-01-22',
    end_date: null,
    status: 'in_progress',
    category: 'Electronics',
    total_items: 25,
    variance_count: 0,
    variance_value: 0,
  },
  {
    id: '3',
    stocktake_number: 'ST-2024-003',
    name: 'Stok Opname Bulanan - Februari',
    scheduled_date: '2024-02-15',
    start_date: null,
    end_date: null,
    status: 'draft',
    category: 'All Categories',
    total_items: 0,
    variance_count: 0,
    variance_value: 0,
  },
];

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  in_progress: 'bg-primary/10 text-primary',
  pending_approval: 'bg-warning/10 text-warning',
  approved: 'bg-success/10 text-success',
  cancelled: 'bg-destructive/10 text-destructive',
};

export default function Stocktaking() {
  const { t, formatCurrency, formatDate, language } = useLanguage();
  const { canApprove } = usePermissions();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [countDialogOpen, setCountDialogOpen] = useState(false);
  const [selectedStocktake, setSelectedStocktake] = useState<any>(null);
  
  // New stocktake form
  const [newStocktake, setNewStocktake] = useState({
    name: '',
    scheduledDate: '',
    category: 'all',
    notes: '',
  });

  // Count items
  const [countItems, setCountItems] = useState<StocktakeItem[]>([]);

  const getStatusLabel = (status: string) => {
    const labels: Record<string, Record<string, string>> = {
      draft: { en: 'Draft', id: 'Draft' },
      in_progress: { en: 'In Progress', id: 'Sedang Berjalan' },
      pending_approval: { en: 'Pending Approval', id: 'Menunggu Persetujuan' },
      approved: { en: 'Approved', id: 'Disetujui' },
      cancelled: { en: 'Cancelled', id: 'Dibatalkan' },
    };
    return labels[status]?.[language] || status;
  };

  const filteredStocktakes = mockStocktakes.filter(st => {
    const matchesSearch = st.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      st.stocktake_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || st.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateNew = () => {
    setNewStocktake({
      name: '',
      scheduledDate: new Date().toISOString().split('T')[0],
      category: 'all',
      notes: '',
    });
    setCreateDialogOpen(true);
  };

  const handleSaveStocktake = () => {
    toast({
      title: t('success.created'),
      description: language === 'id' ? 'Stok opname berhasil dibuat' : 'Stocktake created successfully',
    });
    setCreateDialogOpen(false);
  };

  const handleStartCount = (stocktake: any) => {
    setSelectedStocktake(stocktake);
    // Initialize count items from products
    const items: StocktakeItem[] = mockProducts.map(p => ({
      productId: p.id,
      productName: p.name,
      sku: p.sku,
      systemQty: p.systemQty,
      countedQty: null,
      variance: null,
      unitCost: p.costPrice,
      varianceValue: 0,
      notes: '',
    }));
    setCountItems(items);
    setCountDialogOpen(true);
  };

  const handleViewCount = (stocktake: any) => {
    setSelectedStocktake(stocktake);
    // Load existing count data
    const items: StocktakeItem[] = mockProducts.map(p => ({
      productId: p.id,
      productName: p.name,
      sku: p.sku,
      systemQty: p.systemQty,
      countedQty: p.systemQty - Math.floor(Math.random() * 5), // Mock counted data
      variance: null,
      unitCost: p.costPrice,
      varianceValue: 0,
      notes: '',
    }));
    items.forEach(item => {
      if (item.countedQty !== null) {
        item.variance = item.countedQty - item.systemQty;
        item.varianceValue = item.variance * item.unitCost;
      }
    });
    setCountItems(items);
    setCountDialogOpen(true);
  };

  const updateCountItem = (index: number, countedQty: number | null) => {
    const updated = [...countItems];
    updated[index].countedQty = countedQty;
    if (countedQty !== null) {
      updated[index].variance = countedQty - updated[index].systemQty;
      updated[index].varianceValue = updated[index].variance * updated[index].unitCost;
    } else {
      updated[index].variance = null;
      updated[index].varianceValue = 0;
    }
    setCountItems(updated);
  };

  const updateCountItemNotes = (index: number, notes: string) => {
    const updated = [...countItems];
    updated[index].notes = notes;
    setCountItems(updated);
  };

  const handleSaveCount = () => {
    toast({
      title: t('success.saved'),
      description: language === 'id' ? 'Hitungan stok berhasil disimpan' : 'Stock count saved successfully',
    });
    setCountDialogOpen(false);
  };

  const handleSubmitForApproval = () => {
    toast({
      title: language === 'id' ? 'Diajukan' : 'Submitted',
      description: language === 'id' ? 'Stok opname diajukan untuk persetujuan' : 'Stocktake submitted for approval',
    });
    setCountDialogOpen(false);
  };

  const handleApprove = (stocktake: any) => {
    toast({
      title: language === 'id' ? 'Disetujui' : 'Approved',
      description: language === 'id' ? 'Stok opname telah disetujui dan stok diperbarui' : 'Stocktake approved and inventory updated',
    });
  };

  const totalVarianceValue = countItems.reduce((sum, item) => sum + item.varianceValue, 0);
  const countedItems = countItems.filter(item => item.countedQty !== null).length;
  const varianceItems = countItems.filter(item => item.variance !== null && item.variance !== 0).length;

  return (
    <MainLayout title={t('stocktaking.title')}>
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('common.search') + '...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder={t('common.status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all')}</SelectItem>
            <SelectItem value="draft">{getStatusLabel('draft')}</SelectItem>
            <SelectItem value="in_progress">{getStatusLabel('in_progress')}</SelectItem>
            <SelectItem value="pending_approval">{getStatusLabel('pending_approval')}</SelectItem>
            <SelectItem value="approved">{getStatusLabel('approved')}</SelectItem>
            <SelectItem value="cancelled">{getStatusLabel('cancelled')}</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleCreateNew} className="gap-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">{t('stocktaking.newStocktake')}</span>
          <span className="sm:hidden">{language === 'id' ? 'Baru' : 'New'}</span>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <ClipboardCheck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {language === 'id' ? 'Total Stok Opname' : 'Total Stocktakes'}
                </p>
                <p className="text-xl sm:text-2xl font-bold">{mockStocktakes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Play className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {language === 'id' ? 'Sedang Berjalan' : 'In Progress'}
                </p>
                <p className="text-xl sm:text-2xl font-bold">
                  {mockStocktakes.filter(s => s.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {language === 'id' ? 'Selesai' : 'Completed'}
                </p>
                <p className="text-xl sm:text-2xl font-bold">
                  {mockStocktakes.filter(s => s.status === 'approved').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Calendar className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {language === 'id' ? 'Terjadwal' : 'Scheduled'}
                </p>
                <p className="text-xl sm:text-2xl font-bold">
                  {mockStocktakes.filter(s => s.status === 'draft').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Card View */}
      <div className="block lg:hidden space-y-3 mb-6">
        {filteredStocktakes.map((stocktake) => (
          <Card key={stocktake.id}>
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{stocktake.stocktake_number}</p>
                  <p className="text-sm text-muted-foreground">{stocktake.name}</p>
                </div>
                <Badge className={statusColors[stocktake.status]}>
                  {getStatusLabel(stocktake.status)}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{language === 'id' ? 'Terjadwal:' : 'Scheduled:'}</span>
                <span>{formatDate(stocktake.scheduled_date)}</span>
              </div>
              {stocktake.variance_count > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{language === 'id' ? 'Selisih:' : 'Variance:'}</span>
                  <span className={stocktake.variance_value < 0 ? 'text-destructive' : 'text-success'}>
                    {stocktake.variance_count} item ({formatCurrency(stocktake.variance_value)})
                  </span>
                </div>
              )}
              <div className="flex gap-2 pt-2 border-t flex-wrap">
                {stocktake.status === 'draft' && (
                  <Button size="sm" onClick={() => handleStartCount(stocktake)}>
                    <Play className="w-4 h-4 mr-1" />
                    {language === 'id' ? 'Mulai' : 'Start'}
                  </Button>
                )}
                {stocktake.status === 'in_progress' && (
                  <Button size="sm" variant="outline" onClick={() => handleViewCount(stocktake)}>
                    <Edit className="w-4 h-4 mr-1" />
                    {language === 'id' ? 'Lanjutkan' : 'Continue'}
                  </Button>
                )}
                {stocktake.status === 'approved' && (
                  <Button size="sm" variant="ghost" onClick={() => handleViewCount(stocktake)}>
                    <Eye className="w-4 h-4 mr-1" />
                    {language === 'id' ? 'Lihat' : 'View'}
                  </Button>
                )}
                {stocktake.status === 'pending_approval' && canApprove() && (
                  <Button size="sm" className="text-success" onClick={() => handleApprove(stocktake)}>
                    <CheckCircle className="w-4 h-4 mr-1" />
                    {language === 'id' ? 'Setujui' : 'Approve'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop Table View */}
      <Card className="hidden lg:block">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {language === 'id' ? 'Daftar Stok Opname' : 'Stocktake List'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('stocktaking.stocktakeNumber')}</TableHead>
                <TableHead>{language === 'id' ? 'Nama' : 'Name'}</TableHead>
                <TableHead>{t('stocktaking.scheduledDate')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead className="text-right">{language === 'id' ? 'Total Item' : 'Total Items'}</TableHead>
                <TableHead className="text-right">{t('stocktaking.variance')}</TableHead>
                <TableHead className="text-right">{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStocktakes.map((stocktake) => (
                <TableRow key={stocktake.id}>
                  <TableCell className="font-medium">{stocktake.stocktake_number}</TableCell>
                  <TableCell>{stocktake.name}</TableCell>
                  <TableCell>{formatDate(stocktake.scheduled_date)}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[stocktake.status]}>
                      {getStatusLabel(stocktake.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{stocktake.total_items}</TableCell>
                  <TableCell className="text-right">
                    {stocktake.variance_count > 0 && (
                      <span className={stocktake.variance_value < 0 ? 'text-destructive' : 'text-success'}>
                        {stocktake.variance_count} {language === 'id' ? 'item' : 'items'} ({formatCurrency(stocktake.variance_value)})
                      </span>
                    )}
                    {stocktake.variance_count === 0 && '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {stocktake.status === 'approved' && (
                        <Button variant="ghost" size="icon" onClick={() => handleViewCount(stocktake)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                      {stocktake.status === 'draft' && (
                        <Button variant="outline" size="sm" className="gap-1" onClick={() => handleStartCount(stocktake)}>
                          <Play className="w-3 h-3" />
                          {t('stocktaking.startCount')}
                        </Button>
                      )}
                      {stocktake.status === 'in_progress' && (
                        <Button variant="outline" size="sm" className="gap-1" onClick={() => handleViewCount(stocktake)}>
                          <Edit className="w-3 h-3" />
                          {language === 'id' ? 'Lanjutkan' : 'Continue'}
                        </Button>
                      )}
                      {stocktake.status === 'pending_approval' && canApprove() && (
                        <>
                          <Button variant="outline" size="sm" className="gap-1 text-success" onClick={() => handleApprove(stocktake)}>
                            <CheckCircle className="w-3 h-3" />
                            {t('stocktaking.approve')}
                          </Button>
                          <Button variant="outline" size="sm" className="gap-1 text-destructive">
                            <XCircle className="w-3 h-3" />
                            {t('stocktaking.reject')}
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create New Stocktake Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('stocktaking.newStocktake')}</DialogTitle>
            <DialogDescription>
              {language === 'id' 
                ? 'Buat stok opname baru untuk menghitung inventori' 
                : 'Create a new stocktake to count inventory'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{language === 'id' ? 'Nama Stok Opname' : 'Stocktake Name'}</Label>
              <Input 
                value={newStocktake.name}
                onChange={(e) => setNewStocktake({ ...newStocktake, name: e.target.value })}
                placeholder={language === 'id' ? 'Contoh: Stok Opname Bulanan' : 'e.g. Monthly Stock Count'} 
              />
            </div>
            <div className="space-y-2">
              <Label>{t('stocktaking.scheduledDate')}</Label>
              <Input 
                type="date" 
                value={newStocktake.scheduledDate}
                onChange={(e) => setNewStocktake({ ...newStocktake, scheduledDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('products.category')}</Label>
              <Select 
                value={newStocktake.category} 
                onValueChange={(v) => setNewStocktake({ ...newStocktake, category: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'id' ? 'Semua Kategori' : 'All Categories'}</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="furniture">Furniture</SelectItem>
                  <SelectItem value="stationery">Stationery</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('common.notes')}</Label>
              <Textarea 
                value={newStocktake.notes}
                onChange={(e) => setNewStocktake({ ...newStocktake, notes: e.target.value })}
                placeholder={language === 'id' ? 'Catatan tambahan...' : 'Additional notes...'} 
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSaveStocktake}>
              {t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stock Count Dialog */}
      <Dialog open={countDialogOpen} onOpenChange={setCountDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedStocktake?.stocktake_number} - {selectedStocktake?.name}
            </DialogTitle>
            <DialogDescription>
              {language === 'id' 
                ? 'Masukkan jumlah yang dihitung untuk setiap item' 
                : 'Enter the counted quantity for each item'}
            </DialogDescription>
          </DialogHeader>

          {/* Summary Bar */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">{language === 'id' ? 'Dihitung' : 'Counted'}</p>
              <p className="text-xl font-bold">{countedItems} / {countItems.length}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">{language === 'id' ? 'Ada Selisih' : 'With Variance'}</p>
              <p className="text-xl font-bold">{varianceItems}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">{language === 'id' ? 'Nilai Selisih' : 'Variance Value'}</p>
              <p className={cn("text-xl font-bold", totalVarianceValue < 0 ? 'text-destructive' : 'text-success')}>
                {formatCurrency(totalVarianceValue)}
              </p>
            </div>
          </div>

          {/* Count Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === 'id' ? 'Produk' : 'Product'}</TableHead>
                  <TableHead className="text-center">{language === 'id' ? 'Stok Sistem' : 'System Qty'}</TableHead>
                  <TableHead className="text-center">{language === 'id' ? 'Qty Hitung' : 'Counted Qty'}</TableHead>
                  <TableHead className="text-center">{language === 'id' ? 'Selisih' : 'Variance'}</TableHead>
                  <TableHead className="text-right">{language === 'id' ? 'Nilai Selisih' : 'Variance Value'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {countItems.map((item, index) => (
                  <TableRow key={item.productId}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">{item.sku}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-medium">{item.systemQty}</TableCell>
                    <TableCell className="text-center">
                      <Input
                        type="number"
                        min="0"
                        className="w-20 mx-auto text-center"
                        value={item.countedQty ?? ''}
                        onChange={(e) => updateCountItem(index, e.target.value ? parseInt(e.target.value) : null)}
                        placeholder="-"
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      {item.variance !== null && (
                        <span className={cn(
                          "font-medium",
                          item.variance > 0 && "text-success",
                          item.variance < 0 && "text-destructive"
                        )}>
                          {item.variance > 0 ? '+' : ''}{item.variance}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.varianceValue !== 0 && (
                        <span className={cn(
                          "font-medium",
                          item.varianceValue > 0 && "text-success",
                          item.varianceValue < 0 && "text-destructive"
                        )}>
                          {formatCurrency(item.varianceValue)}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setCountDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="outline" onClick={handleSaveCount}>
              <Save className="w-4 h-4 mr-2" />
              {language === 'id' ? 'Simpan Draft' : 'Save Draft'}
            </Button>
            <Button onClick={handleSubmitForApproval} disabled={countedItems < countItems.length}>
              <CheckCircle className="w-4 h-4 mr-2" />
              {language === 'id' ? 'Ajukan Persetujuan' : 'Submit for Approval'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
