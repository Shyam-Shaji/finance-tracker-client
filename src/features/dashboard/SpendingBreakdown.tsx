import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ChartProps {
  transactions: any[];
}

const COLORS = [
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#f43f5e', // Rose
  '#64748b', // Slate
];

export default function SpendingBreakdown({ transactions }: ChartProps) {
  const data = useMemo(() => {
    const categories: { [key: string]: number } = {};
    let totalExpenses = 0;

    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
        totalExpenses += t.amount;
      });

    const sortedData = Object.entries(categories)
      .map(([name, value]) => ({
        name,
        value,
        percentage: totalExpenses > 0 ? (value / totalExpenses) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value);

    return { list: sortedData, totalExpenses };
  }, [transactions]);

  return (
    <div className="rounded-xl border bg-card p-5 shadow-xs h-full">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Spending Breakdown</h3>
        <p className="text-xs text-muted-foreground">Distribution of expenses by category</p>
      </div>

      {data.totalExpenses === 0 ? (
        <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
          No expenses recorded yet
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="h-48 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.list}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {data.list.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-popover)',
                    borderColor: 'var(--color-border)',
                    borderRadius: '8px',
                    color: 'var(--color-popover-foreground)',
                    fontSize: '12px',
                  }}
                  formatter={(v: any) => [`₹${parseFloat(v).toFixed(2)}`]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs text-muted-foreground">Total Spent</span>
              <span className="text-lg font-bold">₹{data.totalExpenses.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
            </div>
          </div>

          <div className="space-y-3.5">
            {data.list.slice(0, 5).map((item, index) => (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-foreground">{item.name}</span>
                  </div>
                  <span className="text-muted-foreground">
                    ₹{item.value.toLocaleString('en-US', { maximumFractionDigits: 0 })} ({item.percentage.toFixed(0)}%)
                  </span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: COLORS[index % COLORS.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
