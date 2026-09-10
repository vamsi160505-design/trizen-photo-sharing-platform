import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: Request) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  let eventsList;
  if (user.role === 'ADMIN') {
    eventsList = db.events.findMany();
  } else {
    const assignments = db.eventAssignments.findByUserId(user.id);
    const assignedEventIds = new Set(assignments.map((a) => a.eventId));
    eventsList = db.events.findMany().filter((e) => assignedEventIds.has(e.id));
  }

  const enrichedEvents = eventsList.map((evt) => {
    const photos = db.photos.findByEventId(evt.id);
    const selectedCount = photos.filter((p) => p.isSelected).length;
    const assignments = db.eventAssignments.findByEventId(evt.id);
    const gallery = db.galleries.findByEventId(evt.id);

    return {
      ...evt,
      totalPhotos: photos.length,
      selectedPhotosCount: selectedCount,
      assignedTeamCount: assignments.length,
      gallerySlug: gallery ? gallery.slug : null,
      isPublished: gallery ? gallery.isPublished : false,
    };
  });

  return NextResponse.json({ events: enrichedEvents });
}

export async function POST(req: Request) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  if (user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden: Only Admins can create events' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, description, eventDate, teamMemberIds } = body;

    if (!name) {
      return NextResponse.json({ error: 'Event name is required' }, { status: 400 });
    }

    const newEvent = db.events.create({
      name,
      description: description || '',
      eventDate: eventDate || new Date().toISOString(),
      createdByAdminId: user.id,
    });

    if (Array.isArray(teamMemberIds)) {
      teamMemberIds.forEach((memberId: string) => {
        db.eventAssignments.assign(newEvent.id, memberId);
      });
    }

    return NextResponse.json({ event: newEvent }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create event' }, { status: 500 });
  }
}
