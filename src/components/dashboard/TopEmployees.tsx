import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { mockEmployees, mockPOSTransactions } from '@/data/mockData';
import { TrendingUp, Trophy } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFeatureFlags } from '@/contexts/FeatureFlagsContext';

export function TopEmployees() {
  const { language, formatCurrency } = useLanguage();
  const { isEnabled } = useFeatureFlags();

  if (!isEnabled('employeeAnalytics')) {
    return null;
  }

  // Calculate employee performance
  const completedTransactions = mockPOSTransactions.filter(t => t.status === 'completed');
  
  const employeeStats = mockEmployees.map(emp => {
    let totalRevenue = 0;
    let totalEarnings = 0;
    let transactionCount = 0;

    completedTransactions.forEach(transaction => {
      transaction.items.forEach(item => {
        if (item.employeeAssignments) {
          const assignment = item.employeeAssignments.find(a => a.employeeId === emp.id);
          if (assignment) {
            const itemRevenue = (item.total * assignment.percentage) / 100;
            totalRevenue += itemRevenue;
            totalEarnings += assignment.earnings || itemRevenue;
            transactionCount++;
          }
        }
      });
    });

    return {
      ...emp,
      totalRevenue,
      transactionCount,
      earnings: totalEarnings,
    };
  }).filter(e => e.transactionCount > 0)
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 5);

  if (employeeStats.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="w-4 h-4 text-warning" />
          {language === 'id' ? 'Top Karyawan' : 'Top Employees'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {employeeStats.map((employee, index) => (
          <div key={employee.id} className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {employee.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              {index < 3 && (
                <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                  index === 0 ? 'bg-yellow-400 text-yellow-900' :
                  index === 1 ? 'bg-gray-300 text-gray-700' :
                  'bg-amber-600 text-amber-100'
                }`}>
                  {index + 1}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{employee.name}</p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {employee.role}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {employee.transactionCount} {language === 'id' ? 'transaksi' : 'transactions'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-sm text-primary">
                {formatCurrency(employee.totalRevenue)}
              </p>
              <div className="flex items-center gap-1 text-xs text-success">
                <TrendingUp className="w-3 h-3" />
                <span>{formatCurrency(employee.earnings)}</span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
