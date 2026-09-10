import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { saveUploadedFile } from '@/lib/storage';

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

  const photos = db.photos.findByEventId(params.id);
  const enrichedPhotos = photos.map((p) => {
    const uploader = db.users.findById(p.uploadedById);
    return {
      ...p,
      uploadedByName: uploader ? uploader.name : 'Unknown',
      uploadedByEmail: uploader ? uploader.email : 'Unknown',
    };
  });

  return NextResponse.json({ photos: enrichedPhotos });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
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
      return NextResponse.json({ error: 'Forbidden: You are not assigned to upload photos for this event' }, { status: 403 });
    }
  }

  try {
    const formData = await req.formData();
    const files = formData.getAll('file') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided for upload' }, { status: 400 });
    }

    const uploadedPhotos = [];

    for (const file of files) {
      if (!file.type || !file.type.startsWith('image/')) {
        continue; // skip non-images
      }

      const saveResult = await saveUploadedFile(file);

      const photoRecord = db.photos.create({
        eventId: params.id,
        uploadedById: user.id,
        filename: saveResult.filename,
        originalName: saveResult.originalName,
        storageLocation: saveResult.storageLocation,
        mimeType: saveResult.mimeType,
        fileSize: saveResult.fileSize,
        isSelected: false,
      });

      uploadedPhotos.push({
        ...photoRecord,
        uploadedByName: user.name,
        uploadedByEmail: user.email,
      });
    }

    return NextResponse.json({
      message: `Successfully uploaded ${uploadedPhotos.length} photo(s)`,
      photos: uploadedPhotos,
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to upload photos' }, { status: 500 });
  }
}
