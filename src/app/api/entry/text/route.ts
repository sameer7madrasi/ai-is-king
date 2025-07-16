import { NextRequest, NextResponse } from 'next/server';
import { UnifiedEntry } from '@/lib/entryModel';
import { v4 as uuidv4 } from 'uuid';
import { NLPProcessor } from '@/lib/nlpProcessor';

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
  // Use NLPProcessor to generate a natural language response
  try {
    const nlpResult = await NLPProcessor.processText(text);
    // Compose a natural language response (summary + first insight + first recommendation)
    let aiResponse = `Here's what I understood: `;
    if (nlpResult.domain) aiResponse += `Domain: ${nlpResult.domain}. `;
    if (nlpResult.insights && nlpResult.insights.length > 0) aiResponse += `Insight: ${nlpResult.insights[0]}. `;
    if (nlpResult.recommendations && nlpResult.recommendations.length > 0) aiResponse += `Recommendation: ${nlpResult.recommendations[0]}`;
    if (aiResponse === `Here's what I understood: `) aiResponse += 'Entry received!';
    return NextResponse.json({ success: true, entry, aiResponse });
  } catch (error) {
    return NextResponse.json({ success: true, entry, aiResponse: 'Entry received! (AI feedback unavailable)' });
  }
} 