import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Building2
} from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Invalid email or password'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F1F5] flex flex-col justify-center items-center px-4 relative selection:bg-[#645394] selection:text-white">
      {/* Brand Header */}
      <div className="text-center mb-8 z-10">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white border border-[#D9DDE3] shadow-md mb-4">
          <img
            src="/logo-full.png"
            alt="Revati Global Logo"
            className="h-12 w-auto object-contain"
          />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#35313B] tracking-tight font-heading">
          Revati Global Admin
        </h1>
        <p className="text-sm text-slate-600 mt-1.5 max-w-sm mx-auto font-medium">
          Executive administrative access for Revati Global
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white border border-[#D9DDE3] rounded-2xl p-8 shadow-card z-10">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-violet-50 border border-violet-200 flex items-start gap-3 text-[#524378] text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-[#645394]" />
            <div className="flex-1 font-medium">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#35313B] mb-2 font-mono">
              Administrator Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-600">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-[#D9DDE3] rounded-xl text-[#35313B] placeholder-slate-400 text-sm focus:outline-none focus:border-[#645394] transition"
                placeholder="admin@revatiglobal.com"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#35313B] font-mono">
                Password
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-600">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-12 py-3 bg-white border border-[#D9DDE3] rounded-xl text-[#35313B] placeholder-slate-400 text-sm focus:outline-none focus:border-[#645394] transition"
                placeholder="••••••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-600 hover:text-[#35313B] transition"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-3 py-3.5 px-4 bg-[#645394] hover:bg-[#524378] text-white font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 text-sm transition-all transform active:scale-[0.99] disabled:opacity-50 font-heading"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#D9DDE3] flex items-center justify-between text-[11px] text-slate-600">
          <div className="flex items-center gap-1.5 font-medium text-emerald-600">
            <ShieldCheck className="w-4 h-4" />
            <span>End-to-End Encrypted</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[#645394]">
            <Building2 className="w-3.5 h-3.5" />
            <span>Revati Global</span>
          </div>
        </div>
      </div>
    </div>
  );
}
