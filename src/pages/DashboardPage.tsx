import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Building2,
  AlertCircle,
  Users,
  ArrowUpRight,
  Plus,
  FileText,
  Receipt,
  Sparkles,
  Database
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { dashboardApi, invoicesApi, settingsApi } from '../lib/api';
import { DashboardStats } from '../types';
import { Badge } from '../components/ui/Badge';
import { CardSkeleton } from '../components/ui/Skeleton';
import { toast } from 'sonner';

const CATEGORY_COLORS: Record<string, string> = {
  Labor: '#2563eb', // Blue
  Materials: '#0284c7', // Sky
  Equipment: '#d97706', // Amber
  Subcontractor: '#7c3aed', // Purple
  Other: '#64748b' // Slate
};

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await dashboardApi.getStats();
      setStats(data);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load dashboard metrics from server.');
      toast.error('Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSeedDemo = async () => {
    setIsSeeding(true);
    try {
      const res = await settingsApi.seedDemo();
      toast.success(res.message || 'Sample construction demo data loaded successfully!');
      fetchDashboard();
    } catch (err) {
      toast.error('Failed to load sample demo data');
    } finally {
      setIsSeeding(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleMarkPaid = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await invoicesApi.updateStatus(id, 'Paid');
      toast.success('Invoice marked as Paid');
      fetchDashboard();
    } catch (err) {
      toast.error('Failed to update invoice status');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="h-80 bg-white rounded-xl border border-slate-200 animate-pulse" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-800 p-6 rounded-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <AlertCircle className="w-6 h-6 text-rose-600 shrink-0" />
          <div>
            <h3 className="font-semibold text-rose-900">Dashboard Unavailable</h3>
            <p className="text-sm text-rose-700">{error || 'Failed to connect to backend'}</p>
          </div>
        </div>
        <button
          onClick={fetchDashboard}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900 text-white p-6 rounded-2xl shadow-md border border-slate-800 gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Executive Financial Summary</h2>
          <p className="text-slate-400 text-sm mt-1">Real-time progress billing, retainage tracking, & job costing analytics</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={handleQuickSeedDemo}
            disabled={isSeeding}
            className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all shadow-md"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isSeeding ? 'Loading Demo Data...' : 'Load Sample Demo Data'}</span>
          </button>
          <button
            onClick={() => navigate('/invoices/new')}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create Invoice</span>
          </button>
        </div>
      </div>

      {/* Empty Workspace Banner */}
      {stats.activeProjectsCount === 0 && stats.completedProjectsCount === 0 && (
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl shrink-0 mt-0.5">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Your Workspace is Ready!</h3>
              <p className="text-xs text-slate-600 mt-1 max-w-xl leading-relaxed">
                You have a fresh, isolated construction workspace. You can start creating your own clients and projects from scratch, or load pre-populated sample construction demo data (projects, job costing, progress billing invoices, and clients) to explore all ERP features!
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={handleQuickSeedDemo}
              disabled={isSeeding}
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors shadow-xs"
            >
              <Database className="w-4 h-4" />
              <span>{isSeeding ? 'Seeding...' : 'Load Sample Demo Data'}</span>
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Revenue</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900">${stats.totalRevenue.toLocaleString()}</h3>
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center space-x-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Collected from Paid Invoices</span>
            </p>
          </div>
        </div>

        {/* Outstanding Receivables */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Outstanding Receivables</span>
            <div className="p-2.5 bg-sky-50 text-sky-600 rounded-lg">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900">${stats.outstandingReceivables.toLocaleString()}</h3>
            <p className="text-xs text-slate-500 mt-1">
              Sent & Overdue Pending Draws
            </p>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Expenses</span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900">${stats.totalExpenses.toLocaleString()}</h3>
            <p className="text-xs text-slate-500 mt-1">
              Labor, Materials, Equipment & Subs
            </p>
          </div>
        </div>

        {/* Active Projects */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Projects</span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900">{stats.activeProjectsCount}</h3>
            <p className="text-xs text-slate-500 mt-1">
              {stats.completedProjectsCount} completed, {stats.totalClientsCount} clients
            </p>
          </div>
        </div>
      </div>

      {/* Alert bar if overdue invoices */}
      {stats.overdueInvoicesCount > 0 && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <p className="text-sm font-medium">
              You have <span className="font-bold">{stats.overdueInvoicesCount} overdue invoice(s)</span> requiring immediate action or follow-up.
            </p>
          </div>
          <Link
            to="/invoices?status=Overdue"
            className="text-xs font-bold text-rose-700 hover:text-rose-900 underline flex items-center space-x-1"
          >
            <span>View Overdue</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue vs Expenses Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Revenue vs. Expenses</h3>
              <p className="text-xs text-slate-500">Monthly progress draw collections vs project costs</p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthlyFinancials} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} />
                <YAxis
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={false}
                  tickFormatter={(val) => `$${val / 1000}k`}
                />
                <Tooltip
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff' }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Bar dataKey="revenue" name="Revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Category Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <h3 className="text-base font-bold text-slate-900">Expenses by Category</h3>
          <p className="text-xs text-slate-500 mb-4">Cost distribution across all job sites</p>

          <div className="h-56 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categoryExpenses}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {stats.categoryExpenses.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.category] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => `$${Number(val).toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 mt-2">
            {stats.categoryExpenses.map((cat) => (
              <div key={cat.category} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[cat.category] || '#94a3b8' }}
                  />
                  <span className="font-medium text-slate-700">{cat.category}</span>
                </div>
                <span className="font-bold text-slate-900">${cat.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Invoices & Expenses Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-base">Recent Invoices</h3>
            </div>
            <Link to="/invoices" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              View All →
            </Link>
          </div>

          <div className="divide-y divide-slate-100 overflow-x-auto">
            {stats.recentInvoices.map((inv) => (
              <div
                key={inv.id}
                onClick={() => navigate(`/invoices/${inv.id}`)}
                className="p-4 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-sm">{inv.invoiceNumber}</span>
                    <Badge status={inv.status} />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {inv.projectName} • {inv.clientName}
                  </p>
                </div>

                <div className="text-right flex items-center space-x-3">
                  <div>
                    <span className="font-bold text-slate-900 text-sm">${inv.total.toLocaleString()}</span>
                    <p className="text-[10px] text-slate-400">Due {inv.dueDate}</p>
                  </div>
                  {inv.status !== 'Paid' && (
                    <button
                      onClick={(e) => handleMarkPaid(inv.id, e)}
                      className="px-2.5 py-1 text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded border border-emerald-200 transition-colors"
                    >
                      Pay
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Receipt className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-slate-900 text-base">Recent Job Site Expenses</h3>
            </div>
            <Link to="/expenses" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
              View All →
            </Link>
          </div>

          <div className="divide-y divide-slate-100 overflow-x-auto">
            {stats.recentExpenses.map((exp) => (
              <div key={exp.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-slate-900 text-sm">{exp.description}</span>
                    <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-600 rounded">
                      {exp.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {exp.projectName} {exp.vendor ? `• Vendor: ${exp.vendor}` : ''}
                  </p>
                </div>

                <div className="text-right">
                  <span className="font-bold text-slate-900 text-sm">${exp.amount.toLocaleString()}</span>
                  <p className="text-[10px] text-slate-400">{exp.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
