import { NextRequest, NextResponse } from 'next/server';
import { UnifiedEntry } from '@/lib/entryModel';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  const { userId = 'demo-user', text } = await req.json();
  if (!text || typeof text !== 'string') {
    return NextResponse.json({ error: 'Missing or invalid text' }, { status: 400 });
  }
  const now = new Date().toISOString();
  const entry: UnifiedEntry = {
    id: uuidv4(),
    userId,
    type: 'text',
    source: 'manual',
    content: text,
    fileUrl: null,
    metadata: {},
    timestamp: now,
    createdAt: now,
    updatedAt: now,
  };
  // TODO: Store in DB
  return NextResponse.json({ success: true, entry });
} 