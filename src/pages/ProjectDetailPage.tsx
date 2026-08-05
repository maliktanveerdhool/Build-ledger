import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  Receipt,
  FileText,
  Plus,
  ArrowLeft,
  PieChart as PieIcon,
  AlertCircle,
  Clock,
  ShieldAlert,
  UserCheck,
  FileCode,
  CheckCircle2,
  XCircle,
  Clock3,
  Sliders,
  Sparkles,
  Download
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { projectsApi, expensesApi, changeOrdersApi, milestonesApi, downloadCSV } from '../lib/api';
import { ProjectJobCosting, ChangeOrder, ProjectMilestone } from '../types';
import { Badge } from '../components/ui/Badge';
import { TableSkeleton } from '../components/ui/Skeleton';
import { toast } from 'sonner';

const CATEGORY_COLORS: Record<string, string> = {
  Labor: '#2563eb',
  Materials: '#0284c7',
  Equipment: '#d97706',
  Subcontractor: '#7c3aed',
  Other: '#64748b'
};

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<ProjectJobCosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'changeOrders' | 'milestones' | 'expenses'>('overview');

  // Quick Add Expense Modal State
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expDesc, setExpDesc] = useState('');
  const [expCategory, setExpCategory] = useState<'Labor' | 'Materials' | 'Equipment' | 'Subcontractor' | 'Other'>('Labor');
  const [expAmount, setExpAmount] = useState('');
  const [expVendor, setExpVendor] = useState('');
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmittingExp, setIsSubmittingExp] = useState(false);

  // Add Change Order Modal State
  const [showAddCO, setShowAddCO] = useState(false);
  const [coTitle, setCoTitle] = useState('');
  const [coDesc, setCoDesc] = useState('');
  const [coAmount, setCoAmount] = useState('');
  const [coStatus, setCoStatus] = useState<'Pending' | 'Approved' | 'Rejected'>('Approved');
  const [coDate, setCoDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmittingCO, setIsSubmittingCO] = useState(false);

  // Add Milestone Modal State
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [msTitle, setMsTitle] = useState('');
  const [msTargetDate, setMsTargetDate] = useState('');
  const [msPercent, setMsPercent] = useState(0);
  const [msStatus, setMsStatus] = useState<'Not Started' | 'In Progress' | 'Completed' | 'Delayed'>('In Progress');
  const [msNotes, setMsNotes] = useState('');
  const [isSubmittingMs, setIsSubmittingMs] = useState(false);

  const fetchDetail = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await projectsApi.getById(id);
      setData(res);
    } catch (err) {
      toast.error('Failed to load project job costing details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !expAmount || !expDesc) {
      toast.error('Please enter description and amount');
      return;
    }
    setIsSubmittingExp(true);
    try {
      await expensesApi.create({
        projectId: id,
        date: expDate,
        description: expDesc,
        category: expCategory,
        amount: Number(expAmount),
        vendor: expVendor
      });
      toast.success('Expense recorded against project');
      setShowAddExpense(false);
      setExpDesc('');
      setExpAmount('');
      setExpVendor('');
      fetchDetail();
    } catch (err) {
      toast.error('Failed to add expense');
    } finally {
      setIsSubmittingExp(false);
    }
  };

  const handleCreateChangeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !coTitle || !coAmount) {
      toast.error('Title and amount are required for change order');
      return;
    }
    setIsSubmittingCO(true);
    try {
      await changeOrdersApi.create({
        projectId: id,
        title: coTitle,
        description: coDesc,
        amount: Number(coAmount),
        status: coStatus,
        date: coDate
      });
      toast.success('Change order registered successfully!');
      setShowAddCO(false);
      setCoTitle('');
      setCoDesc('');
      setCoAmount('');
      fetchDetail();
    } catch (err) {
      toast.error('Failed to create change order');
    } finally {
      setIsSubmittingCO(false);
    }
  };

  const handleUpdateCOStatus = async (coId: string, status: 'Pending' | 'Approved' | 'Rejected') => {
    try {
      await changeOrdersApi.updateStatus(coId, status);
      toast.success(`Change order status set to ${status}`);
      fetchDetail();
    } catch (err) {
      toast.error('Failed to update change order status');
    }
  };

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !msTitle || !msTargetDate) {
      toast.error('Title and target date are required');
      return;
    }
    setIsSubmittingMs(true);
    try {
      await milestonesApi.create({
        projectId: id,
        title: msTitle,
        targetDate: msTargetDate,
        completionPercent: Number(msPercent),
        status: msStatus,
        notes: msNotes
      });
      toast.success('Project milestone phase created!');
      setShowAddMilestone(false);
      setMsTitle('');
      setMsNotes('');
      fetchDetail();
    } catch (err) {
      toast.error('Failed to create milestone');
    } finally {
      setIsSubmittingMs(false);
    }
  };

  const handleExportJobCostingCSV = () => {
    if (!data) return;
    const headers = ['Project Name', 'Client', 'Original Contract', 'Approved COs', 'Revised Contract', 'Total Expenses', 'Net Profit', 'Profit Margin %'];
    const row = [
      data.project.name,
      data.client?.company || '',
      data.totalContractValue,
      data.approvedChangeOrdersTotal || 0,
      data.revisedContractValue || data.totalContractValue,
      data.totalExpenses,
      data.netProfit,
      `${data.profitMarginPercent}%`
    ];

    downloadCSV(`${data.project.name.replace(/\s+/g, '_')}_Job_Costing`, headers, [row]);
    toast.success('Exported job costing CSV');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <TableSkeleton rows={4} cols={4} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900">Project Not Found</h3>
        <button
          onClick={() => navigate('/projects')}
          className="mt-4 inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </button>
      </div>
    );
  }

  const { project, client } = data;

  return (
    <div className="space-y-8 pb-12">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <button
            onClick={() => navigate('/projects')}
            className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Projects</span>
          </button>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{project.name}</h1>
            <Badge status={project.status} />
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center space-x-3">
            <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1" />{project.location}</span>
            <span>•</span>
            <span className="flex items-center"><UserCheck className="w-3.5 h-3.5 mr-1" />{client?.company}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={handleExportJobCostingCSV}
            className="inline-flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors border border-slate-200"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setShowAddCO(true)}
            className="inline-flex items-center space-x-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors"
          >
            <FileCode className="w-3.5 h-3.5 text-amber-600" />
            <span>+ Change Order</span>
          </button>
          <button
            onClick={() => setShowAddExpense(true)}
            className="inline-flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors border border-slate-200"
          >
            <Plus className="w-3.5 h-3.5 text-slate-600" />
            <span>Add Expense</span>
          </button>
          <button
            onClick={() => navigate(`/invoices/new?projectId=${project.id}`)}
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Progress Invoice</span>
          </button>
        </div>
      </div>

      {/* Job Costing Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revised Contract Value */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Revised Contract Total</span>
            {data.approvedChangeOrdersTotal > 0 && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                +${data.approvedChangeOrdersTotal.toLocaleString()} COs
              </span>
            )}
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mt-2">${(data.revisedContractValue || data.totalContractValue).toLocaleString()}</h3>
          <p className="text-xs text-slate-500 mt-1">
            Original: ${data.totalContractValue.toLocaleString()} • Invoiced: ${data.totalInvoiced.toLocaleString()}
          </p>
        </div>

        {/* Actual Costs */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Actual Expenses</span>
          <h3 className="text-2xl font-bold text-amber-700 mt-2">${data.totalExpenses.toLocaleString()}</h3>
          <p className="text-xs text-slate-500 mt-1">{data.budgetUsedPercent}% of contract value</p>
        </div>

        {/* Retainage Held */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Retainage Held</span>
          <h3 className="text-2xl font-bold text-sky-700 mt-2">${data.retainageHeld.toLocaleString()}</h3>
          <p className="text-xs text-slate-500 mt-1">Held until final signoff</p>
        </div>

        {/* Projected Net Profit */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Projected Net Profit</span>
          <h3 className={`text-2xl font-bold mt-2 ${data.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            ${data.netProfit.toLocaleString()}
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Margin: {data.profitMarginPercent}%
          </p>
        </div>
      </div>

      {/* Budget Utilization Progress Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-bold text-slate-900">Job Budget Utilization</span>
          <span className="text-xs font-bold text-slate-700">
            ${data.totalExpenses.toLocaleString()} / ${data.totalContractValue.toLocaleString()} ({data.budgetUsedPercent}%)
          </span>
        </div>
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              data.budgetUsedPercent > 90 ? 'bg-rose-500' : data.budgetUsedPercent > 75 ? 'bg-amber-500' : 'bg-blue-600'
            }`}
            style={{ width: `${Math.min(data.budgetUsedPercent, 100)}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-2 text-xs text-slate-500">
          <span>Start: {project.startDate}</span>
          <span>Est. Finish: {project.endDate || 'N/A'}</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-1 border-b-2 font-semibold text-sm transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Job Costing Overview
          </button>
          <button
            onClick={() => setActiveTab('changeOrders')}
            className={`py-3 px-1 border-b-2 font-semibold text-sm transition-colors flex items-center space-x-2 ${
              activeTab === 'changeOrders'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <span>Change Orders</span>
            <span className="px-2 py-0.5 text-xs font-bold bg-amber-100 text-amber-800 rounded-full">
              {data.changeOrders?.length || 0}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('milestones')}
            className={`py-3 px-1 border-b-2 font-semibold text-sm transition-colors flex items-center space-x-2 ${
              activeTab === 'milestones'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <span>Schedule & Milestones</span>
            <span className="px-2 py-0.5 text-xs font-bold bg-slate-100 text-slate-700 rounded-full">
              {data.milestones?.length || 0}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`py-3 px-1 border-b-2 font-semibold text-sm transition-colors flex items-center space-x-2 ${
              activeTab === 'expenses'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <span>Expenses ({data.expenses.length})</span>
          </button>
        </nav>
      </div>

      {/* Tab Content: Overview */}
      {activeTab === 'overview' && (
        <>
          {/* Job Cost Breakdown & Category Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Breakdown Progress List */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
              <h3 className="text-base font-bold text-slate-900 mb-4">Job Costing by Category</h3>
              <div className="space-y-4">
                {data.categoryExpenses.map((item) => (
                  <div key={item.category} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-700 font-semibold">{item.category}</span>
                      <span className="text-slate-900 font-bold">
                        ${item.amount.toLocaleString()} ({Math.round(item.percentage)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: CATEGORY_COLORS[item.category] || '#2563eb'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cost Distribution Chart */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
              <h3 className="text-base font-bold text-slate-900 mb-2">Category Comparison</h3>
              <p className="text-xs text-slate-500 mb-4">Actual expenditure distribution</p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.categoryExpenses}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickFormatter={(v) => `$${v/1000}k`} />
                    <Tooltip formatter={(val: any) => `$${Number(val).toLocaleString()}`} />
                    <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                      {data.categoryExpenses.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.category] || '#2563eb'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Associated Invoices & Recent Expenses */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Project Invoices */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base">Project Invoices ({data.invoices.length})</h3>
                <button
                  onClick={() => navigate(`/invoices/new?projectId=${project.id}`)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  + Create Invoice
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {data.invoices.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm">
                    No invoices created for this project yet.
                  </div>
                ) : (
                  data.invoices.map((inv) => (
                    <div
                      key={inv.id}
                      onClick={() => navigate(`/invoices/${inv.id}`)}
                      className="p-4 hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900 text-sm">{inv.invoiceNumber}</span>
                          <Badge status={inv.status} />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Issue: {inv.issueDate} • Due: {inv.dueDate}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-900 text-sm">${inv.total.toLocaleString()}</span>
                        <p className="text-[10px] text-slate-400">Retainage: ${inv.retainageAmount.toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Project Expenses */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base">Recorded Expenses ({data.expenses.length})</h3>
                <button
                  onClick={() => setShowAddExpense(true)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  + Add Expense
                </button>
              </div>

              <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                {data.expenses.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm">
                    No expenses logged for this project yet.
                  </div>
                ) : (
                  data.expenses.map((exp) => (
                    <div key={exp.id} className="p-4 flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-slate-900 text-sm">{exp.description}</span>
                          <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-600 rounded">
                            {exp.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {exp.vendor ? `Vendor: ${exp.vendor} • ` : ''}{exp.date}
                        </p>
                      </div>
                      <span className="font-bold text-slate-900 text-sm">${exp.amount.toLocaleString()}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Tab Content: Change Orders */}
      {activeTab === 'changeOrders' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Project Change Orders</h3>
              <p className="text-xs text-slate-500 mt-1">
                Approved change orders directly adjust the revised contract total and job costing margins.
              </p>
            </div>
            <button
              onClick={() => setShowAddCO(true)}
              className="inline-flex items-center space-x-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create Change Order</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            {(!data.changeOrders || data.changeOrders.length === 0) ? (
              <div className="p-12 text-center">
                <FileCode className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-800">No Change Orders Registered</h4>
                <p className="text-xs text-slate-500 mt-1">Add contract adjustments or scope expansions here.</p>
                <button
                  onClick={() => setShowAddCO(true)}
                  className="mt-4 inline-flex items-center space-x-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-3.5 py-2 rounded-lg border border-amber-200 hover:bg-amber-100"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Change Order</span>
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {data.changeOrders.map((co) => (
                  <div key={co.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-xs font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-md">
                          {co.changeOrderNumber}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">{co.title}</h4>
                        <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                          co.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : co.status === 'Rejected'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {co.status}
                        </span>
                      </div>
                      {co.description && (
                        <p className="text-xs text-slate-600 max-w-2xl">{co.description}</p>
                      )}
                      <p className="text-[11px] text-slate-400">Date: {co.date}</p>
                    </div>

                    <div className="flex items-center space-x-4 shrink-0">
                      <div className="text-right">
                        <span className="text-lg font-bold text-slate-900">
                          +${co.amount.toLocaleString()}
                        </span>
                        <p className="text-[10px] text-slate-400">Scope Value Adjustment</p>
                      </div>

                      {co.status === 'Pending' && (
                        <div className="flex items-center space-x-1.5">
                          <button
                            onClick={() => handleUpdateCOStatus(co.id, 'Approved')}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-200"
                            title="Approve Change Order"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleUpdateCOStatus(co.id, 'Rejected')}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200"
                            title="Reject Change Order"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Content: Milestones & Schedule */}
      {activeTab === 'milestones' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Project Execution Schedule & Milestones</h3>
              <p className="text-xs text-slate-500 mt-1">
                Track key phase progress and target completion dates for project deliverables.
              </p>
            </div>
            <button
              onClick={() => setShowAddMilestone(true)}
              className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Phase Milestone</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            {(!data.milestones || data.milestones.length === 0) ? (
              <div className="p-12 text-center">
                <Clock3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-800">No Milestones Defined</h4>
                <p className="text-xs text-slate-500 mt-1">Set project milestones to monitor site progress.</p>
                <button
                  onClick={() => setShowAddMilestone(true)}
                  className="mt-4 inline-flex items-center space-x-1.5 text-xs font-semibold text-blue-700 bg-blue-50 px-3.5 py-2 rounded-lg border border-blue-200 hover:bg-blue-100"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Milestone</span>
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 p-6 space-y-6">
                {data.milestones.map((ms) => (
                  <div key={ms.id} className="pt-4 first:pt-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-slate-900 text-sm">{ms.title}</h4>
                        <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full ${
                          ms.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : ms.status === 'In Progress'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : ms.status === 'Delayed'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {ms.status}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-slate-500">
                        Target Date: <strong className="text-slate-800">{ms.targetDate}</strong>
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-700">
                        <span>Progress</span>
                        <span>{ms.completionPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all rounded-full ${
                            ms.completionPercent === 100
                              ? 'bg-emerald-500'
                              : ms.status === 'Delayed'
                              ? 'bg-rose-500'
                              : 'bg-blue-600'
                          }`}
                          style={{ width: `${ms.completionPercent}%` }}
                        />
                      </div>
                    </div>

                    {ms.notes && (
                      <p className="text-xs text-slate-500 mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        {ms.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Content: Expenses List */}
      {activeTab === 'expenses' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Recorded Project Expenses ({data.expenses.length})</h3>
            <button
              onClick={() => setShowAddExpense(true)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              + Add Expense
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {data.expenses.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No expenses logged for this project yet.
              </div>
            ) : (
              data.expenses.map((exp) => (
                <div key={exp.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-900 text-sm">{exp.description}</span>
                      <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-600 rounded">
                        {exp.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {exp.vendor ? `Vendor: ${exp.vendor} • ` : ''}{exp.date}
                    </p>
                  </div>
                  <span className="font-bold text-slate-900 text-sm">${exp.amount.toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Add Change Order Modal */}
      {showAddCO && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              New Change Order for {project.name}
            </h3>

            <form onSubmit={handleCreateChangeOrder} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Additional Foundation Shoring & Piling"
                  value={coTitle}
                  onChange={(e) => setCoTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Reason for scope modification or architect variation..."
                  value={coDesc}
                  onChange={(e) => setCoDesc(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Amount ($) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="25000"
                    value={coAmount}
                    onChange={(e) => setCoAmount(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Status</label>
                  <select
                    value={coStatus}
                    onChange={(e: any) => setCoStatus(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900"
                  >
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending Approval</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={coDate}
                  onChange={(e) => setCoDate(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddCO(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCO}
                  className="px-5 py-2 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs"
                >
                  {isSubmittingCO ? 'Creating...' : 'Save Change Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Milestone Modal */}
      {showAddMilestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              Add Schedule Milestone
            </h3>

            <form onSubmit={handleCreateMilestone} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Milestone Phase *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Concrete Slab Pouring"
                  value={msTitle}
                  onChange={(e) => setMsTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Target Date *</label>
                  <input
                    type="date"
                    required
                    value={msTargetDate}
                    onChange={(e) => setMsTargetDate(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Status</label>
                  <select
                    value={msStatus}
                    onChange={(e: any) => setMsStatus(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Delayed">Delayed</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase">Completion (%)</label>
                  <span className="text-xs font-bold text-slate-900">{msPercent}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={msPercent}
                  onChange={(e) => setMsPercent(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Notes / Remarks</label>
                <textarea
                  rows={2}
                  placeholder="Additional inspection details or remarks..."
                  value={msNotes}
                  onChange={(e) => setMsNotes(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddMilestone(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingMs}
                  className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  {isSubmittingMs ? 'Saving...' : 'Save Milestone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              Add Expense to {project.name}
            </h3>

            <form onSubmit={handleCreateExpense} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Structural steel supply batch"
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Category</label>
                  <select
                    value={expCategory}
                    onChange={(e: any) => setExpCategory(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900"
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
                    required
                    min="0"
                    placeholder="0.00"
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Vendor / Supplier</label>
                  <input
                    type="text"
                    placeholder="e.g., Nucor Steel"
                    value={expVendor}
                    onChange={(e) => setExpVendor(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddExpense(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingExp}
                  className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  {isSubmittingExp ? 'Recording...' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
