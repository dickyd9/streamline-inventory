import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Users, 
  UserPlus,
  Shield,
  MoreVertical,
  Edit,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getRoleLabel, AppRole } from '@/lib/permissions';

interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  role: AppRole;
  created_at: string;
}

const roleColors: Record<AppRole, string> = {
  admin: 'bg-destructive/10 text-destructive',
  owner: 'bg-primary/10 text-primary',
  staff: 'bg-muted text-muted-foreground',
};

export default function UserManagement() {
  const { t, formatDate, language } = useLanguage();
  const { canManageUsers, isOwnerOrAdmin, role: currentUserRole } = usePermissions();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [newRole, setNewRole] = useState<AppRole>('staff');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch profiles with roles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, created_at');

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      const usersWithRoles: UserWithRole[] = (profiles || []).map(profile => {
        const userRole = roles?.find(r => r.user_id === profile.id);
        return {
          id: profile.id,
          email: profile.email || '',
          full_name: profile.full_name,
          role: (userRole?.role as AppRole) || 'staff',
          created_at: profile.created_at,
        };
      });

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: t('error.generic'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = (user: UserWithRole) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setRoleDialogOpen(true);
  };

  const handleSaveRole = async () => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', selectedUser.id);

      if (error) throw error;

      toast({
        title: t('success.updated'),
        description: language === 'id' 
          ? `Peran ${selectedUser.full_name || selectedUser.email} telah diubah` 
          : `Role for ${selectedUser.full_name || selectedUser.email} has been updated`,
      });

      setRoleDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: t('error.generic'),
        variant: 'destructive',
      });
    }
  };

  const filteredUsers = users.filter(user => {
    return (
      (user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    );
  });

  if (!isOwnerOrAdmin) {
    return (
      <MainLayout title={t('userManagement.title')}>
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {language === 'id' ? 'Akses Ditolak' : 'Access Denied'}
            </h3>
            <p className="text-muted-foreground">
              {language === 'id' 
                ? 'Anda tidak memiliki izin untuk mengakses halaman ini'
                : 'You do not have permission to access this page'}
            </p>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={t('userManagement.title')}>
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'id' ? 'Total Pengguna' : 'Total Users'}
                </p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <Shield className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'id' ? 'Admin/Owner' : 'Admin/Owner'}
                </p>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.role === 'admin' || u.role === 'owner').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Users className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'id' ? 'Staf' : 'Staff'}
                </p>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.role === 'staff').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
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
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {language === 'id' ? 'Daftar Pengguna' : 'User List'}
          </CardTitle>
          <CardDescription>
            {language === 'id' 
              ? 'Kelola pengguna dan peran mereka dalam sistem'
              : 'Manage users and their roles in the system'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('userManagement.userName')}</TableHead>
                  <TableHead>{t('userManagement.userEmail')}</TableHead>
                  <TableHead>{t('userManagement.userRole')}</TableHead>
                  <TableHead>{language === 'id' ? 'Terdaftar' : 'Registered'}</TableHead>
                  <TableHead className="text-right">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.full_name || '-'}
                      {user.id === currentUser?.id && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          {language === 'id' ? 'Anda' : 'You'}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge className={roleColors[user.role]}>
                        {getRoleLabel(user.role, language)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(user.created_at)}</TableCell>
                    <TableCell className="text-right">
                      {user.id !== currentUser?.id && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleChangeRole(user)}>
                              <Edit className="w-4 h-4 mr-2" />
                              {t('userManagement.changeRole')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Change Role Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('userManagement.changeRole')}</DialogTitle>
            <DialogDescription>
              {selectedUser && (selectedUser.full_name || selectedUser.email)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('userManagement.userRole')}</Label>
              <Select value={newRole} onValueChange={(v) => setNewRole(v as AppRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currentUserRole === 'admin' && (
                    <SelectItem value="admin">{getRoleLabel('admin', language)}</SelectItem>
                  )}
                  <SelectItem value="owner">{getRoleLabel('owner', language)}</SelectItem>
                  <SelectItem value="staff">{getRoleLabel('staff', language)}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>{getRoleLabel('admin', language)}:</strong> {language === 'id' ? 'Akses penuh ke semua fitur' : 'Full access to all features'}</p>
              <p><strong>{getRoleLabel('owner', language)}:</strong> {language === 'id' ? 'Kelola pengguna, pengaturan, dan semua data' : 'Manage users, settings, and all data'}</p>
              <p><strong>{getRoleLabel('staff', language)}:</strong> {language === 'id' ? 'Dapat menambah data, tidak bisa menghapus' : 'Can add data, cannot delete'}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSaveRole}>
              {t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
