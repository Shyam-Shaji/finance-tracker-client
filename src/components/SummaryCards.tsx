import { useMemo } from "react";
import { motion } from "framer-motion";
import { IndianRupee, TrendingUp, TrendingDown, Wallet } from "lucide-react";

interface SummaryCardsProps {
  transactions: any[];
}

const SummaryCards = ({ transactions }: SummaryCardsProps) => {
  const { totalIncome, totalExpenses, balance } = useMemo(() => {
    const inc = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const exp = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    return { totalIncome: inc, totalExpenses: exp, balance: inc - exp };
  }, [transactions]);

  const cards = [
    {
      label: "Total Balance",
      value: balance,
      icon: Wallet,
      color: "text-primary" as const,
      bgColor: "bg-primary/10" as const,
    },
    {
      label: "Total Income",
      value: totalIncome,
      icon: TrendingUp,
      color: "text-income" as const,
      bgColor: "bg-income-muted" as const,
    },
    {
      label: "Total Expenses",
      value: totalExpenses,
      icon: TrendingDown,
      color: "text-expense" as const,
      bgColor: "bg-expense-muted" as const,
    },
    {
      label: "Transactions",
      value: transactions.length,
      icon: IndianRupee,
      color: "text-muted-foreground" as const,
      bgColor: "bg-muted" as const,
      isCount: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="p-5 rounded-xl border bg-card text-card-foreground shadow-xs flex items-center justify-between"
          >
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">{card.label}</span>
              <h3 className="text-2xl font-bold tracking-tight">
                {card.isCount
                  ? card.value.toLocaleString("en-US")
                  : `${card.value < 0 ? "-" : ""}₹${Math.abs(card.value).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`}
              </h3>
            </div>
            <div className={`p-3 rounded-lg ${card.bgColor} ${card.color}`}>
              <Icon className="h-5 w-5" />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default SummaryCards;
