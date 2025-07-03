import { NextRequest, NextResponse } from 'next/server';
import { databaseService } from '@/lib/database';
import { AnalyticsService } from '@/lib/analyticsService';

export async function GET(req: NextRequest) {
  try {
    // Get all files from database
    const files = await databaseService.getAllFiles();
    
    if (files.length === 0) {
      return NextResponse.json({
        message: 'No data available for analysis',
        hasData: false
      });
    }

    // Analyze each dataset
    const analyses = [];
    let totalRows = 0;
    let totalColumns = 0;
    const allInsights = [];
    const allChartSuggestions = [];

    for (const file of files) {
      try {
        const data = await databaseService.getFileData(file.id);
        if (data && data.length > 0) {
          const analysis = AnalyticsService.analyzeDataset(
            data,
            file.columns,
            file.columnTypes
          );
          
          analysis.fileId = file.id;
          analysis.fileName = file.fileName;
          analysis.uploadDate = file.uploadDate;
          
          analyses.push(analysis);
          totalRows += analysis.rowCount;
          totalColumns += analysis.columnCount;
          allInsights.push(...analysis.insights);
          allChartSuggestions.push(...analysis.chartSuggestions);
        }
      } catch (error) {
        console.error(`Error analyzing file ${file.id}:`, error);
      }
    }

    // Sort insights by priority and confidence
    const sortedInsights = allInsights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return (b.confidence || 0) - (a.confidence || 0);
    });

    // Get top insights and chart suggestions
    const topInsights = sortedInsights.slice(0, 10);
    const recommendedCharts = allChartSuggestions.slice(0, 6);

    return NextResponse.json({
      hasData: true,
      summary: {
        totalDatasets: files.length,
        totalRows,
        totalColumns,
        analyzedDatasets: analyses.length
      },
      analyses,
      topInsights,
      recommendedCharts
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate analytics' },
      { status: 500 }
    );
  }
} 