'use client';

import React from 'react';
import { X, ChevronLeft, ChevronRight, Download, Calendar, User, HardDrive } from 'lucide-react';

interface PhotoItem {
  id: string;
  originalName: string;
  storageLocation: string;
  fileSize: number;
  mimeType: string;
  uploadedByName?: string;
  createdAt: string;
}

interface LightboxModalProps {
  photos: PhotoItem[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function LightboxModal({
  photos,
  currentIndex,
  onClose,
  onNavigate,
}: LightboxModalProps) {
  if (currentIndex < 0 || currentIndex >= photos.length) return null;

  const currentPhoto = photos[currentIndex];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNavigate((currentIndex - 1 + photos.length) % photos.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNavigate((currentIndex + 1) % photos.length);
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 KB';
    const mb = bytes / (1024 * 1024);
    return mb >= 1 ? `${mb.toFixed(2)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Top Bar */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10 text-white">
        <div className="text-sm font-semibold truncate max-w-md">
          {currentPhoto.originalName}
          <span className="ml-2 text-xs font-normal text-slate-400">
            ({currentIndex + 1} of {photos.length})
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <a
            href={currentPhoto.storageLocation}
            download={currentPhoto.originalName}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center space-x-1 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-medium backdrop-blur transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </a>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Nav Controls */}
      {photos.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 z-20 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors border border-white/10"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 z-20 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition-colors border border-white/10"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Main Image Container */}
      <div
        className="max-w-5xl max-h-[80vh] flex items-center justify-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-next/no-img-element */}
        <img
          src={currentPhoto.storageLocation}
          alt={currentPhoto.originalName}
          className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
        />
      </div>

      {/* Bottom Info Bar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/80 border border-slate-800 backdrop-blur-md px-6 py-2.5 rounded-full text-xs text-slate-300 flex items-center space-x-6">
        <div className="flex items-center space-x-1.5">
          <HardDrive className="w-3.5 h-3.5 text-blue-400" />
          <span>{formatSize(currentPhoto.fileSize)}</span>
        </div>
        {currentPhoto.uploadedByName && (
          <div className="flex items-center space-x-1.5">
            <User className="w-3.5 h-3.5 text-emerald-400" />
            <span>{currentPhoto.uploadedByName}</span>
          </div>
        )}
        <div className="flex items-center space-x-1.5">
          <Calendar className="w-3.5 h-3.5 text-amber-400" />
          <span>{new Date(currentPhoto.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}
