import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building2, ShieldCheck, UserCheck, Lock, Mail, User as UserIcon, Briefcase, ArrowRight, Eye, EyeOff } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, register, switchDemoUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/';

  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await register({ name, email, password, role: 'user', company });
      } else {
        await login(email, password);
      }
      navigate(from, { replace: true });
    } catch (err) {
      // Toast already shown in context
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (targetRole: 'admin' | 'user') => {
    setLoading(true);
    try {
      await switchDemoUser(targetRole);
      navigate(from, { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-blue-600/10 via-slate-900/50 to-transparent pointer-events-none blur-3xl" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-blue-600/10 border border-blue-500/20 rounded-2xl mb-4">
          <Building2 className="w-8 h-8 text-blue-400" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">BuildLedger</h2>
        <p className="mt-1 text-sm text-slate-400">
          Construction Commercial Management & Financial ERP
        </p>
      </div>

      {/* Quick Demo Login Preset Selection */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 shadow-xl mb-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-center mb-3">
            Quick One-Click Demo Access
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              disabled={loading}
              className="flex items-center justify-center space-x-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 p-2.5 rounded-xl text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
              <div className="text-left">
                <div className="font-bold">Admin Panel</div>
                <div className="text-[10px] text-blue-300/70">admin@buildledger.com</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('user')}
              disabled={loading}
              className="flex items-center justify-center space-x-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 p-2.5 rounded-xl text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="text-left">
                <div className="font-bold">User Panel</div>
                <div className="text-[10px] text-emerald-300/70">john@apexdev.com</div>
              </div>
            </button>
          </div>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
          {/* Mode Switcher Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50/50">
            <button
              type="button"
              onClick={() => setIsRegister(false)}
              className={`flex-1 py-3.5 text-sm font-semibold text-center border-b-2 transition-colors ${
                !isRegister
                  ? 'border-blue-600 text-blue-600 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsRegister(true)}
              className={`flex-1 py-3.5 text-sm font-semibold text-center border-b-2 transition-colors ${
                isRegister
                  ? 'border-blue-600 text-blue-600 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Register Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
            {isRegister && (
              <>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <div className="relative rounded-xl shadow-2xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 tracking-wider mb-1.5">
                    Company / Entity Name
                  </label>
                  <div className="relative rounded-xl shadow-2xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Briefcase className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Apex Contracting Group"
                      className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2.5 text-xs text-emerald-800">
                  <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>New accounts register as <strong>Standard User</strong> with an isolated commercial workspace.</span>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="block w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-10 py-2.5 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-semibold text-sm shadow-md transition-all disabled:opacity-50"
            >
              <span>{loading ? 'Processing...' : isRegister ? 'Create Account & Sign In' : 'Sign In to BuildLedger'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
