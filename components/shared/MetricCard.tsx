import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

type Trend = 'up' | 'down' | 'neutral';

interface MetricCardProps {
  label: string;
  value: string;
  subtext?: string;
  trend?: Trend;
  trendValue?: string;
  badge?: string;
  badgeColor?: 'red' | 'amber' | 'green' | 'blue';
  alertDot?: boolean;
  className?: string;
}

const badgeColors = {
  red: 'bg-red-500/20 text-red-400 border border-red-500/30',
  amber: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  green: 'bg-green-500/20 text-green-400 border border-green-500/30',
  blue: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
};

export default function MetricCard({
  label, value, subtext, trend, trendValue, badge, badgeColor = 'blue', alertDot, className
}: MetricCardProps) {
  return (
    <div className={cn(
      'bg-[#1e2130] border border-[#2a2f45] rounded-lg p-4 hover:border-[#3a4060] transition-all group',
      className
    )}>
      <div className="flex items-start justify-between mb-2">
        <p className="text-[11px] font-medium text-[#5a6280] uppercase tracking-wider">{label}</p>
        {badge && (
          <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide', badgeColors[badgeColor])}>
            {badge}
          </span>
        )}
        {alertDot && !badge && (
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse flex-shrink-0" />
        )}
      </div>
      <p className="text-2xl font-bold text-[#e8eaf0] tracking-tight mb-1">{value}</p>
      <div className="flex items-center gap-1.5">
        {trend && (
          <span className={cn(
            'flex items-center gap-0.5 text-[11px] font-medium',
            trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-[#5a6280]'
          )}>
            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : trend === 'down' ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
            {trendValue}
          </span>
        )}
        {subtext && <p className="text-[11px] text-[#5a6280]">{subtext}</p>}
      </div>
    </div>
  );
}
