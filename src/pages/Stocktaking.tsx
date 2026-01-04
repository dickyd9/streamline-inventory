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
  FileText
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePermissions } from '@/hooks/usePermissions';
import { useToast } from '@/hooks/use-toast';

// Mock data
const mockStocktakes = [
  {
    id: '1',
    stocktake_number: 'ST-2024-001',
    name: 'Monthly Stock Count - January',
    scheduled_date: '2024-01-15',
    start_date: '2024-01-15',
    end_date: '2024-01-15',
    status: 'approved',
    category: 'All Categories',
    total_items: 50,
    variance_count: 3,
    variance_value: -150000,
  },
  {
    id: '2',
    stocktake_number: 'ST-2024-002',
    name: 'Weekly Electronics Check',
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
    name: 'Monthly Stock Count - February',
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStocktake, setSelectedStocktake] = useState<any>(null);

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
    setSelectedStocktake(null);
    setDialogOpen(true);
  };

  const handleSave = () => {
    toast({
      title: t('success.saved'),
      description: language === 'id' ? 'Stok opname berhasil disimpan' : 'Stocktake saved successfully',
    });
    setDialogOpen(false);
  };

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
          <SelectTrigger className="w-48">
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
          {t('stocktaking.newStocktake')}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <ClipboardCheck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'id' ? 'Total Stok Opname' : 'Total Stocktakes'}
                </p>
                <p className="text-2xl font-bold">{mockStocktakes.length}</p>
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
                <p className="text-sm text-muted-foreground">
                  {language === 'id' ? 'Sedang Berjalan' : 'In Progress'}
                </p>
                <p className="text-2xl font-bold">
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
                <p className="text-sm text-muted-foreground">
                  {language === 'id' ? 'Selesai' : 'Completed'}
                </p>
                <p className="text-2xl font-bold">
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
                <p className="text-sm text-muted-foreground">
                  {language === 'id' ? 'Terjadwal' : 'Scheduled'}
                </p>
                <p className="text-2xl font-bold">
                  {mockStocktakes.filter(s => s.status === 'draft').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stocktakes Table */}
      <Card>
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
                      <Button variant="ghost" size="icon">
                        <Eye className="w-4 h-4" />
                      </Button>
                      {stocktake.status === 'draft' && (
                        <Button variant="outline" size="sm" className="gap-1">
                          <Play className="w-3 h-3" />
                          {t('stocktaking.startCount')}
                        </Button>
                      )}
                      {stocktake.status === 'pending_approval' && canApprove() && (
                        <>
                          <Button variant="outline" size="sm" className="gap-1 text-success">
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

      {/* New Stocktake Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
              <Input placeholder={language === 'id' ? 'Contoh: Stok Opname Bulanan' : 'e.g. Monthly Stock Count'} />
            </div>
            <div className="space-y-2">
              <Label>{t('stocktaking.scheduledDate')}</Label>
              <Input type="date" />
            </div>
            <div className="space-y-2">
              <Label>{t('products.category')}</Label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'id' ? 'Semua Kategori' : 'All Categories'}</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="furniture">Furniture</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('common.notes')}</Label>
              <Textarea placeholder={language === 'id' ? 'Catatan tambahan...' : 'Additional notes...'} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSave}>
              {t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
