import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, signGallerySessionToken } from '@/lib/auth';

export async function POST(req: Request, { params }: { params: { slug: string } }) {
  try {
    const { pin } = await req.json();

    if (!pin) {
      return NextResponse.json({ error: 'PIN is required' }, { status: 400 });
    }

    const gallery = db.galleries.findBySlug(params.slug);
    if (!gallery) {
      return NextResponse.json({ error: 'Gallery not found' }, { status: 404 });
    }

    if (!gallery.isPublished) {
      return NextResponse.json({ error: 'This gallery is currently unpublished' }, { status: 403 });
    }

    const isValid = verifyPassword(pin, gallery.pinHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Incorrect PIN' }, { status: 401 });
    }

    const sessionToken = signGallerySessionToken(gallery.slug);

    const response = NextResponse.json({
      success: true,
      galleryTitle: gallery.title,
      sessionToken,
    });

    response.cookies.set(`gallery_session_${params.slug}`, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
