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
import { Search, Plus, Edit, Trash2, Users, UserCheck, TrendingUp, DollarSign } from 'lucide-react';
import { mockEmployees, mockPOSTransactions } from '@/data/mockData';
import { Employee } from '@/types/inventory';
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
  const [dateFilter, setDateFilter] = useState('month');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    commissionRate: 0,
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
  
  // Calculate earnings per employee
  const employeeEarnings = employees.map(emp => {
    let totalEarnings = 0;
    completedTransactions.forEach(transaction => {
      transaction.items.forEach(item => {
        if (item.employeeAssignments) {
          const assignment = item.employeeAssignments.find(a => a.employeeId === emp.id);
          if (assignment) {
            totalEarnings += (item.total * assignment.percentage) / 100 * (emp.commissionRate || 0) / 100;
          }
        }
      });
    });
    return { ...emp, earnings: totalEarnings };
  });

  const totalCommissions = employeeEarnings.reduce((sum, e) => sum + e.earnings, 0);

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: '',
      department: '',
      commissionRate: 0,
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
      commissionRate: employee.commissionRate || 0,
      status: employee.status,
    });
    setDialogOpen(true);
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

  return (
    <MainLayout title={language === 'id' ? 'Karyawan' : 'Employees'}>
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
                <p className="text-sm text-muted-foreground">{language === 'id' ? 'Total Komisi' : 'Total Commission'}</p>
                <p className="text-2xl font-bold">{formatCurrency(totalCommissions)}</p>
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
                <TableHead>{language === 'id' ? 'Komisi %' : 'Commission %'}</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>{language === 'id' ? 'Penghasilan' : 'Earnings'}</TableHead>
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
                    <TableCell>{employee.commissionRate || 0}%</TableCell>
                    <TableCell>
                      <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                        {employee.status === 'active' ? (language === 'id' ? 'Aktif' : 'Active') : (language === 'id' ? 'Nonaktif' : 'Inactive')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-success font-medium">
                      {formatCurrency(empWithEarnings?.earnings || 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
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

      {/* Add/Edit Dialog */}
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
                <Label>{language === 'id' ? 'Rate Komisi (%)' : 'Commission Rate (%)'}</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.commissionRate}
                  onChange={(e) => setFormData({ ...formData, commissionRate: Number(e.target.value) })}
                />
              </div>
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
