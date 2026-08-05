import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Building2,
  DollarSign,
  Trash2,
  Edit2,
  X
} from 'lucide-react';
import { expensesApi, projectsApi } from '../lib/api';
import { Expense, Project } from '../types';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { TableSkeleton } from '../components/ui/Skeleton';
import { toast } from 'sonner';

const expenseSchema = z.object({
  projectId: z.string().min(1, 'Please select a project'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().min(2, 'Description is required'),
  category: z.enum(['Labor', 'Materials', 'Equipment', 'Subcontractor', 'Other']),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  vendor: z.string().optional()
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

export const ExpensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [projectFilter, setProjectFilter] = useState('All');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Delete
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      category: 'Labor',
      amount: 0
    }
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [expData, projData] = await Promise.all([
        expensesApi.getAll(),
        projectsApi.getAll()
      ]);
      setExpenses(expData);
      setProjects(projData);
    } catch (err) {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingExpense(null);
    reset({
      projectId: projects[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      category: 'Labor',
      amount: 0,
      vendor: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (exp: Expense) => {
    setEditingExpense(exp);
    reset({
      projectId: exp.projectId,
      date: exp.date,
      description: exp.description,
      category: exp.category,
      amount: exp.amount,
      vendor: exp.vendor || ''
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: ExpenseFormData) => {
    try {
      if (editingExpense) {
        await expensesApi.update(editingExpense.id, data);
        toast.success('Expense updated');
      } else {
        await expensesApi.create(data);
        toast.success('Expense logged successfully');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      toast.error('Failed to save expense');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await expensesApi.delete(deleteId);
      toast.success('Expense deleted');
      setDeleteId(null);
      loadData();
    } catch (err) {
      toast.error('Failed to delete expense');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      (e.vendor && e.vendor.toLowerCase().includes(search.toLowerCase())) ||
      (e.projectName && e.projectName.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = categoryFilter === 'All' || e.category === categoryFilter;
    const matchesProject = projectFilter === 'All' || e.projectId === projectFilter;

    return matchesSearch && matchesCategory && matchesProject;
  });

  const totalFilteredAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Job Cost Expenses</h1>
          <p className="text-sm text-slate-500">Track labor, materials, equipment rentals & subcontractor bills</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Record Expense</span>
        </button>
      </div>

      {/* Filter Toolbar & Summary */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search expenses by description, vendor, or project..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto overflow-x-auto shrink-0">
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
            >
              <option value="All">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
            >
              <option value="All">All Categories</option>
              <option value="Labor">Labor</option>
              <option value="Materials">Materials</option>
              <option value="Equipment">Equipment</option>
              <option value="Subcontractor">Subcontractor</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredExpenses.length} expense item(s)</span>
          <span className="font-bold text-slate-900 text-sm">
            Total Filtered: ${totalFilteredAmount.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Expenses Table */}
      {loading ? (
        <TableSkeleton rows={6} cols={5} />
      ) : filteredExpenses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900">No Expenses Found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            {search || categoryFilter !== 'All' || projectFilter !== 'All'
              ? 'No expenses match your search query or filters.'
              : 'Start logging job site expenses to track project profitability.'}
          </p>
          <button
            onClick={openCreateModal}
            className="mt-4 inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Record Expense</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Description</th>
                  <th className="py-3.5 px-4">Project</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Vendor</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {exp.description}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {exp.projectName}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 text-slate-700">
                        {exp.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 text-xs">
                      {exp.vendor || '-'}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 text-xs whitespace-nowrap">
                      {exp.date}
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
                      ${exp.amount.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1">
                      <button
                        onClick={() => openEditModal(exp)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                        title="Edit Expense"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(exp.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                        title="Delete Expense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">
                {editingExpense ? 'Edit Job Site Expense' : 'Record Job Site Expense'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Associated Project *</label>
                <select
                  {...register('projectId')}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select Project --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {errors.projectId && <p className="text-xs text-rose-600 mt-1">{errors.projectId.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Expense Description *</label>
                <input
                  type="text"
                  {...register('description')}
                  placeholder="e.g., Structural steel beams order #2"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
                {errors.description && <p className="text-xs text-rose-600 mt-1">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Category *</label>
                  <select
                    {...register('category')}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Labor">Labor</option>
                    <option value="Materials">Materials</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Subcontractor">Subcontractor</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Amount ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('amount', { valueAsNumber: true })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.amount && <p className="text-xs text-rose-600 mt-1">{errors.amount.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Vendor / Supplier</label>
                  <input
                    type="text"
                    {...register('vendor')}
                    placeholder="e.g., Prairie Material"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Date *</label>
                  <input
                    type="date"
                    {...register('date')}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
                >
                  {isSubmitting ? 'Saving...' : editingExpense ? 'Update Expense' : 'Record Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Job Site Expense"
        description="Are you sure you want to delete this expense record?"
        confirmLabel="Delete Expense"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteId(null)}
      />
    </div>
  );
};
