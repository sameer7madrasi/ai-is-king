import { NextRequest, NextResponse } from 'next/server';
import { databaseService } from '@/lib/database';

export async function POST(req: NextRequest) {
  try {
    const { query, filters } = await req.json();
    
    // For now, return all data with basic filtering
    // In the future, we can implement more sophisticated query parsing
    const data = await databaseService.queryData(query || '');
    
    // Apply basic filters if provided
    let filteredData = data;
    if (filters) {
      if (filters.dateRange) {
        filteredData = filteredData.filter((row: any) => {
          const uploadDate = new Date(row.uploadDate);
          const start = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
          const end = filters.dateRange.end ? new Date(filters.dateRange.end) : null;
          
          if (start && uploadDate < start) return false;
          if (end && uploadDate > end) return false;
          return true;
        });
      }
      
      if (filters.fileName) {
        filteredData = filteredData.filter((row: any) => 
          row.fileName.toLowerCase().includes(filters.fileName.toLowerCase())
        );
      }
    }
    
    return NextResponse.json({ 
      data: filteredData,
      totalRows: filteredData.length,
      query: query || 'all data'
    });
  } catch (error) {
    console.error('Error querying data:', error);
    return NextResponse.json(
      { error: 'Failed to query data' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const summary = await databaseService.getDataSummary();
    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error fetching data summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data summary' },
      { status: 500 }
    );
  }
} 