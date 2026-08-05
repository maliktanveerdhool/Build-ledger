import React from 'react';
import { Menu, Plus, ShieldCheck, UserCheck, LogOut, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onMobileMenuOpen: () => void;
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ onMobileMenuOpen, title, subtitle }) => {
  const navigate = useNavigate();
  const { user, isAdmin, logout, switchDemoUser } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between print:hidden">
      <div className="flex items-center space-x-3">
        <button
          onClick={onMobileMenuOpen}
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          {title && <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>}
          {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Panel Indicator */}
        <div className="hidden sm:flex items-center space-x-2">
          {isAdmin ? (
            <button
              onClick={() => switchDemoUser('user')}
              title="Switch to Registered User Panel"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Admin Panel</span>
              <span className="text-[10px] text-blue-500 underline ml-1">(Switch to User)</span>
            </button>
          ) : (
            <button
              onClick={() => switchDemoUser('admin')}
              title="Switch to Admin Panel"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>User Panel</span>
              <span className="text-[10px] text-emerald-600 underline ml-1">(Switch to Admin)</span>
            </button>
          )}
        </div>

        <button
          onClick={() => navigate('/invoices/new')}
          className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-lg text-sm font-medium transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Invoice</span>
        </button>

        <button
          onClick={logout}
          title="Sign Out"
          className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
