import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, Edit, Trash2, Users, UserCheck, TrendingUp, DollarSign, Eye, FileText, Printer } from 'lucide-react';
import { mockEmployees, mockPOSTransactions } from '@/data/mockData';
import { Employee, POSTransaction } from '@/types/inventory';
import { toast } from 'sonner';
import { GrowthIndicator } from '@/components/common/GrowthIndicator';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFeatureFlags } from '@/contexts/FeatureFlagsContext';

export default function Employees() {
  const { language, formatCurrency } = useLanguage();
  const { isEnabled } = useFeatureFlags();
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [viewTab, setViewTab] = useState<'list' | 'report'>('list');
  const [selectedEmployeeReport, setSelectedEmployeeReport] = useState<Employee | null>(null);

  // Form state - removed commissionRate
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    status: 'active' as 'active' | 'inactive',
  });

  const departments = [...new Set(employees.map(e => e.department).filter(Boolean))];

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = departmentFilter === 'all' || emp.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  // Calculate employee stats
  const activeEmployees = employees.filter(e => e.status === 'active').length;
  const completedTransactions = mockPOSTransactions.filter(t => t.status === 'completed');
  
  // Calculate earnings per employee from service assignments
  const employeeEarnings = employees.map(emp => {
    let totalEarnings = 0;
    let transactionCount = 0;
    const transactions: POSTransaction[] = [];

    completedTransactions.forEach(transaction => {
      let wasInvolved = false;
      transaction.items.forEach(item => {
        if (item.employeeAssignments) {
          const assignment = item.employeeAssignments.find(a => a.employeeId === emp.id);
          if (assignment) {
            totalEarnings += assignment.earnings || (item.total * assignment.percentage) / 100;
            wasInvolved = true;
          }
        }
      });
      if (wasInvolved) {
        transactionCount++;
        transactions.push(transaction);
      }
    });

    return { ...emp, earnings: totalEarnings, transactionCount, transactions };
  });

  const totalEarnings = employeeEarnings.reduce((sum, e) => sum + e.earnings, 0);

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: '',
      department: '',
      status: 'active',
    });
    setDialogOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      role: employee.role,
      department: employee.department || '',
      status: employee.status,
    });
    setDialogOpen(true);
  };

  const handleViewReport = (employee: Employee) => {
    setSelectedEmployeeReport(employee);
    setViewTab('report');
  };

  const handleSave = () => {
    if (!formData.name || !formData.email) {
      toast.error('Nama dan email harus diisi');
      return;
    }

    if (selectedEmployee) {
      setEmployees(employees.map(e =>
        e.id === selectedEmployee.id
          ? { ...e, ...formData }
          : e
      ));
      toast.success('Karyawan berhasil diperbarui');
    } else {
      const newEmployee: Employee = {
        id: Date.now().toString(),
        ...formData,
        hireDate: new Date().toISOString().split('T')[0],
      };
      setEmployees([...employees, newEmployee]);
      toast.success('Karyawan berhasil ditambahkan');
    }
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (selectedEmployee) {
      setEmployees(employees.filter(e => e.id !== selectedEmployee.id));
      toast.success('Karyawan berhasil dihapus');
      setDeleteDialogOpen(false);
      setSelectedEmployee(null);
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  if (!isEnabled('employees')) {
    return (
      <MainLayout title={language === 'id' ? 'Karyawan' : 'Employees'}>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              {language === 'id' ? 'Modul Karyawan Tidak Tersedia' : 'Employee Module Not Available'}
            </h2>
            <p className="text-muted-foreground">
              {language === 'id' ? 'Hubungi administrator untuk mengaktifkan fitur ini.' : 'Contact administrator to enable this feature.'}
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Get employee report data
  const reportEmployee = selectedEmployeeReport 
    ? employeeEarnings.find(e => e.id === selectedEmployeeReport.id)
    : null;

  return (
    <MainLayout title={language === 'id' ? 'Karyawan' : 'Employees'}>
      <Tabs value={viewTab} onValueChange={(v) => setViewTab(v as 'list' | 'report')}>
        <TabsList className="mb-4">
          <TabsTrigger value="list">
            <Users className="w-4 h-4 mr-2" />
            {language === 'id' ? 'Daftar' : 'List'}
          </TabsTrigger>
          <TabsTrigger value="report" disabled={!selectedEmployeeReport}>
            <FileText className="w-4 h-4 mr-2" />
            {language === 'id' ? 'Laporan' : 'Report'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{language === 'id' ? 'Total Karyawan' : 'Total Employees'}</p>
                    <p className="text-2xl font-bold">{employees.length}</p>
                  </div>
                  <div className="p-3 rounded-full bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{language === 'id' ? 'Karyawan Aktif' : 'Active Employees'}</p>
                    <p className="text-2xl font-bold">{activeEmployees}</p>
                  </div>
                  <div className="p-3 rounded-full bg-success/10">
                    <UserCheck className="h-6 w-6 text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{language === 'id' ? 'Transaksi Selesai' : 'Completed Trans.'}</p>
                    <p className="text-2xl font-bold">{completedTransactions.length}</p>
                    <GrowthIndicator value={15} />
                  </div>
                  <div className="p-3 rounded-full bg-warning/10">
                    <TrendingUp className="h-6 w-6 text-warning" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{language === 'id' ? 'Total Pendapatan' : 'Total Earnings'}</p>
                    <p className="text-2xl font-bold">{formatCurrency(totalEarnings)}</p>
                    <GrowthIndicator value={8} />
                  </div>
                  <div className="p-3 rounded-full bg-accent/10">
                    <DollarSign className="h-6 w-6 text-accent-foreground" />
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
                placeholder={language === 'id' ? 'Cari karyawan...' : 'Search employees...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={language === 'id' ? 'Semua Departemen' : 'All Departments'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'id' ? 'Semua Departemen' : 'All Departments'}</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept!}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleAddEmployee}>
              <Plus className="w-4 h-4 mr-2" />
              {language === 'id' ? 'Tambah Karyawan' : 'Add Employee'}
            </Button>
          </div>

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{language === 'id' ? 'Nama' : 'Name'}</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>{language === 'id' ? 'Telepon' : 'Phone'}</TableHead>
                    <TableHead>{language === 'id' ? 'Jabatan' : 'Role'}</TableHead>
                    <TableHead>{language === 'id' ? 'Departemen' : 'Department'}</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>{language === 'id' ? 'Transaksi' : 'Transactions'}</TableHead>
                    <TableHead>{language === 'id' ? 'Pendapatan' : 'Earnings'}</TableHead>
                    <TableHead className="text-right">{language === 'id' ? 'Aksi' : 'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee) => {
                    const empWithEarnings = employeeEarnings.find(e => e.id === employee.id);
                    return (
                      <TableRow key={employee.id}>
                        <TableCell className="font-medium">{employee.name}</TableCell>
                        <TableCell>{employee.email}</TableCell>
                        <TableCell>{employee.phone}</TableCell>
                        <TableCell>{employee.role}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{employee.department || '-'}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                            {employee.status === 'active' ? (language === 'id' ? 'Aktif' : 'Active') : (language === 'id' ? 'Nonaktif' : 'Inactive')}
                          </Badge>
                        </TableCell>
                        <TableCell>{empWithEarnings?.transactionCount || 0}</TableCell>
                        <TableCell className="text-success font-medium">
                          {formatCurrency(empWithEarnings?.earnings || 0)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleViewReport(employee)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleEditEmployee(employee)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => { setSelectedEmployee(employee); setDeleteDialogOpen(true); }}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="report">
          {reportEmployee && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{reportEmployee.name}</h2>
                  <p className="text-muted-foreground">{reportEmployee.role} - {reportEmployee.department}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handlePrintReport}>
                    <Printer className="w-4 h-4 mr-2" />
                    {language === 'id' ? 'Cetak' : 'Print'}
                  </Button>
                  <Button variant="ghost" onClick={() => { setSelectedEmployeeReport(null); setViewTab('list'); }}>
                    {language === 'id' ? 'Kembali' : 'Back'}
                  </Button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">{language === 'id' ? 'Total Transaksi' : 'Total Transactions'}</p>
                    <p className="text-2xl font-bold">{reportEmployee.transactionCount}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">{language === 'id' ? 'Total Pendapatan' : 'Total Earnings'}</p>
                    <p className="text-2xl font-bold text-success">{formatCurrency(reportEmployee.earnings)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">{language === 'id' ? 'Rata-rata per Transaksi' : 'Avg per Transaction'}</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(reportEmployee.transactionCount > 0 ? reportEmployee.earnings / reportEmployee.transactionCount : 0)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Transaction History */}
              <Card>
                <CardHeader>
                  <CardTitle>{language === 'id' ? 'Riwayat Transaksi' : 'Transaction History'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{language === 'id' ? 'No. Transaksi' : 'Transaction No.'}</TableHead>
                        <TableHead>{language === 'id' ? 'Tanggal' : 'Date'}</TableHead>
                        <TableHead>{language === 'id' ? 'Item' : 'Item'}</TableHead>
                        <TableHead>{language === 'id' ? 'Persentase' : 'Percentage'}</TableHead>
                        <TableHead>{language === 'id' ? 'Pendapatan' : 'Earnings'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportEmployee.transactions.map(t => (
                        t.items.filter(item => 
                          item.employeeAssignments?.some(a => a.employeeId === reportEmployee.id)
                        ).map((item, idx) => {
                          const assignment = item.employeeAssignments?.find(a => a.employeeId === reportEmployee.id);
                          return (
                            <TableRow key={`${t.id}-${idx}`}>
                              <TableCell className="font-mono">{t.transactionNumber}</TableCell>
                              <TableCell>{new Date(t.completedAt || t.createdAt).toLocaleDateString('id-ID')}</TableCell>
                              <TableCell>{item.itemName}</TableCell>
                              <TableCell>{assignment?.percentage}%</TableCell>
                              <TableCell className="text-success font-medium">
                                {formatCurrency(assignment?.earnings || (item.total * (assignment?.percentage || 0)) / 100)}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add/Edit Dialog - removed commission rate */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedEmployee 
                ? (language === 'id' ? 'Edit Karyawan' : 'Edit Employee')
                : (language === 'id' ? 'Tambah Karyawan' : 'Add Employee')
              }
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'id' ? 'Nama' : 'Name'} *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'id' ? 'Telepon' : 'Phone'}</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'id' ? 'Jabatan' : 'Role'}</Label>
                <Input
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'id' ? 'Departemen' : 'Department'}</Label>
                <Input
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(val: 'active' | 'inactive') => setFormData({ ...formData, status: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{language === 'id' ? 'Aktif' : 'Active'}</SelectItem>
                    <SelectItem value="inactive">{language === 'id' ? 'Nonaktif' : 'Inactive'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {language === 'id' ? 'Batal' : 'Cancel'}
            </Button>
            <Button onClick={handleSave}>
              {language === 'id' ? 'Simpan' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{language === 'id' ? 'Hapus Karyawan?' : 'Delete Employee?'}</AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'id' 
                ? `Apakah Anda yakin ingin menghapus ${selectedEmployee?.name}? Tindakan ini tidak dapat dibatalkan.`
                : `Are you sure you want to delete ${selectedEmployee?.name}? This action cannot be undone.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{language === 'id' ? 'Batal' : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              {language === 'id' ? 'Hapus' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
