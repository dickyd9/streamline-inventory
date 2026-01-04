import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  History,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  CreditCard,
  User,
  ShieldAlert
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePermissions } from '@/hooks/usePermissions';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { id as idLocale, enUS } from 'date-fns/locale';

interface ActivityLog {
  id: string;
  user_id: string;
  user_name: string | null;
  user_role: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  entity_name: string | null;
  details: Record<string, any> | null;
  created_at: string;
}

const actionIcons: Record<string, any> = {
  create: Plus,
  update: Edit,
  delete: Trash2,
  approve: CheckCircle,
  reject: XCircle,
  cancel: XCircle,
  stock_in: ArrowDownCircle,
  stock_out: ArrowUpCircle,
  adjustment: Edit,
  payment: CreditCard,
  login: User,
  logout: User,
};

const actionColors: Record<string, string> = {
  create: 'bg-success/10 text-success',
  update: 'bg-primary/10 text-primary',
  delete: 'bg-destructive/10 text-destructive',
  approve: 'bg-success/10 text-success',
  reject: 'bg-destructive/10 text-destructive',
  cancel: 'bg-muted text-muted-foreground',
  stock_in: 'bg-success/10 text-success',
  stock_out: 'bg-warning/10 text-warning',
  adjustment: 'bg-primary/10 text-primary',
  payment: 'bg-success/10 text-success',
  login: 'bg-primary/10 text-primary',
  logout: 'bg-muted text-muted-foreground',
};

const roleColors: Record<string, string> = {
  admin: 'bg-destructive/10 text-destructive',
  owner: 'bg-primary/10 text-primary',
  staff: 'bg-muted text-muted-foreground',
};

export default function ActivityHistory() {
  const { language, formatDate } = useLanguage();
  const { isOwnerOrAdmin } = usePermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);

    if (!error && data) {
      setLogs(data as ActivityLog[]);
    }
    setLoading(false);
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, Record<string, string>> = {
      create: { en: 'Created', id: 'Membuat' },
      update: { en: 'Updated', id: 'Mengubah' },
      delete: { en: 'Deleted', id: 'Menghapus' },
      approve: { en: 'Approved', id: 'Menyetujui' },
      reject: { en: 'Rejected', id: 'Menolak' },
      cancel: { en: 'Cancelled', id: 'Membatalkan' },
      stock_in: { en: 'Stock In', id: 'Stok Masuk' },
      stock_out: { en: 'Stock Out', id: 'Stok Keluar' },
      adjustment: { en: 'Adjusted', id: 'Menyesuaikan' },
      payment: { en: 'Paid', id: 'Membayar' },
      login: { en: 'Login', id: 'Masuk' },
      logout: { en: 'Logout', id: 'Keluar' },
    };
    return labels[action]?.[language] || action;
  };

  const getEntityLabel = (entity: string) => {
    const labels: Record<string, Record<string, string>> = {
      product: { en: 'Product', id: 'Produk' },
      category: { en: 'Category', id: 'Kategori' },
      supplier: { en: 'Supplier', id: 'Pemasok' },
      customer: { en: 'Customer', id: 'Pelanggan' },
      purchase_order: { en: 'Purchase Order', id: 'PO' },
      sales_order: { en: 'Sales Order', id: 'SO' },
      invoice: { en: 'Invoice', id: 'Faktur' },
      payment: { en: 'Payment', id: 'Pembayaran' },
      stock_movement: { en: 'Stock Movement', id: 'Pergerakan Stok' },
      stocktake: { en: 'Stocktake', id: 'Stok Opname' },
      user: { en: 'User', id: 'Pengguna' },
    };
    return labels[entity]?.[language] || entity;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'HH:mm', { locale: language === 'id' ? idLocale : enUS });
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entity_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesEntity = entityFilter === 'all' || log.entity_type === entityFilter;
    return matchesSearch && matchesAction && matchesEntity;
  });

  // Access control
  if (!isOwnerOrAdmin) {
    return (
      <MainLayout title={language === 'id' ? 'Riwayat Aktivitas' : 'Activity History'}>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShieldAlert className="w-16 h-16 text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              {language === 'id' ? 'Akses Ditolak' : 'Access Denied'}
            </h2>
            <p className="text-muted-foreground text-center">
              {language === 'id' 
                ? 'Anda tidak memiliki izin untuk melihat riwayat aktivitas.'
                : 'You do not have permission to view activity history.'}
            </p>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={language === 'id' ? 'Riwayat Aktivitas' : 'Activity History'}>
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <History className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {language === 'id' ? 'Total Aktivitas' : 'Total Activities'}
                </p>
                <p className="text-xl sm:text-2xl font-bold">{logs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <Plus className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {language === 'id' ? 'Dibuat' : 'Created'}
                </p>
                <p className="text-xl sm:text-2xl font-bold">
                  {logs.filter(l => l.action === 'create').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Edit className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {language === 'id' ? 'Diubah' : 'Updated'}
                </p>
                <p className="text-xl sm:text-2xl font-bold">
                  {logs.filter(l => l.action === 'update').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <Trash2 className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {language === 'id' ? 'Dihapus' : 'Deleted'}
                </p>
                <p className="text-xl sm:text-2xl font-bold">
                  {logs.filter(l => l.action === 'delete').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={language === 'id' ? 'Cari pengguna atau item...' : 'Search user or item...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder={language === 'id' ? 'Aksi' : 'Action'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{language === 'id' ? 'Semua' : 'All'}</SelectItem>
            <SelectItem value="create">{getActionLabel('create')}</SelectItem>
            <SelectItem value="update">{getActionLabel('update')}</SelectItem>
            <SelectItem value="delete">{getActionLabel('delete')}</SelectItem>
            <SelectItem value="approve">{getActionLabel('approve')}</SelectItem>
            <SelectItem value="stock_in">{getActionLabel('stock_in')}</SelectItem>
            <SelectItem value="stock_out">{getActionLabel('stock_out')}</SelectItem>
            <SelectItem value="payment">{getActionLabel('payment')}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={entityFilter} onValueChange={setEntityFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder={language === 'id' ? 'Entitas' : 'Entity'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{language === 'id' ? 'Semua' : 'All'}</SelectItem>
            <SelectItem value="product">{getEntityLabel('product')}</SelectItem>
            <SelectItem value="purchase_order">{getEntityLabel('purchase_order')}</SelectItem>
            <SelectItem value="sales_order">{getEntityLabel('sales_order')}</SelectItem>
            <SelectItem value="invoice">{getEntityLabel('invoice')}</SelectItem>
            <SelectItem value="stock_movement">{getEntityLabel('stock_movement')}</SelectItem>
            <SelectItem value="stocktake">{getEntityLabel('stocktake')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Mobile Card View */}
      <div className="block lg:hidden space-y-3 mb-6">
        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </CardContent>
          </Card>
        ) : filteredLogs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8 text-muted-foreground">
              {language === 'id' ? 'Belum ada aktivitas' : 'No activities yet'}
            </CardContent>
          </Card>
        ) : (
          filteredLogs.slice(0, 50).map((log) => {
            const Icon = actionIcons[log.action] || Edit;
            return (
              <Card key={log.id}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${actionColors[log.action] || 'bg-muted'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{log.user_name || 'Unknown'}</p>
                        <Badge variant="outline" className={roleColors[log.user_role || 'staff']}>
                          {log.user_role || 'staff'}
                        </Badge>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(log.created_at)} {formatTime(log.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge className={actionColors[log.action]}>
                      {getActionLabel(log.action)}
                    </Badge>
                    <span className="text-muted-foreground">{getEntityLabel(log.entity_type)}</span>
                  </div>
                  {log.entity_name && (
                    <p className="text-sm font-medium">{log.entity_name}</p>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Desktop Table */}
      <Card className="hidden lg:block">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            {language === 'id' ? 'Log Aktivitas' : 'Activity Logs'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === 'id' ? 'Waktu' : 'Time'}</TableHead>
                  <TableHead>{language === 'id' ? 'Pengguna' : 'User'}</TableHead>
                  <TableHead>{language === 'id' ? 'Role' : 'Role'}</TableHead>
                  <TableHead>{language === 'id' ? 'Aksi' : 'Action'}</TableHead>
                  <TableHead>{language === 'id' ? 'Entitas' : 'Entity'}</TableHead>
                  <TableHead>{language === 'id' ? 'Nama' : 'Name'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.slice(0, 100).map((log) => {
                  const Icon = actionIcons[log.action] || Edit;
                  return (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">
                        <div className="text-sm">
                          <p>{formatDate(log.created_at)}</p>
                          <p className="text-muted-foreground">{formatTime(log.created_at)}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {log.user_name || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={roleColors[log.user_role || 'staff']}>
                          {log.user_role || 'staff'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`p-1 rounded ${actionColors[log.action] || 'bg-muted'}`}>
                            <Icon className="w-3 h-3" />
                          </div>
                          <span>{getActionLabel(log.action)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getEntityLabel(log.entity_type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {log.entity_name || '-'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </MainLayout>
  );
}
