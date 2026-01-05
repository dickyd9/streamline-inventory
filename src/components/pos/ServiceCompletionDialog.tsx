import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { POSCartItem, EmployeeAssignment, Employee } from '@/types/inventory';
import { mockEmployees } from '@/data/mockData';
import { Plus, Trash2, Users, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ServiceCompletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceItems: POSCartItem[];
  onComplete: (updatedItems: POSCartItem[]) => void;
}

interface ServiceAssignment {
  itemId: string;
  assignments: EmployeeAssignment[];
}

export function ServiceCompletionDialog({ open, onOpenChange, serviceItems, onComplete }: ServiceCompletionDialogProps) {
  const [assignments, setAssignments] = useState<ServiceAssignment[]>([]);
  const [employees] = useState<Employee[]>(mockEmployees.filter(e => e.status === 'active'));

  useEffect(() => {
    // Initialize assignments from existing data or empty
    const initialAssignments = serviceItems.map(item => ({
      itemId: item.itemId,
      assignments: item.employeeAssignments || [],
    }));
    setAssignments(initialAssignments);
  }, [serviceItems, open]);

  const addAssignment = (itemId: string) => {
    setAssignments(prev => prev.map(sa => {
      if (sa.itemId === itemId) {
        return {
          ...sa,
          assignments: [...sa.assignments, { employeeId: '', employeeName: '', percentage: 0 }],
        };
      }
      return sa;
    }));
  };

  const updateAssignment = (itemId: string, index: number, field: keyof EmployeeAssignment, value: string | number) => {
    setAssignments(prev => prev.map(sa => {
      if (sa.itemId === itemId) {
        const newAssignments = [...sa.assignments];
        if (field === 'employeeId') {
          const employee = employees.find(e => e.id === value);
          newAssignments[index] = {
            ...newAssignments[index],
            employeeId: value as string,
            employeeName: employee?.name || '',
          };
        } else {
          newAssignments[index] = { ...newAssignments[index], [field]: value };
        }
        return { ...sa, assignments: newAssignments };
      }
      return sa;
    }));
  };

  const removeAssignment = (itemId: string, index: number) => {
    setAssignments(prev => prev.map(sa => {
      if (sa.itemId === itemId) {
        const newAssignments = [...sa.assignments];
        newAssignments.splice(index, 1);
        return { ...sa, assignments: newAssignments };
      }
      return sa;
    }));
  };

  const getTotalPercentage = (itemId: string) => {
    const sa = assignments.find(a => a.itemId === itemId);
    return sa?.assignments.reduce((sum, a) => sum + (a.percentage || 0), 0) || 0;
  };

  const handleComplete = () => {
    // Validate all services have 100% assignment
    const invalidItems = serviceItems.filter(item => {
      const total = getTotalPercentage(item.itemId);
      return total !== 100;
    });

    if (invalidItems.length > 0) {
      toast.error(`Total persentase harus 100% untuk setiap jasa`);
      return;
    }

    // Check all assignments have employee selected
    const missingEmployee = assignments.some(sa => 
      sa.assignments.some(a => !a.employeeId)
    );
    if (missingEmployee) {
      toast.error('Pilih karyawan untuk setiap penugasan');
      return;
    }

    // Update items with assignments
    const updatedItems = serviceItems.map(item => {
      const sa = assignments.find(a => a.itemId === item.itemId);
      return {
        ...item,
        employeeAssignments: sa?.assignments || [],
      };
    });

    onComplete(updatedItems);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Penugasan Karyawan untuk Jasa
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-6">
            {serviceItems.map((item) => {
              const totalPct = getTotalPercentage(item.itemId);
              const isValid = totalPct === 100;
              const sa = assignments.find(a => a.itemId === item.itemId);

              return (
                <Card key={item.itemId}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-medium">{item.itemName}</h4>
                        <p className="text-sm text-muted-foreground">
                          Rp {item.total.toLocaleString()}
                        </p>
                      </div>
                      <Badge variant={isValid ? 'default' : 'destructive'}>
                        {totalPct}%
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      {sa?.assignments.map((assignment, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Select
                            value={assignment.employeeId}
                            onValueChange={(val) => updateAssignment(item.itemId, idx, 'employeeId', val)}
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Pilih Karyawan" />
                            </SelectTrigger>
                            <SelectContent>
                              {employees.map(emp => (
                                <SelectItem key={emp.id} value={emp.id}>
                                  {emp.name} ({emp.role})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="flex items-center gap-1 w-28">
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={assignment.percentage}
                              onChange={(e) => updateAssignment(item.itemId, idx, 'percentage', Number(e.target.value))}
                              className="w-20"
                            />
                            <span className="text-sm text-muted-foreground">%</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => removeAssignment(item.itemId, idx)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => addAssignment(item.itemId)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Tambah Karyawan
                      </Button>

                      {!isValid && (
                        <div className="flex items-center gap-2 text-sm text-destructive">
                          <AlertCircle className="w-4 h-4" />
                          <span>Total persentase harus 100%</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleComplete}>
            Konfirmasi & Selesaikan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
