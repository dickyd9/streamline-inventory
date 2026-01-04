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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  FileText, 
  CreditCard,
  Eye,
  Download,
  Printer,
  Clock,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { InvoicePrintView } from '@/components/invoices/InvoicePrintView';

// Mock data
const mockInvoices = [
  {
    id: '1',
    invoice_number: 'INV-2024-001',
    type: 'sales',
    reference_number: 'SO-2024-001',
    customer_supplier_name: 'PT Maju Bersama',
    invoice_date: '2024-01-15',
    due_date: '2024-02-15',
    status: 'paid',
    subtotal: 13513514,
    tax_amount: 1486486,
    discount_amount: 0,
    total_amount: 15000000,
    paid_amount: 15000000,
    items: [
      { name: 'Laptop ASUS X515', qty: 5, price: 8500000, total: 42500000 },
      { name: 'Mouse Wireless', qty: 10, price: 150000, total: 1500000 },
    ],
  },
  {
    id: '2',
    invoice_number: 'INV-2024-002',
    type: 'purchase',
    reference_number: 'PO-2024-001',
    customer_supplier_name: 'CV Supplier Utama',
    invoice_date: '2024-01-18',
    due_date: '2024-02-18',
    status: 'partial',
    subtotal: 22522523,
    tax_amount: 2477477,
    discount_amount: 0,
    total_amount: 25000000,
    paid_amount: 10000000,
    items: [
      { name: 'Printer Epson L3150', qty: 10, price: 2500000, total: 25000000 },
    ],
  },
  {
    id: '3',
    invoice_number: 'INV-2024-003',
    type: 'sales',
    reference_number: 'SO-2024-002',
    customer_supplier_name: 'Toko Sejahtera',
    invoice_date: '2024-01-20',
    due_date: '2024-01-25',
    status: 'overdue',
    subtotal: 7657658,
    tax_amount: 842342,
    discount_amount: 0,
    total_amount: 8500000,
    paid_amount: 0,
    items: [
      { name: 'Monitor LG 24"', qty: 3, price: 2500000, total: 7500000 },
      { name: 'Keyboard Mechanical', qty: 5, price: 500000, total: 2500000 },
    ],
  },
  {
    id: '4',
    invoice_number: 'INV-2024-004',
    type: 'sales',
    reference_number: 'SO-2024-003',
    customer_supplier_name: 'PT Abadi Jaya',
    invoice_date: '2024-01-22',
    due_date: '2024-02-22',
    status: 'sent',
    subtotal: 10810811,
    tax_amount: 1189189,
    discount_amount: 0,
    total_amount: 12000000,
    paid_amount: 0,
    items: [
      { name: 'Webcam HD 1080p', qty: 20, price: 600000, total: 12000000 },
    ],
  },
];

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-primary/10 text-primary',
  partial: 'bg-warning/10 text-warning',
  paid: 'bg-success/10 text-success',
  overdue: 'bg-destructive/10 text-destructive',
  cancelled: 'bg-muted text-muted-foreground',
};

const PAYMENT_METHODS = [
  { value: 'cash', labelId: 'Tunai', labelEn: 'Cash' },
  { value: 'bank_transfer', labelId: 'Transfer Bank', labelEn: 'Bank Transfer' },
  { value: 'credit_card', labelId: 'Kartu Kredit', labelEn: 'Credit Card' },
  { value: 'debit_card', labelId: 'Kartu Debit', labelEn: 'Debit Card' },
  { value: 'e_wallet', labelId: 'E-Wallet', labelEn: 'E-Wallet' },
  { value: 'qris', labelId: 'QRIS', labelEn: 'QRIS' },
  { value: 'giro', labelId: 'Giro', labelEn: 'Giro' },
];

export default function Invoices() {
  const { t, formatCurrency, formatDate, language } = useLanguage();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');

  const getStatusLabel = (status: string) => {
    const labels: Record<string, Record<string, string>> = {
      draft: { en: 'Draft', id: 'Draft' },
      sent: { en: 'Sent', id: 'Terkirim' },
      partial: { en: 'Partial', id: 'Sebagian' },
      paid: { en: 'Paid', id: 'Lunas' },
      overdue: { en: 'Overdue', id: 'Jatuh Tempo' },
      cancelled: { en: 'Cancelled', id: 'Dibatalkan' },
    };
    return labels[status]?.[language] || status;
  };

  const filteredInvoices = mockInvoices.filter(inv => {
    const matchesSearch = 
      inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customer_supplier_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    const matchesType = typeFilter === 'all' || inv.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleRecordPayment = (invoice: any) => {
    setSelectedInvoice(invoice);
    setPaymentAmount('');
    setPaymentMethod('bank_transfer');
    setPaymentDialogOpen(true);
  };

  const handlePreviewInvoice = (invoice: any) => {
    setSelectedInvoice(invoice);
    setPreviewDialogOpen(true);
  };

  const handleSavePayment = () => {
    toast({
      title: t('success.saved'),
      description: language === 'id' ? 'Pembayaran berhasil dicatat' : 'Payment recorded successfully',
    });
    setPaymentDialogOpen(false);
  };

  const handlePrint = () => {
    toast({
      title: language === 'id' ? 'Mencetak...' : 'Printing...',
      description: language === 'id' ? 'Faktur sedang dicetak' : 'Invoice is being printed',
    });
    window.print();
  };

  const handleDownload = () => {
    toast({
      title: language === 'id' ? 'Mengunduh...' : 'Downloading...',
      description: language === 'id' ? 'Faktur sedang diunduh' : 'Invoice is being downloaded',
    });
    setPreviewDialogOpen(false);
  };

  // Summary calculations
  const totalInvoices = mockInvoices.length;
  const totalAmount = mockInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);
  const totalPaid = mockInvoices.reduce((sum, inv) => sum + inv.paid_amount, 0);
  const totalOutstanding = totalAmount - totalPaid;

  return (
    <MainLayout title={t('invoices.title')}>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {language === 'id' ? 'Total Faktur' : 'Total Invoices'}
                </p>
                <p className="text-xl sm:text-2xl font-bold">{totalInvoices}</p>
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
                  {language === 'id' ? 'Total Dibayar' : 'Total Paid'}
                </p>
                <p className="text-lg sm:text-xl font-bold">{formatCurrency(totalPaid)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {language === 'id' ? 'Sisa Piutang' : 'Outstanding'}
                </p>
                <p className="text-lg sm:text-xl font-bold">{formatCurrency(totalOutstanding)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertCircle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {language === 'id' ? 'Jatuh Tempo' : 'Overdue'}
                </p>
                <p className="text-xl sm:text-2xl font-bold">
                  {mockInvoices.filter(inv => inv.status === 'overdue').length}
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
            placeholder={t('common.search') + '...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder={language === 'id' ? 'Tipe' : 'Type'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all')}</SelectItem>
            <SelectItem value="sales">{language === 'id' ? 'Penjualan' : 'Sales'}</SelectItem>
            <SelectItem value="purchase">{language === 'id' ? 'Pembelian' : 'Purchase'}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder={t('common.status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('common.all')}</SelectItem>
            <SelectItem value="draft">{getStatusLabel('draft')}</SelectItem>
            <SelectItem value="sent">{getStatusLabel('sent')}</SelectItem>
            <SelectItem value="partial">{getStatusLabel('partial')}</SelectItem>
            <SelectItem value="paid">{getStatusLabel('paid')}</SelectItem>
            <SelectItem value="overdue">{getStatusLabel('overdue')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Mobile Card View */}
      <div className="block lg:hidden space-y-3 mb-6">
        {filteredInvoices.map((invoice) => (
          <Card key={invoice.id}>
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{invoice.invoice_number}</p>
                  <p className="text-sm text-muted-foreground">{invoice.customer_supplier_name}</p>
                </div>
                <Badge className={statusColors[invoice.status]}>
                  {getStatusLabel(invoice.status)}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{language === 'id' ? 'Jatuh tempo:' : 'Due:'}</span>
                <span>{formatDate(invoice.due_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-bold">{formatCurrency(invoice.total_amount)}</span>
              </div>
              <div className="flex gap-2 pt-2 border-t">
                <Button variant="ghost" size="sm" onClick={() => handlePreviewInvoice(invoice)}>
                  <Eye className="w-4 h-4 mr-1" />
                  {language === 'id' ? 'Lihat' : 'View'}
                </Button>
                {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                  <Button variant="outline" size="sm" onClick={() => handleRecordPayment(invoice)}>
                    <CreditCard className="w-4 h-4 mr-1" />
                    {language === 'id' ? 'Bayar' : 'Pay'}
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
            {language === 'id' ? 'Daftar Faktur' : 'Invoice List'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('invoices.invoiceNumber')}</TableHead>
                <TableHead>{language === 'id' ? 'Tipe' : 'Type'}</TableHead>
                <TableHead>{language === 'id' ? 'Referensi' : 'Reference'}</TableHead>
                <TableHead>{language === 'id' ? 'Pelanggan/Pemasok' : 'Customer/Supplier'}</TableHead>
                <TableHead>{t('invoices.dueDate')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead className="text-right">{t('common.total')}</TableHead>
                <TableHead className="text-right">{t('invoices.paidAmount')}</TableHead>
                <TableHead className="text-right">{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {invoice.type === 'sales' 
                        ? (language === 'id' ? 'Penjualan' : 'Sales')
                        : (language === 'id' ? 'Pembelian' : 'Purchase')}
                    </Badge>
                  </TableCell>
                  <TableCell>{invoice.reference_number}</TableCell>
                  <TableCell>{invoice.customer_supplier_name}</TableCell>
                  <TableCell>{formatDate(invoice.due_date)}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[invoice.status]}>
                      {getStatusLabel(invoice.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(invoice.total_amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(invoice.paid_amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handlePreviewInvoice(invoice)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-1"
                          onClick={() => handleRecordPayment(invoice)}
                        >
                          <CreditCard className="w-3 h-3" />
                          {t('invoices.recordPayment')}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Invoice Preview Modal */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="flex items-center justify-between">
              <span>{language === 'id' ? 'Preview Faktur' : 'Invoice Preview'}</span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedInvoice && (
            <div className="print-content">
              <InvoicePrintView invoice={selectedInvoice} />
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2 p-4 pt-0">
            <Button variant="outline" onClick={() => setPreviewDialogOpen(false)}>
              <X className="w-4 h-4 mr-2" />
              {language === 'id' ? 'Tutup' : 'Close'}
            </Button>
            <Button variant="outline" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              {language === 'id' ? 'Unduh PDF' : 'Download PDF'}
            </Button>
            <Button onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              {language === 'id' ? 'Cetak' : 'Print'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('invoices.recordPayment')}</DialogTitle>
            <DialogDescription>
              {selectedInvoice && (
                <>
                  {selectedInvoice.invoice_number} - {selectedInvoice.customer_supplier_name}
                  <br />
                  {language === 'id' ? 'Sisa:' : 'Remaining:'} {formatCurrency(selectedInvoice.total_amount - selectedInvoice.paid_amount)}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('payments.amount')}</Label>
              <Input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label>{t('payments.method')}</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {language === 'id' ? method.labelId : method.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('payments.paymentDate')}</Label>
              <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="space-y-2">
              <Label>{language === 'id' ? 'Referensi (Opsional)' : 'Reference (Optional)'}</Label>
              <Input placeholder={language === 'id' ? 'No. transfer/cek' : 'Transfer/Check no.'} />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSavePayment}>
              {t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
