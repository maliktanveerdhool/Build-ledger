import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  AlertCircle,
  PieChart as PieIcon,
  Printer,
  Download,
  FileSpreadsheet,
  Building2,
  Receipt
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { projectsApi, invoicesApi, expensesApi, downloadCSV } from '../lib/api';
import { TableSkeleton } from '../components/ui/Skeleton';
import { downloadElementAsPdf, triggerPrint } from '../lib/pdfUtils';
import { toast } from 'sonner';

export const ReportsPage: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReportData = async () => {
    setLoading(true);
    try {
      const [pData, iData, eData] = await Promise.all([
        projectsApi.getAll(),
        invoicesApi.getAll(),
        expensesApi.getAll()
      ]);
      setProjects(pData);
      setInvoices(iData);
      setExpenses(eData);
    } catch (err) {
      toast.error('Failed to load reporting data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, []);

  // Profitability calculations per project
  const projectProfitability = projects.map((p) => {
    const projInvoices = invoices.filter((i) => i.projectId === p.id);
    const projExpenses = expenses.filter((e) => e.projectId === p.id);

    const totalContract = p.contractValue || 0;
    const totalInvoiced = projInvoices.reduce((sum, i) => sum + i.total, 0);
    const totalPaid = projInvoices.filter((i) => i.status === 'Paid').reduce((sum, i) => sum + i.total, 0);
    const totalCosts = projExpenses.reduce((sum, e) => sum + e.amount, 0);
    const retainageHeld = projInvoices.reduce((sum, i) => sum + i.retainageAmount, 0);

    const netProfit = totalContract - totalCosts;
    const marginPercent = totalContract > 0 ? (netProfit / totalContract) * 100 : 0;

    return {
      id: p.id,
      name: p.name,
      status: p.status,
      totalContract,
      totalInvoiced,
      totalPaid,
      totalCosts,
      retainageHeld,
      netProfit,
      marginPercent: Math.round(marginPercent * 10) / 10
    };
  });

  // Receivables Aging Breakdown
  const unpaidInvoices = invoices.filter((i) => i.status === 'Sent' || i.status === 'Overdue');
  const now = new Date();

  let agingCurrent = 0; // <= 0 days overdue
  let aging1to30 = 0;   // 1-30 days overdue
  let aging31to60 = 0;  // 31-60 days overdue
  let aging60Plus = 0;  // > 60 days overdue

  unpaidInvoices.forEach((inv) => {
    const dueDate = new Date(inv.dueDate);
    const diffDays = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 3600 * 24));

    if (diffDays <= 0) {
      agingCurrent += inv.total;
    } else if (diffDays <= 30) {
      aging1to30 += inv.total;
    } else if (diffDays <= 60) {
      aging31to60 += inv.total;
    } else {
      aging60Plus += inv.total;
    }
  });

  const totalOutstanding = agingCurrent + aging1to30 + aging31to60 + aging60Plus;

  const handleExportCSV = () => {
    const headers = ['Project Name', 'Status', 'Revised Contract Value', 'Invoiced Amount', 'Paid Amount', 'Actual Costs', 'Retainage Held', 'Net Profit', 'Margin %'];
    const rows = projectProfitability.map(p => [
      p.name,
      p.status,
      p.totalContract,
      p.totalInvoiced,
      p.totalPaid,
      p.totalCosts,
      p.retainageHeld,
      p.netProfit,
      `${p.marginPercent}%`
    ]);

    downloadCSV('Construction_Financial_Report', headers, rows);
    toast.success('Report exported to CSV');
  };

  const handlePrintReport = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <TableSkeleton rows={6} cols={6} />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Financial & Profitability Reports</h1>
          <p className="text-sm text-slate-500">Job costing profitability, AR aging, and expense audit analytics</p>
        </div>
        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2.5 rounded-xl font-semibold text-sm border border-slate-200 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => downloadElementAsPdf('printable-report', 'Financial_Reports.pdf')}
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
          <button
            onClick={() => triggerPrint('printable-report')}
            className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      <div id="printable-report" className="space-y-8">

      {/* Receivables Aging Overview Cards */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-slate-900 text-base">Accounts Receivable Aging Schedule</h3>
          </div>
          <span className="text-xs font-bold text-slate-700">
            Total Outstanding: <span className="text-blue-700">${totalOutstanding.toLocaleString()}</span>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <span className="text-xs font-semibold text-emerald-800 uppercase">Current (Not Due)</span>
            <h4 className="text-xl font-bold text-emerald-900 mt-1">${agingCurrent.toLocaleString()}</h4>
          </div>

          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
            <span className="text-xs font-semibold text-amber-800 uppercase">1 - 30 Days Overdue</span>
            <h4 className="text-xl font-bold text-amber-900 mt-1">${aging1to30.toLocaleString()}</h4>
          </div>

          <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
            <span className="text-xs font-semibold text-rose-800 uppercase">31 - 60 Days Overdue</span>
            <h4 className="text-xl font-bold text-rose-900 mt-1">${aging31to60.toLocaleString()}</h4>
          </div>

          <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
            <span className="text-xs font-semibold text-purple-800 uppercase">60+ Days Overdue</span>
            <h4 className="text-xl font-bold text-purple-900 mt-1">${aging60Plus.toLocaleString()}</h4>
          </div>
        </div>
      </div>

      {/* Project Profitability Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base">Project Profitability & Budget Audit</h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Project Name</th>
                <th className="py-3.5 px-4 text-right">Contract Value</th>
                <th className="py-3.5 px-4 text-right">Invoiced</th>
                <th className="py-3.5 px-4 text-right">Actual Costs</th>
                <th className="py-3.5 px-4 text-right">Retainage Held</th>
                <th className="py-3.5 px-4 text-right">Projected Net Profit</th>
                <th className="py-3.5 px-4 text-right">Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {projectProfitability.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {p.name}
                    <span className="block text-[10px] text-slate-400 font-normal">{p.status}</span>
                  </td>

                  <td className="py-3.5 px-4 text-right font-medium">
                    ${p.totalContract.toLocaleString()}
                  </td>

                  <td className="py-3.5 px-4 text-right font-medium text-blue-700">
                    ${p.totalInvoiced.toLocaleString()}
                  </td>

                  <td className="py-3.5 px-4 text-right font-medium text-amber-700">
                    ${p.totalCosts.toLocaleString()}
                  </td>

                  <td className="py-3.5 px-4 text-right text-slate-600">
                    ${p.retainageHeld.toLocaleString()}
                  </td>

                  <td className={`py-3.5 px-4 text-right font-bold ${p.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    ${p.netProfit.toLocaleString()}
                  </td>

                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                    {p.marginPercent}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contract vs Expenses Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <h3 className="text-base font-bold text-slate-900 mb-2">Contract Value vs. Total Expenses Comparison</h3>
        <p className="text-xs text-slate-500 mb-6">Visual comparison of revenue ceiling versus accrued job site expenditure</p>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={projectProfitability} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: '#64748b' }}
                axisLine={false}
                interval={0}
                tickFormatter={(val) => (val.length > 15 ? `${val.substring(0, 15)}...` : val)}
              />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickFormatter={(v) => `$${v/1000}k`} />
              <Tooltip formatter={(val: any) => `$${Number(val).toLocaleString()}`} />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Bar dataKey="totalContract" name="Contract Value" fill="#2563eb" radius={[4, 4, 0, 0]} />
              <Bar dataKey="totalCosts" name="Actual Costs" fill="#d97706" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
    </div>
  );
};
