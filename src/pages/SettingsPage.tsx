import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Settings as SettingsIcon,
  Building,
  Mail,
  Phone,
  FileText,
  RotateCcw,
  Save,
  Check,
  Database,
  Trash2,
  Sparkles
} from 'lucide-react';
import { settingsApi } from '../lib/api';
import { Settings } from '../types';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [seedModalOpen, setSeedModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting }
  } = useForm<Settings>();

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await settingsApi.get();
      reset(data);
    } catch (err) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const onSubmit = async (data: Settings) => {
    try {
      await settingsApi.update(data);
      toast.success('Company settings updated successfully');
      loadSettings();
    } catch (err) {
      toast.error('Failed to update company settings');
    }
  };

  const handleSeedDemoData = async () => {
    setIsProcessing(true);
    try {
      const res = await settingsApi.seedDemo();
      toast.success(res.message || 'Sample demo data loaded successfully!');
      setSeedModalOpen(false);
      loadSettings();
    } catch (err) {
      toast.error('Failed to load sample demo data');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearWorkspace = async () => {
    setIsProcessing(true);
    try {
      const res = await settingsApi.clearDemo();
      toast.success(res.message || 'Workspace cleared successfully!');
      setClearModalOpen(false);
      loadSettings();
    } catch (err) {
      toast.error('Failed to clear workspace');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetSeedData = async () => {
    setIsProcessing(true);
    try {
      await settingsApi.resetData();
      toast.success('System database reset to initial admin seed data!');
      setResetModalOpen(false);
      loadSettings();
    } catch (err) {
      toast.error('Failed to reset data');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 animate-pulse">
        Loading settings configuration...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Company & Billing Settings</h1>
        <p className="text-sm text-slate-500">Configure business identity, tax ID, and auto-numbering prefixes</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Business Profile Box */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Company Business Profile
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Company Legal Name *</label>
            <input
              type="text"
              required
              {...register('companyName')}
              placeholder="e.g. Apex Construction LLC"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Company Street Address</label>
            <textarea
              rows={2}
              {...register('companyAddress')}
              placeholder="e.g. 500 Grand Ave, Suite 100, Chicago, IL"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Company Phone</label>
              <input
                type="text"
                {...register('companyPhone')}
                placeholder="(312) 555-0199"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Company Billing Email</label>
              <input
                type="email"
                {...register('companyEmail')}
                placeholder="billing@yourcompany.com"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Tax ID / EIN</label>
            <input
              type="text"
              {...register('taxId')}
              placeholder="12-3456789"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Invoice Numbering Controls */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Invoice Defaults & Auto-Numbering
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Invoice Prefix</label>
              <input
                type="text"
                {...register('invoicePrefix')}
                placeholder="e.g. INV-2026-"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Next Invoice Sequence #</label>
              <input
                type="number"
                {...register('nextInvoiceNumber', { valueAsNumber: true })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Currency Symbol</label>
              <input
                type="text"
                {...register('currency')}
                placeholder="$"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving Settings...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>

      {/* Demo Data & Workspace Management Box */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Workspace & Demo Data Management</h2>
            <p className="text-xs text-slate-500">Seed sample construction projects/invoices or clear your workspace data</p>
          </div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            {user?.role === 'admin' ? 'Admin Panel' : 'User Panel'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center space-x-2 text-slate-900 font-semibold text-sm">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Use Sample Demo Data</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Populate your workspace with sample clients, active projects, job costing expenses, and progress billing invoices.
            </p>
            <button
              type="button"
              onClick={() => setSeedModalOpen(true)}
              className="mt-2 inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors border border-blue-200 w-full justify-center"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Load Sample Demo Data</span>
            </button>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center space-x-2 text-slate-900 font-semibold text-sm">
              <Trash2 className="w-4 h-4 text-rose-500" />
              <span>Start Fresh (Zero Data)</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Wipe all clients, projects, invoices, and expenses in your workspace to start completely empty.
            </p>
            <button
              type="button"
              onClick={() => setClearModalOpen(true)}
              className="mt-2 inline-flex items-center space-x-2 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors border border-rose-200 w-full justify-center"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Workspace Data</span>
            </button>
          </div>
        </div>

        {user?.role === 'admin' && (
          <div className="pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setResetModalOpen(true)}
              className="inline-flex items-center space-x-2 text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-4 py-2 rounded-lg text-xs font-semibold transition-colors border border-amber-200"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Global System Seed Data (Admin Only)</span>
            </button>
          </div>
        )}
      </div>

      {/* Seed Demo Dialog */}
      <ConfirmDialog
        isOpen={seedModalOpen}
        title="Load Sample Demo Construction Data"
        description="This will add sample clients, construction projects, job costing expenses, and progress billing invoices to your workspace. Continue?"
        confirmLabel="Load Demo Data"
        isLoading={isProcessing}
        onConfirm={handleSeedDemoData}
        onClose={() => setSeedModalOpen(false)}
      />

      {/* Clear Data Dialog */}
      <ConfirmDialog
        isOpen={clearModalOpen}
        title="Clear Workspace Data"
        description="Are you sure you want to delete all clients, projects, invoices, and expenses from your account workspace? This action cannot be undone."
        confirmLabel="Yes, Clear All Data"
        isLoading={isProcessing}
        onConfirm={handleClearWorkspace}
        onClose={() => setClearModalOpen(false)}
      />

      {/* Admin Reset Dialog */}
      <ConfirmDialog
        isOpen={resetModalOpen}
        title="Reset Global System Data"
        description="As an administrator, are you sure you want to restore default admin seed data? All custom data across default datasets will be reset."
        confirmLabel="Reset System Data"
        isLoading={isProcessing}
        onConfirm={handleResetSeedData}
        onClose={() => setResetModalOpen(false)}
      />
    </div>
  );
};
