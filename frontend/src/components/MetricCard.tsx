interface MetricCardProps {
  label: string;
  value: string;
  subtitle?: string;
  accent?: 'green' | 'blue' | 'yellow' | 'red';
}

const accentClasses: Record<NonNullable<MetricCardProps['accent']>, string> = {
  green: 'text-emerald-400',
  blue: 'text-sky-400',
  yellow: 'text-amber-400',
  red: 'text-red-400',
};

export function MetricCard({
  label,
  value,
  subtitle,
  accent = 'green',
}: MetricCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 flex flex-col gap-1">
      <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
        {label}
      </span>
      <span className={`text-xl font-semibold ${accentClasses[accent]}`}>
        {value}
      </span>
      {subtitle && (
        <span className="text-xs text-slate-400">
          {subtitle}
        </span>
      )}
    </div>
  );
}
