import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const event = db.events.findById(params.id);
  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  if (user.role !== 'ADMIN') {
    const isAssigned = db.eventAssignments.isAssigned(params.id, user.id);
    if (!isAssigned) {
      return NextResponse.json({ error: 'Forbidden: You are not assigned to this event' }, { status: 403 });
    }
  }

  const assignments = db.eventAssignments.findByEventId(params.id);
  const assignedUsers = assignments.map((a) => {
    const u = db.users.findById(a.userId);
    return u ? { id: u.id, name: u.name, email: u.email, role: u.role } : null;
  }).filter(Boolean);

  const photos = db.photos.findByEventId(params.id);
  const gallery = db.galleries.findByEventId(params.id);

  return NextResponse.json({
    event,
    assignedUsers,
    photosCount: photos.length,
    selectedPhotosCount: photos.filter((p) => p.isSelected).length,
    gallery: gallery
      ? {
          id: gallery.id,
          title: gallery.title,
          slug: gallery.slug,
          isPublished: gallery.isPublished,
          createdAt: gallery.createdAt,
        }
      : null,
  });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  if (user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden: Only Admins can delete events' }, { status: 403 });
  }

  const event = db.events.findById(params.id);
  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  db.events.delete(params.id);
  return NextResponse.json({ success: true, message: 'Event deleted' });
}
