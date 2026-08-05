import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  Receipt,
  BarChart3,
  Settings as SettingsIcon,
  HardHat,
  ShieldCheck,
  LogOut,
  UserCheck,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onMobileClose }) => {
  const { user, isAdmin, logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Projects', path: '/projects', icon: Building2 },
    { label: 'Clients', path: '/clients', icon: Users },
    { label: 'Invoices', path: '/invoices', icon: FileText },
    { label: 'Expenses', path: '/expenses', icon: Receipt },
    { label: 'Reports', path: '/reports', icon: BarChart3 },
    ...(isAdmin ? [
      { label: 'User Accounts', path: '/users', icon: ShieldCheck },
    ] : []),
    { label: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 w-64 border-r border-slate-800">
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white shadow-md shadow-blue-500/20">
            <HardHat className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-white leading-tight">BuildLedger</h1>
            <div className="flex items-center space-x-1 mt-0.5">
              {isAdmin ? (
                <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                  Admin Panel
                </span>
              ) : (
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                  User Panel
                </span>
              )}
            </div>
          </div>
        </div>
        {mobileOpen && (
          <button
            onClick={onMobileClose}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <p className="px-3 text-[11px] font-semibold text-slate-400 tracking-wider uppercase mb-2">
          {isAdmin ? 'Admin Menu' : 'User Portal'}
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onMobileClose}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600/90 text-white shadow-xs font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Footer / User Profile Card */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
              isAdmin
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-200 truncate">{user?.name || 'Guest User'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email || 'Not logged in'}</p>
            </div>
          </div>

          <button
            onClick={logout}
            title="Sign Out"
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex shrink-0 h-screen sticky top-0 print:hidden">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex print:hidden">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={onMobileClose}
          />
          <div className="relative z-10 flex-1 max-w-xs w-full">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
