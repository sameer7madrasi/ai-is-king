import { NextRequest, NextResponse } from 'next/server';
import { NLPProcessor } from '@/lib/nlpProcessor';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = body.text;
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }
    
    console.log('=== TEST NLP ENDPOINT ===');
    console.log('Input text:', text);
    
    // Process the text with full logging
    const result = await NLPProcessor.processText(text);
    
    return NextResponse.json({
      success: true,
      input: text,
      result: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Test NLP error:', error);
    return NextResponse.json({ 
      error: 'Processing failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Test NLP endpoint - POST with { "text": "your text here" }',
    example: {
      text: "July 2nd - 2 goals, 2 assists. 7 miles. Left foot needs to be better."
    }
  });
} 