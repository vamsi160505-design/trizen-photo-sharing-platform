'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Plus, Calendar, Image as ImageIcon, Users, ExternalLink, Globe, Lock, Trash2, ArrowRight } from 'lucide-react';

interface EventItem {
  id: string;
  name: string;
  description: string;
  eventDate: string;
  totalPhotos: number;
  selectedPhotosCount: number;
  assignedTeamCount: number;
  gallerySlug: string | null;
  isPublished: boolean;
  createdAt: string;
}

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function AdminDashboardPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [teamMembers, setTeamMembers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Event Form State
  const [newEventName, setNewEventName] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [eventsRes, usersRes] = await Promise.all([
        fetch('/api/events'),
        fetch('/api/users'),
      ]);

      if (eventsRes.ok) {
        const data = await eventsRes.json();
        setEvents(data.events || []);
      }
      if (usersRes.ok) {
        const uData = await usersRes.json();
        setTeamMembers((uData.users || []).filter((u: UserItem) => u.role === 'TEAM_MEMBER'));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventName) return;

    setCreating(true);
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newEventName,
          description: newEventDesc,
          teamMemberIds: selectedTeamIds,
        }),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setNewEventName('');
        setNewEventDesc('');
        setSelectedTeamIds([]);
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      const res = await fetch(`/api/events/${eventId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Admin & Lead Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Event Management Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Create events, assign photography team members, review uploads, and publish PIN-protected customer galleries.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center justify-center space-x-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Create New Event</span>
        </button>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <span>Active Events ({events.length})</span>
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((n) => (
              <div key={n} className="h-44 bg-slate-900 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl">
            <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">No events found</p>
            <p className="text-xs text-slate-500 mt-1">Click "Create New Event" to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all shadow-md group"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                        {evt.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{evt.description || 'No description provided.'}</p>
                    </div>

                    <button
                      onClick={() => handleDeleteEvent(evt.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Delete Event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Operational Stats Grid */}
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-800 text-xs text-slate-300">
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-center">
                      <div className="text-slate-400 text-[10px] uppercase font-semibold">Total Uploads</div>
                      <div className="text-base font-extrabold text-blue-400 mt-0.5">{evt.totalPhotos}</div>
                    </div>

                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-center">
                      <div className="text-slate-400 text-[10px] uppercase font-semibold">Curated Selected</div>
                      <div className="text-base font-extrabold text-emerald-400 mt-0.5">{evt.selectedPhotosCount}</div>
                    </div>

                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 text-center">
                      <div className="text-slate-400 text-[10px] uppercase font-semibold">Team Assigned</div>
                      <div className="text-base font-extrabold text-purple-400 mt-0.5">{evt.assignedTeamCount}</div>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {evt.isPublished ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold rounded-full">
                        <Globe className="w-3 h-3" />
                        <span>Gallery Published ({evt.gallerySlug})</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-semibold rounded-full">
                        <Lock className="w-3 h-3" />
                        <span>Draft / Unpublished</span>
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/dashboard/admin/events/${evt.id}`}
                    className="inline-flex items-center space-x-1 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <span>Manage Event</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-2">Create New Event</h2>
            <p className="text-xs text-slate-400 mb-6">
              Fill in the event details and assign photography team members.
            </p>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Event Name</label>
                <input
                  type="text"
                  required
                  value={newEventName}
                  onChange={(e) => setNewEventName(e.target.value)}
                  placeholder="e.g. Arjun & Priya Wedding"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newEventDesc}
                  onChange={(e) => setNewEventDesc(e.target.value)}
                  placeholder="Event venue, date, special instructions..."
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Assign Photography Team Members
                </label>
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {teamMembers.map((member) => (
                    <label
                      key={member.id}
                      className="flex items-center space-x-3 p-2 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 cursor-pointer hover:border-slate-700"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTeamIds.includes(member.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTeamIds((prev) => [...prev, member.id]);
                          } else {
                            setSelectedTeamIds((prev) => prev.filter((id) => id !== member.id));
                          }
                        }}
                        className="rounded border-slate-700 text-blue-600 focus:ring-0"
                      />
                      <div>
                        <div className="font-semibold text-white">{member.name}</div>
                        <div className="text-[10px] text-slate-500">{member.email}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all"
                >
                  {creating ? 'Creating...' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
