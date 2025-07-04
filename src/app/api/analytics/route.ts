import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsService } from '@/lib/analyticsService';

export async function GET(request: NextRequest) {
  try {
    console.log('Analytics API called - starting analysis...');
    
    const analytics = await AnalyticsService.analyzeAllData();
    
    console.log('Analytics completed:', {
      totalDatasets: analytics.summary.totalDatasets,
      totalRecords: analytics.summary.totalRecords,
      insightsCount: analytics.insights.length,
      crossDatasetInsightsCount: analytics.crossDatasetInsights.length
    });
    
    return NextResponse.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error in analytics API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to analyze data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 