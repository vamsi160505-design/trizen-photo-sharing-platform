'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { UserCheck, Calendar, Image as ImageIcon, ArrowRight } from 'lucide-react';

interface EventItem {
  id: string;
  name: string;
  description: string;
  eventDate: string;
  totalPhotos: number;
}

export default function TeamDashboardPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAssignedEvents = async () => {
    try {
      const res = await fetch('/api/events');
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedEvents();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-2">
        <div className="inline-flex items-center space-x-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
          <UserCheck className="w-4 h-4" />
          <span>Team Member Portal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">Your Assigned Events</h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Upload and review photographs for events assigned to you by your Lead.
        </p>
      </div>

      {/* Assigned Events Grid */}
      <div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((n) => (
              <div key={n} className="h-36 bg-slate-900 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl">
            <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-2" />
            <p className="text-base font-semibold text-slate-300">No assigned events</p>
            <p className="text-xs text-slate-500 mt-1">You will see events here once an Admin assigns you.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all shadow-md group"
              >
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {evt.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{evt.description || 'No description provided.'}</p>

                  <div className="mt-4 pt-4 border-t border-slate-800 flex items-center space-x-2 text-xs text-slate-300">
                    <ImageIcon className="w-4 h-4 text-emerald-400" />
                    <span>Uploaded Photos: <strong className="text-white">{evt.totalPhotos}</strong></span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/60 flex justify-end">
                  <Link
                    href={`/dashboard/team/events/${evt.id}`}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow transition-all"
                  >
                    <span>Upload & Manage Photos</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
