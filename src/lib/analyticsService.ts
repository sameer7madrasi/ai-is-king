export interface DataInsight {
  type: 'statistical' | 'trend' | 'correlation' | 'anomaly' | 'recommendation';
  title: string;
  description: string;
  value?: any;
  confidence?: number;
  priority: 'high' | 'medium' | 'low';
}

export interface ChartSuggestion {
  type: 'bar' | 'line' | 'scatter' | 'histogram' | 'pie' | 'heatmap';
  title: string;
  description: string;
  data: any;
  xAxis?: string;
  yAxis?: string;
  category?: string;
}

export interface DatasetAnalysis {
  fileId: string;
  fileName: string;
  uploadDate: string;
  rowCount: number;
  columnCount: number;
  insights: DataInsight[];
  chartSuggestions: ChartSuggestion[];
  summary: {
    numericColumns: string[];
    categoricalColumns: string[];
    dateColumns: string[];
    textColumns: string[];
  };
}

export interface GlobalAnalytics {
  totalDatasets: number;
  totalRows: number;
  totalColumns: number;
  dataTypes: Record<string, number>;
  timeSpan: {
    earliest: string;
    latest: string;
    days: number;
  };
  topInsights: DataInsight[];
  recommendedCharts: ChartSuggestion[];
  trends: {
    uploadFrequency: number;
    dataGrowth: number;
    mostCommonTypes: string[];
  };
}

export class AnalyticsService {
  /**
   * Analyze a single dataset and generate insights
   */
  static analyzeDataset(data: any[], columns: string[], columnTypes: Record<string, string>): DatasetAnalysis {
    const insights: DataInsight[] = [];
    const chartSuggestions: ChartSuggestion[] = [];
    
    // Categorize columns
    const numericColumns = columns.filter(col => columnTypes[col] === 'number');
    const categoricalColumns = columns.filter(col => columnTypes[col] === 'string' && this.isCategorical(data, col));
    const dateColumns = columns.filter(col => this.isDateColumn(data, col));
    const textColumns = columns.filter(col => columnTypes[col] === 'string' && !this.isCategorical(data, col));

    // Generate statistical insights
    insights.push(...this.generateStatisticalInsights(data, columns, columnTypes));
    
    // Generate trend insights
    insights.push(...this.generateTrendInsights(data, columns, columnTypes));
    
    // Generate correlation insights
    if (numericColumns.length >= 2) {
      insights.push(...this.generateCorrelationInsights(data, numericColumns));
    }
    
    // Generate anomaly insights
    insights.push(...this.generateAnomalyInsights(data, columns, columnTypes));
    
    // Generate chart suggestions
    chartSuggestions.push(...this.generateChartSuggestions(data, columns, columnTypes));

    return {
      fileId: 'temp',
      fileName: 'Dataset',
      uploadDate: new Date().toISOString(),
      rowCount: data.length,
      columnCount: columns.length,
      insights,
      chartSuggestions,
      summary: {
        numericColumns,
        categoricalColumns,
        dateColumns,
        textColumns
      }
    };
  }

  /**
   * Generate statistical insights
   */
  private static generateStatisticalInsights(data: any[], columns: string[], columnTypes: Record<string, string>): DataInsight[] {
    const insights: DataInsight[] = [];
    
    // Analyze numeric columns
    columns.forEach(col => {
      if (columnTypes[col] === 'number') {
        const values = data.map(row => row[col]).filter(v => v !== null && v !== undefined && !isNaN(v));
        if (values.length > 0) {
          const mean = values.reduce((a, b) => a + b, 0) / values.length;
          const sorted = values.sort((a, b) => a - b);
          const median = sorted[Math.floor(sorted.length / 2)];
          const min = Math.min(...values);
          const max = Math.max(...values);
          const std = Math.sqrt(values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length);

          insights.push({
            type: 'statistical',
            title: `${col} Statistics`,
            description: `Mean: ${mean.toFixed(2)}, Median: ${median.toFixed(2)}, Range: ${min.toFixed(2)} - ${max.toFixed(2)}`,
            value: { mean, median, min, max, std },
            confidence: 0.9,
            priority: 'medium'
          });

          // Check for outliers
          const q1 = sorted[Math.floor(sorted.length * 0.25)];
          const q3 = sorted[Math.floor(sorted.length * 0.75)];
          const iqr = q3 - q1;
          const outliers = values.filter(v => v < q1 - 1.5 * iqr || v > q3 + 1.5 * iqr);
          
          if (outliers.length > 0) {
            insights.push({
              type: 'anomaly',
              title: `Outliers in ${col}`,
              description: `Found ${outliers.length} outliers (${(outliers.length / values.length * 100).toFixed(1)}% of data)`,
              value: outliers,
              confidence: 0.8,
              priority: 'high'
            });
          }
        }
      }
    });

    // Analyze categorical columns
    columns.forEach(col => {
      if (columnTypes[col] === 'string') {
        const values = data.map(row => row[col]).filter(v => v !== null && v !== undefined && v !== '');
        if (values.length > 0) {
          const uniqueValues = new Set(values);
                     const valueCounts = values.reduce((acc, val) => {
             acc[val as string] = (acc[val as string] || 0) + 1;
             return acc;
           }, {} as Record<string, number>);

          insights.push({
            type: 'statistical',
            title: `${col} Distribution`,
            description: `${uniqueValues.size} unique values, most common: ${Object.entries(valueCounts).sort((a, b) => (b[1] as number) - (a[1] as number))[0]?.[0] || 'N/A'}`,
            value: { uniqueCount: uniqueValues.size, valueCounts },
            confidence: 0.8,
            priority: 'medium'
          });
        }
      }
    });

    return insights;
  }

  /**
   * Generate trend insights
   */
  private static generateTrendInsights(data: any[], columns: string[], columnTypes: Record<string, string>): DataInsight[] {
    const insights: DataInsight[] = [];
    
    // Look for time-based trends
    const dateColumns = columns.filter(col => this.isDateColumn(data, col));
    dateColumns.forEach(dateCol => {
      const numericCols = columns.filter(col => columnTypes[col] === 'number');
      
      numericCols.forEach(numCol => {
        const timeSeriesData = data
          .map(row => ({ date: new Date(row[dateCol]), value: row[numCol] }))
          .filter(item => !isNaN(item.date.getTime()) && item.value !== null && !isNaN(item.value))
          .sort((a, b) => a.date.getTime() - b.date.getTime());

        if (timeSeriesData.length >= 3) {
          const values = timeSeriesData.map(item => item.value);
          const trend = this.calculateTrend(values);
          
          if (Math.abs(trend) > 0.1) {
            insights.push({
              type: 'trend',
              title: `${numCol} Trend Over Time`,
              description: `${trend > 0 ? 'Increasing' : 'Decreasing'} trend in ${numCol} over time (slope: ${trend.toFixed(3)})`,
              value: { trend, timeSeriesData },
              confidence: 0.7,
              priority: 'high'
            });
          }
        }
      });
    });

    return insights;
  }

  /**
   * Generate correlation insights
   */
  private static generateCorrelationInsights(data: any[], numericColumns: string[]): DataInsight[] {
    const insights: DataInsight[] = [];
    
    for (let i = 0; i < numericColumns.length; i++) {
      for (let j = i + 1; j < numericColumns.length; j++) {
        const col1 = numericColumns[i];
        const col2 = numericColumns[j];
        
        const values1 = data.map(row => row[col1]).filter(v => v !== null && !isNaN(v));
        const values2 = data.map(row => row[col2]).filter(v => v !== null && !isNaN(v));
        
        if (values1.length === values2.length && values1.length > 1) {
          const correlation = this.calculateCorrelation(values1, values2);
          
          if (Math.abs(correlation) > 0.5) {
            insights.push({
              type: 'correlation',
              title: `${col1} vs ${col2} Correlation`,
              description: `${Math.abs(correlation) > 0.7 ? 'Strong' : 'Moderate'} ${correlation > 0 ? 'positive' : 'negative'} correlation (${correlation.toFixed(3)})`,
              value: { correlation, col1, col2 },
              confidence: 0.8,
              priority: 'high'
            });
          }
        }
      }
    }

    return insights;
  }

  /**
   * Generate anomaly insights
   */
  private static generateAnomalyInsights(data: any[], columns: string[], columnTypes: Record<string, string>): DataInsight[] {
    const insights: DataInsight[] = [];
    
    // Look for missing data patterns
    columns.forEach(col => {
      const missingCount = data.filter(row => row[col] === null || row[col] === undefined || row[col] === '').length;
      const missingPercentage = (missingCount / data.length) * 100;
      
      if (missingPercentage > 10) {
        insights.push({
          type: 'anomaly',
          title: `Missing Data in ${col}`,
          description: `${missingPercentage.toFixed(1)}% of values are missing in ${col}`,
          value: { missingCount, missingPercentage },
          confidence: 0.9,
          priority: 'medium'
        });
      }
    });

    return insights;
  }

  /**
   * Generate chart suggestions
   */
  private static generateChartSuggestions(data: any[], columns: string[], columnTypes: Record<string, string>): ChartSuggestion[] {
    const suggestions: ChartSuggestion[] = [];
    
    // Bar chart for categorical data
    const categoricalColumns = columns.filter(col => columnTypes[col] === 'string' && this.isCategorical(data, col));
    categoricalColumns.forEach(col => {
               const valueCounts = data.reduce((acc, row) => {
           const value = row[col];
           if (value !== null && value !== undefined && value !== '') {
             acc[value as string] = (acc[value as string] || 0) + 1;
           }
           return acc;
         }, {} as Record<string, number>);

      const sortedData = Object.entries(valueCounts)
        .sort((a, b) => (b[1] as number) - (a[1] as number))
        .slice(0, 10); // Top 10 categories

      suggestions.push({
        type: 'bar',
        title: `${col} Distribution`,
        description: `Distribution of values in ${col}`,
        data: sortedData.map(([label, value]) => ({ label, value })),
        xAxis: col,
        yAxis: 'Count'
      });
    });

    // Histogram for numeric data
    const numericColumns = columns.filter(col => columnTypes[col] === 'number');
    numericColumns.forEach(col => {
      const values = data.map(row => row[col]).filter(v => v !== null && !isNaN(v));
      if (values.length > 0) {
        const min = Math.min(...values);
        const max = Math.max(...values);
        const binCount = Math.min(10, Math.ceil(Math.sqrt(values.length)));
        const binSize = (max - min) / binCount;
        
        const bins = Array(binCount).fill(0);
        values.forEach(value => {
          const binIndex = Math.min(Math.floor((value - min) / binSize), binCount - 1);
          bins[binIndex]++;
        });

        suggestions.push({
          type: 'histogram',
          title: `${col} Distribution`,
          description: `Frequency distribution of ${col}`,
          data: bins.map((count, i) => ({
            bin: `${(min + i * binSize).toFixed(2)} - ${(min + (i + 1) * binSize).toFixed(2)}`,
            count
          })),
          xAxis: col,
          yAxis: 'Frequency'
        });
      }
    });

    // Scatter plot for correlations
    if (numericColumns.length >= 2) {
      for (let i = 0; i < numericColumns.length; i++) {
        for (let j = i + 1; j < numericColumns.length; j++) {
          const col1 = numericColumns[i];
          const col2 = numericColumns[j];
          
          const scatterData = data
            .map(row => ({ x: row[col1], y: row[col2] }))
            .filter(point => point.x !== null && point.y !== null && !isNaN(point.x) && !isNaN(point.y));

          if (scatterData.length > 0) {
            suggestions.push({
              type: 'scatter',
              title: `${col1} vs ${col2}`,
              description: `Relationship between ${col1} and ${col2}`,
              data: scatterData,
              xAxis: col1,
              yAxis: col2
            });
          }
        }
      }
    }

    return suggestions;
  }

  /**
   * Helper methods
   */
  private static isCategorical(data: any[], column: string): boolean {
    const values = data.map(row => row[column]).filter(v => v !== null && v !== undefined && v !== '');
    const uniqueValues = new Set(values);
    return uniqueValues.size <= Math.min(20, values.length * 0.5); // Max 20 unique values or 50% of data
  }

  private static isDateColumn(data: any[], column: string): boolean {
    const sampleValues = data.slice(0, 10).map(row => row[column]).filter(v => v !== null && v !== undefined);
    return sampleValues.some(value => {
      const date = new Date(value);
      return !isNaN(date.getTime());
    });
  }

  private static calculateTrend(values: number[]): number {
    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * values[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  }

  private static calculateCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    return denominator === 0 ? 0 : numerator / denominator;
  }
} 