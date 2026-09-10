import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  const assignments = db.eventAssignments.findByEventId(params.id);
  const teamMembers = assignments
    .map((a) => db.users.findById(a.userId))
    .filter(Boolean)
    .map((u) => ({ id: u!.id, name: u!.name, email: u!.email, role: u!.role }));

  return NextResponse.json({ teamMembers });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  if (user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden: Only Admins can manage team members' }, { status: 403 });
  }

  try {
    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const assignment = db.eventAssignments.assign(params.id, userId);
    return NextResponse.json({ success: true, assignment });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to add team member' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
  }

  if (user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden: Only Admins can manage team members' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId parameter is required' }, { status: 400 });
  }

  db.eventAssignments.unassign(params.id, userId);
  return NextResponse.json({ success: true, message: 'Team member unassigned' });
}
