'use client';

interface MealTimingChartProps {
  data: { label: string; percent: number }[];
}

export function MealTimingChart({ data }: MealTimingChartProps) {
  const maxPercent = Math.max(...data.map(d => d.percent), 1);
  
  const colors = [
    'from-amber-400 to-amber-500',    // Morning
    'from-sage-400 to-sage-500',      // Midday
    'from-violet-400 to-violet-500',  // Evening
    'from-rose-400 to-rose-500',      // Late
  ];
  
  return (
    <div className="card-elevated">
      <h3 className="font-semibold text-warm-800 mb-6">Meal Timing Distribution</h3>
      <div className="space-y-5">
        {data.map(({ label, percent }, index) => (
          <div key={label}>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-warm-600">{label}</span>
              <span className="font-semibold text-warm-800">{percent}%</span>
            </div>
            <div className="h-3 bg-warm-100 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${colors[index]} rounded-full transition-all duration-700`}
                style={{ width: `${(percent / maxPercent) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
