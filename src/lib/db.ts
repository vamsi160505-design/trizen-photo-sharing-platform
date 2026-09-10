import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'ADMIN' | 'TEAM_MEMBER';
  createdAt: string;
  updatedAt: string;
}

export interface EventRecord {
  id: string;
  name: string;
  description?: string;
  eventDate?: string;
  createdByAdminId: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventAssignmentRecord {
  id: string;
  eventId: string;
  userId: string;
  assignedAt: string;
}

export interface PhotoRecord {
  id: string;
  eventId: string;
  uploadedById: string;
  filename: string;
  originalName: string;
  storageLocation: string;
  mimeType: string;
  fileSize: number;
  width?: number;
  height?: number;
  isSelected: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryRecord {
  id: string;
  eventId: string;
  title: string;
  slug: string;
  pinHash: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryPhotoRecord {
  id: string;
  galleryId: string;
  photoId: string;
  addedAt: string;
}

export interface DatabaseSchema {
  users: UserRecord[];
  events: EventRecord[];
  eventAssignments: EventAssignmentRecord[];
  photos: PhotoRecord[];
  galleries: GalleryRecord[];
  galleryPhotos: GalleryPhotoRecord[];
}

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'db.json');

function ensureDbFileExists(): DatabaseSchema {
  const dir = path.dirname(DB_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE_PATH)) {
    const initialData: DatabaseSchema = {
      users: [],
      events: [],
      eventAssignments: [],
      photos: [],
      galleries: [],
      galleryPhotos: [],
    };
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }

  try {
    const content = fs.readFileSync(DB_FILE_PATH, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Failed to parse db.json, creating new file', err);
    const initialData: DatabaseSchema = {
      users: [],
      events: [],
      eventAssignments: [],
      photos: [],
      galleries: [],
      galleryPhotos: [],
    };
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
}

export function readDb(): DatabaseSchema {
  return ensureDbFileExists();
}

export function writeDb(data: DatabaseSchema): void {
  const dir = path.dirname(DB_FILE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export const db = {
  users: {
    findMany: () => readDb().users,
    findUnique: (predicate: (u: UserRecord) => boolean) => readDb().users.find(predicate),
    findById: (id: string) => readDb().users.find((u) => u.id === id),
    findByEmail: (email: string) => readDb().users.find((u) => u.email.toLowerCase() === email.toLowerCase()),
    create: (user: Omit<UserRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
      const data = readDb();
      const now = new Date().toISOString();
      const newUser: UserRecord = {
        id: crypto.randomUUID(),
        ...user,
        createdAt: now,
        updatedAt: now,
      };
      data.users.push(newUser);
      writeDb(data);
      return newUser;
    },
  },
  events: {
    findMany: () => readDb().events,
    findById: (id: string) => readDb().events.find((e) => e.id === id),
    findByAdminId: (adminId: string) => readDb().events.filter((e) => e.createdByAdminId === adminId),
    create: (event: Omit<EventRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
      const data = readDb();
      const now = new Date().toISOString();
      const newEvent: EventRecord = {
        id: crypto.randomUUID(),
        ...event,
        createdAt: now,
        updatedAt: now,
      };
      data.events.push(newEvent);
      writeDb(data);
      return newEvent;
    },
    delete: (id: string) => {
      const data = readDb();
      data.events = data.events.filter((e) => e.id !== id);
      data.eventAssignments = data.eventAssignments.filter((a) => a.eventId !== id);
      data.photos = data.photos.filter((p) => p.eventId !== id);
      data.galleries = data.galleries.filter((g) => g.eventId !== id);
      writeDb(data);
    },
  },
  eventAssignments: {
    findMany: () => readDb().eventAssignments,
    findByEventId: (eventId: string) => readDb().eventAssignments.filter((a) => a.eventId === eventId),
    findByUserId: (userId: string) => readDb().eventAssignments.filter((a) => a.userId === userId),
    isAssigned: (eventId: string, userId: string) =>
      readDb().eventAssignments.some((a) => a.eventId === eventId && a.userId === userId),
    assign: (eventId: string, userId: string) => {
      const data = readDb();
      const existing = data.eventAssignments.find((a) => a.eventId === eventId && a.userId === userId);
      if (existing) return existing;
      const newAssignment: EventAssignmentRecord = {
        id: crypto.randomUUID(),
        eventId,
        userId,
        assignedAt: new Date().toISOString(),
      };
      data.eventAssignments.push(newAssignment);
      writeDb(data);
      return newAssignment;
    },
    unassign: (eventId: string, userId: string) => {
      const data = readDb();
      data.eventAssignments = data.eventAssignments.filter(
        (a) => !(a.eventId === eventId && a.userId === userId)
      );
      writeDb(data);
    },
  },
  photos: {
    findMany: () => readDb().photos,
    findById: (id: string) => readDb().photos.find((p) => p.id === id),
    findByEventId: (eventId: string) => readDb().photos.filter((p) => p.eventId === eventId),
    findByUploadedBy: (userId: string) => readDb().photos.filter((p) => p.uploadedById === userId),
    create: (photo: Omit<PhotoRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
      const data = readDb();
      const now = new Date().toISOString();
      const newPhoto: PhotoRecord = {
        id: crypto.randomUUID(),
        ...photo,
        createdAt: now,
        updatedAt: now,
      };
      data.photos.push(newPhoto);
      writeDb(data);
      return newPhoto;
    },
    updateSelection: (id: string, isSelected: boolean) => {
      const data = readDb();
      const photo = data.photos.find((p) => p.id === id);
      if (photo) {
        photo.isSelected = isSelected;
        photo.updatedAt = new Date().toISOString();
        writeDb(data);
      }
      return photo;
    },
    delete: (id: string) => {
      const data = readDb();
      data.photos = data.photos.filter((p) => p.id !== id);
      data.galleryPhotos = data.galleryPhotos.filter((gp) => gp.photoId !== id);
      writeDb(data);
    },
  },
  galleries: {
    findMany: () => readDb().galleries,
    findById: (id: string) => readDb().galleries.find((g) => g.id === id),
    findBySlug: (slug: string) => readDb().galleries.find((g) => g.slug === slug),
    findByEventId: (eventId: string) => readDb().galleries.find((g) => g.eventId === eventId),
    createOrUpdate: (gallery: Omit<GalleryRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
      const data = readDb();
      const now = new Date().toISOString();
      const existingIndex = data.galleries.findIndex((g) => g.eventId === gallery.eventId);
      
      let finalGallery: GalleryRecord;
      if (existingIndex >= 0) {
        finalGallery = {
          ...data.galleries[existingIndex],
          ...gallery,
          updatedAt: now,
        };
        data.galleries[existingIndex] = finalGallery;
      } else {
        finalGallery = {
          id: crypto.randomUUID(),
          ...gallery,
          createdAt: now,
          updatedAt: now,
        };
        data.galleries.push(finalGallery);
      }
      writeDb(data);
      return finalGallery;
    },
  },
  galleryPhotos: {
    findByGalleryId: (galleryId: string) => readDb().galleryPhotos.filter((gp) => gp.galleryId === galleryId),
    syncGalleryPhotos: (galleryId: string, photoIds: string[]) => {
      const data = readDb();
      // Remove existing
      data.galleryPhotos = data.galleryPhotos.filter((gp) => gp.galleryId !== galleryId);
      // Add new
      const now = new Date().toISOString();
      const newItems: GalleryPhotoRecord[] = photoIds.map((photoId) => ({
        id: crypto.randomUUID(),
        galleryId,
        photoId,
        addedAt: now,
      }));
      data.galleryPhotos.push(...newItems);
      writeDb(data);
      return newItems;
    },
  },
};
