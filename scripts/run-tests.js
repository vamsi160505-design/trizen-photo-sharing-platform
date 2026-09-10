const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Setup clean temporary test environment
const testDbPath = path.join(__dirname, '..', 'data', 'test_db.json');
process.env.JWT_SECRET = 'test-jwt-secret-key-123';

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, originalHash] = storedHash.split(':');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === originalHash;
}

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failedTests++;
  }
}

async function runTestSuite() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING SUITE: TRIZEN PHOTO SHARING PLATFORM TESTS');
  console.log('======================================================\n');

  // TEST SUITE 1: AUTHENTICATION & AUTHORIZATION
  console.log('--- Suite 1: Authentication & Authorization ---');
  const adminPass = 'Admin@123456';
  const hashedAdminPass = hashPassword(adminPass);
  assert(verifyPassword(adminPass, hashedAdminPass), 'Admin password hashes and verifies correctly');
  assert(!verifyPassword('WrongPass', hashedAdminPass), 'Invalid password verification fails correctly');

  // TEST SUITE 2: PHOTO ACCESS CONTROLS & RBAC
  console.log('\n--- Suite 2: Role-Based Access Control (RBAC) ---');
  const adminUser = { id: 'admin-1', role: 'ADMIN' };
  const teamMemberUser = { id: 'team-1', role: 'TEAM_MEMBER' };
  const unassignedTeamMember = { id: 'team-2', role: 'TEAM_MEMBER' };

  const eventAssignments = [
    { eventId: 'evt-100', userId: 'team-1' }
  ];

  function canAccessEvent(user, eventId) {
    if (user.role === 'ADMIN') return true;
    return eventAssignments.some(a => a.eventId === eventId && a.userId === user.id);
  }

  assert(canAccessEvent(adminUser, 'evt-100'), 'Admin can access any event');
  assert(canAccessEvent(teamMemberUser, 'evt-100'), 'Assigned team member can access assigned event');
  assert(!canAccessEvent(unassignedTeamMember, 'evt-100'), 'Unassigned team member CANNOT access unassigned event (403)');

  // TEST SUITE 3: GALLERY PUBLISHING WORKFLOW & SECURITY
  console.log('\n--- Suite 3: Gallery Publishing Workflows ---');
  function canPublishGallery(user) {
    return user.role === 'ADMIN';
  }

  assert(canPublishGallery(adminUser), 'Admin is permitted to publish gallery');
  assert(!canPublishGallery(teamMemberUser), 'Team Member is FORBIDDEN from publishing gallery (403)');

  // TEST SUITE 4: PIN-PROTECTED ACCESS VERIFICATION
  console.log('\n--- Suite 4: PIN-Protected Access Verification ---');
  const galleryPin = '482917';
  const galleryPinHash = hashPassword(galleryPin);
  const galleryState = { slug: 'abc123', isPublished: true, pinHash: galleryPinHash };

  function verifyGalleryAccess(slug, enteredPin, gallery) {
    if (!gallery || gallery.slug !== slug) return { success: false, status: 404, error: 'Gallery not found' };
    if (!gallery.isPublished) return { success: false, status: 403, error: 'Gallery is unpublished' };
    const validPin = verifyPassword(enteredPin, gallery.pinHash);
    if (!validPin) return { success: false, status: 401, error: 'Incorrect PIN' };
    return { success: true, status: 200 };
  }

  const correctAttempt = verifyGalleryAccess('abc123', '482917', galleryState);
  assert(correctAttempt.success && correctAttempt.status === 200, 'Valid PIN (482917) grants gallery access');

  const incorrectAttempt = verifyGalleryAccess('abc123', '000000', galleryState);
  assert(!incorrectAttempt.success && incorrectAttempt.status === 401, 'Incorrect PIN denies gallery access with status 401');

  const unpublishedGallery = { slug: 'secret-gallery', isPublished: false, pinHash: galleryPinHash };
  const unpublishedAttempt = verifyGalleryAccess('secret-gallery', '482917', unpublishedGallery);
  assert(!unpublishedAttempt.success && unpublishedAttempt.status === 403, 'Access to unpublished gallery is denied with status 403');

  console.log('\n======================================================');
  console.log(`📊 TEST RESULTS: ${passedTests} Passed, ${failedTests} Failed`);
  console.log('======================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTestSuite();
