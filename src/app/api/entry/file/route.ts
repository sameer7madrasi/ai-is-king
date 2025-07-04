import { NextRequest, NextResponse } from 'next/server';
import { UnifiedEntry } from '@/lib/entryModel';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const userId = formData.get('userId') as string || 'demo-user';
  if (!file) {
    return NextResponse.json({ error: 'Missing file' }, { status: 400 });
  }
  // For now, we won't actually store the file, just mock the entry
  const now = new Date().toISOString();
  const entry: UnifiedEntry = {
    id: uuidv4(),
    userId,
    type: 'file',
    source: 'upload',
    content: file.name, // In real use, extract text or summary
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