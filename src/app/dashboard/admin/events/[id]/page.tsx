'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ShieldCheck, ArrowLeft, Image as ImageIcon, Globe, Lock, KeyRound, Copy, Check, Users, Trash2, Plus, Sparkles } from 'lucide-react';
import PhotoGrid, { PhotoItem } from '@/components/PhotoGrid';

interface EventDetail {
  id: string;
  name: string;
  description: string;
  eventDate: string;
}

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface GalleryInfo {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
}

export default function AdminEventDetailPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [activeTab, setActiveTab] = useState<'photos' | 'publish' | 'team'>('photos');
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [assignedUsers, setAssignedUsers] = useState<UserItem[]>([]);
  const [allTeamMembers, setAllTeamMembers] = useState<UserItem[]>([]);
  const [galleryInfo, setGalleryInfo] = useState<GalleryInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Gallery Publishing Form State
  const [galleryTitle, setGalleryTitle] = useState('');
  const [gallerySlug, setGallerySlug] = useState('');
  const [galleryPin, setGalleryPin] = useState('482917');
  const [publishing, setPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<any>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const fetchEventData = async () => {
    try {
      const [evtRes, photosRes, usersRes] = await Promise.all([
        fetch(`/api/events/${eventId}`),
        fetch(`/api/events/${eventId}/photos`),
        fetch(`/api/users`),
      ]);

      if (evtRes.ok) {
        const data = await evtRes.json();
        setEvent(data.event);
        setAssignedUsers(data.assignedUsers || []);
        setGalleryInfo(data.gallery || null);
        if (data.event) {
          setGalleryTitle(data.event.name + ' - Official Gallery');
          setGallerySlug(`gallery-${eventId.substring(0, 6)}`);
        }
      }

      if (photosRes.ok) {
        const pData = await photosRes.json();
        setPhotos(pData.photos || []);
      }

      if (usersRes.ok) {
        const uData = await usersRes.json();
        setAllTeamMembers((uData.users || []).filter((u: UserItem) => u.role === 'TEAM_MEMBER'));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) fetchEventData();
  }, [eventId]);

  const handleToggleSelect = async (photoId: string, currentSelected: boolean) => {
    // Optimistic update
    setPhotos((prev) =>
      prev.map((p) => (p.id === photoId ? { ...p, isSelected: !currentSelected } : p))
    );

    try {
      await fetch(`/api/photos/${photoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isSelected: !currentSelected }),
      });
    } catch (err) {
      console.error(err);
      fetchEventData(); // Rollback on error
    }
  };

  const handleSelectAll = (select: boolean) => {
    setPhotos((prev) => prev.map((p) => ({ ...p, isSelected: select })));
    // Sync all
    photos.forEach((p) => {
      fetch(`/api/photos/${p.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isSelected: select }),
      });
    });
  };

  const handleDeletePhoto = async (photoId: string) => {
    try {
      const res = await fetch(`/api/photos/${photoId}`, { method: 'DELETE' });
      if (res.ok) {
        setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePublishGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishing(true);
    setPublishResult(null);

    const selectedIds = photos.filter((p) => p.isSelected).map((p) => p.id);

    try {
      const res = await fetch(`/api/events/${eventId}/gallery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: galleryTitle,
          slug: gallerySlug || 'abc123',
          pin: galleryPin,
          selectedPhotoIds: selectedIds,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setPublishResult(data.gallery);
        setGalleryInfo(data.gallery);
      } else {
        alert(data.error || 'Failed to publish gallery');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to publish gallery');
    } finally {
      setPublishing(false);
    }
  };

  const handleAssignUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/events/${eventId}/team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) fetchEventData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnassignUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/events/${eventId}/team?userId=${userId}`, {
        method: 'DELETE',
      });
      if (res.ok) fetchEventData();
    } catch (err) {
      console.error(err);
    }
  };

  const selectedCount = photos.filter((p) => p.isSelected).length;

  if (loading) {
    return <div className="py-20 text-center text-slate-400">Loading event details...</div>;
  }

  if (!event) {
    return <div className="py-20 text-center text-red-400">Event not found.</div>;
  }

  return (
    <div className="space-y-8">
      {/* Top Header Navigation */}
      <div className="flex items-center space-x-4">
        <Link
          href="/dashboard/admin"
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-white">{event.name}</h1>
          <p className="text-xs text-slate-400 mt-0.5">{event.description || 'Event Management Console'}</p>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-slate-800 space-x-6">
        <button
          onClick={() => setActiveTab('photos')}
          className={`pb-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'photos'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Curate Photographs ({photos.length})</span>
          <span className="ml-1 px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full text-[10px]">
            {selectedCount} Selected
          </span>
        </button>

        <button
          onClick={() => setActiveTab('publish')}
          className={`pb-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'publish'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Publish & PIN Gallery</span>
        </button>

        <button
          onClick={() => setActiveTab('team')}
          className={`pb-3 text-sm font-semibold flex items-center space-x-2 border-b-2 transition-colors ${
            activeTab === 'team'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Team Members ({assignedUsers.length})</span>
        </button>
      </div>

      {/* TAB 1: CURATE PHOTOGRAPHS */}
      {activeTab === 'photos' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            <div className="text-xs text-slate-300">
              Select photographs to include in the customer-facing published gallery.
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleSelectAll(true)}
                className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold rounded-lg transition-colors"
              >
                Select All ({photos.length})
              </button>
              <button
                onClick={() => handleSelectAll(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors"
              >
                Deselect All
              </button>
            </div>
          </div>

          <PhotoGrid
            photos={photos}
            isAdmin={true}
            onToggleSelect={handleToggleSelect}
            onDeletePhoto={handleDeletePhoto}
          />
        </div>
      )}

      {/* TAB 2: PUBLISH GALLERY */}
      {activeTab === 'publish' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <Globe className="w-5 h-5 text-blue-400" />
                <span>Gallery Publishing Controls</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Set a title, custom share link slug, and 6-digit access PIN for customer access.
              </p>
            </div>

            <form onSubmit={handlePublishGallery} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Gallery Title</label>
                <input
                  type="text"
                  required
                  value={galleryTitle}
                  onChange={(e) => setGalleryTitle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Shareable URL Slug
                </label>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-500 font-mono">/gallery/</span>
                  <input
                    type="text"
                    required
                    value={gallerySlug}
                    onChange={(e) => setGallerySlug(e.target.value)}
                    placeholder="abc123"
                    className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Set Access PIN (4 to 8 digits)
                </label>
                <div className="relative max-w-xs">
                  <input
                    type="text"
                    required
                    maxLength={8}
                    value={galleryPin}
                    onChange={(e) => setGalleryPin(e.target.value)}
                    placeholder="482917"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono tracking-widest text-white focus:outline-none focus:border-blue-500"
                  />
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-1">
                <div className="font-semibold text-blue-400">Curated Photos Summary</div>
                <div>
                  Total Uploaded: <span className="font-bold text-white">{photos.length}</span> |
                  Selected for Gallery: <span className="font-bold text-emerald-400">{selectedCount}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={publishing}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg transition-all"
              >
                {publishing ? 'Publishing Gallery...' : 'Publish Gallery & Save Credentials'}
              </button>
            </form>
          </div>

          {/* Operational State Box - Matching Requirements Specification */}
          {(publishResult || galleryInfo?.isPublished) && (
            <div className="bg-slate-950 border border-blue-500/40 rounded-3xl p-6 space-y-4 shadow-2xl font-mono text-xs text-slate-200">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold font-sans">
                <Sparkles className="w-4 h-4" />
                <span>Example Operational State (Published Credentials):</span>
              </div>

              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2 leading-relaxed">
                <div>Event Name: <span className="text-white font-bold">{event.name}</span></div>
                <div>
                  Total Uploaded Photos: <span className="text-white font-bold">{photos.length}</span> | Selected for Publishing: <span className="text-emerald-400 font-bold">{selectedCount}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 font-bold text-blue-400">Generated Gallery Credentials:</div>
                <div className="flex items-center justify-between text-slate-300 bg-slate-950 p-2.5 rounded-lg">
                  <span className="truncate">
                    Gallery URL: <span className="text-white">http://localhost:3000/gallery/{gallerySlug}</span>
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`http://localhost:3000/gallery/${gallerySlug}`);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }}
                    className="p-1.5 text-slate-400 hover:text-white rounded transition-colors shrink-0"
                    title="Copy Link"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div>Access PIN: <span className="text-amber-300 font-extrabold text-sm">{galleryPin}</span></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TEAM MANAGEMENT */}
      {activeTab === 'team' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Users className="w-5 h-5 text-purple-400" />
              <span>Assigned Team Members</span>
            </h2>

            {assignedUsers.length === 0 ? (
              <p className="text-xs text-slate-400">No team members currently assigned to this event.</p>
            ) : (
              <div className="space-y-2">
                {assignedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-white">{user.name}</div>
                      <div className="text-slate-400">{user.email}</div>
                    </div>
                    <button
                      onClick={() => handleUnassignUser(user.id)}
                      className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition-colors font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white">Add Available Team Member</h2>

            <div className="space-y-2">
              {allTeamMembers
                .filter((member) => !assignedUsers.some((u) => u.id === member.id))
                .map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs"
                  >
                    <div>
                      <div className="font-semibold text-white">{member.name}</div>
                      <div className="text-slate-400">{member.email}</div>
                    </div>
                    <button
                      onClick={() => handleAssignUser(member.id)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-semibold flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Assign</span>
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
