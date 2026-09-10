import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyGallerySessionToken, parseCookies } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  const gallery = db.galleries.findBySlug(params.slug);
  if (!gallery) {
    return NextResponse.json({ error: 'Gallery not found' }, { status: 404 });
  }

  if (!gallery.isPublished) {
    return NextResponse.json({ error: 'This gallery is unpublished' }, { status: 403 });
  }

  const cookieHeader = req.headers.get('cookie');
  const authHeader = req.headers.get('authorization');
  const parsedCookies = parseCookies(cookieHeader);

  let sessionToken = parsedCookies[`gallery_session_${params.slug}`];
  if (!sessionToken && authHeader && authHeader.startsWith('Bearer ')) {
    sessionToken = authHeader.substring(7);
  }

  const isVerified = sessionToken ? verifyGallerySessionToken(sessionToken, params.slug) : false;

  if (!isVerified) {
    return NextResponse.json({
      error: 'PIN verification required to view gallery photos',
      requiresPin: true,
    }, { status: 401 });
  }

  const galleryPhotos = db.galleryPhotos.findByGalleryId(gallery.id);
  const photoIds = new Set(galleryPhotos.map((gp) => gp.photoId));

  const allPhotos = db.photos.findByEventId(gallery.eventId);
  const publishedPhotos = allPhotos
    .filter((p) => photoIds.has(p.id) || p.isSelected)
    .map((p) => ({
      id: p.id,
      filename: p.filename,
      originalName: p.originalName,
      storageLocation: p.storageLocation,
      fileSize: p.fileSize,
      mimeType: p.mimeType,
      createdAt: p.createdAt,
    }));

  const event = db.events.findById(gallery.eventId);

  return NextResponse.json({
    gallery: {
      id: gallery.id,
      title: gallery.title,
      slug: gallery.slug,
      eventName: event ? event.name : gallery.title,
      eventDescription: event ? event.description : '',
      photoCount: publishedPhotos.length,
    },
    photos: publishedPhotos,
  });
}
