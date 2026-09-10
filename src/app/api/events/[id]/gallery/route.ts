import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest, hashPassword } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const gallery = db.galleries.findByEventId(params.id);
  if (!gallery) {
    return NextResponse.json({ gallery: null });
  }

  const galleryPhotos = db.galleryPhotos.findByGalleryId(gallery.id);

  return NextResponse.json({
    gallery: {
      id: gallery.id,
      title: gallery.title,
      slug: gallery.slug,
      isPublished: gallery.isPublished,
      selectedCount: galleryPhotos.length,
      createdAt: gallery.createdAt,
    },
  });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  // Edge case requirement check: A Team Member attempting to publish a gallery -> MUST return 403 Forbidden
  if (user.role !== 'ADMIN') {
    return NextResponse.json({
      error: 'Forbidden: Only Admins can publish or manage galleries',
    }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { title, slug, pin, selectedPhotoIds } = body;

    if (!pin || pin.length < 4) {
      return NextResponse.json({ error: 'Access PIN must be at least 4 digits' }, { status: 400 });
    }

    const event = db.events.findById(params.id);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const gallerySlug = slug || `gallery-${params.id.substring(0, 6)}`;
    const pinHash = hashPassword(pin);

    const gallery = db.galleries.createOrUpdate({
      eventId: params.id,
      title: title || event.name,
      slug: gallerySlug,
      pinHash,
      isPublished: true,
    });

    const photoIdsToPublish = Array.isArray(selectedPhotoIds) ? selectedPhotoIds : [];

    // Mark photos as selected in event
    const allEventPhotos = db.photos.findByEventId(params.id);
    allEventPhotos.forEach((p) => {
      const isSel = photoIdsToPublish.includes(p.id);
      db.photos.updateSelection(p.id, isSel);
    });

    // Sync gallery photos junction
    db.galleryPhotos.syncGalleryPhotos(gallery.id, photoIdsToPublish);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const galleryUrl = `${appUrl}/gallery/${gallery.slug}`;

    return NextResponse.json({
      success: true,
      gallery: {
        id: gallery.id,
        title: gallery.title,
        slug: gallery.slug,
        galleryUrl,
        pin: pin, // return plain PIN in admin publish response for sharing convenience
        selectedCount: photoIdsToPublish.length,
        isPublished: gallery.isPublished,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to publish gallery' }, { status: 500 });
  }
}
