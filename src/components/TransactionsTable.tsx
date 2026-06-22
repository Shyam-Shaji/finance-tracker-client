import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, SlidersHorizontal, Plus, ArrowUpDown,
  Pencil, Trash2, Loader2, Calendar, Tag,
} from 'lucide-react';
import api from '../api/axios';
import { toast } from 'sonner';

import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

type TransactionType = 'income' | 'expense';
type Category = string;

const CATEGORIES = [
  'Food & Dining',
  'Rent & Utilities',
  'Transportation',
  'Salary',
  'Entertainment',
  'Shopping',
  'Healthcare',
  'Investments',
  'Others',
];

const TransactionsTable = () => {
  const queryClient = useQueryClient();
  const role = 'admin';

  const [filters, setFilters] = useState({ search: '', type: 'all', category: 'all' });
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<any>(null);
  const [form, setForm] = useState({
    date: '',
    type: 'expense' as TransactionType,
    description: '',
    amount: '',
    category: '',
  });

  const { data: txResponse, isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const response = await api.get('/transaction');
      return response.data;
    },
  });

  const transactions = txResponse?.data || [];

  const createMutation = useMutation({
    mutationFn: async (newTx: any) => {
      const response = await api.post('/transaction', newTx);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transaction added successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create transaction');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.put(`/transaction/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transaction updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update transaction');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/transaction/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transaction deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete transaction');
    },
  });

  const openAdd = () => {
    setEditingTx(null);
    setForm({
      date: new Date().toISOString().split('T')[0],
      type: 'expense',
      description: '',
      amount: '',
      category: CATEGORIES[0],
    });
    setDialogOpen(true);
  };

  const openEdit = (tx: any) => {
    setEditingTx(tx);
    setForm({
      date: tx.date
        ? new Date(tx.date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      type: tx.type,
      description: tx.description,
      amount: tx.amount.toString(),
      category: tx.category,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.description || !form.amount || !form.date) {
      toast.error('Please fill in all required fields');
      return;
    }
    const payload = {
      date: new Date(form.date),
      type: form.type,
      description: form.description,
      amount: parseFloat(form.amount),
      category: form.category || CATEGORIES[0],
    };
    try {
      if (editingTx) {
        await updateMutation.mutateAsync({ id: editingTx._id || editingTx.id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      setDialogOpen(false);
    } catch {
      // handled by onError
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch {
        // handled by onError
      }
    }
  };

  const toggleSort = (field: 'date' | 'amount') => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const filteredTransactions = useMemo(() => {
    let result = [...transactions];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (tx) =>
          tx.description.toLowerCase().includes(q) ||
          tx.category.toLowerCase().includes(q)
      );
    }
    if (filters.type !== 'all') result = result.filter((tx) => tx.type === filters.type);
    if (filters.category !== 'all') result = result.filter((tx) => tx.category === filters.category);

    result.sort((a, b) => {
      const valA = sortField === 'date' ? new Date(a.date).getTime() : a.amount;
      const valB = sortField === 'date' ? new Date(b.date).getTime() : b.amount;
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [transactions, filters, sortField, sortOrder]);

  const saving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="rounded-xl border bg-card shadow-sm">

      {/* ── Header ── */}
      <div className="p-4 sm:p-5 border-b">
        <div className="flex flex-col gap-3">
          {/* Title + action row */}
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-foreground">Transactions</h3>
            {role === 'admin' && (
              <Button size="sm" onClick={openAdd} className="h-8 shrink-0">
                <Plus className="h-4 w-4 mr-1" />
                <span className="hidden xs:inline">Add</span>
              </Button>
            )}
          </div>

          {/* Search + filter toggle row */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search transactions…"
                className="pl-9 h-9 w-full"
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="h-9 shrink-0"
              aria-label="Toggle filters"
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Collapsible filter row */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-3 pt-3">
                <Select
                  value={filters.type}
                  onValueChange={(v) => setFilters((f) => ({ ...f, type: v }))}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filters.category}
                  onValueChange={(v) => setFilters((f) => ({ ...f, category: v }))}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Sort controls (visible on mobile above list) ── */}
      <div className="flex items-center gap-2 px-4 sm:px-5 py-2 border-b sm:hidden bg-muted/30">
        <span className="text-xs text-muted-foreground mr-1">Sort:</span>
        <button
          onClick={() => toggleSort('date')}
          className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors ${sortField === 'date' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
        >
          <Calendar className="h-3 w-3" /> Date
        </button>
        <button
          onClick={() => toggleSort('amount')}
          className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors ${sortField === 'amount' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
        >
          <Tag className="h-3 w-3" /> Amount
        </button>
      </div>

      {/* ── Desktop Table ── */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b text-xs text-muted-foreground">
              <th
                className="text-left p-3 font-medium cursor-pointer hover:text-foreground transition-colors select-none"
                onClick={() => toggleSort('date')}
              >
                <span className="inline-flex items-center gap-1">
                  Date <ArrowUpDown className="h-3 w-3" />
                </span>
              </th>
              <th className="text-left p-3 font-medium">Description</th>
              <th className="text-left p-3 font-medium hidden md:table-cell">Category</th>
              <th
                className="text-right p-3 font-medium cursor-pointer hover:text-foreground transition-colors select-none"
                onClick={() => toggleSort('amount')}
              >
                <span className="inline-flex items-center gap-1 justify-end">
                  Amount <ArrowUpDown className="h-3 w-3" />
                </span>
              </th>
              {role === 'admin' && (
                <th className="text-right p-3 font-medium">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={role === 'admin' ? 5 : 4} className="p-10 text-center">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    Loading transactions…
                  </div>
                </td>
              </tr>
            ) : filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={role === 'admin' ? 5 : 4} className="p-10 text-center text-sm text-muted-foreground">
                  No transactions found
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx, i) => (
                <motion.tr
                  key={tx._id || tx.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b last:border-0 hover:bg-muted/40 transition-colors"
                >
                  <td className="p-3 text-sm text-muted-foreground whitespace-nowrap">
                    {new Date(tx.date).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="p-3 text-sm font-medium max-w-[160px] truncate">{tx.description}</td>
                  <td className="p-3 hidden md:table-cell">
                    <Badge variant="secondary" className="text-xs font-normal">
                      {tx.category}
                    </Badge>
                  </td>
                  <td className={`p-3 text-sm font-semibold text-right font-mono whitespace-nowrap ${tx.type === 'income' ? 'text-income' : 'text-expense'}`}>
                    {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  {role === 'admin' && (
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(tx)} className="h-7 w-7 p-0">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost" size="sm"
                          onClick={() => handleDelete(tx._id || tx.id)}
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Mobile Card List ── */}
      <div className="sm:hidden divide-y">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Loading transactions…
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            No transactions found
          </div>
        ) : (
          filteredTransactions.map((tx, i) => (
            <motion.div
              key={tx._id || tx.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors"
            >
              {/* Left: type indicator dot */}
              <div className={`w-2 h-2 rounded-full shrink-0 mt-0.5 ${tx.type === 'income' ? 'bg-income' : 'bg-expense'}`} />

              {/* Middle: description + meta */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{tx.description}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-xs text-muted-foreground">
                    {new Date(tx.date).toLocaleDateString('en-IN', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </span>
                  <Badge variant="secondary" className="text-xs font-normal h-4 px-1.5">
                    {tx.category}
                  </Badge>
                </div>
              </div>

              {/* Right: amount + actions */}
              <div className="flex items-center gap-1 shrink-0">
                <span className={`text-sm font-semibold font-mono ${tx.type === 'income' ? 'text-income' : 'text-expense'}`}>
                  {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                {role === 'admin' && (
                  <div className="flex items-center gap-0.5 ml-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(tx)} className="h-7 w-7 p-0">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost" size="sm"
                      onClick={() => handleDelete(tx._id || tx.id)}
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* ── Add / Edit Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-md sm:max-w-lg rounded-xl">
          <DialogHeader>
            <DialogTitle>{editingTx ? 'Edit Transaction' : 'Add Transaction'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-1">
            {/* Date + Type */}
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Date</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm((f) => ({ ...f, type: v as TransactionType }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-xs">Description</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="e.g., Monthly Salary"
              />
            </div>

            {/* Amount + Category */}
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Amount (₹)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm((f) => ({ ...f, category: v as Category }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:gap-0 pt-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editingTx ? 'Save Changes' : 'Add Transaction'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransactionsTable;