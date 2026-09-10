const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

// Generate sample SVG placeholder images
function createPlaceholderImage(filename, title, color) {
  const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
    <rect width="100%" height="100%" fill="${color}" />
    <circle cx="400" cy="250" r="120" fill="rgba(255,255,255,0.2)" />
    <path d="M200 450 L350 300 L450 400 L550 280 L700 450 Z" fill="rgba(255,255,255,0.4)" />
    <text x="50%" y="82%" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="#ffffff" text-anchor="middle">${title}</text>
    <text x="50%" y="90%" font-family="Arial, sans-serif" font-size="18" fill="rgba(255,255,255,0.8)" text-anchor="middle">Trizen Photo Sharing Platform</text>
  </svg>`;

  const filePath = path.join(uploadsDir, filename);
  fs.writeFileSync(filePath, svgContent, 'utf-8');
  return `/uploads/${filename}`;
}

function seedDatabase() {
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbFilePath = path.join(dataDir, 'db.json');

  const adminId = 'u-admin-001';
  const teamMemberId = 'u-team-001';
  const eventId = 'evt-arjun-priya-wedding';
  const galleryId = 'gal-abc123';

  // Seed sample images
  const p1Loc = createPlaceholderImage('wedding_ceremony.svg', 'Wedding Ceremony - Arjun & Priya', '#1e40af');
  const p2Loc = createPlaceholderImage('ring_exchange.svg', 'Ring Exchange Moment', '#0369a1');
  const p3Loc = createPlaceholderImage('reception_party.svg', 'Reception Celebration', '#4c1d95');
  const p4Loc = createPlaceholderImage('couple_portrait.svg', 'Couple Sunset Portrait', '#991b1b');
  const p5Loc = createPlaceholderImage('family_group.svg', 'Family & Friends Group', '#065f46');

  const now = new Date().toISOString();

  const seedData = {
    users: [
      {
        id: adminId,
        email: 'admin@trizen.com',
        passwordHash: hashPassword('Admin@123456'),
        name: 'Admin Lead',
        role: 'ADMIN',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: teamMemberId,
        email: 'photographer@trizen.com',
        passwordHash: hashPassword('Team@123456'),
        name: 'Alex Photographer',
        role: 'TEAM_MEMBER',
        createdAt: now,
        updatedAt: now,
      },
    ],
    events: [
      {
        id: eventId,
        name: 'Arjun & Priya Wedding',
        description: 'Grand wedding celebration & reception album at Royal Palms Resort.',
        eventDate: '2026-09-15T10:00:00.000Z',
        createdByAdminId: adminId,
        createdAt: now,
        updatedAt: now,
      },
    ],
    eventAssignments: [
      {
        id: 'assign-001',
        eventId: eventId,
        userId: teamMemberId,
        assignedAt: now,
      },
    ],
    photos: [
      {
        id: 'photo-1',
        eventId,
        uploadedById: teamMemberId,
        filename: 'wedding_ceremony.svg',
        originalName: 'Wedding_Ceremony.jpg',
        storageLocation: p1Loc,
        mimeType: 'image/svg+xml',
        fileSize: 45200,
        isSelected: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'photo-2',
        eventId,
        uploadedById: teamMemberId,
        filename: 'ring_exchange.svg',
        originalName: 'Ring_Exchange_Moment.jpg',
        storageLocation: p2Loc,
        mimeType: 'image/svg+xml',
        fileSize: 38900,
        isSelected: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'photo-3',
        eventId,
        uploadedById: teamMemberId,
        filename: 'reception_party.svg',
        originalName: 'Reception_Party.jpg',
        storageLocation: p3Loc,
        mimeType: 'image/svg+xml',
        fileSize: 52100,
        isSelected: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'photo-4',
        eventId,
        uploadedById: teamMemberId,
        filename: 'couple_portrait.svg',
        originalName: 'Sunset_Portrait.jpg',
        storageLocation: p4Loc,
        mimeType: 'image/svg+xml',
        fileSize: 41800,
        isSelected: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'photo-5',
        eventId,
        uploadedById: teamMemberId,
        filename: 'family_group.svg',
        originalName: 'Family_Group_Photo.jpg',
        storageLocation: p5Loc,
        mimeType: 'image/svg+xml',
        fileSize: 49300,
        isSelected: false,
        createdAt: now,
        updatedAt: now,
      },
    ],
    galleries: [
      {
        id: galleryId,
        eventId,
        title: 'Arjun & Priya Wedding - Official Gallery',
        slug: 'abc123',
        pinHash: hashPassword('482917'),
        isPublished: true,
        createdAt: now,
        updatedAt: now,
      },
    ],
    galleryPhotos: [
      { id: 'gp-1', galleryId, photoId: 'photo-1', addedAt: now },
      { id: 'gp-2', galleryId, photoId: 'photo-2', addedAt: now },
      { id: 'gp-3', galleryId, photoId: 'photo-3', addedAt: now },
      { id: 'gp-4', galleryId, photoId: 'photo-4', addedAt: now },
    ],
  };

  fs.writeFileSync(dbFilePath, JSON.stringify(seedData, null, 2), 'utf-8');
  console.log('✅ Seed script executed successfully!');
  console.log('----------------------------------------------------');
  console.log('Admin Demo:        admin@trizen.com / Admin@123456');
  console.log('Team Member Demo:  photographer@trizen.com / Team@123456');
  console.log('Demo Gallery URL:  /gallery/abc123');
  console.log('Demo Gallery PIN:  482917');
  console.log('----------------------------------------------------');
}

seedDatabase();
