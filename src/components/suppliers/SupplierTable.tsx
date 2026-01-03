import { useState } from 'react';
import { mockSuppliers } from '@/data/mockData';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit, Trash2, Search, Plus, Mail, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusStyles = {
  active: 'bg-success/10 text-success border-success/20',
  inactive: 'bg-muted text-muted-foreground border-border',
};

export function SupplierTable() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSuppliers = mockSuppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Supplier
        </Button>
      </div>

      {/* Cards for mobile, Table for desktop */}
      <div className="grid gap-4 md:hidden">
        {filteredSuppliers.map((supplier) => (
          <div key={supplier.id} className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold">{supplier.name}</h3>
                <Badge 
                  variant="outline" 
                  className={cn("capitalize mt-1", statusStyles[supplier.status])}
                >
                  {supplier.status}
                </Badge>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                {supplier.email}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                {supplier.phone}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table for desktop */}
      <div className="hidden md:block bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSuppliers.map((supplier) => (
              <TableRow key={supplier.id} className="table-row-hover">
                <TableCell className="font-medium">{supplier.name}</TableCell>
                <TableCell className="text-muted-foreground">{supplier.email}</TableCell>
                <TableCell className="text-muted-foreground">{supplier.phone}</TableCell>
                <TableCell className="text-muted-foreground max-w-xs truncate">
                  {supplier.address}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={cn("capitalize", statusStyles[supplier.status])}
                  >
                    {supplier.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
