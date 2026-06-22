import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartProps {
  transactions: any[];
}

export default function BalanceTrendChart({ transactions }: ChartProps) {
  const chartData = useMemo(() => {
    // Sort transactions by date ascending
    const sorted = [...transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let cumulativeBalance = 0;
    const dailyData: { [key: string]: number } = {};

    sorted.forEach((tx) => {
      const dateStr = new Date(tx.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      const change = tx.type === 'income' ? tx.amount : -tx.amount;
      cumulativeBalance += change;
      dailyData[dateStr] = cumulativeBalance;
    });

    return Object.entries(dailyData).map(([date, balance]) => ({
      date,
      balance,
    }));
  }, [transactions]);

  return (
    <div className="rounded-xl border bg-card p-5 shadow-xs">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Balance Trend</h3>
        <p className="text-xs text-muted-foreground">Cumulative balance change over time</p>
      </div>
      <div className="h-64 w-full">
        {chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
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
                formatter={(v: any) => [`₹${parseFloat(v).toFixed(2)}`, 'Balance']}
              />
              <Area
                type="monotone"
                dataKey="balance"
                stroke="var(--color-primary)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#balanceGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
