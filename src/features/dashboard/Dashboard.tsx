
import { LayoutDashboard, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';

import UserMenu from '../../components/UserMenu';
import SummaryCards from '../../components/SummaryCards';
import BalanceTrendChart from './BalanceTrendChart';
import IncomeExpenseChart from './IncomeExpenseChart';
import SpendingBreakdown from './SpendingBreakdown';
import InsightsPanel from './InsightsPanel';
import TransactionsTable from '../../components/TransactionsTable';

export default function Dashboard() {
  const { data: txResponse, isLoading, error } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const response = await api.get('/transaction');
      return response.data;
    },
  });

  const transactions = txResponse?.data || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-primary">
              <LayoutDashboard className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="text-base font-bold tracking-tight">FinTrack</h1>
          </div>
          <div className="flex items-center gap-3">
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-sm text-destructive">Failed to load dashboard data. Please try refreshing.</p>
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <SummaryCards transactions={transactions} />
            </motion.div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BalanceTrendChart transactions={transactions} />
              <IncomeExpenseChart transactions={transactions} />
            </div>

            {/* Spending + Insights row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <SpendingBreakdown transactions={transactions} />
              </div>
              <InsightsPanel transactions={transactions} />
            </div>

            {/* Transactions Table */}
            <TransactionsTable />
          </>
        )}
      </main>
    </div>
  );
}
