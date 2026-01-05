import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GrowthIndicatorProps {
  value: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function GrowthIndicator({ 
  value, 
  label = 'vs periode lalu',
  size = 'md',
  showLabel = true,
  className 
}: GrowthIndicatorProps) {
  const isPositive = value > 0;
  const isNeutral = value === 0;
  const isNegative = value < 0;

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className={cn('flex items-center gap-1', sizeClasses[size], className)}>
      <div className={cn(
        'flex items-center gap-0.5 font-medium',
        isPositive && 'text-success',
        isNegative && 'text-destructive',
        isNeutral && 'text-muted-foreground'
      )}>
        {isPositive && <TrendingUp className={iconSizes[size]} />}
        {isNegative && <TrendingDown className={iconSizes[size]} />}
        {isNeutral && <Minus className={iconSizes[size]} />}
        <span>{isPositive ? '+' : ''}{value.toFixed(1)}%</span>
      </div>
      {showLabel && (
        <span className="text-muted-foreground">{label}</span>
      )}
    </div>
  );
}
