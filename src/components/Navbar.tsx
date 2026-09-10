'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Camera, LogOut, ShieldCheck, UserCheck, Image as ImageIcon, Sparkles } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'TEAM_MEMBER';
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/login');
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-blue-300">
                  Trizen<span className="text-blue-400">Photo</span>
                </span>
                <span className="block text-[10px] text-slate-400 font-medium tracking-wider uppercase -mt-1">
                  Event Platform
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors ${
                pathname === '/' ? 'text-blue-400' : 'text-slate-300 hover:text-white'
              }`}
            >
              Overview
            </Link>

            {user?.role === 'ADMIN' && (
              <Link
                href="/dashboard/admin"
                className={`flex items-center space-x-1.5 text-sm font-medium transition-colors ${
                  pathname.startsWith('/dashboard/admin') ? 'text-blue-400 font-semibold' : 'text-slate-300 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>Admin Dashboard</span>
              </Link>
            )}

            {user?.role === 'TEAM_MEMBER' && (
              <Link
                href="/dashboard/team"
                className={`flex items-center space-x-1.5 text-sm font-medium transition-colors ${
                  pathname.startsWith('/dashboard/team') ? 'text-blue-400 font-semibold' : 'text-slate-300 hover:text-white'
                }`}
              >
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>Team Dashboard</span>
              </Link>
            )}

            <Link
              href="/gallery/abc123"
              className="flex items-center space-x-1 text-sm font-medium text-amber-300 hover:text-amber-200 transition-colors px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Demo Customer Gallery</span>
            </Link>
          </nav>

          {/* User Controls */}
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="w-20 h-8 bg-slate-800 rounded animate-pulse" />
            ) : user ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <div className="text-sm font-semibold text-white">{user.name}</div>
                  <div className="text-xs text-slate-400 flex items-center justify-end space-x-1">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        user.role === 'ADMIN' ? 'bg-blue-400' : 'bg-emerald-400'
                      }`}
                    />
                    <span>{user.role}</span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                Sign In / Register
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
