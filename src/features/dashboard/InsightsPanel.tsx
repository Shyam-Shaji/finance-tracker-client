import { useMemo } from 'react';
import { Lightbulb, TrendingUp, Info, AlertTriangle } from 'lucide-react';

interface PanelProps {
  transactions: any[];
}

export default function InsightsPanel({ transactions }: PanelProps) {
  const insights = useMemo(() => {
    if (transactions.length === 0) return [];

    const list: { type: 'success' | 'warning' | 'info'; text: string; icon: any }[] = [];

    // Calculate basic totals
    const incomeList = transactions.filter((t) => t.type === 'income');
    const expenseList = transactions.filter((t) => t.type === 'expense');

    const totalIncome = incomeList.reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = expenseList.reduce((sum, t) => sum + t.amount, 0);

    // 1. Savings Rate Insight
    if (totalIncome > 0) {
      const savingsRate = ((totalIncome - totalExpense) / totalIncome) * 100;
      if (savingsRate > 20) {
        list.push({
          type: 'success',
          text: `Your savings rate is ${savingsRate.toFixed(0)}%. You're building wealth effectively!`,
          icon: TrendingUp,
        });
      } else if (savingsRate > 0) {
        list.push({
          type: 'info',
          text: `Your savings rate is ${savingsRate.toFixed(0)}%. Try to save at least 20% of your income.`,
          icon: Info,
        });
      } else {
        list.push({
          type: 'warning',
          text: `Your expenses exceed your income this period. Check where you can cut back.`,
          icon: AlertTriangle,
        });
      }
    }

    // 2. Highest Single Expense Insight
    if (expenseList.length > 0) {
      const highestExpense = [...expenseList].sort((a, b) => b.amount - a.amount)[0];
      list.push({
        type: 'info',
        text: `Your largest single expense was ₹${highestExpense.amount.toLocaleString()} for "${highestExpense.description}".`,
        icon: Lightbulb,
      });
    }

    // 3. Top Category Spending Insight
    if (expenseList.length > 0) {
      const categories: { [key: string]: number } = {};
      expenseList.forEach((t) => {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
      });

      const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
      if (topCategory) {
        list.push({
          type: 'info',
          text: `You spent the most on "${topCategory[0]}" (₹${topCategory[1].toLocaleString()}).`,
          icon: Info,
        });
      }
    }

    // 4. Activity status
    if (transactions.length > 10) {
      list.push({
        type: 'success',
        text: `You are consistently logging transactions (${transactions.length} entries). Keep it up!`,
        icon: Lightbulb,
      });
    }

    return list.slice(0, 3); // Return at most 3 relevant insights
  }, [transactions]);

  return (
    <div className="rounded-xl border bg-card p-5 shadow-xs h-full flex flex-col justify-between">
      <div>
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-foreground">Financial Insights</h3>
          <p className="text-xs text-muted-foreground">Automated observations about your cashflow</p>
        </div>

        {insights.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
            No insights available. Log more transactions!
          </div>
        ) : (
          <div className="space-y-3">
            {insights.map((insight, idx) => {
              const Icon = insight.icon;
              return (
                <div
                  key={idx}
                  className={`flex gap-3 p-3 rounded-lg border text-xs leading-relaxed ${
                    insight.type === 'success'
                      ? 'bg-income-muted/40 border-income/20 text-foreground'
                      : insight.type === 'warning'
                      ? 'bg-destructive/10 border-destructive/20 text-foreground'
                      : 'bg-muted/50 border-border text-foreground'
                  }`}
                >
                  <div className={`p-1 rounded-md shrink-0 h-fit ${
                    insight.type === 'success'
                      ? 'text-income bg-income-muted'
                      : insight.type === 'warning'
                      ? 'text-destructive bg-destructive/15'
                      : 'text-muted-foreground bg-muted'
                  }`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <p>{insight.text}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
