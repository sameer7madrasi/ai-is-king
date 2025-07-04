import { NextRequest, NextResponse } from 'next/server';
import { UnifiedEntry } from '@/lib/entryModel';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('audio') as File | null;
  const userId = formData.get('userId') as string || 'demo-user';
  if (!file) {
    return NextResponse.json({ error: 'Missing audio file' }, { status: 400 });
  }
  // In real use, run speech-to-text here
  const transcript = 'Transcribed text (stub)';
  const now = new Date().toISOString();
  const entry: UnifiedEntry = {
    id: uuidv4(),
    userId,
    type: 'voice',
    source: 'upload',
    content: transcript,
    fileUrl: null, // In real use, store and provide URL
    metadata: {
      filename: file.name,
      mimetype: file.type,
      // Add more as needed
    },
    timestamp: now,
    createdAt: now,
    updatedAt: now,
  };
  // TODO: Store in DB and handle file storage
  return NextResponse.json({ success: true, entry });
} 