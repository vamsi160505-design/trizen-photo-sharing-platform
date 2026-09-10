import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { deleteFile } from '@/lib/storage';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  if (user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden: Only Admins can select photos for gallery' }, { status: 403 });
  }

  try {
    const { isSelected } = await req.json();
    const photo = db.photos.findById(params.id);
    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    const updated = db.photos.updateSelection(params.id, Boolean(isSelected));
    return NextResponse.json({ photo: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update photo' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const photo = db.photos.findById(params.id);
  if (!photo) {
    return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
  }

  if (user.role !== 'ADMIN' && photo.uploadedById !== user.id) {
    return NextResponse.json({ error: 'Forbidden: You can only delete your own photos' }, { status: 403 });
  }

  deleteFile(photo.storageLocation);
  db.photos.delete(params.id);

  return NextResponse.json({ success: true, message: 'Photo deleted' });
}
