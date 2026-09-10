'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, ShieldCheck, UserCheck, Lock, Mail, User, AlertCircle, Loader2, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'TEAM_MEMBER'>('TEAM_MEMBER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fillAdminDemo = () => {
    setIsRegister(false);
    setEmail('admin@trizen.com');
    setPassword('Admin@123456');
    setError(null);
  };

  const fillTeamDemo = () => {
    setIsRegister(false);
    setEmail('photographer@trizen.com');
    setPassword('Team@123456');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegister ? { name, email, password, role } : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (data.user.role === 'ADMIN') {
        router.push('/dashboard/admin');
      } else {
        router.push('/dashboard/team');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10">
      {/* Quick Demo Fill Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6 text-xs text-slate-300 space-y-2">
        <div className="font-semibold text-amber-400 flex items-center space-x-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Quick Demo Fill for Evaluation:</span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={fillAdminDemo}
            className="flex-1 py-1.5 px-3 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 rounded-lg transition-colors flex items-center justify-center space-x-1"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Fill Admin</span>
          </button>
          <button
            type="button"
            onClick={fillTeamDemo}
            className="flex-1 py-1.5 px-3 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 rounded-lg transition-colors flex items-center justify-center space-x-1"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Fill Team Member</span>
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600/20 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-blue-500/30">
            <Camera className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-white">
            {isRegister ? 'Create an Account' : 'Welcome Back'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isRegister
              ? 'Register as an Admin or Team Member to manage events'
              : 'Sign in to access your event photo dashboard'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-950 p-1 rounded-xl mb-6 border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              !isRegister ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              isRegister ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Photographer"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Role Type</label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`flex items-center space-x-2 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    role === 'TEAM_MEMBER'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                      : 'border-slate-800 bg-slate-950 text-slate-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="TEAM_MEMBER"
                    checked={role === 'TEAM_MEMBER'}
                    onChange={() => setRole('TEAM_MEMBER')}
                    className="hidden"
                  />
                  <UserCheck className="w-4 h-4" />
                  <span className="font-semibold">Team Member</span>
                </label>

                <label
                  className={`flex items-center space-x-2 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    role === 'ADMIN'
                      ? 'border-blue-500 bg-blue-500/10 text-blue-300'
                      : 'border-slate-800 bg-slate-950 text-slate-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="ADMIN"
                    checked={role === 'ADMIN'}
                    onChange={() => setRole('ADMIN')}
                    className="hidden"
                  />
                  <ShieldCheck className="w-4 h-4" />
                  <span className="font-semibold">Admin / Lead</span>
                </label>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-950/50 text-red-300 border border-red-800 rounded-xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{isRegister ? 'Complete Registration' : 'Sign In'}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
