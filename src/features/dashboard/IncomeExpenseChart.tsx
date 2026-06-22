import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartProps {
  transactions: any[];
}

export default function IncomeExpenseChart({ transactions }: ChartProps) {
  const chartData = useMemo(() => {
    const dailyMap: { [key: string]: { income: number; expense: number } } = {};

    transactions.forEach((tx) => {
      const dateStr = new Date(tx.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });

      if (!dailyMap[dateStr]) {
        dailyMap[dateStr] = { income: 0, expense: 0 };
      }

      if (tx.type === 'income') {
        dailyMap[dateStr].income += tx.amount;
      } else {
        dailyMap[dateStr].expense += tx.amount;
      }
    });

    // Sort by date key chronologically (using actual timestamp for sort)
    return Object.entries(dailyMap)
      .map(([date, data]) => ({
        date,
        ...data,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-10); // Show last 10 days with activity
  }, [transactions]);

  return (
    <div className="rounded-xl border bg-card p-5 shadow-xs">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Income vs Expenses</h3>
        <p className="text-xs text-muted-foreground">Daily comparison of cash inflow and outflow</p>
      </div>
      <div className="h-64 w-full">
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'var(--color-muted-foreground)', fontSize: 11 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'var(--color-muted-foreground)', fontSize: 11 }}
                tickFormatter={(v) => `₹${v}`}
              />
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
              <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="income" name="Income" fill="var(--color-income, #10b981)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Expense" fill="var(--color-expense, #ef4444)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
