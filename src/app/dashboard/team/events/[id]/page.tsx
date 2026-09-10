'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { UserCheck, ArrowLeft, ShieldAlert, Image as ImageIcon } from 'lucide-react';
import PhotoUploader from '@/components/PhotoUploader';
import PhotoGrid, { PhotoItem } from '@/components/PhotoGrid';

interface EventDetail {
  id: string;
  name: string;
  description: string;
}

export default function TeamEventDetailPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbiddenError, setForbiddenError] = useState<string | null>(null);

  const fetchEventData = async () => {
    try {
      const [evtRes, photosRes] = await Promise.all([
        fetch(`/api/events/${eventId}`),
        fetch(`/api/events/${eventId}/photos`),
      ]);

      if (evtRes.status === 403) {
        setForbiddenError('Forbidden: You are not assigned to this event.');
        return;
      }

      if (evtRes.ok) {
        const data = await evtRes.json();
        setEvent(data.event);
      }

      if (photosRes.ok) {
        const pData = await photosRes.json();
        setPhotos(pData.photos || []);
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

  if (forbiddenError) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Access Forbidden (403)</h2>
        <p className="text-xs text-slate-400">{forbiddenError}</p>
        <Link
          href="/dashboard/team"
          className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Team Dashboard</span>
        </Link>
      </div>
    );
  }

  if (loading) {
    return <div className="py-20 text-center text-slate-400">Loading assigned event details...</div>;
  }

  if (!event) {
    return <div className="py-20 text-center text-red-400">Event not found.</div>;
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex items-center space-x-4">
        <Link
          href="/dashboard/team"
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="text-xs text-emerald-400 font-semibold uppercase tracking-wider flex items-center space-x-1">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Assigned Event Workspace</span>
          </div>
          <h1 className="text-2xl font-black text-white">{event.name}</h1>
        </div>
      </div>

      {/* Upload Dropzone */}
      <PhotoUploader eventId={eventId} onUploadSuccess={fetchEventData} />

      {/* Uploaded Photographs Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <ImageIcon className="w-5 h-5 text-emerald-400" />
          <span>Uploaded Photos ({photos.length})</span>
        </h2>

        <PhotoGrid
          photos={photos}
          isAdmin={false}
          onDeletePhoto={handleDeletePhoto}
        />
      </div>
    </div>
  );
}
