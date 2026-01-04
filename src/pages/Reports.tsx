import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  Download,
  Calendar,
  FileSpreadsheet,
  FileText,
  ShoppingBag,
  ArrowLeftRight
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePermissions } from '@/hooks/usePermissions';
import { useToast } from '@/hooks/use-toast';

export default function Reports() {
  const { t, language } = useLanguage();
  const { hasPermission } = usePermissions();
  const { toast } = useToast();

  const reportTypes = [
    {
      title: t('reports.inventorySummary'),
      description: language === 'id' 
        ? 'Ringkasan semua produk, level stok, dan valuasi' 
        : 'Overview of all products, stock levels, and valuations',
      icon: Package,
      color: 'primary',
      exportOptions: ['pdf', 'csv', 'excel'],
    },
    {
      title: t('reports.purchaseAnalysis'),
      description: language === 'id' 
        ? 'Analisis tren pembelian dan performa pemasok' 
        : 'Analyze purchasing trends and supplier performance',
      icon: ShoppingCart,
      color: 'success',
      exportOptions: ['pdf', 'csv', 'excel'],
    },
    {
      title: t('reports.salesAnalysis'),
      description: language === 'id' 
        ? 'Analisis penjualan dan performa pelanggan' 
        : 'Sales analysis and customer performance',
      icon: ShoppingBag,
      color: 'warning',
      exportOptions: ['pdf', 'csv', 'excel'],
    },
    {
      title: t('reports.stockMovementReport'),
      description: language === 'id' 
        ? 'Lacak pergerakan inventori dari waktu ke waktu' 
        : 'Track inventory movements over time',
      icon: ArrowLeftRight,
      color: 'primary',
      exportOptions: ['pdf', 'csv', 'excel'],
    },
    {
      title: t('reports.valuationReport'),
      description: language === 'id' 
        ? 'Laporan valuasi inventori detail per kategori' 
        : 'Detailed inventory valuation by category',
      icon: BarChart3,
      color: 'success',
      exportOptions: ['pdf', 'csv', 'excel'],
    },
    {
      title: language === 'id' ? 'Laporan Faktur' : 'Invoice Report',
      description: language === 'id' 
        ? 'Ringkasan faktur dan status pembayaran' 
        : 'Invoice summary and payment status',
      icon: FileText,
      color: 'warning',
      exportOptions: ['pdf', 'csv', 'excel'],
    },
  ];

  const colorMap: Record<string, string> = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
  };

  const handleExport = (reportTitle: string, format: string) => {
    if (!hasPermission('export:reports')) {
      toast({
        title: t('error.forbidden'),
        description: language === 'id' 
          ? 'Anda tidak memiliki izin untuk mengekspor laporan' 
          : 'You do not have permission to export reports',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: t('success.exported'),
      description: `${reportTitle} - ${format.toUpperCase()}`,
    });
  };

  return (
    <MainLayout title={t('reports.title')}>
      {/* Date Range Selector */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm font-medium">{t('reports.dateRange')}:</span>
        </div>
        <Select defaultValue="30days">
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">{t('reports.last7Days')}</SelectItem>
            <SelectItem value="30days">{t('reports.last30Days')}</SelectItem>
            <SelectItem value="90days">{t('reports.last90Days')}</SelectItem>
            <SelectItem value="year">{t('reports.thisYear')}</SelectItem>
            <SelectItem value="custom">{t('reports.customRange')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportTypes.map((report) => (
          <Card key={report.title} className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${colorMap[report.color]}`}>
                <report.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{report.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {report.description}
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2"
                    onClick={() => handleExport(report.title, 'pdf')}
                  >
                    <Download className="w-4 h-4" />
                    {t('reports.exportPdf')}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2"
                    onClick={() => handleExport(report.title, 'csv')}
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    {t('reports.exportCsv')}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2"
                    onClick={() => handleExport(report.title, 'excel')}
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    {t('reports.exportExcel')}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Coming Soon Section */}
      <div className="mt-8 p-8 bg-muted/50 rounded-xl border border-dashed border-border text-center">
        <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          {language === 'id' ? 'Analitik Lanjutan Segera Hadir' : 'Advanced Analytics Coming Soon'}
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          {language === 'id' 
            ? 'Kami sedang mengembangkan fitur analitik lanjutan termasuk prediksi stok, perbandingan pemasok, dan saran reorder otomatis.'
            : 'We\'re working on advanced analytics features including predictive stock analysis, supplier comparison, and automated reorder suggestions.'}
        </p>
      </div>
    </MainLayout>
  );
}
