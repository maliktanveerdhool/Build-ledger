import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Printer,
  Download,
  CheckCircle,
  ArrowLeft,
  Trash2,
  Building2,
  HardHat,
  FileText,
  DollarSign
} from 'lucide-react';
import { invoicesApi, settingsApi } from '../lib/api';
import { Settings } from '../types';
import { Badge } from '../components/ui/Badge';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { downloadElementAsPdf, triggerPrint } from '../lib/pdfUtils';
import { toast } from 'sonner';

export const InvoiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState<any>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadInvoiceDetail = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [invData, sData] = await Promise.all([
        invoicesApi.getById(id),
        settingsApi.get()
      ]);
      setInvoice(invData);
      setSettings(sData);
    } catch (err) {
      toast.error('Failed to load invoice details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoiceDetail();
  }, [id]);

  const handleMarkPaid = async () => {
    if (!id) return;
    try {
      await invoicesApi.updateStatus(id, 'Paid');
      toast.success('Invoice marked as Paid');
      loadInvoiceDetail();
    } catch (err) {
      toast.error('Failed to update invoice status');
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      await invoicesApi.delete(id);
      toast.success('Invoice deleted');
      navigate('/invoices');
    } catch (err) {
      toast.error('Failed to delete invoice');
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 animate-pulse">
        Loading invoice statement...
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-bold text-slate-900">Invoice Not Found</h3>
        <button
          onClick={() => navigate('/invoices')}
          className="mt-4 inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Invoices</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Top Controls Bar (Hidden in print) */}
      <div className="print:hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <button
          onClick={() => navigate('/invoices')}
          className="inline-flex items-center space-x-1 text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Invoices</span>
        </button>

        <div className="flex items-center space-x-3 shrink-0">
          {invoice.status !== 'Paid' && (
            <button
              onClick={handleMarkPaid}
              className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-lg text-sm font-semibold shadow-xs transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Mark as Paid</span>
            </button>
          )}

          <button
            onClick={() => downloadElementAsPdf('printable-invoice', `${invoice.invoiceNumber}.pdf`)}
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>

          <button
            onClick={() => triggerPrint('printable-invoice')}
            className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-lg text-sm font-semibold shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>

          <button
            onClick={() => setDeleteOpen(true)}
            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200"
            title="Delete Invoice"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Printable Invoice Sheet */}
      <div
        id="printable-invoice"
        className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-lg print:shadow-none print:border-none print:p-0 print:m-0 space-y-8"
      >
        {/* Company Header & Invoice Number */}
        <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-200 pb-8 gap-6">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <HardHat className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {settings?.companyName || 'BuildLedger Construction Services'}
              </h1>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mt-2">
              {settings?.companyAddress}<br />
              Phone: {settings?.companyPhone} • Email: {settings?.companyEmail}<br />
              Tax ID / EIN: {settings?.taxId}
            </p>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <div className="inline-block mb-1">
              <Badge status={invoice.status} />
            </div>
            <h2 className="text-2xl font-mono font-bold text-slate-900">{invoice.invoiceNumber}</h2>
            <p className="text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Issue Date:</span> {invoice.issueDate}<br />
              <span className="font-semibold text-slate-700">Due Date:</span> {invoice.dueDate}
            </p>
          </div>
        </div>

        {/* Client & Project Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-200">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Billed To (Client)</span>
            <h3 className="font-bold text-slate-900 text-base">{invoice.client?.company || invoice.clientName}</h3>
            <p className="text-xs text-slate-600 mt-1">
              Attn: {invoice.client?.name}<br />
              {invoice.client?.email}<br />
              {invoice.client?.address}
            </p>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Project Site Details</span>
            <h3 className="font-bold text-slate-900 text-base">{invoice.project?.name || invoice.projectName}</h3>
            <p className="text-xs text-slate-600 mt-1">
              Location: {invoice.project?.location || 'Job Site'}<br />
              Original Contract: ${invoice.project?.contractValue ? invoice.project.contractValue.toLocaleString() : 'N/A'}
            </p>
          </div>
        </div>

        {/* Schedule of Values / Line Items Table */}
        <div className="space-y-2">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Completed Construction Work Schedule</h3>
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider border-y border-slate-200">
                <th className="py-2.5 px-3">Description of Work Item</th>
                <th className="py-2.5 px-3 text-center">Qty / Units</th>
                <th className="py-2.5 px-3 text-right">Unit Rate</th>
                <th className="py-2.5 px-3 text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {invoice.lineItems.map((item: any, idx: number) => (
                <tr key={idx}>
                  <td className="py-3 px-3 font-medium text-slate-900">{item.description}</td>
                  <td className="py-3 px-3 text-center text-slate-600">{item.quantity}</td>
                  <td className="py-3 px-3 text-right text-slate-600">${item.unitPrice.toLocaleString()}</td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900">${item.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Summary & Retainage */}
        <div className="flex justify-end pt-4">
          <div className="w-full sm:w-80 space-y-2 text-sm">
            <div className="flex justify-between py-1 text-slate-600 border-b border-slate-100">
              <span>Gross Completed Work</span>
              <span className="font-bold text-slate-900">${invoice.subtotal.toLocaleString()}</span>
            </div>

            <div className="flex justify-between py-1 text-amber-700 border-b border-slate-100">
              <span>Less Retainage ({invoice.retainagePercent}%)</span>
              <span className="font-bold">-${invoice.retainageAmount.toLocaleString()}</span>
            </div>

            <div className="flex justify-between py-2.5 text-base font-bold text-slate-900 border-b-2 border-slate-900">
              <span>Net Progress Billing Due</span>
              <span className="text-blue-700">${invoice.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Terms & Notes */}
        {invoice.notes && (
          <div className="pt-6 border-t border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Notes & Terms</span>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
              {invoice.notes}
            </p>
          </div>
        )}

        {/* Print Footer */}
        <div className="hidden print:block pt-12 text-center text-[10px] text-slate-400">
          Generated via BuildLedger Construction SaaS • Thank you for your business!
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteOpen}
        title="Delete Progress Invoice"
        description="Are you sure you want to permanently delete this invoice?"
        confirmLabel="Delete Invoice"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteOpen(false)}
      />
    </div>
  );
};
