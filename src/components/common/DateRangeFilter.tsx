import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format, subDays, subWeeks, subMonths, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { cn } from '@/lib/utils';

export type DateRangePreset = 'today' | 'yesterday' | 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'custom';

interface DateRange {
  from: Date;
  to: Date;
}

interface DateRangeFilterProps {
  value: DateRangePreset;
  customRange?: DateRange;
  onChange: (preset: DateRangePreset, range: DateRange) => void;
  className?: string;
}

const presets: { value: DateRangePreset; label: string }[] = [
  { value: 'today', label: 'Hari Ini' },
  { value: 'yesterday', label: 'Kemarin' },
  { value: 'this_week', label: 'Minggu Ini' },
  { value: 'last_week', label: 'Minggu Lalu' },
  { value: 'this_month', label: 'Bulan Ini' },
  { value: 'last_month', label: 'Bulan Lalu' },
];

export function getDateRange(preset: DateRangePreset, customRange?: DateRange): DateRange {
  const now = new Date();
  
  switch (preset) {
    case 'today':
      return { from: startOfDay(now), to: endOfDay(now) };
    case 'yesterday':
      const yesterday = subDays(now, 1);
      return { from: startOfDay(yesterday), to: endOfDay(yesterday) };
    case 'this_week':
      return { from: startOfWeek(now, { weekStartsOn: 1 }), to: endOfWeek(now, { weekStartsOn: 1 }) };
    case 'last_week':
      const lastWeek = subWeeks(now, 1);
      return { from: startOfWeek(lastWeek, { weekStartsOn: 1 }), to: endOfWeek(lastWeek, { weekStartsOn: 1 }) };
    case 'this_month':
      return { from: startOfMonth(now), to: endOfMonth(now) };
    case 'last_month':
      const lastMonth = subMonths(now, 1);
      return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
    case 'custom':
      return customRange || { from: startOfDay(now), to: endOfDay(now) };
    default:
      return { from: startOfDay(now), to: endOfDay(now) };
  }
}

export function DateRangeFilter({ value, customRange, onChange, className }: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempRange, setTempRange] = useState<DateRange | undefined>(customRange);

  const handlePresetClick = (preset: DateRangePreset) => {
    const range = getDateRange(preset);
    onChange(preset, range);
    if (preset !== 'custom') {
      setIsOpen(false);
    }
  };

  const currentRange = value === 'custom' && customRange ? customRange : getDateRange(value);
  const displayLabel = presets.find(p => p.value === value)?.label || 
    `${format(currentRange.from, 'dd MMM')} - ${format(currentRange.to, 'dd MMM')}`;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn('justify-start text-left font-normal', className)}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayLabel}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <div className="flex">
          <div className="border-r p-2 space-y-1">
            {presets.map(preset => (
              <Button
                key={preset.value}
                variant={value === preset.value ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                size="sm"
                onClick={() => handlePresetClick(preset.value)}
              >
                {preset.label}
              </Button>
            ))}
            <Button
              variant={value === 'custom' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
              size="sm"
              onClick={() => handlePresetClick('custom')}
            >
              Kustom
            </Button>
          </div>
          {value === 'custom' && (
            <div className="p-2">
              <Calendar
                mode="range"
                selected={{ from: tempRange?.from, to: tempRange?.to }}
                onSelect={(range) => {
                  if (range?.from && range?.to) {
                    setTempRange({ from: range.from, to: range.to });
                    onChange('custom', { from: range.from, to: range.to });
                  }
                }}
                numberOfMonths={1}
              />
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
