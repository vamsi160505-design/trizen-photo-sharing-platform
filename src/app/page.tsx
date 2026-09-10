import React from 'react';
import Link from 'next/link';
import { Camera, ShieldCheck, UserCheck, Eye, ArrowRight, Lock, CheckCircle2, Sparkles, Layers } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <div className="text-center space-y-6 max-w-4xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>TrizenAI Full Stack Internship Challenge</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
          Collaborative Event Photo <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
            & PIN-Protected Gallery Platform
          </span>
        </h1>

        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          A full-stack photo-sharing application built for event photography teams to upload, curate, and publish PIN-protected customer galleries seamlessly.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/login"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-blue-500/20 transition-all flex items-center space-x-2"
          >
            <span>Sign In to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/gallery/abc123"
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-xl transition-all flex items-center space-x-2"
          >
            <Lock className="w-4 h-4 text-amber-400" />
            <span>Open Demo Gallery (PIN: 482917)</span>
          </Link>
        </div>
      </div>

      {/* Pre-seeded Demo Credentials Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span>Pre-seeded Evaluation Demo Credentials</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Admin Card */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 space-y-3">
            <div className="flex items-center space-x-2 text-blue-400 font-bold text-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>Admin / Lead Credentials</span>
            </div>
            <div className="text-xs space-y-1 text-slate-300 font-mono bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div>Email: admin@trizen.com</div>
              <div>Password: Admin@123456</div>
            </div>
            <p className="text-xs text-slate-400">Full control over events, team assignments, photo curation, and gallery publishing.</p>
          </div>

          {/* Team Member Card */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 space-y-3">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
              <UserCheck className="w-4 h-4" />
              <span>Team Member Credentials</span>
            </div>
            <div className="text-xs space-y-1 text-slate-300 font-mono bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div>Email: photographer@trizen.com</div>
              <div>Password: Team@123456</div>
            </div>
            <p className="text-xs text-slate-400">Can view assigned events and bulk upload photographs.</p>
          </div>

          {/* Customer Gallery Card */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 space-y-3">
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
              <Lock className="w-4 h-4" />
              <span>Published Demo Gallery</span>
            </div>
            <div className="text-xs space-y-1 text-slate-300 font-mono bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div>URL: /gallery/abc123</div>
              <div>Access PIN: 482917</div>
            </div>
            <p className="text-xs text-slate-400">Public customer view - requires no account login, protected by PIN.</p>
          </div>
        </div>
      </div>

      {/* Expected Workflow Sequence */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-white">Expected Workflow Sequence</h2>
          <p className="text-sm text-slate-400 mt-1">End-to-end operational sequence implemented by the application</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { step: '1', title: 'Admin Creates Event', desc: 'Admin sets up event and assigns photography team members.' },
            { step: '2', title: 'Team Uploads', desc: 'Photographers bulk upload event photos to object storage.' },
            { step: '3', title: 'Admin Reviews', desc: 'Lead reviews all uploads and selects best photos for sharing.' },
            { step: '4', title: 'Publish Gallery', desc: 'Admin publishes gallery and sets a 6-digit access PIN.' },
            { step: '5', title: 'Customer Access', desc: 'Customer opens share link, enters PIN, and browses photos.' },
          ].map((item) => (
            <div
              key={item.step}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 font-bold text-xs flex items-center justify-center mb-3 border border-blue-500/30">
                  {item.step}
                </div>
                <h3 className="font-bold text-white text-sm">{item.title}</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features & Security Specs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 space-y-4">
          <h3 className="text-xl font-bold text-white flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-blue-400" />
            <span>Role-Based Access Control (RBAC)</span>
          </h3>
          <ul className="space-y-3 text-sm text-slate-300">
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <span>Strict separation between Admin/Lead and Team Member capabilities.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <span>Team members cannot publish galleries, access unassigned events, or manage other users photos.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <span>Customers access published galleries without needing to register accounts.</span>
            </li>
          </ul>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 space-y-4">
          <h3 className="text-xl font-bold text-white flex items-center space-x-2">
            <Lock className="w-6 h-6 text-purple-400" />
            <span>Object Storage & Security</span>
          </h3>
          <ul className="space-y-3 text-sm text-slate-300">
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <span>Image files are stored in object storage abstraction (not binary stored in DB).</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <span>PINs are hashed using PBKDF2/SHA-512 password hashing standards.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <span>Edge cases (incorrect PINs, unauthorized event access, failed uploads) gracefully handled.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
