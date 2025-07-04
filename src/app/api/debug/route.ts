import { NextRequest, NextResponse } from 'next/server';
import { databaseService } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    console.log('Debug API called');
    
    // Get all files
    const files = await databaseService.getAllFiles();
    console.log('Files found:', files.length);
    
    // Get data for first file if exists
    let sampleData = null;
    if (files.length > 0) {
      const firstFile = files[0];
      sampleData = await databaseService.getFileData(firstFile.id);
      console.log('Sample data for first file:', sampleData.length, 'rows');
    }
    
    return NextResponse.json({
      success: true,
      files: files.map(f => ({
        id: f.id,
        name: f.fileName,
        rows: f.numRows,
        columns: f.columns,
        uploadDate: f.uploadDate
      })),
      sampleData: sampleData ? sampleData.slice(0, 2) : null
    });
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Debug failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 