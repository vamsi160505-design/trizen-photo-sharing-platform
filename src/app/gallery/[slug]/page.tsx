'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Camera, Lock, Download, Sparkles, Image as ImageIcon, AlertCircle } from 'lucide-react';
import PinModal from '@/components/PinModal';
import PhotoGrid, { PhotoItem } from '@/components/PhotoGrid';

interface GalleryDetails {
  id: string;
  title: string;
  slug: string;
  eventName: string;
  eventDescription: string;
  photoCount: number;
}

export default function CustomerGalleryPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [gallery, setGallery] = useState<GalleryDetails | null>(null);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [requiresPin, setRequiresPin] = useState(true);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGalleryPhotos = async (token?: string) => {
    setLoading(true);
    setError(null);

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(`/api/gallery/${slug}/photos`, { headers });
      const data = await res.json();

      if (res.status === 401 && data.requiresPin) {
        setRequiresPin(true);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to load gallery');
      }

      setGallery(data.gallery);
      setPhotos(data.photos || []);
      setRequiresPin(false);
    } catch (err: any) {
      setError(err.message || 'Gallery unavailable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) fetchGalleryPhotos();
  }, [slug]);

  const handlePinSuccess = (token: string) => {
    setSessionToken(token);
    setRequiresPin(false);
    fetchGalleryPhotos(token);
  };

  const handleDownloadAll = () => {
    photos.forEach((p) => {
      const link = document.createElement('a');
      link.href = p.storageLocation;
      link.download = p.originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-12 h-12 bg-blue-600/20 text-blue-400 rounded-full flex items-center justify-center mx-auto animate-pulse">
          <Camera className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-slate-300">Loading published gallery...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Gallery Access Error</h2>
        <p className="text-xs text-slate-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* PIN Access Modal Prompt */}
      {requiresPin && <PinModal gallerySlug={slug} onSuccess={handlePinSuccess} />}

      {/* Main Gallery View (visible when PIN verified) */}
      {!requiresPin && gallery && (
        <>
          {/* Gallery Banner Header */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Published Customer Gallery</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-white">{gallery.title}</h1>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">{gallery.eventDescription}</p>
              </div>

              {photos.length > 0 && (
                <button
                  onClick={handleDownloadAll}
                  className="inline-flex items-center justify-center space-x-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg transition-all shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Download All ({photos.length} Photos)</span>
                </button>
              )}
            </div>
          </div>

          {/* Curated Photos Grid */}
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span className="font-semibold text-slate-200">
                Curated Album ({photos.length} Photographs)
              </span>
              <span>Protected Access • Click any photo to view in high resolution</span>
            </div>

            <PhotoGrid photos={photos} isAdmin={false} />
          </div>
        </>
      )}
    </div>
  );
}
