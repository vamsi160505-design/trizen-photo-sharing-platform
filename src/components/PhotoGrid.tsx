'use client';

import React, { useState } from 'react';
import { CheckCircle2, Circle, Eye, Trash2, Check, Download } from 'lucide-react';
import LightboxModal from './LightboxModal';

export interface PhotoItem {
  id: string;
  originalName: string;
  storageLocation: string;
  fileSize: number;
  mimeType: string;
  uploadedByName?: string;
  isSelected?: boolean;
  createdAt: string;
}

interface PhotoGridProps {
  photos: PhotoItem[];
  isAdmin?: boolean;
  onToggleSelect?: (photoId: string, currentSelected: boolean) => void;
  onDeletePhoto?: (photoId: string) => void;
}

export default function PhotoGrid({
  photos,
  isAdmin = false,
  onToggleSelect,
  onDeletePhoto,
}: PhotoGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number>(-1);

  if (!photos || photos.length === 0) {
    return (
      <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
        <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
          <Eye className="w-6 h-6" />
        </div>
        <p className="text-base font-semibold text-slate-700 dark:text-slate-200">No photos uploaded yet</p>
        <p className="text-xs text-slate-400 mt-1">Upload photographs to start organizing your gallery.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className={`group relative bg-white dark:bg-slate-800 rounded-xl overflow-hidden border transition-all duration-200 shadow-sm hover:shadow-md ${
              photo.isSelected
                ? 'border-blue-500 ring-2 ring-blue-500/20'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
            }`}
          >
            {/* Image Preview */}
            <div
              className="aspect-video sm:aspect-square relative overflow-hidden bg-slate-100 dark:bg-slate-900 cursor-pointer"
              onClick={() => setLightboxIndex(index)}
            >
              {/* eslint-disable-next-next/no-img-element */}
              <img
                src={photo.storageLocation}
                alt={photo.originalName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex(index);
                  }}
                  className="p-2 bg-white/20 hover:bg-white/40 text-white backdrop-blur rounded-full transition-colors"
                  title="View Fullscreen"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <a
                  href={photo.storageLocation}
                  download={photo.originalName}
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 bg-white/20 hover:bg-white/40 text-white backdrop-blur rounded-full transition-colors"
                  title="Download Photo"
                >
                  <Download className="w-5 h-5" />
                </a>
                {onDeletePhoto && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this photo?')) onDeletePhoto(photo.id);
                    }}
                    className="p-2 bg-red-600/80 hover:bg-red-600 text-white backdrop-blur rounded-full transition-colors"
                    title="Delete Photo"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Selection Checkbox Overlay for Admin */}
              {isAdmin && onToggleSelect && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSelect(photo.id, !!photo.isSelected);
                  }}
                  className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-slate-900/60 backdrop-blur hover:bg-slate-900 transition-colors text-white"
                  title={photo.isSelected ? 'Deselect photo' : 'Select for gallery'}
                >
                  {photo.isSelected ? (
                    <CheckCircle2 className="w-6 h-6 text-blue-400 fill-blue-400/20" />
                  ) : (
                    <Circle className="w-6 h-6 text-white/70" />
                  )}
                </button>
              )}

              {/* Selection Status Badge */}
              {photo.isSelected && (
                <div className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-md flex items-center space-x-1 shadow-sm">
                  <Check className="w-3 h-3" />
                  <span>Selected</span>
                </div>
              )}
            </div>

            {/* Footer Details */}
            <div className="p-3 text-xs">
              <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                {photo.originalName}
              </div>
              <div className="flex justify-between items-center mt-1 text-slate-400">
                <span>By {photo.uploadedByName || 'Team Member'}</span>
                <span>{(photo.fileSize / 1024).toFixed(0)} KB</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {lightboxIndex >= 0 && (
        <LightboxModal
          photos={photos}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(-1)}
          onNavigate={(newIdx) => setLightboxIndex(newIdx)}
        />
      )}
    </>
  );
}
