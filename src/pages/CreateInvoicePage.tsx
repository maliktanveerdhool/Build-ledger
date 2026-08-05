import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileText,
  Plus,
  Trash2,
  ArrowLeft,
  Building2,
  Calendar,
  Percent,
  DollarSign,
  Save
} from 'lucide-react';
import { projectsApi, clientsApi, settingsApi, invoicesApi } from '../lib/api';
import { Project, Client, Settings, InvoiceLineItem } from '../types';
import { toast } from 'sonner';

export const CreateInvoicePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialProjectId = searchParams.get('projectId') || '';

  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [projectId, setProjectId] = useState(initialProjectId);
  const [clientId, setClientId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<'Draft' | 'Sent' | 'Paid'>('Sent');
  const [retainagePercent, setRetainagePercent] = useState<number>(10);
  const [notes, setNotes] = useState('Payment due within 30 days. Standard AIA construction progress draw retainage terms apply.');

  // Line items
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
    { description: 'Phase 1 - Structural Foundations & Site Mobilization', quantity: 1, unitPrice: 150000, amount: 150000 }
  ]);

  useEffect(() => {
    // Default due date +30 days
    const d = new Date();
    d.setDate(d.getDate() + 30);
    setDueDate(d.toISOString().split('T')[0]);

    async function loadData() {
      setLoading(true);
      try {
        const [pData, cData, sData] = await Promise.all([
          projectsApi.getAll(),
          clientsApi.getAll(),
          settingsApi.get()
        ]);
        setProjects(pData);
        setClients(cData);
        setSettings(sData);

        const defaultInvNum = `${sData.invoicePrefix || 'INV-'}${sData.nextInvoiceNumber || 1016}`;
        setInvoiceNumber(defaultInvNum);

        if (initialProjectId) {
          const matched = pData.find(p => p.id === initialProjectId);
          if (matched) {
            setProjectId(matched.id);
            setClientId(matched.clientId);
          }
        } else if (pData.length > 0) {
          setProjectId(pData[0].id);
          setClientId(pData[0].clientId);
        }
      } catch (err) {
        toast.error('Failed to load initial invoice parameters');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [initialProjectId]);

  const handleProjectChange = (id: string) => {
    setProjectId(id);
    const p = projects.find(proj => proj.id === id);
    if (p) {
      setClientId(p.clientId);
    }
  };

  const handleLineItemChange = (index: number, field: keyof InvoiceLineItem, val: any) => {
    const updated = [...lineItems];
    if (field === 'quantity' || field === 'unitPrice') {
      const numVal = Number(val) || 0;
      updated[index] = {
        ...updated[index],
        [field]: numVal,
        amount: field === 'quantity' ? Math.round(numVal * updated[index].unitPrice * 100) / 100 : Math.round(updated[index].quantity * numVal * 100) / 100
      };
    } else {
      updated[index] = {
        ...updated[index],
        [field]: val
      };
    }
    setLineItems(updated);
  };

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { description: 'Construction Services / Work Package', quantity: 1, unitPrice: 0, amount: 0 }
    ]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length === 1) {
      toast.error('At least one line item is required');
      return;
    }
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  // Live Calculations
  const subtotal = lineItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  const retainageAmount = Math.round(subtotal * (retainagePercent / 100) * 100) / 100;
  const total = Math.round((subtotal - retainageAmount) * 100) / 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !clientId) {
      toast.error('Please select a project and client');
      return;
    }

    if (lineItems.length === 0 || subtotal <= 0) {
      toast.error('Please add at least one line item with a positive amount');
      return;
    }

    setSubmitting(true);
    try {
      const created = await invoicesApi.create({
        invoiceNumber,
        projectId,
        clientId,
        issueDate,
        dueDate,
        status,
        lineItems,
        retainagePercent,
        notes
      });

      toast.success('Progress invoice generated successfully');
      navigate(`/invoices/${created.id}`);
    } catch (err) {
      toast.error('Failed to create progress invoice');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 animate-pulse">
        Loading invoice builder parameters...
      </div>
    );
  }

  const selectedProject = projects.find(p => p.id === projectId);
  const selectedClient = clients.find(c => c.id === clientId);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <button
            onClick={() => navigate('/invoices')}
            className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Invoices</span>
          </button>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Generate Progress Invoice</h1>
          <p className="text-sm text-slate-500">Create AIA-compliant progress draw with retainage percentage</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Invoice Metadata Box */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Project Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Select Construction Project *</label>
              <select
                value={projectId}
                onChange={(e) => handleProjectChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (${p.contractValue.toLocaleString()})
                  </option>
                ))}
              </select>
              {selectedProject && (
                <p className="text-xs text-slate-500 mt-1">
                  Job Location: {selectedProject.location}
                </p>
              )}
            </div>

            {/* Client Info */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Billed To (Client)</label>
              <input
                type="text"
                readOnly
                value={selectedClient ? `${selectedClient.company} (${selectedClient.name})` : 'Select Project'}
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 cursor-not-allowed"
              />
              {selectedClient && (
                <p className="text-xs text-slate-500 mt-1">
                  Email: {selectedClient.email}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Invoice Number *</label>
              <input
                type="text"
                required
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Issue Date *</label>
              <input
                type="date"
                required
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Due Date *</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Initial Status</label>
              <select
                value={status}
                onChange={(e: any) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900"
              >
                <option value="Sent">Sent</option>
                <option value="Draft">Draft</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Completed Work Schedule / Line Items</h3>
            <button
              type="button"
              onClick={addLineItem}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Work Line Item</span>
            </button>
          </div>

          <div className="space-y-3">
            {lineItems.map((item, index) => (
              <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex-1 w-full">
                  <input
                    type="text"
                    required
                    placeholder="Work description / trade breakdown..."
                    value={item.description}
                    onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900"
                  />
                </div>

                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <div className="w-20">
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => handleLineItemChange(index, 'quantity', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 text-center"
                    />
                  </div>

                  <div className="w-32">
                    <input
                      type="number"
                      required
                      step="100"
                      placeholder="Unit Price"
                      value={item.unitPrice}
                      onChange={(e) => handleLineItemChange(index, 'unitPrice', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 text-right"
                    />
                  </div>

                  <div className="w-32 text-right font-bold text-slate-900 text-sm px-2">
                    ${item.amount.toLocaleString()}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeLineItem(index)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Totals & Retainage Box */}
          <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="w-full md:w-1/2 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Retainage Percentage (%)
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    min="0"
                    max="30"
                    step="0.5"
                    value={retainagePercent}
                    onChange={(e) => setRetainagePercent(Number(e.target.value) || 0)}
                    className="w-28 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-900"
                  />
                  <span className="text-xs text-slate-500">
                    Standard 10% held until project completion.
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Invoice Notes / Terms</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900"
                />
              </div>
            </div>

            <div className="w-full md:w-72 bg-slate-900 text-white p-5 rounded-2xl space-y-3 shadow-md">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Subtotal Work Completed</span>
                <span>${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-amber-400">
                <span>Less Retainage ({retainagePercent}%)</span>
                <span>-${retainageAmount.toLocaleString()}</span>
              </div>
              <div className="pt-3 border-t border-slate-800 flex justify-between text-base font-bold text-white">
                <span>Net Amount Due</span>
                <span className="text-emerald-400">${total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/invoices')}
            className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center space-x-2 px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md shadow-blue-500/20"
          >
            <Save className="w-4 h-4" />
            <span>{submitting ? 'Generating Invoice...' : 'Generate Progress Invoice'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
