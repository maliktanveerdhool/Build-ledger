import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  FileText,
  Plus,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  Trash2,
  Eye,
  Filter,
  DollarSign
} from 'lucide-react';
import { invoicesApi } from '../lib/api';
import { Invoice } from '../types';
import { Badge } from '../components/ui/Badge';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { TableSkeleton } from '../components/ui/Skeleton';
import { toast } from 'sonner';

export const InvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') || 'All';

  // Delete
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const navigate = useNavigate();

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const data = await invoicesApi.getAll();
      setInvoices(data);
    } catch (err) {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const handleMarkPaid = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await invoicesApi.updateStatus(id, 'Paid');
      toast.success('Invoice marked as Paid');
      loadInvoices();
    } catch (err) {
      toast.error('Failed to update invoice status');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await invoicesApi.delete(deleteId);
      toast.success('Invoice deleted');
      setDeleteId(null);
      loadInvoices();
    } catch (err) {
      toast.error('Failed to delete invoice');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusFilterChange = (status: string) => {
    if (status === 'All') {
      searchParams.delete('status');
    } else {
      searchParams.set('status', status);
    }
    setSearchParams(searchParams);
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      (inv.projectName && inv.projectName.toLowerCase().includes(search.toLowerCase())) ||
      (inv.clientName && inv.clientName.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Progress Billing & Invoices</h1>
          <p className="text-sm text-slate-500">Track progress draws, AIA retainage, and payment status</p>
        </div>
        <button
          onClick={() => navigate('/invoices/new')}
          className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Create Progress Invoice</span>
        </button>
      </div>

      {/* Search & Status Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by invoice #, project, or client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto shrink-0 pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-slate-400 mr-1" />
          {['All', 'Draft', 'Sent', 'Paid', 'Overdue'].map((st) => (
            <button
              key={st}
              onClick={() => handleStatusFilterChange(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      {loading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : filteredInvoices.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900">No Invoices Found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            {search || statusFilter !== 'All'
              ? 'No invoices match your current search or status filter.'
              : 'Create your first construction progress billing invoice.'}
          </p>
          <button
            onClick={() => navigate('/invoices/new')}
            className="mt-4 inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Create Invoice</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Invoice #</th>
                  <th className="py-3.5 px-4">Project & Client</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Issue / Due Date</th>
                  <th className="py-3.5 px-4 text-right">Retainage</th>
                  <th className="py-3.5 px-4 text-right">Total Amount</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => navigate(`/invoices/${inv.id}`)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <td className="py-4 px-4 font-bold text-slate-900 whitespace-nowrap">
                      {inv.invoiceNumber}
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-900">{inv.projectName}</div>
                      <div className="text-xs text-slate-500">{inv.clientName}</div>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <Badge status={inv.status} />
                    </td>

                    <td className="py-4 px-4 text-xs whitespace-nowrap">
                      <div>Issued: {inv.issueDate}</div>
                      <div className={inv.status === 'Overdue' ? 'text-rose-600 font-bold' : 'text-slate-400'}>
                        Due: {inv.dueDate}
                      </div>
                    </td>

                    <td className="py-4 px-4 text-right font-medium text-slate-600 whitespace-nowrap">
                      ${inv.retainageAmount.toLocaleString()} ({inv.retainagePercent}%)
                    </td>

                    <td className="py-4 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
                      ${inv.total.toLocaleString()}
                    </td>

                    <td className="py-4 px-4 text-right whitespace-nowrap space-x-1" onClick={(e) => e.stopPropagation()}>
                      {inv.status !== 'Paid' && (
                        <button
                          onClick={(e) => handleMarkPaid(inv.id, e)}
                          className="px-2.5 py-1 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded border border-emerald-200 transition-colors"
                          title="Mark as Paid"
                        >
                          Pay
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/invoices/${inv.id}`)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="View & Print Invoice"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(inv.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Invoice"
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

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Progress Invoice"
        description="Are you sure you want to delete this invoice? This will remove the record from all billing metrics."
        confirmLabel="Delete Invoice"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteId(null)}
      />
    </div>
  );
};
