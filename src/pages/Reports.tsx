import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  Download,
  Calendar
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const reportTypes = [
  {
    title: 'Inventory Summary',
    description: 'Overview of all products, stock levels, and valuations',
    icon: Package,
    color: 'primary',
  },
  {
    title: 'Purchase Analysis',
    description: 'Analyze purchasing trends and supplier performance',
    icon: ShoppingCart,
    color: 'success',
  },
  {
    title: 'Stock Movement',
    description: 'Track inventory movements over time',
    icon: TrendingUp,
    color: 'warning',
  },
  {
    title: 'Valuation Report',
    description: 'Detailed inventory valuation by category',
    icon: BarChart3,
    color: 'primary',
  },
];

const colorMap = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
};

export default function Reports() {
  return (
    <MainLayout title="Reports">
      {/* Date Range Selector */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm font-medium">Date Range:</span>
        </div>
        <Select defaultValue="30days">
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="90days">Last 90 days</SelectItem>
            <SelectItem value="year">This year</SelectItem>
            <SelectItem value="custom">Custom range</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportTypes.map((report) => (
          <Card key={report.title} className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${colorMap[report.color as keyof typeof colorMap]}`}>
                <report.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{report.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {report.description}
                </p>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="w-4 h-4" />
                    Export PDF
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="w-4 h-4" />
                    Export CSV
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Coming Soon Section */}
      <div className="mt-8 p-8 bg-muted/50 rounded-xl border border-dashed border-border text-center">
        <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Advanced Analytics Coming Soon</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          We're working on advanced analytics features including predictive stock analysis, 
          supplier comparison, and automated reorder suggestions.
        </p>
      </div>
    </MainLayout>
  );
}
